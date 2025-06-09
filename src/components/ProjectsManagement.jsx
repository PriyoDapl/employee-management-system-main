"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import EditIcon from "@mui/icons-material/Edit";

const ProjectsManagement = ({ user, onBack, onProjectCountChange }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [statusConfirmation, setStatusConfirmation] = useState({
    isOpen: false,
    project: null,
  });
  const [showInactive, setShowInactive] = useState(false);
  const [viewFilter, setViewFilter] = useState("active");
  const [formData, setFormData] = useState({
    name: "",
    details: "",
  });

  useEffect(() => {
    fetchProjects();
  }, [showInactive]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Only access localStorage after component has mounted
      if (typeof window === "undefined") {
        setError("Browser environment required");
        return;
      }

      const token = localStorage.getItem("token");
      const url = showInactive
        ? "/api/projects?showInactive=true"
        : "/api/projects";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newProjects = data.projects || [];
        setProjects(newProjects);
        // Notify parent component of the active project count only
        if (onProjectCountChange) {
          const activeProjects = newProjects.filter(
            (p) => p.isActive !== false
          );
          onProjectCountChange(activeProjects.length);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Error fetching projects");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.name.trim() || !formData.details.trim()) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Only access localStorage after component has mounted
      if (typeof window === "undefined") {
        setError("Browser environment required");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const url = editingProject
        ? `/api/projects/${editingProject._id}`
        : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          details: formData.details.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(
          editingProject
            ? "Project updated successfully!"
            : "Project created successfully!"
        );
        setFormData({ name: "", details: "" });
        setEditingProject(null);
        fetchProjects(); // Refresh projects list for both new and updated projects
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      setError("Error saving project");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      details: project.details,
    });
    setError("");
    setSuccess("");
  };

  const handleToggleStatus = (project) => {
    setStatusConfirmation({
      isOpen: true,
      project: project,
    });
  };

  const confirmToggleStatus = async () => {
    if (statusConfirmation.project) {
      setLoading(true);
      try {
        // Only access localStorage after component has mounted
        if (typeof window === "undefined") {
          setError("Browser environment required");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/projects/${statusConfirmation.project._id}/toggle-status`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSuccess(data.message);
          fetchProjects(); // Refresh projects list
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to toggle project status");
        }
      } catch (error) {
        console.error("Error toggling project status:", error);
        setError("Error toggling project status");
      } finally {
        setLoading(false);
        setStatusConfirmation({ isOpen: false, project: null });
      }
    }
  };

  const cancelToggleStatus = () => {
    setStatusConfirmation({ isOpen: false, project: null });
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setFormData({ name: "", details: "" });
    setError("");
    setSuccess("");
  };

  const handleViewFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setViewFilter(newFilter);
      setShowInactive(newFilter === "all" || newFilter === "inactive");
    }
  };

  const getFilteredProjects = () => {
    if (viewFilter === "active") {
      return projects.filter((p) => p.isActive !== false);
    } else if (viewFilter === "inactive") {
      return projects.filter((p) => p.isActive === false);
    }
    return projects; // 'all'
  };

  const filteredProjects = getFilteredProjects();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100" }}>
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
            Projects Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Create/Edit Project Form */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ mb: 3, color: "primary.main" }}
          >
            {editingProject ? "Edit Project" : "Create New Project"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Project Name"
              value={formData.name}
              onChange={handleInputChange}
              variant="outlined"
              required
              placeholder="Enter project name"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              fullWidth
              id="details"
              name="details"
              label="Project Details"
              value={formData.details}
              onChange={handleInputChange}
              variant="outlined"
              multiline
              rows={4}
              required
              placeholder="Enter project details and description"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  minWidth: 140,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : editingProject ? (
                  "Update Project"
                ) : (
                  "Create Project"
                )}
              </Button>
              {editingProject && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Projects List */}
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              pl: 2,
            }}
          >
            <Typography
              variant="h5"
              component="h3"
              sx={{ color: "primary.main" }}
            >
              Projects ({filteredProjects.length})
            </Typography>

            <ToggleButtonGroup
              value={viewFilter}
              exclusive
              onChange={handleViewFilterChange}
              aria-label="project filter"
              size="small"
              sx={{
                "& .MuiToggleButton-root": {
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  padding: "6px 12px",
                  marginRight: 0.5,
                  border: "1px solid",
                  borderColor: "grey.300",
                },
                "& .MuiToggleButton-root:last-of-type": {
                  marginRight: 0,
                },
              }}
            >
              <ToggleButton value="all" aria-label="all projects">
                All
              </ToggleButton>
              <ToggleButton value="active" aria-label="active projects">
                Active
              </ToggleButton>
              <ToggleButton value="inactive" aria-label="inactive projects">
                Inactive
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {loading && projects.length === 0 ? (
            <Paper sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                Loading projects...
              </Typography>
            </Paper>
          ) : filteredProjects.length === 0 ? (
            <Paper sx={{ textAlign: "center", py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {viewFilter === "active"
                  ? "No active projects found."
                  : viewFilter === "inactive"
                  ? "No inactive projects found."
                  : "No projects created yet."}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {viewFilter === "active" || viewFilter === "all"
                  ? "Create your first project using the form above."
                  : "Switch to 'Active' or 'All' to see available projects."}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredProjects.map((project) => (
                <Grid item xs={12} md={6} lg={4} key={project._id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "grey.200",
                      bgcolor: "white",
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
                          component="h4"
                          sx={{
                            fontWeight: "bold",
                            color:
                              project.isActive === false
                                ? "text.secondary"
                                : "text.primary",
                            flex: 1,
                          }}
                        >
                          {project.name}
                        </Typography>
                        <Chip
                          label={
                            project.isActive === false ? "Inactive" : "Active"
                          }
                          color={
                            project.isActive === false ? "default" : "success"
                          }
                          size="small"
                          sx={{ ml: 1, fontWeight: 500, pointerEvents: "none" }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, whiteSpace: "pre-wrap" }}
                      >
                        {project.details}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Created:{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </Typography>
                        {project.updatedAt !== project.createdAt && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Updated:{" "}
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>

                    <Divider />

                    <Box sx={{ p: 2, display: "flex", gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(project)}
                        disabled={loading}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 500,
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color={
                          project.isActive === false ? "success" : "warning"
                        }
                        onClick={() => handleToggleStatus(project)}
                        disabled={loading}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 500,
                        }}
                      >
                        {project.isActive === false ? "Activate" : "Deactivate"}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Status Toggle Confirmation Dialog */}
        <Dialog
          open={statusConfirmation.isOpen}
          onClose={cancelToggleStatus}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            {statusConfirmation.project?.isActive === false
              ? "Activate"
              : "Deactivate"}{" "}
            Project
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to{" "}
              <strong>
                {statusConfirmation.project?.isActive === false
                  ? "activate"
                  : "deactivate"}
              </strong>{" "}
              the project "<strong>{statusConfirmation.project?.name}</strong>"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {statusConfirmation.project?.isActive === false
                ? "This project will become visible and available for assignment to employees."
                : "This project will be hidden from new assignments but existing assignments will remain."}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={cancelToggleStatus}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmToggleStatus}
              variant="contained"
              color={
                statusConfirmation.project?.isActive === false
                  ? "success"
                  : "warning"
              }
              autoFocus
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              {statusConfirmation.project?.isActive === false
                ? "Activate"
                : "Deactivate"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProjectsManagement;
