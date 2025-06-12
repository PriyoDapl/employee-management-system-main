"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Chip,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const CreateTaskModal = ({ open, onClose, onSuccess, projects, employees }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "Assigned",
    dueDate: null,
    assignedTo: "",
    projectId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (loading) return;
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      status: "Assigned",
      dueDate: null,
      assignedTo: "",
      projectId: "",
    });
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!formData.assignedTo) {
      setError("Please assign the task to an employee");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/management/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          priority: formData.priority,
          status: formData.status,
          dueDate: formData.dueDate ? (() => {
            const date = new Date(formData.dueDate);
            // Set to end of day to avoid timing issues with today's date
            date.setHours(23, 59, 59, 999);
            return date.toISOString();
          })() : undefined,
          assignedTo: formData.assignedTo,
          projectId: formData.projectId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      const result = await response.json();
      onSuccess(result.task);
      handleClose();
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create New Task
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Task Title *"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter a clear, descriptive title for the task"
              disabled={loading}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Provide detailed instructions, requirements, or context for this task"
              disabled={loading}
            />
          </Grid>

          {/* Assignee */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ width: "10vw" }} disabled={loading}>
              <InputLabel>Assign To *</InputLabel>
              <Select
                value={formData.assignedTo}
                onChange={(e) => handleChange("assignedTo", e.target.value)}
                label="Assign To *"
              >
                {employees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    <Box>
                      <Typography variant="body2">{employee.email}</Typography>
                      {employee.firstName && employee.lastName && (
                        <Typography variant="caption" color="text.secondary">
                          {employee.firstName} {employee.lastName}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Project */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={{ width: "10vw" }} disabled={loading}>
              <InputLabel>Project</InputLabel>
              <Select
                value={formData.projectId}
                onChange={(e) => handleChange("projectId", e.target.value)}
                label="Project"
              >
                <MenuItem value="">
                  <em>No Project</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    <Box>
                      <Typography variant="body2">{project.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {project.details?.substring(0, 50)}
                        {project.details?.length > 50 ? "..." : ""}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Priority */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                label="Priority"
              >
                <MenuItem value="Low">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Low" color="success" size="small" />
                    <Typography variant="body2">Low Priority</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Medium">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Medium" color="warning" size="small" />
                    <Typography variant="body2">Medium Priority</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="High">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="High" color="error" size="small" />
                    <Typography variant="body2">High Priority</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Critical">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip label="Critical" color="error" size="small" />
                    <Typography variant="body2">Critical Priority</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={loading}>
              <InputLabel>Initial Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                label="Initial Status"
              >
                <MenuItem value="Assigned">Assigned</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Due Date */}
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Due Date (Optional)"
                value={formData.dueDate}
                onChange={(date) => handleChange("dueDate", date)}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    helperText: "Select a deadline for this task"
                  }
                }}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title.trim() || !formData.assignedTo}
        >
          {loading ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              Creating...
            </Box>
          ) : (
            "Create Task"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskModal;
