"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import ConfirmationModal from "./ConfirmationModal";

const ProjectManagementDetailsModal = ({ project, open, onClose, onRefresh }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  useEffect(() => {
    if (open && project) {
      fetchProjectAssignments();
    }
  }, [open, project]);

  const fetchProjectAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/management/projects/assign", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project assignments");
      }

      const data = await response.json();
      const allAssignments = data.assignments || [];
      
      // Filter assignments for this specific project
      const projectAssignments = allAssignments.filter(
        assignment => assignment.projectId?._id === project._id
      );
      
      setAssignments(projectAssignments);
    } catch (err) {
      console.error("Error fetching project assignments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteConfirmation(true);
  };

  const confirmRemoveAssignment = async () => {
    if (!assignmentToDelete) return;
    
    setActionLoading(true);
    setError("");
    setSuccess("");
    setShowDeleteConfirmation(false);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `/api/management/projects/assign/${assignmentToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setSuccess("Employee removed from project successfully!");
        fetchProjectAssignments(); // Refresh assignments
        if (onRefresh) onRefresh(); // Refresh parent data
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to remove assignment");
      }
    } catch (err) {
      console.error("Error removing assignment:", err);
      setError("Error removing assignment");
    } finally {
      setActionLoading(false);
      setAssignmentToDelete(null);
    }
  };

  const cancelRemoveAssignment = () => {
    setShowDeleteConfirmation(false);
    setAssignmentToDelete(null);
  };

  if (!project) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2, 
        borderBottom: "1px solid", 
        borderColor: "divider",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AssignmentIcon color="primary" />
          <Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {project.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Project Details & Assignments
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ m: 3, mb: 0 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ m: 3, mb: 0 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* Project Information Section */}
        <Box sx={{ p: 3, bgcolor: "grey.50" }}>
          <Typography variant="h6" gutterBottom sx={{ color: "primary.main", fontWeight: 600 }}>
            Project Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {project.details || "No description available"}
                  </Typography>
                  
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={project.isActive === false ? "Inactive" : "Active"}
                      color={project.isActive === false ? "default" : "success"}
                      size="small"
                      sx={{ fontWeight: 500, pointerEvents: "none" }}
                    />
                    <Chip
                      label={`${assignments.length} Assigned`}
                      variant="outlined"
                      size="small"
                      color="primary"
                        sx={{ pointerEvents: "none" }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Project Timeline
                  </Typography>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </Box>
                  
                  {project.updatedAt !== project.createdAt && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Updated:</strong> {new Date(project.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Project Assignments Section */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 600 }}>
              Assigned Employees ({assignments.length})
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : assignments.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
              <PersonIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No employees assigned
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This project has no employees assigned to it yet.
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow
                      key={assignment._id}
                      hover
                      sx={{
                        "&:hover": {
                          bgcolor: "primary.50",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {assignment.employeeId?.firstName} {assignment.employeeId?.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {assignment.employeeId?.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(assignment.assignedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {assignment.assignedBy?.firstName} {assignment.assignedBy?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assignment.assignedBy?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {assignment.notes ? (
                            <>
                              <NotesIcon fontSize="small" color="action" />
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 200,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={assignment.notes}
                              >
                                {assignment.notes}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No notes
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Remove employee from project">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveAssignment(assignment)}
                            disabled={actionLoading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 1, 
        borderTop: "1px solid", 
        borderColor: "divider" 
      }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={cancelRemoveAssignment}
        onConfirm={confirmRemoveAssignment}
        title="Remove Employee from Project"
        message={
          assignmentToDelete && 
          `Are you sure you want to remove ${assignmentToDelete.employeeId?.firstName} ${assignmentToDelete.employeeId?.lastName} from this project? This action cannot be undone.`
        }
        confirmText="Remove"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </Dialog>
  );
};

export default ProjectManagementDetailsModal;
