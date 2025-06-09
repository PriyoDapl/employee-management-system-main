import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Employee } from "@/model/Employee";
import { User } from "@/model/User";
import Project from "@/model/Project";
import { verifyToken, getTokenFromHeaders } from "@/lib/auth";

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
      const [employeeCount, projectCount, totalUsers] = await Promise.all([
        Employee.countDocuments({ isActive: { $ne: false } }),
        Project.countDocuments(),
        User.countDocuments({ role: "employee", isActive: { $ne: false } }),
      ]);

      stats.employeeCount = Math.max(employeeCount, totalUsers); // Use the higher count
      stats.projectCount = projectCount;
      stats.totalUsers = totalUsers;
    } else {
      // Employees can see limited stats
      const [projectCount] = await Promise.all([Project.countDocuments()]);

      stats.projectCount = projectCount;
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
