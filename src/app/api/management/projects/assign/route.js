import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ProjectAssignment from "@/model/ProjectAssignment";
import Project from "@/model/Project";
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

// POST - Assign project to employee
export async function POST(request) {
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
          error: "Unauthorized: Only management can assign projects",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { projectId, employeeId, notes } = body;

    // Validate required fields
    if (!projectId || !employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: "Project ID and Employee ID are required",
        },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 }
      );
    }

    // Verify employee exists and is active
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== "employee" || !employee.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee not found or inactive",
        },
        { status: 404 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await ProjectAssignment.findOne({
      projectId,
      employeeId,
    });

    if (existingAssignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Project already assigned to this employee",
        },
        { status: 409 }
      );
    }

    // Create assignment
    const assignment = new ProjectAssignment({
      projectId,
      employeeId,
      assignedBy: decoded.userId,
      notes: notes?.trim() || "",
    });

    await assignment.save();

    // Populate assignment data for response
    await assignment.populate([
      { path: "projectId", select: "name details" },
      { path: "employeeId", select: "firstName lastName email" },
      { path: "assignedBy", select: "firstName lastName email" },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Project assigned successfully",
        assignment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/management/projects/assign error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to assign project",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// GET - Get all project assignments (for management)
export async function GET(request) {
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
          error: "Unauthorized: Only management can view assignments",
        },
        { status: 403 }
      );
    }

    // Fetch all assignments with populated data
    const assignments = await ProjectAssignment.find({})
      .populate("projectId", "name details createdAt isActive")
      .populate("employeeId", "firstName lastName email")
      .populate("assignedBy", "firstName lastName email")
      .sort({ assignedDate: -1 });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("GET /api/management/projects/assign error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch assignments",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
