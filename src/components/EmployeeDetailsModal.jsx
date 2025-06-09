"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Grid,
  Box,
  Chip,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ManagementEmployeeEdit from "./ManagementEmployeeEdit";

const EmployeeDetailsModal = ({ employee, user, onClose, onEmployeeUpdate }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(employee);
  const employeeData = currentEmployee.employeeData || currentEmployee;
  const isManagement = user?.role === "management";

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
  };
  const handleSaveEdit = (updatedEmployee) => {
    // Update the current employee with the new data
    setCurrentEmployee(updatedEmployee);
    setShowEditModal(false);

    // Trigger refresh in the parent component
    if (onEmployeeUpdate) {
      onEmployeeUpdate();
    }
  };
  if (showEditModal) {
    return (
      <ManagementEmployeeEdit
        employee={currentEmployee}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />
    );
  }
  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "95vh",
          m: 1,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 3,
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Employee Profile
          </Typography>
          <Chip
            label={employeeData.employeeId || "N/A"}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              fontWeight: 500,
            }}
          />
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.1)",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>{" "}
      <DialogContent sx={{ p: 0, bgcolor: "grey.50" }}>
        <Box sx={{ py: 4, px: 3 }}>
          <Grid container spacing={4}>
            {/* Basic Information Section */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Basic Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Employee ID
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employeeData.employeeId || "Not assigned"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Email Address
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employee.email ||
                            employeeData.user?.email ||
                            "Not provided"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        First Name
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employee.firstName ||
                            employeeData.user?.firstName ||
                            "Not provided"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Last Name
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employee.lastName ||
                            employeeData.user?.lastName ||
                            "Not provided"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>{" "}
            {/* Work Information Section */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Work Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Department
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employeeData.department || "Not assigned"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Position
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employeeData.position || "Not assigned"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Salary (INR)
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: "text.primary",
                          }}
                        >
                          {employeeData.salary
                            ? `₹${employeeData.salary.toLocaleString()}`
                            : "Not disclosed"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Hire Date
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employeeData.hireDate
                            ? new Date(
                                employeeData.hireDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Not provided"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>{" "}
            {/* Personal Information Section */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Personal Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Phone Number
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employeeData.personalInfo?.phone || "Not provided"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Emergency Contact
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employeeData.personalInfo?.emergencyContact?.phone ||
                            "Not provided"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Address
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {employeeData.personalInfo?.address?.street ||
                            "Not provided"}
                        </Typography>
                      </Paper>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500, mb: 1 }}
                      >
                        Skills & Expertise
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        {employeeData.skills &&
                        employeeData.skills.length > 0 ? (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                          >
                            {employeeData.skills.map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                sx={{
                                  bgcolor: "primary.50",
                                  color: "primary.main",
                                  border: "1px solid",
                                  borderColor: "primary.200",
                                  fontWeight: 500,
                                  fontSize: "0.875rem",
                                  "&:hover": {
                                    bgcolor: "primary.100",
                                  },
                                }}
                                size="medium"
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography
                            variant="body1"
                            sx={{
                              color: "text.secondary",
                              fontStyle: "italic",
                            }}
                          >
                            No skills listed
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>{" "}
            {/* Account Status Section */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "grey.200",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  Account Status
                </Typography>

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: (() => {
                      const isActive =
                        employee.isActive !== undefined
                          ? employee.isActive
                          : employeeData.isActive;
                      return isActive ? "success.50" : "error.50";
                    })(),
                    border: "1px solid",
                    borderColor: (() => {
                      const isActive =
                        employee.isActive !== undefined
                          ? employee.isActive
                          : employeeData.isActive;
                      return isActive ? "success.200" : "error.200";
                    })(),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Current Status:
                    </Typography>
                    <Chip
                      label={
                        (
                          employee.isActive !== undefined
                            ? employee.isActive
                            : employeeData.isActive
                        )
                          ? "Active"
                          : "Inactive"
                      }
                      color={
                        (
                          employee.isActive !== undefined
                            ? employee.isActive
                            : employeeData.isActive
                        )
                          ? "success"
                          : "error"
                      }
                      variant="filled"
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontStyle: "italic", mt: 1 }}
                  >
                    {(
                      employee.isActive !== undefined
                        ? employee.isActive
                        : employeeData.isActive
                    )
                      ? "Employee has access to the system"
                      : "Employee access is restricted"}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>{" "}
      <DialogActions
        sx={{
          p: 3,
          bgcolor: "white",
          gap: 2,
          borderTop: "1px solid",
          borderColor: "grey.200",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {isManagement ? "Management View" : "Employee View"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          {isManagement && (
            <Button
              onClick={handleEditClick}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                fontWeight: 500,
                textTransform: "none",
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderColor: "primary.dark",
                  bgcolor: "primary.50",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s",
              }}
            >
              Edit Details
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              minWidth: 100,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              bgcolor: "primary.main",
              "&:hover": {
                bgcolor: "primary.dark",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s",
            }}
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeDetailsModal;
