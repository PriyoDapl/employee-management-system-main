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

// GET - Get mails received by user based on their position
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

    // For management users, they can see ALL messages for tracking purposes
    if (user.role === "management") {
      // Management sees all messages
      const allMails = await Mail.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(100);

      // Check if management user also has a specific position
      const managementEmployeeRecord = await Employee.findOne({ user: decoded.userId });

      const enrichedMails = allMails.map(mail => {
        let recipientType = "MANAGEMENT_VIEW";
        
        if (managementEmployeeRecord && managementEmployeeRecord.position) {
          const wasDirectRecipient = mail.recipients?.some(r => r.position === managementEmployeeRecord.position);
          const wasInCC = mail.ccRecipients?.some(cc => cc.position === managementEmployeeRecord.position);
          
          if (wasDirectRecipient) recipientType = "TO";
          else if (wasInCC) recipientType = "CC";
        }

        return {
          ...mail.toObject(),
          recipientType
        };
      });

      return NextResponse.json({
        success: true,
        mails: enrichedMails,
        totalCount: enrichedMails.length
      });
    }

    // For employees, find their position and show messages sent to their position
    const employeeRecord = await Employee.findOne({ user: decoded.userId });
    
    if (!employeeRecord || !employeeRecord.position) {
      return NextResponse.json({
        success: true,
        mails: [],
        message: "No position assigned to user"
      });
    }

    const userPosition = employeeRecord.position;

    // Get all messages where user's position is in recipients or ccRecipients
    const receivedMails = await Mail.find({
      $or: [
        { "recipients.position": userPosition },
        { "ccRecipients.position": userPosition }
      ],
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(100);

    // Add recipientType field to indicate if message was sent to user as TO or CC
    const enrichedMails = receivedMails.map(mail => {
      let recipientType = "TO";
      
      // Check if user was in CC recipients
      const wasInCC = mail.ccRecipients?.some(cc => cc.position === userPosition);
      
      if (wasInCC) {
        recipientType = "CC";
      }

      return {
        ...mail.toObject(),
        recipientType
      };
    });

    return NextResponse.json({
      success: true,
      mails: enrichedMails,
    });
  } catch (error) {
    console.error("GET /api/mail/inbox error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch inbox messages",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
