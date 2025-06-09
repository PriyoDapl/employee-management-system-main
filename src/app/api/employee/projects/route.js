import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ProjectAssignment from "@/model/ProjectAssignment";
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

// GET - Get projects assigned to logged-in employee
export async function GET(request) {
  try {
    // Verify token
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Verify user is an employee
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "employee") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only employees can access this endpoint",
        },
        { status: 403 }
      );
    }

    // Fetch assignments for this employee
    const assignments = await ProjectAssignment.find({
      employeeId: decoded.userId,
    })
      .populate("projectId", "name details createdAt updatedAt isActive")
      .populate("assignedBy", "firstName lastName email")
      .sort({ assignedDate: -1 });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("GET /api/employee/projects error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch assigned projects",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
