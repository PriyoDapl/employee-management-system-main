"use client";

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
} from "@mui/material";

const ProjectDetailsModal = ({ assignment, open, onClose }) => {
  if (!assignment) return null;

  const { projectId: project, assignedBy, assignedDate, notes } = assignment;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography
          variant="h5"
          component="div"
          sx={{ fontWeight: 600, color: "primary.main" }}
        >
          {project?.name || "Project Details"}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "text.primary", fontWeight: 500 }}
          >
            Project Description
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ lineHeight: 1.6 }}
          >
            {project?.details || "No details available"}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "text.primary", fontWeight: 500 }}
          >
            Assignment Information
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Assigned Date
              </Typography>
              <Typography variant="body1">
                {new Date(assignedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Project Created
              </Typography>
              <Typography variant="body1">
                {new Date(project?.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>

            {project?.updatedAt && project.updatedAt !== project.createdAt && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(project.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            )}

            {assignedBy && (
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Assigned By
                </Typography>
                <Typography variant="body1">
                  {assignedBy.email}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {notes && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "text.primary", fontWeight: 500 }}
              >
                Assignment Notes
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "primary.50",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "primary.100",
                }}
              >
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {notes}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="contained" size="large">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDetailsModal;
