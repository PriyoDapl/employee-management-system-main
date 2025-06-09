"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";

const ProjectAssignments = ({ user, onBack }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    assignment: null,
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      if (typeof window === "undefined") {
        setError("Browser environment required");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token");
        return;
      }

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
      const fetchedAssignments = data.assignments || [];
      setAssignments(fetchedAssignments);
      
      // Check for orphaned assignments (assignments with deleted projects)
      const orphanedAssignments = fetchedAssignments.filter(assignment => !assignment.projectId);
      if (orphanedAssignments.length > 0) {
        setError(`Found ${orphanedAssignments.length} assignment(s) with deleted projects. These have been filtered from the view. Click "Clean Up" to remove them permanently.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = (assignment) => {
    setDeleteConfirmation({
      isOpen: true,
      assignment,
    });
  };

  const confirmRemoveAssignment = async () => {
    if (deleteConfirmation.assignment) {
      setLoading(true);
      try {
        if (typeof window === "undefined") {
          setError("Browser environment required");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/management/projects/assign/${deleteConfirmation.assignment._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setSuccess("Employee removed from project successfully!");
          fetchAssignments(); // Refresh assignments list
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to remove assignment");
        }
      } catch (error) {
        console.error("Error removing assignment:", error);
        setError("Error removing assignment");
      } finally {
        setLoading(false);
        setDeleteConfirmation({ isOpen: false, assignment: null });
      }
    }
  };

  const cancelRemoveAssignment = () => {
    setDeleteConfirmation({ isOpen: false, assignment: null });
  };

  const cleanupOrphanedAssignments = async () => {
    if (typeof window === "undefined") {
      setError("Browser environment required");
      return;
    }

    const token = localStorage.getItem("token");
    const orphanedAssignments = assignments.filter(assignment => !assignment.projectId);
    
    if (orphanedAssignments.length === 0) {
      setSuccess("No orphaned assignments found.");
      return;
    }

    setLoading(true);
    try {
      // Remove orphaned assignments one by one
      const promises = orphanedAssignments.map(assignment =>
        fetch(`/api/management/projects/assign/${assignment._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(response => response.ok).length;
      
      if (successCount === orphanedAssignments.length) {
        setSuccess(`Successfully cleaned up ${successCount} orphaned assignment(s).`);
      } else {
        setError(`Cleaned up ${successCount} out of ${orphanedAssignments.length} orphaned assignments.`);
      }
      
      fetchAssignments(); // Refresh assignments list
    } catch (error) {
      console.error("Error cleaning up orphaned assignments:", error);
      setError("Error cleaning up orphaned assignments");
    } finally {
      setLoading(false);
    }
  };

  // Group assignments by project for better visualization
  // Filter out assignments with deleted projects first
  const validAssignments = assignments.filter(assignment => assignment.projectId && assignment.projectId._id);
  
  const groupedAssignments = validAssignments.reduce((acc, assignment) => {
    const projectId = assignment.projectId._id;
    if (!acc[projectId]) {
      acc[projectId] = {
        project: assignment.projectId,
        assignments: [],
      };
    }
    acc[projectId].assignments.push(assignment);
    return acc;
  }, {});

  if (loading && assignments.length === 0) {
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
            Loading project assignments...
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
            Project Assignments
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              error.includes("assignment(s) with deleted projects") ? (
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={cleanupOrphanedAssignments}
                  disabled={loading}
                >
                  Clean Up
                </Button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <AssignmentIcon
                  sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                />
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                  {validAssignments.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Assignments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <PeopleIcon
                  sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                />
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                  {Object.keys(groupedAssignments).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Projects
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Badge
                  badgeContent={validAssignments.length}
                  color="primary"
                  max={999}
                >
                  <PeopleIcon
                    sx={{ fontSize: 40, color: "info.main", mb: 1 }}
                  />
                </Badge>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                  {new Set(validAssignments.map((a) => a.employeeId?._id)).size}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assigned Employees
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mb: 4, color: "primary.main" }}
        >
          Project Assignments Overview
        </Typography>

        {validAssignments.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <AssignmentIcon sx={{ fontSize: 80, color: "grey.400", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No project assignments found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by assigning employees to projects from the employees list.
            </Typography>
          </Paper>
        ) : (
          <Box>
            {Object.values(groupedAssignments).map((projectGroup) => (
              <Paper
                key={projectGroup.project?._id || 'unknown-project'}
                sx={{ mb: 3, overflow: "hidden" }}
              >
                <Box
                  sx={{
                    p: 3,
                    bgcolor: "primary.main",
                    color: "white",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {projectGroup.project?.name || "Project Missing"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {projectGroup.project?.details || "No project details available"}
                  </Typography>
                  <Box  sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                    <Chip
                      label={`${projectGroup.assignments.length} Employee${
                        projectGroup.assignments.length !== 1 ? "s" : ""
                      } Assigned`}
                      clickable={false}
                      onClick={undefined}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 500,
                        pointerEvents: "none",
                      }}
                    />
                  </Box>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "grey.50" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Employee
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Assigned Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Assigned By
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projectGroup.assignments.map((assignment) => (
                        <TableRow
                          key={assignment._id}
                          sx={{
                            "&:hover": {
                              bgcolor: "primary.50",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {assignment.employeeId?.firstName}{" "}
                              {assignment.employeeId?.lastName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {assignment.employeeId?.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(
                                assignment.assignedDate
                              ).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {assignment.assignedBy?.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {assignment.notes || "No notes"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Remove employee from project">
                              <Button
                                variant="outlined"
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() =>
                                  handleRemoveAssignment(assignment)
                                }
                                sx={{ minWidth: "auto" }}
                              >
                                Remove
                              </Button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}
          </Box>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmation.isOpen}
          onClose={cancelRemoveAssignment}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Assignment Removal</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove{" "}
              <strong>
                {deleteConfirmation.assignment?.employeeId?.firstName}{" "}
                {deleteConfirmation.assignment?.employeeId?.lastName}
              </strong>{" "}
              from the project{" "}
              <strong>{deleteConfirmation.assignment?.projectId?.name}</strong>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This action cannot be undone. The employee will lose access to
              this project.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelRemoveAssignment}>Cancel</Button>
            <Button
              onClick={confirmRemoveAssignment}
              variant="contained"
              color="error"
              autoFocus
            >
              Remove Assignment
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProjectAssignments;
