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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";

const EmployeeDetails = ({ user, onBack, hasExistingProfile }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    department: "",
    position: "",
    salary: "",
    hireDate: "",
    phone: "",
    address: "",
    emergencyContact: "",
    skills: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [existingSkills, setExistingSkills] = useState([]);

  const isManagement = user?.role === "management";

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const fetchEmployeeDetails = async () => {
    setFetchLoading(true);
    try {
      // Only access localStorage after component has mounted
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/employee/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const employee = await response.json();
        setProfileExists(true);
        setIsViewMode(true);

        // Pre-fill form with existing data
        setFormData({
          firstName: employee.user?.firstName || "",
          lastName: employee.user?.lastName || "",
          employeeId: employee.employeeId || "",
          department: employee.department || "",
          position: employee.position || "",
          salary: employee.salary?.toString() || "",
          hireDate: employee.hireDate
            ? new Date(employee.hireDate).toISOString().split("T")[0]
            : "",
          phone: employee.personalInfo?.phone || "",
          address: employee.personalInfo?.address?.street || "",
          emergencyContact:
            employee.personalInfo?.emergencyContact?.phone || "",
          skills: Array.isArray(employee.skills)
            ? employee.skills.join(", ")
            : "",
        });
        setExistingSkills(employee.skills || []);
      } else if (response.status === 404) {
        // No profile exists, show add form
        setProfileExists(false);
        setIsViewMode(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch employee details");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      setError("Error fetching employee details");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "department",
      "position",
      "hireDate",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field].trim()
    );

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      setLoading(false);
      return;
    }

    try {
      // Only access localStorage after component has mounted
      if (typeof window === "undefined") return;

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

      const submissionData = {
        ...formData,
        skills: skillsArray,
      };

      const response = await fetch("/api/employee/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Employee details saved successfully!");
        setProfileExists(true);
        setIsViewMode(true);
        setExistingSkills(skillsArray);

        // Refresh the data
        setTimeout(() => {
          fetchEmployeeDetails();
        }, 1000);
      } else {
        setError(data.error || "Failed to save employee details");
      }
    } catch (error) {
      console.error("Error saving employee details:", error);
      setError("Error saving employee details");
    } finally {
      setLoading(false);
    }
  };

  const renderSkills = () => {
    if (!existingSkills || existingSkills.length === 0) {
      return (
        <Typography 
          variant="body1" 
          sx={{
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          No skills listed
        </Typography>
      );
    }

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {existingSkills.map((skill, index) => (
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
              pointerEvents: "none",
              
              "&:hover": {
                bgcolor: "primary.100",
              },
            }}
            size="medium"
          />
        ))}
      </Box>
    );
  };

  if (fetchLoading) {
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
              Employee Details
            </Typography>
          </Toolbar>
        </AppBar>
        <Container
          maxWidth="md"
          sx={{ mt: 4, display: "flex", justifyContent: "center" }}
        >
          <CircularProgress />
        </Container>
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
            {profileExists ? "My Profile" : "Add Employee Details"}
          </Typography>
          {profileExists && isManagement && (
            <Button
              variant="outlined"
              onClick={() => setIsViewMode(!isViewMode)}
              sx={{ ml: 2 }}
            >
              {isViewMode ? "Edit" : "Cancel"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {profileExists && !isManagement && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Your profile details are locked for editing. Contact management for
            any changes.
          </Alert>
        )}

        <Paper 
          elevation={3}
          sx={{ 
            p: 4, 
            borderRadius: 3,
            bgcolor: "white",
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{ mb: 4, color: "primary.main" }}
          >
            {profileExists ? "Employee Profile" : "Create Employee Profile"}
          </Typography>

          {isViewMode && profileExists ? (
            // View Mode - Show details as read-only
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
                            {formData.employeeId || "Not assigned"}
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
                            {formData.firstName || "Not provided"}
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
                            {formData.lastName || "Not provided"}
                          </Typography>
                        </Paper>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

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
                            {formData.department || "Not assigned"}
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
                            {formData.position || "Not assigned"}
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
                            {formData.salary
                              ? `₹${parseInt(formData.salary).toLocaleString()}`
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
                            {formData.hireDate
                              ? new Date(formData.hireDate).toLocaleDateString("en-US", {
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
              </Grid>

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
                            {formData.phone || "Not provided"}
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
                            {formData.emergencyContact || "Not provided"}
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
                            {formData.address || "Not provided"}
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
                          {renderSkills()}
                        </Paper>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            // Form Mode - For adding new profile or editing (management only)
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
                          onChange={handleChange}
                          variant="outlined"
                          placeholder="Auto-generated if empty"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

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
                          name="position"
                          label="Position *"
                          value={formData.position}
                          onChange={handleChange}
                          variant="outlined"
                          required
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
                          name="salary"
                          label="Salary (INR)"
                          type="number"
                          value={formData.salary}
                          onChange={handleChange}
                          variant="outlined"
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
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

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
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ 
                        minWidth: 120,
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
                        <CircularProgress size={24} color="inherit" />
                      ) : profileExists ? (
                        "Update Details"
                      ) : (
                        "Save Details"
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      onClick={onBack}
                      disabled={loading}
                      sx={{
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
                      Back to Dashboard
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default EmployeeDetails;
