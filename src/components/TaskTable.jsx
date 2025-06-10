"use client";

import { useState } from "react";
import { formatDueDate, isTaskOverdue } from "../utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  RateReview as ReviewIcon,
  Assignment as TaskIcon,
  MoreHoriz,
} from "@mui/icons-material";

const TaskTable = ({ 
  tasks, 
  onView, 
  onEdit,
  onStatusUpdate, 
  onDelete, 
  loading, 
  sortBy, 
  sortOrder, 
  onSort 
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "Assigned": return "default";
      case "In Progress": return "primary";
      case "On Hold": return "warning";
      case "Under Review": return "info";
      case "Completed": return "success";
      default: return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low": return "success";
      case "Medium": return "warning";
      case "High": return "error";
      case "Critical": return "error";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Assigned": return <TaskIcon fontSize="small" />;
      case "In Progress": return <PlayArrowIcon fontSize="small" />;
      case "On Hold": return <PauseIcon fontSize="small" />;
      case "Under Review": return <ReviewIcon fontSize="small" />;
      case "Completed": return <CheckCircleIcon fontSize="small" />;
      default: return <TaskIcon fontSize="small" />;
    }
  };

  const handleMenuOpen = (event, task) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTask(null);
  };

  const handleMenuAction = (action) => {
    if (!selectedTask) return;
    
    switch (action) {
      case "view":
        onView(selectedTask);
        break;
      case "edit":
        onEdit(selectedTask);
        break;
      case "delete":
        onDelete(selectedTask._id);
        break;
      default:
        break;
    }
    
    handleMenuClose();
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="tasks table">
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            <TableCell sx={{ fontWeight: "bold", color: "white" }}>
              <TableSortLabel
                active={sortBy === "title"}
                direction={sortBy === "title" ? sortOrder : "asc"}
                onClick={() => onSort("title")}
                sx={{
                  color: "white !important",
                  "&:hover": { color: "white !important" },
                }}
              >
                Task
              </TableSortLabel>
            </TableCell>
            
            <TableCell sx={{ fontWeight: "bold", color: "white" }}>
              <TableSortLabel
                active={sortBy === "status"}
                direction={sortBy === "status" ? sortOrder : "asc"}
                onClick={() => onSort("status")}
                sx={{
                  color: "white !important",
                  "&:hover": { color: "white !important" },
                }}
              >
                Status
              </TableSortLabel>
            </TableCell>
            
            <TableCell sx={{ fontWeight: "bold", color: "white" }}>
              <TableSortLabel
                active={sortBy === "priority"}
                direction={sortBy === "priority" ? sortOrder : "asc"}
                onClick={() => onSort("priority")}
                sx={{
                  color: "white !important",
                  "&:hover": { color: "white !important" },
                }}
              >
                Priority
              </TableSortLabel>
            </TableCell>
            
            <TableCell sx={{ fontWeight: "bold", color: "white" }}>
              <TableSortLabel
                active={sortBy === "assignee"}
                direction={sortBy === "assignee" ? sortOrder : "asc"}
                onClick={() => onSort("assignee")}
                sx={{
                  color: "white !important",
                  "&:hover": { color: "white !important" },
                }}
              >
                Assignee
              </TableSortLabel>
            </TableCell>
            
            <TableCell sx={{ fontWeight: "bold", color: "white" }}>
              <TableSortLabel
                active={sortBy === "dueDate"}
                direction={sortBy === "dueDate" ? sortOrder : "asc"}
                onClick={() => onSort("dueDate")}
                sx={{
                  color: "white !important",
                  "&:hover": { color: "white !important" },
                }}
              >
                Due Date
              </TableSortLabel>
            </TableCell>
            
            <TableCell sx={{ fontWeight: "bold", color: "white" }}>
              Project
            </TableCell>
            
            <TableCell sx={{ fontWeight: "bold", color: "white" }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        
        <TableBody>
          {tasks.map((task, index) => (
            <TableRow
              key={task._id}
              sx={{
                "&:hover": {
                  bgcolor: "primary.50",
                },
                bgcolor: index % 2 === 0 ? "grey.50" : "white",
              }}
            >
              {/* Task Title & Description */}
              <TableCell sx={{ maxWidth: 300 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {task.title}
                </Typography>
                {task.description && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {task.description}
                  </Typography>
                )}
              </TableCell>
              
              {/* Status */}
              <TableCell>
                <Chip
                  icon={getStatusIcon(task.status)}
                  label={task.status}
                  color={getStatusColor(task.status)}
                  size="small"
                  sx={{ pointerEvents: "none" }}
                />
              </TableCell>
              
              {/* Priority */}
              <TableCell>
                <Chip
                  label={task.priority}
                  color={getPriorityColor(task.priority)}
                  size="small"
                  variant="outlined"
                  sx={{ pointerEvents: "none" }}
                />
              </TableCell>
              
              {/* Assignee */}
              <TableCell>
                {task.assignedTo ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar 
                      sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                    >
                      {task.assignedTo.email.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        {task.assignedTo.firstName && task.assignedTo.lastName
                          ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                          : task.assignedTo.email
                        }
                      </Typography>
                      {task.assignedTo.firstName && task.assignedTo.lastName && (
                        <Typography variant="caption" color="text.secondary">
                          {task.assignedTo.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Unassigned
                  </Typography>
                )}
              </TableCell>
              
              {/* Due Date */}
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ScheduleIcon 
                    fontSize="small" 
                    color={isTaskOverdue(task.dueDate) ? "error" : "action"} 
                  />
                  <Box>
                    <Typography 
                      variant="body2"
                      color={isTaskOverdue(task.dueDate) ? "error.main" : "text.primary"}
                    >
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                    </Typography>
                    {task.dueDate && (
                      <Typography 
                        variant="caption" 
                        color={isTaskOverdue(task.dueDate) ? "error.main" : "text.secondary"}
                        sx={{ fontWeight: isTaskOverdue(task.dueDate) ? 600 : 400 }}
                      >
                        {formatDueDate(task.dueDate)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </TableCell>
              
              {/* Project */}
              <TableCell>
                {task.projectId ? (
                  <Typography variant="body2">
                    {task.projectId.name}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No project
                  </Typography>
                )}
              </TableCell>
              
              {/* Actions */}
              <TableCell>
                <Box sx={{ display: "flex", gap: 1 }}>                  
                  <Tooltip title="More actions">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, task)}
                    >
                      <MoreHoriz fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleMenuAction("view")}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction("edit")}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit Task
        </MenuItem>
        <MenuItem 
          onClick={() => handleMenuAction("delete")}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Task
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};

export default TaskTable;
