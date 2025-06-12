"use client";

import { useEffect, useState } from "react";
import { formatDueDate, isTaskOverdue } from "../utils/dateUtils";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  RateReview as ReviewIcon,
  Assignment as TaskIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

const AssignedTasks = ({ user, onBack, onTaskCountChange }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Task action menu
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [actionMenuTask, setActionMenuTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (onTaskCountChange) {
      onTaskCountChange(tasks.length);
    }
  }, [tasks.length, onTaskCountChange]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token");
        return;
      }

      const response = await fetch("/api/employee/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch tasks");
        } else {
          throw new Error(`HTTP ${response.status}: Failed to fetch tasks`);
        }
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus, comment = "") => {
    setStatusUpdateLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/employee/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          comment: comment.trim() || undefined,
        }),
      });

      if (!response.ok) {
        // Try to get error message from response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update task status");
        } else {
          throw new Error(`HTTP ${response.status}: Failed to update task status`);
        }
      }

      const updatedTask = await response.json();
      
      // Update the task in local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId ? updatedTask.task : task
        )
      );

      setSelectedTask(null);
      setShowTaskModal(false);
      setActionMenuAnchor(null);
      setActionMenuTask(null);
    } catch (err) {
      console.error("Error updating task status:", err);
      setError(err.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

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
      case "Assigned": return <TaskIcon />;
      case "In Progress": return <PlayArrowIcon />;
      case "On Hold": return <PauseIcon />;
      case "Under Review": return <ReviewIcon />;
      case "Completed": return <CheckCircleIcon />;
      default: return <TaskIcon />;
    }
  };

  const canUpdateStatus = (currentStatus, newStatus) => {
    const validTransitions = {
      "Assigned": ["In Progress"],
      "In Progress": ["On Hold", "Under Review"],
      "On Hold": ["In Progress"],
      "Under Review": ["In Progress"]
      // Employees cannot mark tasks as "Completed" - only management can
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const getAvailableStatusOptions = (currentStatus) => {
    const transitions = {
      "Assigned": ["In Progress"],
      "In Progress": ["On Hold", "Under Review"],
      "On Hold": ["In Progress"],
      "Under Review": ["In Progress"]
    };
    
    return transitions[currentStatus] || [];
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31");
          bValue = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31");
          break;
        case "priority":
          const priorityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleActionMenuOpen = (event, task) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setActionMenuTask(task);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setActionMenuTask(null);
  };

  const handleQuickStatusUpdate = (newStatus) => {
    if (actionMenuTask) {
      handleTaskStatusUpdate(actionMenuTask._id, newStatus);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: "grey.50",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading your tasks...
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "grey.50", minHeight: "100vh" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "transparent",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="primary"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: "text.primary" }}
          >
            My Tasks
          </Typography>
          
          {/* Filter and Sort Controls */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="On Hold">On Hold</MenuItem>
                <MenuItem value="Under Review">Under Review</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All Priority</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              startIcon={<SortIcon />}
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mb: 4, color: "primary.main" }}
        >
          My Assigned Tasks ({filteredAndSortedTasks.length})
        </Typography>

        {filteredAndSortedTasks.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {tasks.length === 0 ? "No tasks assigned" : "No tasks match your filters"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tasks.length === 0 
                ? "You haven't been assigned any tasks yet. Check back later."
                : "Try adjusting your filter criteria to see more tasks."
              }
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "title"}
                      direction={sortBy === "title" ? sortOrder : "asc"}
                      onClick={() => {
                        if (sortBy === "title") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("title");
                          setSortOrder("asc");
                        }
                      }}
                    >
                      Task Title
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "status"}
                      direction={sortBy === "status" ? sortOrder : "asc"}
                      onClick={() => {
                        if (sortBy === "status") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("status");
                          setSortOrder("asc");
                        }
                      }}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "priority"}
                      direction={sortBy === "priority" ? sortOrder : "asc"}
                      onClick={() => {
                        if (sortBy === "priority") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("priority");
                          setSortOrder("asc");
                        }
                      }}
                    >
                      Priority
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "dueDate"}
                      direction={sortBy === "dueDate" ? sortOrder : "asc"}
                      onClick={() => {
                        if (sortBy === "dueDate") {
                          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                        } else {
                          setSortBy("dueDate");
                          setSortOrder("asc");
                        }
                      }}
                    >
                      Due Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedTasks.map((task) => (
                  <TableRow
                    key={task._id}
                    sx={{
                      backgroundColor: isTaskOverdue(task.dueDate) ? "error.50" : "inherit",
                      "&:hover": {
                        backgroundColor: isTaskOverdue(task.dueDate) ? "error.100" : "action.hover",
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(task.status)}
                        label={task.status}
                        color={getStatusColor(task.status)}
                        size="small"
                        variant="filled"
                        sx={{ pointerEvents: "none" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                        variant="outlined"
                        sx={{ pointerEvents: "none" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={isTaskOverdue(task.dueDate) ? "error.main" : "text.secondary"}
                        sx={{ fontWeight: isTaskOverdue(task.dueDate) ? 600 : 400 }}
                      >
                        {formatDueDate(task.dueDate)}
                      </Typography>
                      {task.dueDate && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {task.projectId ? task.projectId.name : "No project"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.description || "No description provided"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        <Tooltip title="View Details">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskClick(task);
                            }}
                          >
                            View
                          </Button>
                        </Tooltip>
                        {getAvailableStatusOptions(task.status).length > 0 && (
                          <Tooltip title="Quick Actions">
                            <IconButton
                              size="small"
                              onClick={(e) => handleActionMenuOpen(e, task)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {actionMenuTask && getAvailableStatusOptions(actionMenuTask.status).map((status) => (
            <MenuItem
              key={status}
              onClick={() => handleQuickStatusUpdate(status)}
              disabled={statusUpdateLoading}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getStatusIcon(status)}
                Mark as {status}
              </Box>
            </MenuItem>
          ))}
          {actionMenuTask && getAvailableStatusOptions(actionMenuTask.status).length === 0 && (
            <MenuItem disabled>
              No status updates available
            </MenuItem>
          )}
        </Menu>

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          open={showTaskModal}
          onClose={() => {
            setSelectedTask(null);
            setShowTaskModal(false);
          }}
          onStatusUpdate={handleTaskStatusUpdate}
          loading={statusUpdateLoading}
        />
      </Container>
    </Box>
  );
};

// Task Detail Modal Component
const TaskDetailModal = ({ task, open, onClose, onStatusUpdate, loading }) => {
  const [comment, setComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleStatusUpdate = () => {
    if (selectedStatus && task) {
      onStatusUpdate(task._id, selectedStatus, comment);
      setComment("");
      setSelectedStatus("");
    }
  };

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

  if (!task) return null;

  const availableStatuses = {
    "Assigned": ["In Progress"],
    "In Progress": ["On Hold", "Under Review"],
    "On Hold": ["In Progress"],
    "Under Review": ["In Progress"]
  }[task.status] || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">{task.title}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={task.status}
              color={getStatusColor(task.status)}
              size="small"
              sx ={{ pointerEvents: "none" }}
            />
            <Chip
              label={task.priority}
              color={getPriorityColor(task.priority)}
              size="small"
              variant="outlined"
              sx ={{ pointerEvents: "none" }}
            />
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Description</Typography>
          <Typography variant="body2" color="text.secondary">
            {task.description || "No description provided"}
          </Typography>
        </Box>

        {task.dueDate && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Due Date</Typography>
            <Typography
              variant="body2"
              color={isTaskOverdue(task.dueDate) ? "error.main" : "text.secondary"}
            >
              {new Date(task.dueDate).toLocaleDateString()} ({formatDueDate(task.dueDate)})
            </Typography>
          </Box>
        )}

        {task.projectId && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Project</Typography>
            <Typography variant="body2" color="text.secondary">
              {task.projectId.name}
            </Typography>
          </Box>
        )}

        {task.createdBy && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Assigned By</Typography>
            <Typography variant="body2" color="text.secondary">
              {task.createdBy.firstName && task.createdBy.lastName 
                ? `${task.createdBy.firstName} ${task.createdBy.lastName} (${task.createdBy.email})`
                : task.createdBy.email
              }
            </Typography>
          </Box>
        )}

        {/* Activity Log */}
        {task.activity && task.activity.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>Activity History</Typography>
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: "auto" }}>
              <List dense>
                {task.activity.map((activity, index) => (
                  <ListItem key={index} divider={index < task.activity.length - 1}>
                    <ListItemText
                      primary={`Status changed to ${activity.status}`}
                      secondary={
                        <>
                          <span style={{ fontSize: "0.75rem", color: "gray", display: "block" }}>
                            {activity.updatedBy?.firstName && activity.updatedBy?.lastName 
                              ? `${activity.updatedBy.firstName} ${activity.updatedBy.lastName}`
                              : activity.updatedBy?.email || 'Unknown User'
                            } • {new Date(activity.timestamp).toLocaleString()}
                          </span>
                          {activity.comment && (
                            <span style={{ 
                              marginTop: "4px", 
                              fontStyle: "italic",
                              display: "block",
                              fontSize: "0.875rem"
                            }}>
                              "{activity.comment}"
                            </span>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        )}

        {/* Status Update Section */}
        {availableStatuses.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Update Status</Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="New Status"
              >
                {availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment about this status update..."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
        {availableStatuses.length > 0 && (
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!selectedStatus || loading}
          >
            {loading ? <CircularProgress size={20} /> : "Update Status"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AssignedTasks;
