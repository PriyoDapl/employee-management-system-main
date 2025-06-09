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
  CardActions,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ProjectDetailsModal from "./ProjectDetailsModal";

const AssignedProjects = ({ user, onBack, onProjectCountChange }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token");
        return;
      }

      const response = await fetch("/api/employee/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assigned projects");
      }
      const data = await response.json();
      const newAssignments = data.assignments || [];
      setAssignments(newAssignments);

      // Notify parent component of active project count only
      if (onProjectCountChange) {
        const activeProjectCount = newAssignments.filter(
          assignment => assignment.projectId?.isActive !== false
        ).length;
        onProjectCountChange(activeProjectCount);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (assignment) => {
    setSelectedProject(assignment);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
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
            Loading your projects...
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
            My Projects
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ mb: 4, color: "primary.main" }}
        >
          My Assigned Projects ({assignments.length})
        </Typography>

        {assignments.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No projects assigned
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You haven't been assigned any projects yet. Check back later or
              contact your manager.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {assignments.map((assignment) => (
              <Grid item key={assignment._id}>
                <Card
                  sx={{
                    width: 320,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    "&:hover": {
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            fontSize: "1.1rem",
                            lineHeight: 1.3,
                            color: assignment.projectId?.isActive === false 
                              ? "text.secondary" 
                              : "text.primary",
                            flex: 1,
                            pr: 1,
                          }}
                        >
                          {assignment.projectId?.name || "Unnamed Project"}
                        </Typography>
                        <Chip
                          label={assignment.projectId?.isActive === false ? "Inactive" : "Active"}
                          variant="outlined"
                          size="small"
                          color={assignment.projectId?.isActive === false ? "default" : "success"}
                          sx={{ 
                            fontSize: "0.75rem",
                            height: 24,
                            pointerEvents: "none",
                            "& .MuiChip-label": { px: 1 }
                          }}
                        />
                      </Box>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.4,
                        }}
                      >
                        {assignment.projectId?.details || "No description available"}
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      display: "grid", 
                      gap: 1,
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "grey.200"
                    }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Assigned
                        </Typography>
                        <Typography variant="caption" color="text.primary" sx={{ fontWeight: 500 }}>
                          {new Date(assignment.assignedDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </Typography>
                      </Box>
                      
                      {assignment.assignedBy && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Assigned by
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.primary" 
                            noWrap
                            sx={{ 
                              fontWeight: 500,
                              textAlign: "right",
                              maxWidth: "180px"
                            }}
                          >
                            {assignment.assignedBy.email}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {assignment.notes && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: "primary.50",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "grey.300",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                        >
                          Notes
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.4,
                          }}
                        >
                          {assignment.notes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      onClick={() => handleViewDetails(assignment)}
                      fullWidth
                      sx={{
                        textTransform: "none",
                        fontWeight: 500,
                        borderRadius: 1.5,
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {selectedProject && (
          <ProjectDetailsModal
            assignment={selectedProject}
            open={!!selectedProject}
            onClose={handleCloseModal}
          />
        )}
      </Container>
    </Box>
  );
};

export default AssignedProjects;
