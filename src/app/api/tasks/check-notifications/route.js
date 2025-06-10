// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/mongodb";
// import Task from "@/model/Task";
// import { User } from "@/model/User";
// import { verifyToken, getTokenFromHeaders } from "@/lib/auth";

// // Helper function to get and verify token from request
// const getAuthenticatedUser = (request) => {
//   const token = getTokenFromHeaders(request.headers);
//   if (!token) {
//     throw new Error("No token provided");
//   }
//   return verifyToken(token);
// };

// // GET - Check for task notifications (overdue, due soon, etc.)
// export async function GET(request) {
//   try {
//     // Verify token
//     const decoded = getAuthenticatedUser(request);

//     await dbConnect();

//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "User not found",
//         },
//         { status: 404 }
//       );
//     }

//     const now = new Date();
//     const tomorrow = new Date(now);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const nextWeek = new Date(now);
//     nextWeek.setDate(nextWeek.getDate() + 7);

//     let notifications = [];

//     if (user.role === "employee") {
//       // Employee notifications
//       const employeeTasks = await Task.find({
//         assignedTo: decoded.userId,
//         isActive: true,
//         status: { $ne: "Completed" }
//       }).populate("projectId", "name");

//       // Overdue tasks
//       const overdueTasks = employeeTasks.filter(task => task.dueDate < now);
//       if (overdueTasks.length > 0) {
//         notifications.push({
//           type: "overdue",
//           priority: "high",
//           title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
//           message: `You have ${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} that ${overdueTasks.length > 1 ? 'are' : 'is'} past the due date.`,
//           count: overdueTasks.length,
//           tasks: overdueTasks.map(t => ({
//             id: t._id,
//             title: t.title,
//             dueDate: t.dueDate,
//             project: t.projectId?.name
//           }))
//         });
//       }

//       // Due today
//       const dueTodayTasks = employeeTasks.filter(task => 
//         task.dueDate >= now && task.dueDate < tomorrow
//       );
//       if (dueTodayTasks.length > 0) {
//         notifications.push({
//           type: "due_today",
//           priority: "medium",
//           title: `${dueTodayTasks.length} Task${dueTodayTasks.length > 1 ? 's' : ''} Due Today`,
//           message: `You have ${dueTodayTasks.length} task${dueTodayTasks.length > 1 ? 's' : ''} due today.`,
//           count: dueTodayTasks.length,
//           tasks: dueTodayTasks.map(t => ({
//             id: t._id,
//             title: t.title,
//             dueDate: t.dueDate,
//             project: t.projectId?.name
//           }))
//         });
//       }

//       // Due this week
//       const dueThisWeekTasks = employeeTasks.filter(task => 
//         task.dueDate > tomorrow && task.dueDate <= nextWeek
//       );
//       if (dueThisWeekTasks.length > 0) {
//         notifications.push({
//           type: "due_soon",
//           priority: "low",
//           title: `${dueThisWeekTasks.length} Task${dueThisWeekTasks.length > 1 ? 's' : ''} Due This Week`,
//           message: `You have ${dueThisWeekTasks.length} task${dueThisWeekTasks.length > 1 ? 's' : ''} due within the next week.`,
//           count: dueThisWeekTasks.length,
//           tasks: dueThisWeekTasks.map(t => ({
//             id: t._id,
//             title: t.title,
//             dueDate: t.dueDate,
//             project: t.projectId?.name
//           }))
//         });
//       }

//     } else if (user.role === "management") {
//       // Management notifications
//       const allTasks = await Task.find({
//         isActive: true,
//         status: { $ne: "Completed" }
//       })
//       .populate("assignedTo", "firstName lastName")
//       .populate("projectId", "name");

//       // Overdue tasks across all employees
//       const overdueTasks = allTasks.filter(task => task.dueDate < now);
//       if (overdueTasks.length > 0) {
//         notifications.push({
//           type: "overdue",
//           priority: "high",
//           title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''} (Team)`,
//           message: `There ${overdueTasks.length > 1 ? 'are' : 'is'} ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} across the team.`,
//           count: overdueTasks.length,
//           tasks: overdueTasks.map(t => ({
//             id: t._id,
//             title: t.title,
//             dueDate: t.dueDate,
//             project: t.projectId?.name,
//             assignee: `${t.assignedTo?.firstName} ${t.assignedTo?.lastName}`
//           }))
//         });
//       }

//       // Tasks under review
//       const reviewTasks = allTasks.filter(task => task.status === "Under Review");
//       if (reviewTasks.length > 0) {
//         notifications.push({
//           type: "review_needed",
//           priority: "medium",
//           title: `${reviewTasks.length} Task${reviewTasks.length > 1 ? 's' : ''} Need Review`,
//           message: `${reviewTasks.length} task${reviewTasks.length > 1 ? 's are' : ' is'} waiting for your review.`,
//           count: reviewTasks.length,
//           tasks: reviewTasks.map(t => ({
//             id: t._id,
//             title: t.title,
//             dueDate: t.dueDate,
//             project: t.projectId?.name,
//             assignee: `${t.assignedTo?.firstName} ${t.assignedTo?.lastName}`
//           }))
//         });
//       }

//       // Tasks due today (team-wide)
//       const dueTodayTasks = allTasks.filter(task => 
//         task.dueDate >= now && task.dueDate < tomorrow
//       );
//       if (dueTodayTasks.length > 0) {
//         notifications.push({
//           type: "due_today",
//           priority: "medium",
//           title: `${dueTodayTasks.length} Task${dueTodayTasks.length > 1 ? 's' : ''} Due Today (Team)`,
//           message: `${dueTodayTasks.length} task${dueTodayTasks.length > 1 ? 's are' : ' is'} due today across the team.`,
//           count: dueTodayTasks.length,
//           tasks: dueTodayTasks.map(t => ({
//             id: t._id,
//             title: t.title,
//             dueDate: t.dueDate,
//             project: t.projectId?.name,
//             assignee: `${t.assignedTo?.firstName} ${t.assignedTo?.lastName}`
//           }))
//         });
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       notifications,
//       summary: {
//         total: notifications.reduce((sum, n) => sum + n.count, 0),
//         high: notifications.filter(n => n.priority === "high").length,
//         medium: notifications.filter(n => n.priority === "medium").length,
//         low: notifications.filter(n => n.priority === "low").length,
//       }
//     });
//   } catch (error) {
//     console.error("GET /api/tasks/check-notifications error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message || "Failed to check notifications",
//       },
//       { status: error.message === "No token provided" ? 401 : 500 }
//     );
//   }
// }
