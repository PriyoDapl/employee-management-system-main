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
  Chip,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import ProjectDetailsModal from "./ProjectDetailsModal";

const MyProjects = ({ user, onBack }) => {
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
      setAssignments(data.assignments || []);
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
          <Grid container spacing={3}>
            {assignments.map((assignment) => (
              <Grid item xs={12} md={6} lg={4} key={assignment._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                    bgcolor: "white",
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: assignment.projectId?.isActive === false 
                            ? "text.secondary" 
                            : "primary.main",
                          mb: 0,
                          flex: 1,
                        }}
                      >
                        {assignment.projectId?.name || "Unnamed Project"}
                      </Typography>
                      <Chip
                        label={
                          assignment.projectId?.isActive === false ? "Inactive" : "Active"
                        }
                        color={
                          assignment.projectId?.isActive === false ? "default" : "success"
                        }
                        size="small"
                        sx={{ ml: 1, fontWeight: 500 }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {assignment.projectId?.details || "No details available"}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Assigned:{" "}
                        {new Date(assignment.assignedDate).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Project Created:{" "}
                        {new Date(
                          assignment.projectId?.createdAt
                        ).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {assignment.assignedBy && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Assigned by: {assignment.assignedBy.email}
                        </Typography>
                      </Box>
                    )}

                    {assignment.notes && (
                      <Box
                        sx={{
                          mt: 2,
                          p: 1.5,
                          bgcolor: "primary.50",
                          borderRadius: 1,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{ fontWeight: 500, display: "block", mb: 0.5 }}
                        >
                          Assignment Notes:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {assignment.notes}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewDetails(assignment)}
                      fullWidth
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

export default MyProjects;
