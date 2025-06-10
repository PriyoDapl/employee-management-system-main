import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Task from "@/model/Task";
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

// POST - Create a new task (Management only)
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
          error: "Unauthorized: Only management can create tasks",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      projectId,
      assignedTo,
      priority,
      status,
      dueDate,
      estimatedHours,
      tags,
    } = body;

    // Validate required fields
    if (!title || !assignedTo) {
      return NextResponse.json(
        {
          success: false,
          error: "Title and assigned employee are required",
        },
        { status: 400 }
      );
    }

    // Verify project exists (if provided)
    if (projectId) {
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
    }

    // Verify employee exists and is active
    const employee = await User.findById(assignedTo);
    if (!employee || employee.role !== "employee" || !employee.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Employee not found or inactive",
        },
        { status: 404 }
      );
    }

    // Validate due date (if provided)
    let dueDateObj = null;
    if (dueDate) {
      dueDateObj = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDateOnly = new Date(dueDateObj);
      dueDateOnly.setHours(0, 0, 0, 0);
      
      if (dueDateOnly < today) {
        return NextResponse.json(
          {
            success: false,
            error: "Due date cannot be in the past",
          },
          { status: 400 }
        );
      }
    }

    // Create task
    const taskData = {
      title: title.trim(),
      assignedTo,
      createdBy: decoded.userId,
      priority: priority || "Medium",
      status: status || "Assigned",
      estimatedHours: estimatedHours || null,
      tags: tags || [],
    };

    // Add optional fields only if provided
    if (description && description.trim()) {
      taskData.description = description.trim();
    }
    
    if (projectId) {
      taskData.projectId = projectId;
    }
    
    if (dueDateObj) {
      taskData.dueDate = dueDateObj;
    }

    const task = new Task(taskData);

    await task.save();

    // Populate task data for response
    await task.populate([
      { path: "projectId", select: "name details isActive" },
      { path: "assignedTo", select: "firstName lastName email" },
      { path: "createdBy", select: "firstName lastName email" },
      { path: "activity.updatedBy", select: "firstName lastName email" },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/management/tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create task",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}

// GET - Get all tasks (for management with filters)
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
          error: "Unauthorized: Only management can view all tasks",
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Build filter query
    const query = { isActive: true };

    // Filter by project
    if (searchParams.get("projectId")) {
      query.projectId = searchParams.get("projectId");
    }

    // Filter by employee
    if (searchParams.get("assignedTo")) {
      query.assignedTo = searchParams.get("assignedTo");
    }

    // Filter by status
    if (searchParams.get("status")) {
      query.status = searchParams.get("status");
    }

    // Filter by priority
    if (searchParams.get("priority")) {
      query.priority = searchParams.get("priority");
    }

    // Filter by overdue tasks
    if (searchParams.get("overdue") === "true") {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: "Completed" };
    }

    // Date range filter
    if (searchParams.get("dueDateFrom") || searchParams.get("dueDateTo")) {
      query.dueDate = {};
      if (searchParams.get("dueDateFrom")) {
        query.dueDate.$gte = new Date(searchParams.get("dueDateFrom"));
      }
      if (searchParams.get("dueDateTo")) {
        query.dueDate.$lte = new Date(searchParams.get("dueDateTo"));
      }
    }

    // Fetch tasks with populated data
    let tasksQuery = Task.find(query)
      .populate("projectId", "name details isActive")
      .populate("assignedTo", "firstName lastName email")
      .populate("createdBy", "firstName lastName email")
      .populate("activity.updatedBy", "firstName lastName email");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "dueDate";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;
    
    if (sortBy === "dueDate") {
      tasksQuery = tasksQuery.sort({ dueDate: sortOrder, priority: -1 });
    } else if (sortBy === "priority") {
      tasksQuery = tasksQuery.sort({ priority: sortOrder, dueDate: 1 });
    } else if (sortBy === "createdAt") {
      tasksQuery = tasksQuery.sort({ createdAt: sortOrder });
    } else if (sortBy === "status") {
      tasksQuery = tasksQuery.sort({ status: sortOrder, dueDate: 1 });
    }

    // Pagination
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const skip = (page - 1) * limit;

    const tasks = await tasksQuery.skip(skip).limit(limit);
    const totalTasks = await Task.countDocuments(query);

    return NextResponse.json({
      success: true,
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTasks / limit),
        totalTasks,
        limit,
      },
    });
  } catch (error) {
    console.error("GET /api/management/tasks error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch tasks",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
