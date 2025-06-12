import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Employee } from "@/model/Employee";
import { User } from "@/model/User";
import { Mail } from "@/model/Mail";
import Project from "@/model/Project";
import { verifyToken, getTokenFromHeaders } from "@/lib/auth";

// GET - Get statistics for management dashboard or employee view
export async function GET(request) {
  try {
    await dbConnect();

    const token = getTokenFromHeaders(request.headers);
    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    // Get counts based on user role
    const stats = {};

    if (decoded.role === "management") {
      // Management can see all stats
      const [activeEmployeeCount, activeProjectCount, totalMessages, todayMessages] = await Promise.all([
        User.countDocuments({ role: "employee", isActive: { $ne: false } }),
        Project.countDocuments({ isActive: { $ne: false } }),
        Mail.countDocuments({ isActive: { $ne: false } }),
        Mail.countDocuments({ 
          isActive: { $ne: false },
          createdAt: { 
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        })
      ]);

      // Get message statistics by request type
      const messagesByType = await Mail.aggregate([
        { $match: { isActive: { $ne: false } } },
        { $group: { _id: "$requestType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      // Get recent messaging activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentMessages = await Mail.aggregate([
        { 
          $match: { 
            isActive: { $ne: false },
            createdAt: { $gte: sevenDaysAgo }
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      stats.employeeCount = activeEmployeeCount;
      stats.projectCount = activeProjectCount;
      stats.totalMessages = totalMessages;
      stats.todayMessages = todayMessages;
      stats.messagesByType = messagesByType;
      stats.recentMessagingActivity = recentMessages;
    } else {
      // Employees can see limited stats - only count active projects
      const [activeProjectCount] = await Promise.all([
        Project.countDocuments({ isActive: { $ne: false } })
      ]);

      stats.projectCount = activeProjectCount; // Only count active projects
      stats.employeeCount = 0; // Employees don't need to see employee count
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
