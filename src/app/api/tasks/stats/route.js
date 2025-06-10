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

// GET - Get task statistics (Management only)
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
          error: "Unauthorized: Only management can view task statistics",
        },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Build base query
    const baseQuery = { isActive: true };

    // Filter by project if specified
    if (searchParams.get("projectId")) {
      baseQuery.projectId = searchParams.get("projectId");
    }

    // Get all active tasks
    const allTasks = await Task.find(baseQuery);

    // Calculate overall statistics
    const overallStats = {
      total: allTasks.length,
      assigned: allTasks.filter(t => t.status === "Assigned").length,
      inProgress: allTasks.filter(t => t.status === "In Progress").length,
      onHold: allTasks.filter(t => t.status === "On Hold").length,
      underReview: allTasks.filter(t => t.status === "Under Review").length,
      completed: allTasks.filter(t => t.status === "Completed").length,
      overdue: allTasks.filter(t => t.dueDate < new Date() && t.status !== "Completed").length,
    };

    // Calculate priority distribution
    const priorityStats = {
      low: allTasks.filter(t => t.priority === "Low").length,
      medium: allTasks.filter(t => t.priority === "Medium").length,
      high: allTasks.filter(t => t.priority === "High").length,
      critical: allTasks.filter(t => t.priority === "Critical").length,
    };

    // Calculate completion rate
    const completionRate = allTasks.length > 0 
      ? Math.round((overallStats.completed / allTasks.length) * 100) 
      : 0;

    // Get tasks due in the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingTasks = allTasks.filter(t => 
      t.dueDate <= nextWeek && 
      t.dueDate > new Date() && 
      t.status !== "Completed"
    ).length;

    // Get employee workload (tasks per employee)
    const employeeWorkload = {};
    allTasks.forEach(task => {
      if (task.assignedTo) {
        const empId = task.assignedTo.toString();
        if (!employeeWorkload[empId]) {
          employeeWorkload[empId] = {
            total: 0,
            completed: 0,
            overdue: 0,
            inProgress: 0,
          };
        }
        employeeWorkload[empId].total++;
        if (task.status === "Completed") {
          employeeWorkload[empId].completed++;
        } else if (task.dueDate < new Date()) {
          employeeWorkload[empId].overdue++;
        } else if (task.status === "In Progress") {
          employeeWorkload[empId].inProgress++;
        }
      }
    });

    // Get project task distribution
    const projectDistribution = {};
    allTasks.forEach(task => {
      if (task.projectId) {
        const projId = task.projectId.toString();
        if (!projectDistribution[projId]) {
          projectDistribution[projId] = {
            total: 0,
            completed: 0,
            overdue: 0,
            inProgress: 0,
          };
        }
        projectDistribution[projId].total++;
        if (task.status === "Completed") {
          projectDistribution[projId].completed++;
        } else if (task.dueDate < new Date() && task.status !== "Completed") {
          projectDistribution[projId].overdue++;
        } else if (task.status === "In Progress") {
          projectDistribution[projId].inProgress++;
        }
      }
    });

    return NextResponse.json({
      success: true,
      statistics: {
        overall: overallStats,
        priority: priorityStats,
        completionRate,
        upcomingTasks,
        employeeWorkload,
        projectDistribution,
      },
    });
  } catch (error) {
    console.error("GET /api/tasks/stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch task statistics",
      },
      { status: error.message === "No token provided" ? 401 : 500 }
    );
  }
}
