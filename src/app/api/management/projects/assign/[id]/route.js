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

// DELETE - Remove project assignment
export async function DELETE(request, { params }) {
  try {
    // Verify token and ensure user is management
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    // Check if user is management
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== "management") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Only management can remove assignments",
        },
        { status: 403 }
      );
    }

    const { id: assignmentId } = params;

    // Find and delete the assignment
    const assignment = await ProjectAssignment.findByIdAndDelete(assignmentId);

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Assignment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project assignment removed successfully",
    });
  } catch (error) {
    console.error("DELETE /api/management/projects/assign/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to remove assignment",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
