"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";

const ProjectAssignmentModal = ({ employee, open, onClose, onSuccess }) => {
  const [projects, setProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      fetchProjects();
      fetchEmployeeAssignments();
      // Reset form
      setSelectedProject("");
      setNotes("");
      setError("");
    }
  }, [open, employee?._id]);
  const fetchProjects = async () => {
    setFetchingProjects(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      // Filter to only include active projects for assignment
      const activeProjects = (data.projects || []).filter(project => project.isActive !== false);
      setProjects(activeProjects);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetchingProjects(false);
    }
  };

  const fetchEmployeeAssignments = async () => {
    if (!employee?._id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/management/projects/assign", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch assignments");
      }

      const data = await response.json();
      const assignments = data.assignments || [];

      // Get project IDs already assigned to this employee
      const assignedProjectIds = assignments
        .filter((assignment) => assignment.employeeId?._id === employee._id)
        .map((assignment) => assignment.projectId?._id);

      // Filter out already assigned projects
      const filtered = projects.filter(
        (project) => !assignedProjectIds.includes(project._id)
      );

      setAvailableProjects(filtered);
    } catch (err) {
      console.error("Error fetching employee assignments:", err);
      // If fetching assignments fails, show all projects
      setAvailableProjects(projects);
    }
  };

  // Update available projects when projects or employee changes
  useEffect(() => {
    if (projects.length > 0 && employee?._id) {
      fetchEmployeeAssignments();
    }
  }, [projects, employee?._id]);

  const handleAssign = async () => {
    if (!selectedProject) {
      setError("Please select a project");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/management/projects/assign", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: selectedProject,
          employeeId: employee._id,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign project");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedProjectData = availableProjects.find(
    (p) => p._id === selectedProject
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Assign Project to Employee
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Employee Details
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            {employee?.firstName && employee?.lastName
              ? `${employee.firstName} ${employee.lastName}`
              : "Name not provided"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee?.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Project</InputLabel>
          <Select
            value={selectedProject}
            label="Select Project"
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={fetchingProjects}
          >
            {fetchingProjects ? (
              <MenuItem disabled>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading projects...
              </MenuItem>
            ) : availableProjects.length === 0 ? (
              <MenuItem disabled>
                {projects.length === 0
                  ? "No projects available"
                  : "All projects already assigned to this employee"}
              </MenuItem>
            ) : (
              availableProjects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {selectedProjectData && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Project Details
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              {selectedProjectData.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedProjectData.details}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Created:{" "}
              {new Date(selectedProjectData.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Assignment Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any specific instructions or notes for this assignment..."
          sx={{ mb: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || !selectedProject || fetchingProjects}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Assigning...
            </>
          ) : (
            "Assign Project"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectAssignmentModal;
