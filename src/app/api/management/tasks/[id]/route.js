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

// GET - Get a specific task by ID
export async function GET(request, { params }) {
  try {
    // Verify token
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    const { id: taskId } = params;

    // Find the task
    const task = await Task.findById(taskId)
      .populate("projectId", "name details isActive")
      .populate("assignedTo", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")
      .populate("activity.updatedBy", "firstName lastName email");

    if (!task || !task.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    // Check authorization
    const user = await User.findById(decoded.userId);
    const isManagement = user.role === "management";
    const isAssignedEmployee = task.assignedTo._id.toString() === decoded.userId;

    if (!isManagement && !isAssignedEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: You can only access your own tasks",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("GET /api/management/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch task",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// PUT - Update a task (Management can update everything, employees can update status and add comments)
export async function PUT(request, { params }) {
  try {
    // Verify token
    const decoded = getAuthenticatedUser(request);

    await dbConnect();

    const { id: taskId } = params;
    const body = await request.json();

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

    // Check authorization
    const user = await User.findById(decoded.userId);
    const isManagement = user.role === "management";
    const isAssignedEmployee = task.assignedTo.toString() === decoded.userId;

    if (!isManagement && !isAssignedEmployee) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: You can only update your own tasks",
        },
        { status: 403 }
      );
    }

    // Management can update everything
    if (isManagement) {
      const {
        title,
        description,
        assignedTo,
        priority,
        dueDate,
        estimatedHours,
        actualHours,
        tags,
        status,
        comment,
      } = body;

      // Update fields if provided
      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) {
        const dueDateObj = new Date(dueDate);
        if (dueDateObj <= new Date() && task.status !== "Completed") {
          return NextResponse.json(
            {
              success: false,
              error: "Due date must be in the future for non-completed tasks",
            },
            { status: 400 }
          );
        }
        task.dueDate = dueDateObj;
      }
      if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
      if (actualHours !== undefined) task.actualHours = actualHours;
      if (tags !== undefined) task.tags = tags;

      // Handle status change
      if (status !== undefined && status !== task.status) {
        task.activity.push({
          status,
          updatedBy: decoded.userId,
          comment: comment || `Status changed to ${status}`,
        });
        task.status = status;
      }
    }
    // Employees can only update status and add comments
    else if (isAssignedEmployee) {
      const { status, comment, actualHours } = body;

      // Employees can update actual hours
      if (actualHours !== undefined) {
        task.actualHours = actualHours;
      }

      // Handle status change with restrictions
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
    console.error("PUT /api/management/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update task",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// DELETE - Delete a task (Management only)
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
          error: "Unauthorized: Only management can delete tasks",
        },
        { status: 403 }
      );
    }

    const { id: taskId } = params;

    // Find and soft delete the task (set isActive to false)
    const task = await Task.findById(taskId);

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    task.isActive = false;
    task.activity.push({
      status: task.status,
      updatedBy: decoded.userId,
      comment: "Task deleted",
    });

    await task.save();

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/management/tasks/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete task",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
