"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const ManagementEmployeeEdit = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    department: "",
    position: "",
    customPosition: "",
    salary: "",
    hireDate: "",
    phone: "",
    address: "",
    emergencyContact: "",
    skills: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showCustomPosition, setShowCustomPosition] = useState(false);

  // Predefined positions for dropdown
  const predefinedPositions = [
    "Human Resource",
    "Team Leader",
    "Project Manager",
    "Senior Developer",
    "Junior Developer",
    "Quality Assurance",
    "Business Analyst",
    "Data Scientist",
    "UI/UX Designer",
    "System Administrator",
    "Network Engineer",
    "DevOps Engineer",
    "Technical Support",
    "Sales Executive",
    "Marketing Specialist",
    "Customer Service",
    "Trainee",
    "Student",
    "Intern",
    "Others",
  ]; // Helper function to safely access nested employee data
  const getEmployeeData = (employee) => {
    // Handle both direct employee object and employee with employeeData wrapper
    const empData = employee?.employeeData || employee;
    const userData = employee?.user || empData?.user || employee;

    const result = {
      firstName: userData?.firstName || employee?.firstName || "",
      lastName: userData?.lastName || employee?.lastName || "",
      email: userData?.email || employee?.email || "",
      employeeId: empData?.employeeId || employee?.employeeId || "",
      department: empData?.department || employee?.department || "",
      position: empData?.position || employee?.position || "",
      customPosition: "", // Will be set below if needed
      salary: empData?.salary?.toString() || employee?.salary?.toString() || "",
      hireDate: empData?.hireDate
        ? new Date(empData.hireDate).toISOString().split("T")[0]
        : employee?.hireDate
        ? new Date(employee.hireDate).toISOString().split("T")[0]
        : "",
      phone:
        empData?.personalInfo?.phone ||
        employee?.personalInfo?.phone ||
        userData?.personalInfo?.phone ||
        "",
      address:
        empData?.personalInfo?.address?.street ||
        employee?.personalInfo?.address?.street ||
        userData?.personalInfo?.address?.street ||
        "",
      emergencyContact:
        empData?.personalInfo?.emergencyContact?.phone ||
        employee?.personalInfo?.emergencyContact?.phone ||
        userData?.personalInfo?.emergencyContact?.phone ||
        "",
      skills: Array.isArray(empData?.skills)
        ? empData.skills.join(", ")
        : Array.isArray(employee?.skills)
        ? employee.skills.join(", ")
        : typeof empData?.skills === "string"
        ? empData.skills
        : typeof employee?.skills === "string"
        ? employee.skills
        : "",
      isActive:
        userData?.isActive !== undefined
          ? userData.isActive
          : empData?.isActive !== undefined
          ? empData.isActive
          : employee?.isActive !== undefined
          ? employee.isActive
          : true,
    };

    // Handle custom positions if the position is not in predefined list
    const predefinedPositions = [
      "Human Resource",
      "Team Leader",
      "Project Manager",
      "Senior Developer",
      "Junior Developer",
      "Quality Assurance",
      "Business Analyst",
      "Data Scientist",
      "UI/UX Designer",
      "System Administrator",
      "Network Engineer",
      "DevOps Engineer",
      "Technical Support",
      "Sales Executive",
      "Marketing Specialist",
      "Customer Service",
      "Trainee",
      "Student",
      "Intern",
      "Others",
    ];

    const position = result.position;
    if (position && !predefinedPositions.includes(position)) {
      result.position = "Others";
      result.customPosition = position;
    }

    return result;
  };
  useEffect(() => {
    if (employee) {
      const employeeData = getEmployeeData(employee);
      setFormData(employeeData);
      setShowCustomPosition(employeeData.position === "Others");
    }
  }, [employee]);
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "position") {
      setShowCustomPosition(value === "Others");
      if (value !== "Others") {
        setFormData({
          ...formData,
          [name]: value,
          customPosition: "", // Clear custom position when predefined is selected
        });
      } else {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }

    // Clear field-specific validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required";
    }

    if (!formData.position.trim()) {
      errors.position = "Position is required";
    }

    if (formData.position === "Others" && !formData.customPosition.trim()) {
      errors.customPosition =
        "Custom position is required when 'Others' is selected";
    }

    if (!formData.hireDate) {
      errors.hireDate = "Hire date is required";
    }

    if (formData.salary && isNaN(parseFloat(formData.salary))) {
      errors.salary = "Salary must be a valid number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate form
    if (!validateForm()) {
      setError("Please correct the errors below");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      // Convert skills string to array
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill);

      // Use custom position if "Others" is selected, otherwise use the selected position
      const finalPosition =
        formData.position === "Others"
          ? formData.customPosition
          : formData.position;

      const submissionData = {
        ...formData,
        position: finalPosition,
        skills: skillsArray,
        salary: formData.salary ? parseFloat(formData.salary) : 0,
      };

      // Get the correct employeeId from the employee data
      const employeeData = getEmployeeData(employee);
      const employeeId = employeeData.employeeId;

      if (!employeeId) {
        setError("Employee ID not found");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/management/employee/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Employee details updated successfully!");
        setTimeout(() => {
          onSave(data.employee);
          onClose();
        }, 1500);
      } else {
        setError(data.error || "Failed to update employee details");
      }
    } catch (error) {
      console.error("Error updating employee details:", error);
      setError("Error updating employee details. Please try again.");
    } finally {
      setLoading(false);
    }
  };
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
            Edit Employee Profile
          </Typography>
          <Chip
            label={getEmployeeData(employee).employeeId || "N/A"}
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
        <Container maxWidth="lg" sx={{ py: 4, px: 3 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": { fontWeight: 500 },
              }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": { fontWeight: 500 },
              }}
            >
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
                      <TextField
                        fullWidth
                        name="firstName"
                        label="First Name *"
                        value={formData.firstName}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        error={!!validationErrors.firstName}
                        helperText={validationErrors.firstName}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="lastName"
                        label="Last Name *"
                        value={formData.lastName}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        error={!!validationErrors.lastName}
                        helperText={validationErrors.lastName}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="employeeId"
                        label="Employee ID"
                        value={formData.employeeId}
                        variant="outlined"
                        disabled
                        helperText="Employee ID cannot be changed"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "grey.100",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Email Address"
                        value={
                          getEmployeeData(employee).email || "Not provided"
                        }
                        variant="outlined"
                        disabled
                        helperText="Email cannot be changed"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "grey.100",
                          },
                        }}
                      />
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
                      <TextField
                        fullWidth
                        name="department"
                        label="Department *"
                        value={formData.department}
                        onChange={handleChange}
                        variant="outlined"
                        required
                        error={!!validationErrors.department}
                        helperText={validationErrors.department}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl
                        fullWidth
                        required
                        error={!!validationErrors.position}
                      >
                        <InputLabel>Position *</InputLabel>
                        <Select
                          name="position"
                          value={formData.position}
                          onChange={handleChange}
                          label="Position *"
                          sx={{
                            borderRadius: 2,
                          }}
                        >
                          {predefinedPositions.map((position) => (
                            <MenuItem key={position} value={position}>
                              {position}
                            </MenuItem>
                          ))}
                        </Select>
                        {validationErrors.position && (
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 0.5, ml: 1 }}
                          >
                            {validationErrors.position}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>

                    {/* Custom Position Field - Only show when "Others" is selected */}
                    {showCustomPosition && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name="customPosition"
                          label="Custom Position *"
                          value={formData.customPosition}
                          onChange={handleChange}
                          variant="outlined"
                          required
                          error={!!validationErrors.customPosition}
                          helperText={
                            validationErrors.customPosition ||
                            "Enter custom position title"
                          }
                          placeholder="Enter custom position title"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="salary"
                        label="Salary (INR)"
                        type="number"
                        value={formData.salary}
                        onChange={handleChange}
                        variant="outlined"
                        error={!!validationErrors.salary}
                        helperText={validationErrors.salary || "Optional field"}
                        InputProps={{
                          startAdornment: (
                            <Typography sx={{ mr: 1 }}>₹</Typography>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="hireDate"
                        label="Hire Date *"
                        type="date"
                        value={formData.hireDate}
                        onChange={handleChange}
                        variant="outlined"
                        InputLabelProps={{
                          shrink: true,
                        }}
                        required
                        error={!!validationErrors.hireDate}
                        helperText={validationErrors.hireDate}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
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
                      <TextField
                        fullWidth
                        name="phone"
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="e.g., +91 9876543210"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="emergencyContact"
                        label="Emergency Contact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="e.g., +91 9876543210"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="address"
                        label="Address"
                        value={formData.address}
                        onChange={handleChange}
                        variant="outlined"
                        multiline
                        rows={2}
                        placeholder="Street address"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="skills"
                        label="Skills (comma-separated)"
                        value={formData.skills}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="e.g., JavaScript, React, Node.js, Python"
                        multiline
                        rows={2}
                        helperText="Enter skills separated by commas"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
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
                      bgcolor: formData.isActive ? "success.50" : "error.50",
                      border: "1px solid",
                      borderColor: formData.isActive
                        ? "success.200"
                        : "error.200",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isActive}
                          onChange={handleChange}
                          name="isActive"
                          color="primary"
                          size="large"
                        />
                      }
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            Employee Status
                          </Typography>
                          <Chip
                            label={formData.isActive ? "Active" : "Inactive"}
                            color={formData.isActive ? "success" : "error"}
                            variant="filled"
                            size="medium"
                            sx={{ fontWeight: 600, pointerEvents: "none" }}
                          />
                        </Box>
                      }
                      sx={{ mb: 2 }}
                    />
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontStyle: "italic",
                        pl: 6,
                      }}
                    >
                      {formData.isActive
                        ? "Employee can access (Not implemented yet)"
                        : "Employee cannot access (Not implemented yet)"}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
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
            * Required fields
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={loading}
            sx={{
              minWidth: 120,
              borderRadius: 2,
              fontWeight: 500,
              textTransform: "none",
              borderColor: "grey.300",
              color: "text.primary",
              "&:hover": {
                borderColor: "grey.400",
                bgcolor: "grey.50",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              minWidth: 140,
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
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                <span>Saving...</span>
              </Box>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ManagementEmployeeEdit;
