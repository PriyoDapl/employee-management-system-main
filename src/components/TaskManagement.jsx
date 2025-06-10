"use client";

import { useState, useEffect } from "react";
import { formatDueDate, isTaskOverdue } from "../utils/dateUtils";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Sort as SortIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  RateReview as ReviewIcon,
  Assignment as TaskIcon,
} from "@mui/icons-material";

import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import TaskTable from "./TaskTable";

const TaskManagement = ({ user, onBack, onTaskCountChange }) => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // View mode
  // const [viewMode, setViewMode] = useState("table"); // Only table view now

  useEffect(() => {
    Promise.all([
      fetchTasks(),
      fetchProjects(),
      fetchEmployees()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/management/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data.tasks || []);
      
      // Update task count in parent
      if (onTaskCountChange) {
        onTaskCountChange(data.tasks?.length || 0);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/management/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      const employeeUsers = data.filter(user => user.role === "employee");
      setEmployees(employeeUsers);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/management/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete task");
      
      setTasks(prev => prev.filter(task => task._id !== taskId));
      setSuccess("Task deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus, comment = "") => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/management/tasks/${taskId}`, {
        method: "PUT",
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      const updatedTask = await response.json();
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updatedTask.task : task
      ));
      
      // Also refresh the selected task if it's being viewed
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(updatedTask.task);
      }
      
      setSuccess("Task updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
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



  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (assigneeFilter !== "all" && task.assignedTo?._id !== assigneeFilter) return false;
      if (projectFilter !== "all" && task.projectId?._id !== projectFilter) return false;
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
        case "assignee":
          aValue = a.assignedTo?.email || "";
          bValue = b.assignedTo?.email || "";
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

  const handleTaskView = async (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
    
    // Fetch detailed task information including activity history
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/management/tasks/${task._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const detailedTask = await response.json();
        setSelectedTask(detailedTask.task);
      }
    } catch (err) {
      console.error("Error fetching task details:", err);
    }
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const byStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    const overdue = tasks.filter(task => isTaskOverdue(task.dueDate)).length;
    const dueToday = tasks.filter(task => {
      if (!task.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      return today.toDateString() === dueDate.toDateString();
    }).length;

    return { total, byStatus, overdue, dueToday };
  };

  const stats = getTaskStats();

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
            Loading task management...
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
            Task Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Header and Stats */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ color: "primary.main" }}
          >
            Task Management
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateModal(true)}
            size="large"
          >
            Create Task
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Tasks
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Overdue
                </Typography>
                <Typography variant="h4" color="error">
                  {stats.overdue}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Due Today
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.dueToday}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.byStatus.Completed || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
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
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
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
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  label="Assignee"
                >
                  <MenuItem value="all">All Assignees</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.email}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  label="Project"
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
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
                  <MenuItem value="assignee">Assignee</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                startIcon={<SortIcon />}
                sx={{ height: "40px" }}
              >
                {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tasks Display */}
        <Typography variant="h6" gutterBottom>
          Tasks ({filteredAndSortedTasks.length})
        </Typography>

        {filteredAndSortedTasks.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {tasks.length === 0 ? "No tasks created" : "No tasks match your filters"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tasks.length === 0 
                ? "Create your first task to get started."
                : "Try adjusting your filter criteria to see more tasks."
              }
            </Typography>
          </Paper>
        ) : (
          <TaskTable
            tasks={filteredAndSortedTasks}
            onView={handleTaskView}
            onEdit={(task) => {
              setSelectedTask(task);
              setShowEditModal(true);
            }}
            onStatusUpdate={handleTaskStatusUpdate}
            onDelete={handleTaskDelete}
            loading={actionLoading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(field) => {
              if (sortBy === field) {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              } else {
                setSortBy(field);
                setSortOrder("asc");
              }
            }}
          />
        )}

        {/* Create Task Modal */}
        <CreateTaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTasks();
            setSuccess("Task created successfully");
            setTimeout(() => setSuccess(""), 3000);
          }}
          projects={projects}
          employees={employees}
        />

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          open={showTaskModal}
          onClose={() => {
            setSelectedTask(null);
            setShowTaskModal(false);
          }}
          onStatusUpdate={handleTaskStatusUpdate}
          onDelete={() => {
            handleTaskDelete(selectedTask._id);
            setSelectedTask(null);
            setShowTaskModal(false);
          }}
          loading={actionLoading}
          projects={projects}
          employees={employees}
          onEdit={() => {
            setShowTaskModal(false);
            setShowEditModal(true);
          }}
        />

        {/* Edit Task Modal */}
        <EditTaskModal
          open={showEditModal}
          onClose={() => {
            setSelectedTask(null);
            setShowEditModal(false);
          }}
          onSuccess={(updatedTask) => {
            setShowEditModal(false);
            setSelectedTask(null);
            fetchTasks();
            setSuccess("Task updated successfully");
            setTimeout(() => setSuccess(""), 3000);
          }}
          task={selectedTask}
          projects={projects}
          employees={employees}
        />
      </Container>
    </Box>
  );
};

export default TaskManagement;

