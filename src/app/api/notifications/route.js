// import { NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
// import dbConnect from "@/lib/mongodb";
// import { Task } from "@/model";

// export async function GET(request) {
//   try {
//     await dbConnect();

//     const authHeader = request.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "No token provided" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Get user's task notifications
//     const userId = decoded.userId;
//     const currentDate = new Date();
    
//     // Find tasks assigned to the user that need attention
//     const notifications = [];

//     // Overdue tasks
//     const overdueTasks = await Task.find({
//       assignedTo: userId,
//       status: { $in: ["Assigned", "In Progress"] },
//       dueDate: { $lt: currentDate }
//     }).populate("project", "name").limit(10);

//     overdueTasks.forEach(task => {
//       notifications.push({
//         id: `overdue-${task._id}`,
//         type: "overdue",
//         title: "Task Overdue",
//         message: `Task "${task.title}" is overdue`,
//         taskId: task._id,
//         projectName: task.project?.name,
//         priority: task.priority,
//         dueDate: task.dueDate,
//         createdAt: task.dueDate
//       });
//     });

//     // Tasks due today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const dueTodayTasks = await Task.find({
//       assignedTo: userId,
//       status: { $in: ["Assigned", "In Progress"] },
//       dueDate: { $gte: today, $lt: tomorrow }
//     }).populate("project", "name").limit(10);

//     dueTodayTasks.forEach(task => {
//       notifications.push({
//         id: `due-today-${task._id}`,
//         type: "due_today",
//         title: "Task Due Today",
//         message: `Task "${task.title}" is due today`,
//         taskId: task._id,
//         projectName: task.project?.name,
//         priority: task.priority,
//         dueDate: task.dueDate,
//         createdAt: task.dueDate
//       });
//     });

//     // Recently assigned tasks (last 24 hours)
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);

//     const recentTasks = await Task.find({
//       assignedTo: userId,
//       status: "Assigned",
//       createdAt: { $gte: yesterday }
//     }).populate("project", "name").limit(5);

//     recentTasks.forEach(task => {
//       notifications.push({
//         id: `new-${task._id}`,
//         type: "new_assignment",
//         title: "New Task Assigned",
//         message: `You have been assigned a new task: "${task.title}"`,
//         taskId: task._id,
//         projectName: task.project?.name,
//         priority: task.priority,
//         dueDate: task.dueDate,
//         createdAt: task.createdAt
//       });
//     });

//     // Sort notifications by creation date (most recent first)
//     notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     return NextResponse.json({
//       notifications: notifications.slice(0, 20), // Limit to 20 notifications
//       unreadCount: notifications.length
//     });

//   } catch (error) {
//     console.error("Error fetching notifications:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch notifications" },
//       { status: 500 }
//     );
//   }
// }
