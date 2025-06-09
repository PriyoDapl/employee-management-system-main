import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Employee } from "@/model/Employee";
import { User } from "@/model/User";
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
      // Management can see all stats - count active employees by checking User records with role "employee" and isActive not false
      const [activeEmployeeCount, activeProjectCount] = await Promise.all([
        User.countDocuments({ role: "employee", isActive: { $ne: false } }),
        Project.countDocuments({ isActive: { $ne: false } }),
      ]);

      stats.employeeCount = activeEmployeeCount;
      stats.projectCount = activeProjectCount; // Only count active projects
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
