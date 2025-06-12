import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Mail } from "@/model/Mail";
import { Employee } from "@/model/Employee";
import { User } from "@/model/User";
import { verifyToken, getTokenFromHeaders } from "@/lib/auth";

// Helper function to get and verify token from request
const getAuthenticatedUser = (request) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) {
    throw new Error("No token provided");
  }
  return verifyToken(token);
};

// GET - Get role email mappings for dropdown
export async function GET(request) {
  try {
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Verify user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Get URL search params
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "get-positions") {
      // Fetch all unique positions with their employees
      const positions = await Employee.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$position",
            employees: {
              $push: {
                name: {
                  $concat: [
                    { $ifNull: ["$firstName", ""] },
                    { $cond: [{ $and: [{ $ne: ["$firstName", ""] }, { $ne: ["$lastName", ""] }] }, " ", ""] },
                    { $ifNull: ["$lastName", ""] }
                  ]
                },
                fallbackName: "$name"
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            position: "$_id",
            employeeNames: {
              $map: {
                input: "$employees",
                as: "emp",
                in: {
                  $cond: [
                    { $ne: ["$$emp.name", ""] },
                    "$$emp.name",
                    { $ifNull: ["$$emp.fallbackName", "Unknown"] }
                  ]
                }
              }
            }
          }
        }
      ]);

      // Format positions for the frontend
      const formattedPositions = positions.map((pos) => ({
        _id: pos._id, // Use position title as ID
        position: pos._id,
        employeeNames: pos.employeeNames,
        // For display purposes, show first employee name
        employeeName: pos.employeeNames.length > 0 ? pos.employeeNames[0] : "No Employee Assigned"
      }));

      return NextResponse.json({
        success: true,
        positions: formattedPositions,
      });
    }

    // Default: Get user's mail history
    const mails = await Mail.find({ senderUserId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      mails,
    });
  } catch (error) {
    console.error("GET /api/mail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch data",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// POST - Send mail
export async function POST(request) {
  try {
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Verify user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { requestType, subject, message, selectedPositions, ccPositions, priority } = body;

    // Validate required fields
    if (!requestType || !subject || !message || !selectedPositions || selectedPositions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Request type, subject, message, and at least one recipient are required",
        },
        { status: 400 }
      );
    }

    // Helper function to get employees for a position and extract their details
    const getEmployeeDetailsForPosition = async (positionTitle) => {
      const employees = await Employee.find({ 
        position: positionTitle, 
        isActive: true 
      }).populate('user', 'email firstName lastName');

      return employees.map(emp => ({
        email: emp.user?.email || 'no-email@company.com',
        employeeName: `${emp.user?.firstName || ''} ${emp.user?.lastName || ''}`.trim() || emp.name || 'Unknown Employee'
      }));
    };

    // Extract position titles from selected position IDs
    const selectedPositionTitles = selectedPositions;

    // Get recipients with employee details
    const recipients = [];
    for (const positionTitle of selectedPositionTitles) {
      const employeeDetails = await getEmployeeDetailsForPosition(positionTitle);
      
      // If no employees found, add a placeholder
      if (employeeDetails.length === 0) {
        recipients.push({
          position: positionTitle,
          email: 'no-employees@company.com',
          employeeName: 'No employees assigned to this position'
        });
      } else {
        // Add one entry per employee in the position
        employeeDetails.forEach(empDetail => {
          recipients.push({
            position: positionTitle,
            email: empDetail.email,
            employeeName: empDetail.employeeName
          });
        });
      }
    }

    // Get CC recipients if any
    let ccRecipients = [];
    if (ccPositions && ccPositions.length > 0) {
      const ccPositionTitles = ccPositions;
      
      for (const positionTitle of ccPositionTitles) {
        const employeeDetails = await getEmployeeDetailsForPosition(positionTitle);
        
        // If no employees found, add a placeholder
        if (employeeDetails.length === 0) {
          ccRecipients.push({
            position: positionTitle,
            email: 'no-employees@company.com',
            employeeName: 'No employees assigned to this position'
          });
        } else {
          // Add one entry per employee in the position
          employeeDetails.forEach(empDetail => {
            ccRecipients.push({
              position: positionTitle,
              email: empDetail.email,
              employeeName: empDetail.employeeName
            });
          });
        }
      }
    }

    // Create mail record
    const mail = new Mail({
      senderUserId: decoded.userId,
      senderName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      senderEmail: user.email,
      requestType,
      subject: subject.trim(),
      message: message.trim(),
      recipients,
      ccRecipients,
      priority: priority || "Medium",
    });

    await mail.save();

    // Log the messaging action for management tracking
    const recipientInfo = recipients.map(r => {
      return `${r.position} - ${r.employeeName} (${r.email})`;
    });

    const ccInfo = ccRecipients.map(cc => {
      return `${cc.position} - ${cc.employeeName} (${cc.email})`;
    });

    // Detailed logging for management tracking
    console.log("=== MESSAGE TRACKING LOG ===");
    console.log("Message ID:", mail._id);
    console.log("Timestamp:", new Date().toISOString());
    console.log("Sender:", `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email, `(${user.email})`);
    console.log("Request Type:", requestType);
    console.log("Priority:", priority || "Medium");
    console.log("Subject:", subject);
    console.log("Recipients:", recipientInfo);
    if (ccInfo.length > 0) {
      console.log("CC Recipients:", ccInfo);
    }
    console.log("Message Length:", message.length, "characters");
    console.log("=== END MESSAGE LOG ===");

    // Simple success log
    console.log("Message sent successfully:", {
      messageId: mail._id,
      to: recipientInfo,
      cc: ccInfo,
      subject: subject,
      from: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully",
        mail: {
          id: mail._id,
          requestType: mail.requestType,
          subject: mail.subject,
          createdAt: mail.createdAt,
          recipients: mail.recipients,
          ccRecipients: mail.ccRecipients,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/mail error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send message",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
