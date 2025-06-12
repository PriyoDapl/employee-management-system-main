import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Mail } from "@/model/Mail";
import { User } from "@/model/User";
import { Employee } from "@/model/Employee";
import { verifyToken, getTokenFromHeaders } from "@/lib/auth";

// Helper function to get and verify token from request
const getAuthenticatedUser = (request) => {
  const token = getTokenFromHeaders(request.headers);
  if (!token) {
    throw new Error("No token provided");
  }
  return verifyToken(token);
};

// GET - Get all messages for management tracking and oversight
export async function GET(request) {
  try {
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Verify user exists and is management
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

    if (user.role !== "management") {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Management role required.",
        },
        { status: 403 }
      );
    }

    // Get URL search params for filtering
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, today, week, month
    const requestType = searchParams.get("requestType");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const skip = (page - 1) * limit;

    // Build query based on filters
    let query = { isActive: { $ne: false } };

    // Date filter
    const now = new Date();
    switch (filter) {
      case "today":
        query.createdAt = {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lt: new Date(now.setHours(23, 59, 59, 999))
        };
        break;
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query.createdAt = { $gte: weekAgo };
        break;
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query.createdAt = { $gte: monthAgo };
        break;
    }

    // Request type filter
    if (requestType && requestType !== "all") {
      query.requestType = requestType;
    }

    // Get total count
    const totalCount = await Mail.countDocuments(query);

    // Get messages with sender details
    const messages = await Mail.find(query)
      .populate({
        path: 'senderUserId',
        select: 'firstName lastName email role'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Enrich messages with additional information
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        // Get employee counts for each position
        const recipientInfo = await Promise.all(
          message.recipients.map(async (recipient) => {
            const employeeCount = await Employee.countDocuments({
              position: recipient.position,
              isActive: true
            });
            
            const employees = await Employee.find({
              position: recipient.position,
              isActive: true
            }).select('firstName lastName name');

            const employeeNames = employees.map(emp => 
              `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || 'Unknown'
            );

            return {
              position: recipient.position,
              employeeCount,
              employeeNames
            };
          })
        );

        const ccInfo = await Promise.all(
          message.ccRecipients.map(async (cc) => {
            const employeeCount = await Employee.countDocuments({
              position: cc.position,
              isActive: true
            });
            
            const employees = await Employee.find({
              position: cc.position,
              isActive: true
            }).select('firstName lastName name');

            const employeeNames = employees.map(emp => 
              `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || 'Unknown'
            );

            return {
              position: cc.position,
              employeeCount,
              employeeNames
            };
          })
        );

        return {
          ...message.toObject(),
          recipientDetails: recipientInfo,
          ccDetails: ccInfo,
          senderDetails: message.senderUserId ? {
            name: `${message.senderUserId.firstName || ''} ${message.senderUserId.lastName || ''}`.trim() || 'Unknown',
            email: message.senderUserId.email,
            role: message.senderUserId.role
          } : {
            name: message.senderName || 'Unknown',
            email: message.senderEmail || 'Unknown',
            role: 'Unknown'
          }
        };
      })
    );

    // Get summary statistics
    const stats = {
      totalMessages: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    };

    return NextResponse.json({
      success: true,
      messages: enrichedMessages,
      stats,
      filters: {
        filter,
        requestType,
        page,
        limit
      }
    });

  } catch (error) {
    console.error("GET /api/mail/management error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch management messages",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
