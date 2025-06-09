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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";

const ProjectsManagement = ({ user, onBack, onProjectCountChange }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    project: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    details: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // Only access localStorage after component has mounted
      if (typeof window === "undefined") {
        setError("Browser environment required");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const newProjects = data.projects || [];
        setProjects(newProjects);
        // Notify parent component of the new project count
        if (onProjectCountChange) {
          onProjectCountChange(newProjects.length);
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

  const handleDelete = (project) => {
    setDeleteConfirmation({
      isOpen: true,
      project: project,
    });
  };
  const confirmDelete = async () => {
    if (deleteConfirmation.project) {
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
          `/api/projects/${deleteConfirmation.project._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setSuccess("Project deleted successfully!");
          fetchProjects(); // Refresh projects list
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to delete project");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
        setError("Error deleting project");
      } finally {
        setLoading(false);
        setDeleteConfirmation({ isOpen: false, project: null });
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, project: null });
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setFormData({ name: "", details: "" });
    setError("");
    setSuccess("");
  };
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
      </AppBar>{" "}
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
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ minWidth: 140 }}
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
                >
                  Cancel
                </Button>
              )}{" "}
            </Box>
          </Box>
        </Paper>
        {/* Projects List */}
        <Box>
          <Typography
            variant="h5"
            component="h3"
            sx={{ mb: 3, color: "primary.main" }}
          >
            All Projects ({projects.length})
          </Typography>

          {loading && projects.length === 0 ? (
            <Paper sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                Loading projects...
              </Typography>
            </Paper>
          ) : projects.length === 0 ? (
            <Paper sx={{ textAlign: "center", py: 6 }}>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                No projects created yet.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first project using the form above.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {projects.map((project) => (
                <Grid item xs={12} md={6} lg={4} key={project._id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component="h4"
                        sx={{ mb: 2, fontWeight: "bold" }}
                      >
                        {project.name}
                      </Typography>
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
                        onClick={() => handleEdit(project)}
                        disabled={loading}
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(project)}
                        disabled={loading}
                        size="small"
                      >
                        Delete
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmation.isOpen}
          onClose={cancelDelete}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Delete Project</DialogTitle>
          <DialogContent>
            <Typography id="delete-dialog-description">
              Are you sure you want to delete the project "
              {deleteConfirmation.project?.name}"? It won't be saved anywhere
              else and hence, cannot be recovered.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              variant="contained"
              color="error"
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default ProjectsManagement;
