import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/model/Task";
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

// GET - Get a specific task by ID (only if assigned to current employee)
export async function GET(request, { params }) {
  try {
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

    const task = await Task.findOne({
      _id: params.id,
      assignedTo: decoded.userId,
      isActive: true
    })
    .populate("createdBy", "firstName lastName email")
    .populate("projectId", "name");

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found or not assigned to you",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("GET /api/employee/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch task",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// PATCH - Update task status (employees can only update their own assigned tasks)
export async function PATCH(request, { params }) {
  try {
    const decoded = getAuthenticatedUser(request);
    const { status, comment } = await request.json();

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

    // Find the task and verify it's assigned to the current user
    const task = await Task.findOne({
      _id: params.id,
      assignedTo: decoded.userId,
      isActive: true
    });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found or not assigned to you",
        },
        { status: 404 }
      );
    }

    // Validate status transitions for employees
    const validTransitions = {
      "Assigned": ["In Progress"],
      "In Progress": ["On Hold", "Under Review"],
      "On Hold": ["In Progress"],
      "Under Review": ["In Progress"]
      // Employees cannot mark tasks as "Completed" - only management can
    };

    if (!validTransitions[task.status] || !validTransitions[task.status].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition from ${task.status} to ${status}`,
        },
        { status: 400 }
      );
    }

    // Update task status
    const updatedTask = await Task.findByIdAndUpdate(
      params.id,
      {
        $set: {
          status,
        },
        $push: {
          activity: {
            status: status,
            updatedBy: decoded.userId,
            comment: comment || undefined,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    )
    .populate("createdBy", "firstName lastName email")
    .populate("projectId", "name")
    .populate("activity.updatedBy", "firstName lastName email");

    return NextResponse.json({
      success: true,
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("PATCH /api/employee/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update task status",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
