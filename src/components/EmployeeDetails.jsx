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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";

const EmployeeDetails = ({ user, onBack, hasExistingProfile }) => {
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [isFirstTimeCreation, setIsFirstTimeCreation] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [existingSkills, setExistingSkills] = useState([]);
  const [showCustomPosition, setShowCustomPosition] = useState(false);
  const [originalData, setOriginalData] = useState({});

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
    "Others"
  ];

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
        
        // Check if this is a default profile (created during signup with default values)
        const isDefaultProfile = (employee.department === 'General' || !employee.department) && 
                                (employee.position === 'Employee' || !employee.position) && 
                                (employee.salary === 0 || !employee.salary) && 
                                !employee.hireDate;
        
        console.log('Employee profile debug:', {
          department: employee.department,
          position: employee.position,
          salary: employee.salary,
          hireDate: employee.hireDate,
          profileCompleted: employee.profileCompleted,
          isDefaultProfile,
          isManagement
        });
        
        if (isDefaultProfile) {
          // Treat as first-time creation
          setProfileExists(false);
          setProfileCompleted(false);
          setIsFirstTimeCreation(true);
          setIsViewMode(false);
        } else {
          setProfileExists(true);
          setProfileCompleted(employee.profileCompleted || false);
          // Set view mode based on completion status and user role
          // For employees: show edit mode if profile is not completed
          // For management: always start in view mode
          setIsViewMode(employee.profileCompleted || isManagement);
        }

        // Pre-fill form with existing data
        const position = employee.position || "";
        const isCustomPosition = position && !predefinedPositions.includes(position);
        
        const employeeData = {
          firstName: employee.user?.firstName || "",
          lastName: employee.user?.lastName || "",
          employeeId: employee.employeeId || "",
          department: isDefaultProfile ? "" : (employee.department || ""),
          position: isDefaultProfile ? "" : (isCustomPosition ? "Others" : position),
          customPosition: isDefaultProfile ? "" : (isCustomPosition ? position : ""),
          salary: isDefaultProfile ? "" : (employee.salary?.toString() || ""),
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
        };
        
        setFormData(employeeData);
        setOriginalData(employeeData);
        setShowCustomPosition(isCustomPosition && !isDefaultProfile);
        setExistingSkills(employee.skills || []);
      } else if (response.status === 404) {
        // No profile exists, show add form
        setProfileExists(false);
        setProfileCompleted(false);
        setIsFirstTimeCreation(true);
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

  // Helper function to check if a field is editable
  const isFieldEditable = (fieldName) => {
    // If profile is completed, no field is editable for employees
    if (profileCompleted && !isManagement) {
      return false;
    }
    
    // Management can always edit
    if (isManagement) {
      return true;
    }
    
    // Department and salary are not editable by employees
    if ((fieldName === 'department' || fieldName === 'salary') && !isManagement) {
      return false;
    }
    
    // If it's first time creation or no profile exists, all fields are editable (except department and salary for employees)
    if (isFirstTimeCreation || !profileExists) {
      return true;
    }
    
    // If profile exists but not completed, check if field is empty or has default values
    const originalValue = originalData[fieldName];
    const isEmptyField = !originalValue || originalValue.trim() === "";
    const isDefaultValue = (fieldName === 'position' && originalValue === 'Employee');
    
    return isEmptyField || isDefaultValue;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If profile is completed, prevent any changes
    if (profileCompleted) {
      return;
    }
    
    // If profile exists but not completed, only allow editing empty fields
    if (profileExists && !isFirstTimeCreation) {
      const originalValue = originalData[name];
      if (originalValue && originalValue.trim() !== "") {
        // Field already has data, don't allow changes
        return;
      }
    }
    
    if (name === 'position') {
      setShowCustomPosition(value === 'Others');
      if (value !== 'Others') {
        setFormData({
          ...formData,
          [name]: value,
          customPosition: '' // Clear custom position when predefined is selected
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e, completeProfile = false) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // If it's a first-time creation, validate required fields
    if (isFirstTimeCreation || !profileExists) {
      const requiredFields = [
        "firstName",
        "lastName",
        "department",
        "position",
        "hireDate",
      ];
      
      // Check for custom position when "Others" is selected
      if (formData.position === "Others" && !formData.customPosition.trim()) {
        setError("Please enter a custom position title when 'Others' is selected");
        setLoading(false);
        return;
      }
      
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

      // Use custom position if "Others" is selected, otherwise use the selected position
      const finalPosition = formData.position === 'Others' ? formData.customPosition : formData.position;

      const submissionData = {
        ...formData,
        position: finalPosition,
        skills: skillsArray,
        completeProfile,
      };

      const method = isFirstTimeCreation || !profileExists ? "POST" : "PATCH";
      const response = await fetch("/api/employee/profile", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (response.ok) {
        if (completeProfile) {
          setSuccess("Profile submitted successfully! Your profile is now locked for editing. Contact management for any changes.");
          setProfileCompleted(true);
        } else {
          setSuccess("Employee details saved successfully!");
        }
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
          {profileExists && !isManagement && !profileCompleted && (
            <Button
              variant="outlined"
              onClick={() => setIsViewMode(!isViewMode)}
              sx={{ ml: 2 }}
            >
              {isViewMode ? "Edit Profile" : "Cancel"}
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
            {profileCompleted 
              ? "Your profile is completed and locked for editing. Contact management for any changes."
              : "You can only fill empty fields. Once you complete your profile, it will be locked."}
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
            sx={{ mb: 2, color: "primary.main" }}
          >
            {profileExists ? "Employee Profile" : "Create Employee Profile"}
          </Typography>

          {/* Profile Status Indicator */}
          {profileExists && (
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={profileCompleted ? "Profile Completed" : "Profile In Progress"}
                color={profileCompleted ? "success" : "warning"}
                variant="filled"
                icon={profileCompleted ? <CheckCircleIcon /> : <EditIcon />}
                sx={{ fontWeight: 600 }}
              />
              {profileCompleted && (
                <Typography variant="body2" color="text.secondary">
                  Profile locked for editing. Contact management for changes.
                </Typography>
              )}
            </Box>
          )}

          {isViewMode && profileExists && (profileCompleted || isManagement) ? (
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
                          disabled={!isFieldEditable("firstName")}
                          helperText={!isFieldEditable("firstName") && formData.firstName ? "Field already filled and cannot be changed" : ""}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("firstName") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("lastName")}
                          helperText={!isFieldEditable("lastName") && formData.lastName ? "Field already filled and cannot be changed" : ""}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("lastName") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("employeeId")}
                          helperText={!isFieldEditable("employeeId") && formData.employeeId ? "Field already assigned and cannot be changed" : "Auto-generated if empty"}
                          placeholder="Auto-generated if empty"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("employeeId") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("department")}
                          helperText={!isManagement ? "Department is assigned by management" : (!isFieldEditable("department") && formData.department ? "Field already filled and cannot be changed" : "")}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("department") ? "grey.100" : "white",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required disabled={!isFieldEditable("position")}>
                          <InputLabel>Position *</InputLabel>
                          <Select
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            label="Position *"
                            sx={{
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("position") ? "grey.100" : "white",
                            }}
                          >
                            {predefinedPositions.map((position) => (
                              <MenuItem key={position} value={position}>
                                {position}
                              </MenuItem>
                            ))}
                          </Select>
                          {!isFieldEditable("position") && formData.position && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                              Field already filled and cannot be changed
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
                            disabled={!isFieldEditable("customPosition")}
                            helperText={!isFieldEditable("customPosition") && formData.customPosition ? "Field already filled and cannot be changed" : "Enter custom position title"}
                            placeholder="Enter custom position title"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                bgcolor: !isFieldEditable("customPosition") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("salary")}
                          helperText={!isManagement ? "Salary is assigned by management" : (!isFieldEditable("salary") && formData.salary ? "Field already filled and cannot be changed" : "")}
                          InputProps={{
                            startAdornment: (
                              <Typography sx={{ mr: 1 }}>₹</Typography>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("salary") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("hireDate")}
                          helperText={!isFieldEditable("hireDate") && formData.hireDate ? "Field already filled and cannot be changed" : ""}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("hireDate") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("phone")}
                          helperText={!isFieldEditable("phone") && formData.phone ? "Field already filled and cannot be changed" : ""}
                          placeholder="e.g., +91 9876543210"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("phone") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("emergencyContact")}
                          helperText={!isFieldEditable("emergencyContact") && formData.emergencyContact ? "Field already filled and cannot be changed" : ""}
                          placeholder="e.g., +91 9876543210"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("emergencyContact") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("address")}
                          helperText={!isFieldEditable("address") && formData.address ? "Field already filled and cannot be changed" : ""}
                          placeholder="Street address"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("address") ? "grey.100" : "white",
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
                          disabled={!isFieldEditable("skills")}
                          helperText={!isFieldEditable("skills") && formData.skills ? "Field already filled and cannot be changed" : "Enter skills separated by commas"}
                          placeholder="e.g., JavaScript, React, Node.js, Python"
                          multiline
                          rows={2}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: !isFieldEditable("skills") ? "grey.100" : "white",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    {(isFirstTimeCreation || !profileExists) ? (
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        onClick={(e) => handleSubmit(e, true)}
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
                        ) : (
                          "Submit Details"
                        )}
                      </Button>
                    ) : !profileCompleted ? (
                      // For employees with incomplete profiles, only show Submit Details button
                      !isManagement ? (
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          onClick={(e) => handleSubmit(e, true)}
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
                          ) : (
                            "Submit Details"
                          )}
                        </Button>
                      ) : (
                        // For management, keep both buttons
                        <>
                          <Button
                            type="submit"
                            variant="outlined"
                            disabled={loading}
                            onClick={(e) => handleSubmit(e, false)}
                            sx={{ 
                              minWidth: 120,
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: "none",
                              borderColor: "primary.main",
                              color: "primary.main",
                              "&:hover": {
                                borderColor: "primary.dark",
                                bgcolor: "primary.50",
                              },
                            }}
                          >
                            {loading ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            onClick={(e) => handleSubmit(e, true)}
                            sx={{ 
                              minWidth: 120,
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: "none",
                              bgcolor: "success.main",
                              "&:hover": {
                                bgcolor: "success.dark",
                                transform: "translateY(-1px)",
                              },
                              transition: "all 0.2s",
                            }}
                          >
                            {loading ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : (
                              "Complete Profile"
                            )}
                          </Button>
                        </>
                      )
                    ) : null}

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
