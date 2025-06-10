// "use client";

// import { useState, useEffect } from "react";
// import {
//   IconButton,
//   Badge,
//   Menu,
//   MenuItem,
//   Typography,
//   Box,
//   Divider,
//   List,
//   ListItem,
//   ListItemText,
//   ListItemIcon,
//   Chip,
//   Paper,
//   Button,
// } from "@mui/material";
// import {
//   Notifications as NotificationsIcon,
//   NotificationImportant as UrgentIcon,
//   Schedule as ScheduleIcon,
//   Assignment as AssignmentIcon,
//   Warning as WarningIcon,
// } from "@mui/icons-material";

// const NotificationMenu = ({ user }) => {
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const isOpen = Boolean(anchorEl);

//   useEffect(() => {
//     if (user) {
//       fetchNotifications();
//       // Refresh notifications every 5 minutes
//       const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
//       return () => clearInterval(interval);
//     }
//   }, [user]);

//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");
//       if (!token) return;

//       const response = await fetch("/api/notifications", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setNotifications(data.notifications || []);
//         setUnreadCount(data.unreadCount || 0);
//       }
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//     if (notifications.length === 0) {
//       fetchNotifications();
//     }
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case "overdue":
//         return <WarningIcon color="error" />;
//       case "due_today":
//         return <ScheduleIcon color="warning" />;
//       case "new_assignment":
//         return <AssignmentIcon color="primary" />;
//       default:
//         return <NotificationsIcon />;
//     }
//   };

//   const getNotificationColor = (type) => {
//     switch (type) {
//       case "overdue":
//         return "error";
//       case "due_today":
//         return "warning";
//       case "new_assignment":
//         return "primary";
//       default:
//         return "default";
//     }
//   };

//   const formatDate = (date) => {
//     const now = new Date();
//     const notificationDate = new Date(date);
//     const diffTime = now - notificationDate;
//     const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//     if (diffHours < 1) {
//       return "Just now";
//     } else if (diffHours < 24) {
//       return `${diffHours}h ago`;
//     } else {
//       return `${diffDays}d ago`;
//     }
//   };

//   return (
//     <>
//       <IconButton
//         color="inherit"
//         onClick={handleClick}
//         sx={{ mr: 1 }}
//       >
//         <Badge badgeContent={unreadCount} color="error">
//           <NotificationsIcon />
//         </Badge>
//       </IconButton>

//       <Menu
//         anchorEl={anchorEl}
//         open={isOpen}
//         onClose={handleClose}
//         PaperProps={{
//           sx: {
//             maxWidth: 400,
//             width: "100%",
//             maxHeight: 500,
//           },
//         }}
//         transformOrigin={{ horizontal: "right", vertical: "top" }}
//         anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
//       >
//         <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
//           <Typography variant="h6" component="div">
//             Notifications
//           </Typography>
//           {unreadCount > 0 && (
//             <Typography variant="caption" color="text.secondary">
//               {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
//             </Typography>
//           )}
//         </Box>

//         {loading ? (
//           <Box sx={{ p: 3, textAlign: "center" }}>
//             <Typography variant="body2" color="text.secondary">
//               Loading notifications...
//             </Typography>
//           </Box>
//         ) : notifications.length === 0 ? (
//           <Box sx={{ p: 3, textAlign: "center" }}>
//             <Typography variant="body2" color="text.secondary">
//               No new notifications
//             </Typography>
//           </Box>
//         ) : (
//           <List sx={{ maxHeight: 350, overflow: "auto", p: 0 }}>
//             {notifications.map((notification, index) => (
//               <div key={notification.id}>
//                 <ListItem
//                   sx={{
//                     alignItems: "flex-start",
//                     "&:hover": {
//                       bgcolor: "action.hover",
//                     },
//                   }}
//                 >
//                   <ListItemIcon sx={{ mt: 1 }}>
//                     {getNotificationIcon(notification.type)}
//                   </ListItemIcon>
//                   <ListItemText
//                     primary={
//                       <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                         <Typography variant="subtitle2" component="span">
//                           {notification.title}
//                         </Typography>
//                         <Chip
//                           label={notification.priority}
//                           size="small"
//                           color={
//                             notification.priority === "High" || notification.priority === "Urgent"
//                               ? "error"
//                               : notification.priority === "Medium"
//                               ? "warning"
//                               : "default"
//                           }
//                           sx={{ height: 20 }}
//                         />
//                       </Box>
//                     }
//                     secondary={
//                       <Box>
//                         <Typography variant="body2" color="text.primary">
//                           {notification.message}
//                         </Typography>
//                         {notification.projectName && (
//                           <Typography variant="caption" color="text.secondary">
//                             Project: {notification.projectName}
//                           </Typography>
//                         )}
//                         <Typography variant="caption" color="text.secondary" display="block">
//                           {formatDate(notification.createdAt)}
//                         </Typography>
//                       </Box>
//                     }
//                   />
//                 </ListItem>
//                 {index < notifications.length - 1 && <Divider />}
//               </div>
//             ))}
//           </List>
//         )}

//         {notifications.length > 0 && (
//           <>
//             <Divider />
//             <Box sx={{ p: 2, textAlign: "center" }}>
//               <Button
//                 size="small"
//                 variant="text"
//                 onClick={() => {
//                   handleClose();
//                   // Navigate to tasks page
//                   window.location.href = "/employee"; // or appropriate routing
//                 }}
//               >
//                 View All Tasks
//               </Button>
//             </Box>
//           </>
//         )}
//       </Menu>
//     </>
//   );
// };

// export default NotificationMenu;
