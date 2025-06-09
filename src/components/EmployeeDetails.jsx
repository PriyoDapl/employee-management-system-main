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
        <Typography variant="body2" color="text.secondary">
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
            variant="outlined"
            size="small"
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
            }}
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

        <Paper sx={{ p: 4 }}>
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
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "text.primary", fontWeight: 500 }}
                >
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Employee ID
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.employeeId || "Not assigned"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  First Name
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.firstName || "Not provided"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Name
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.lastName || "Not provided"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Department
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.department || "Not assigned"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Position
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.position || "Not assigned"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Salary (INR)
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.salary
                      ? `₹${parseInt(formData.salary).toLocaleString()}`
                      : "Not disclosed"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Hire Date
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.hireDate
                      ? new Date(formData.hireDate).toLocaleDateString()
                      : "Not provided"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "text.primary", fontWeight: 500, mt: 2 }}
                >
                  Personal Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Phone
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.phone || "Not provided"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Emergency Contact
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.emergencyContact || "Not provided"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Address
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body1">
                    {formData.address || "Not provided"}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Skills
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  {renderSkills()}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            // Form Mode - For adding new profile or editing (management only)
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "text.primary", fontWeight: 500 }}
                  >
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="firstName"
                    label="First Name *"
                    value={formData.firstName}
                    onChange={handleChange}
                    variant="outlined"
                    required
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
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="department"
                    label="Department *"
                    value={formData.department}
                    onChange={handleChange}
                    variant="outlined"
                    required
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
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "text.primary", fontWeight: 500, mt: 2 }}
                  >
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
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
                    placeholder="e.g., JavaScript, React, Node.js"
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ minWidth: 120 }}
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
