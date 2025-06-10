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

// GET - Get tasks assigned to logged-in employee
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

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Build filter query for employee's tasks
    const filters = {};

    // Filter by status
    if (searchParams.get("status")) {
      filters.status = searchParams.get("status");
    }

    // Filter by priority
    if (searchParams.get("priority")) {
      filters.priority = searchParams.get("priority");
    }

    // Filter by project
    if (searchParams.get("projectId")) {
      filters.projectId = searchParams.get("projectId");
    }

    // Filter overdue tasks
    if (searchParams.get("overdue") === "true") {
      filters.overdue = true;
    }

    // Use the static method to get tasks
    const tasks = await Task.getTasksByEmployee(decoded.userId, filters);

    // Get task statistics
    const allTasks = await Task.find({ 
      assignedTo: decoded.userId, 
      isActive: true 
    });

    const stats = {
      total: allTasks.length,
      assigned: allTasks.filter(t => t.status === "Assigned").length,
      inProgress: allTasks.filter(t => t.status === "In Progress").length,
      onHold: allTasks.filter(t => t.status === "On Hold").length,
      underReview: allTasks.filter(t => t.status === "Under Review").length,
      completed: allTasks.filter(t => t.status === "Completed").length,
      overdue: allTasks.filter(t => t.dueDate < new Date() && t.status !== "Completed").length,
    };

    return NextResponse.json({
      success: true,
      tasks,
      stats,
    });
  } catch (error) {
    console.error("GET /api/employee/tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch assigned tasks",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// PUT - Update task status or add comment (Employee can only update their own tasks)
export async function PUT(request) {
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

    const body = await request.json();
    const { taskId, status, comment, actualHours } = body;

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: "Task ID is required",
        },
        { status: 400 }
      );
    }

    // Find the task
    const task = await Task.findById(taskId);

    if (!task || !task.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    // Verify task is assigned to this employee
    if (task.assignedTo.toString() !== decoded.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: You can only update your own tasks",
        },
        { status: 403 }
      );
    }

    // Update actual hours if provided
    if (actualHours !== undefined) {
      task.actualHours = actualHours;
    }

    // Handle status change with employee restrictions
    if (status !== undefined && status !== task.status) {
      // Define allowed status transitions for employees
      const allowedTransitions = {
        "Assigned": ["In Progress"],
        "In Progress": ["On Hold", "Under Review"],
        "On Hold": ["In Progress"],
        "Under Review": ["In Progress"], // Employee can request changes
      };

      // Only management can mark as completed
      if (status === "Completed") {
        return NextResponse.json(
          {
            success: false,
            error: "Only management can mark tasks as completed",
          },
          { status: 403 }
        );
      }

      // Check if the transition is allowed
      const allowed = allowedTransitions[task.status];
      if (!allowed || !allowed.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot transition from ${task.status} to ${status}`,
          },
          { status: 400 }
        );
      }

      task.activity.push({
        status,
        updatedBy: decoded.userId,
        comment: comment || `Status changed to ${status}`,
      });
      task.status = status;
    }
    // Add comment without status change
    else if (comment) {
      task.activity.push({
        status: task.status,
        updatedBy: decoded.userId,
        comment,
      });
    }

    await task.save();

    // Populate task data for response
    await task.populate([
      { path: "projectId", select: "name details isActive" },
      { path: "assignedTo", select: "firstName lastName email" },
      { path: "createdBy", select: "firstName lastName email" },
      { path: "activity.updatedBy", select: "firstName lastName email" },
    ]);

    return NextResponse.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("PUT /api/employee/tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update task",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}