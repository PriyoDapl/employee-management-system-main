"use client";

import { useState } from "react";
import { formatDueDate, isTaskOverdue } from "../utils/dateUtils";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

const TaskDetailModal = ({ 
  task, 
  open, 
  onClose, 
  onStatusUpdate, 
  onDelete, 
  onEdit, 
  loading, 
  projects, 
  employees 
}) => {
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [comment, setComment] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !task) return;

    setUpdateLoading(true);
    try {
      await onStatusUpdate(task._id, selectedStatus, comment.trim());
      setShowStatusUpdate(false);
      setSelectedStatus("");
      setComment("");
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdateLoading(false);
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

  const availableStatuses = ["Assigned", "In Progress", "On Hold", "Under Review", "Completed"];

  if (!task) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          minWidth: { xs: '90vw', sm: '600px', md: '800px' },
          maxWidth: '1000px',
          margin: { xs: '16px', sm: '32px' },
          borderRadius: '8px',
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {task.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={task.status}
                color={getStatusColor(task.status)}
                size="small"
                variant="outlined"
              />
              <Chip
                label={task.priority}
                color={getPriorityColor(task.priority)}
                size="small"
                variant="outlined"
              />
              {isTaskOverdue(task.dueDate) && (
                <Chip
                  label="OVERDUE"
                  color="error"
                  size="small"
                  variant="filled"
                />
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Grid container spacing={3}>
          {/* Main Task Information */}
          <Grid item xs={12} md={8}>
            {/* Description */}
            <Box sx={{ mb: 3, width: "30vw" }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Description
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {task.description || "No description provided"}
                </Typography>
              </Paper>
            </Box>

            {/* Activity Log */}
            {task.activity && task.activity.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Activity History
                </Typography>
                <Paper variant="outlined" sx={{ maxHeight: 250, overflow: "auto" }}>
                  <List dense>
                    {task.activity
                      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                      .map((activity, index) => (
                        <ListItem key={index} divider={index < task.activity.length - 1} sx={{ py: 1.5 }}>
                          <ListItemText
                            primary={
                              <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                                Status changed to {activity.status}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                  {activity.updatedBy?.firstName && activity.updatedBy?.lastName 
                                    ? `${activity.updatedBy.firstName} ${activity.updatedBy.lastName}`
                                    : activity.updatedBy?.email || 'Unknown User'
                                  } • {new Date(activity.timestamp).toLocaleString()}
                                </Typography>
                                {activity.comment && (
                                  <Typography component="span" variant="body2" sx={{ 
                                    display: "block",
                                    mt: 1, 
                                    fontStyle: "italic",
                                    p: 1.5,
                                    bgcolor: "grey.100",
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: "grey.300"
                                  }}>
                                    "{activity.comment}"
                                  </Typography>
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
            {!showStatusUpdate ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setShowStatusUpdate(true)}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Update Status
              </Button>
            ) : (
              <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Update Task Status
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>New Status</InputLabel>
                      <Select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        label="New Status"
                        disabled={updateLoading}
                      >
                        {availableStatuses
                          .filter(status => status !== task.status)
                          .map((status) => (
                            <MenuItem key={status} value={status}>
                              {status}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Comment (optional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment about this status update..."
                      disabled={updateLoading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleStatusUpdate}
                        disabled={!selectedStatus || updateLoading}
                      >
                        {updateLoading ? <CircularProgress size={20} /> : "Update Status"}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setShowStatusUpdate(false);
                          setSelectedStatus("");
                          setComment("");
                        }}
                        disabled={updateLoading}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}
          </Grid>

          {/* Side Information */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3, width: "30vw" }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Task Details
              </Typography>
              
              {/* Assignee */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Assigned To
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {task.assignedTo?.email || "Unassigned"}
                </Typography>
                {task.assignedTo?.firstName && task.assignedTo?.lastName && (
                  <Typography variant="caption" color="text.secondary">
                    {task.assignedTo.firstName} {task.assignedTo.lastName}
                  </Typography>
                )}
              </Box>

              {/* Project */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Project
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {task.projectId?.name || "No project assigned"}
                </Typography>
              </Box>

              {/* Due Date */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Due Date
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontWeight: 500,
                    color: isTaskOverdue(task.dueDate) ? "error.main" : "text.primary"
                  }}
                >
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                </Typography>
                {task.dueDate && (
                  <Typography 
                    variant="caption" 
                    color={isTaskOverdue(task.dueDate) ? "error.main" : "text.secondary"}
                    sx={{ display: "block", mt: 0.5, fontWeight: isTaskOverdue(task.dueDate) ? 600 : 400 }}
                  >
                    {formatDueDate(task.dueDate)}
                  </Typography>
                )}
              </Box>

              {/* Created By */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created By
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {task.createdBy?.firstName && task.createdBy?.lastName
                    ? `${task.createdBy.firstName} ${task.createdBy.lastName}`
                    : task.createdBy?.email || "Unknown"
                  }
                </Typography>
                {task.createdBy?.email && task.createdBy?.firstName && (
                  <Typography variant="caption" color="text.secondary">
                    {task.createdBy.email}
                  </Typography>
                )}
              </Box>

              {/* Created Date */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Created
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(task.createdAt).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Last Updated */}
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {new Date(task.updatedAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Paper>

            {/* Quick Actions */}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  disabled={loading}
                  variant="outlined"
                  fullWidth
                >
                  Edit Task
                </Button>
                
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  disabled={loading}
                  color="error"
                  variant="outlined"
                  fullWidth
                >
                  Delete Task
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailModal;
