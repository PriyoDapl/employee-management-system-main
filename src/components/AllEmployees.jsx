"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  TableSortLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";
import EmployeeDetailsModal from "./EmployeeDetailsModal";
import ProjectAssignmentModal from "./ProjectAssignmentModal";

const AllEmployees = ({ user, onBack, onEmployeeCountChange }) => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  useEffect(() => {
    fetchEmployees();
  }, []);
  useEffect(() => {
    // Filter employees based on department and status
    let filtered = employees;

    if (departmentFilter.length > 0) {
      filtered = filtered.filter(
        (emp) =>
          emp.employeeData?.department &&
          departmentFilter.includes(emp.employeeData.department)
      );
    }

    if (statusFilter) {
      const isActive = statusFilter === "Active";
      filtered = filtered.filter((emp) => emp.isActive === isActive);
    } // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = getSortValue(a, sortConfig.key);
        let bValue = getSortValue(b, sortConfig.key);

        // Handle numeric comparison (salary)
        if (sortConfig.key === "salary") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        // Handle string comparison (default)
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue, undefined, {
                numeric: true,
                sensitivity: "base",
              })
            : bValue.localeCompare(aValue, undefined, {
                numeric: true,
                sensitivity: "base",
              });
        }

        // Fallback comparison
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredEmployees(filtered);
  }, [employees, departmentFilter, statusFilter, sortConfig]); // Helper function to get sortable value from employee object
  const getSortValue = (employee, key) => {
    switch (key) {
      case "employeeId":
        return employee.employeeData?.employeeId?.toLowerCase() || "zzz"; // Put "Not assigned" at end
      case "name":
        const fullName =
          employee.firstName && employee.lastName
            ? `${employee.firstName} ${employee.lastName}`.toLowerCase()
            : "zzz"; // Put "Name not provided" at end
        return fullName;
      case "email":
        return employee.email?.toLowerCase() || "";
      case "department":
        return employee.employeeData?.department?.toLowerCase() || "zzz";
      case "position":
        return employee.employeeData?.position?.toLowerCase() || "zzz";
      case "salary":
        return employee.employeeData?.salary || 0; // Numeric sorting
      case "status":
        return employee.isActive ? "active" : "inactive";
      default:
        return "";
    }
  };
  // Handle sort click
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      // If clicking the same column, toggle direction
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    // If clicking a different column, always start with ascending
    setSortConfig({ key, direction });
  };
  const fetchEmployees = async () => {
    try {
      // Only access localStorage after component has mounted
      if (typeof window === "undefined") {
        setError("Browser environment required");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token");
        return;
      }

      const response = await fetch("/api/management/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      const userData = await response.json();
      // Filter only employees
      const employeeData = userData.filter((user) => user.role === "employee");
      setEmployees(employeeData);
      setFilteredEmployees(employeeData); // Initialize filtered employees
      setError(""); // Clear any previous errors
      
      // Notify parent component about the updated active employee count
      if (onEmployeeCountChange) {
        const activeEmployeeCount = employeeData.filter(emp => emp.isActive !== false).length;
        onEmployeeCountChange(activeEmployeeCount);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (!refreshing) {
        setLoading(false);
      }
    }
  };
  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
  };
  const handleCloseModal = () => {
    setSelectedEmployee(null);
  };

  const handleEmployeeUpdate = () => {
    // Refresh employee data after an update
    setRefreshing(true);
    setSuccessMessage("Employee updated successfully!");
    fetchEmployees().finally(() => {
      setRefreshing(false);
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    });
    setSelectedEmployee(null);
  };

  const handleAssignProject = (employee) => {
    setAssigningEmployee(employee);
  };

  const handleCloseAssignModal = () => {
    setAssigningEmployee(null);
  };

  const handleAssignmentSuccess = () => {
    // Could add a success message or refresh data if needed
    setAssigningEmployee(null);
  };
  const handleDepartmentFilter = (department) => {
    setDepartmentFilter((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(statusFilter === status ? "" : status);
  };
  const clearAllFilters = () => {
    setDepartmentFilter([]);
    setStatusFilter("");
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
            Loading employees...
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
            All Employees
          </Typography>
          {refreshing && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}>
              <CircularProgress size={20} color="primary" />
              <Typography variant="body2" color="text.secondary">
                Refreshing...
              </Typography>
            </Box>
          )}
        </Toolbar>{" "}
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
          All Employees ({filteredEmployees.length}
          {employees.length !== filteredEmployees.length
            ? ` of ${employees.length}`
            : ""}
          )
        </Typography>
        {/* Filter Controls */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "black" }}
          >
            Filters:
          </Typography>
          {/* Department Filter */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {departmentFilter.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: "primary.main",
                  fontWeight: 500,
                  mr: 1,
                }}
              >
                Departments ({departmentFilter.length}):
              </Typography>
            )}
            {[
              ...new Set(
                employees
                  .map((emp) => emp.employeeData?.department)
                  .filter(Boolean)
              ),
            ].map((department) => (
              <Chip
                key={department}
                label={department}
                onClick={() => handleDepartmentFilter(department)}
                color={
                  departmentFilter.includes(department) ? "primary" : "default"
                }
                variant={
                  departmentFilter.includes(department) ? "filled" : "outlined"
                }
                clickable
                size="small"
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: departmentFilter.includes(department)
                      ? "primary.dark"
                      : "action.hover",
                  },
                }}
              />
            ))}
          </Box>
          <div>|</div>
          {/* Status Filter */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {["Active", "Inactive"].map((status) => (
              <Chip
                key={status}
                label={status}
                onClick={() => handleStatusFilter(status)}
                color={
                  statusFilter === status
                    ? status === "Active"
                      ? "success"
                      : "error"
                    : "default"
                }
                variant={statusFilter === status ? "filled" : "outlined"}
                clickable
                size="small"
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor:
                      statusFilter === status
                        ? status === "Active"
                          ? "success.dark"
                          : "error.dark"
                        : "action.hover",
                  },
                }}
              />
            ))}
          </Box>
          {/* Clear Filters */}
          {(departmentFilter.length > 0 || statusFilter) && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearAllFilters}
              sx={{ ml: 1 }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
        {filteredEmployees.length === 0 && employees.length > 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No employees match the current filters
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Try adjusting your filter criteria or clear all filters.
            </Typography>
            <Button variant="outlined" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </Paper>
        ) : filteredEmployees.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No employees found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are currently no employees in the system.
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            sx={{ boxShadow: 3, borderRadius: 2 }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="employees table">
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    <TableSortLabel
                      active={sortConfig.key === "employeeId"}
                      direction={
                        sortConfig.key === "employeeId"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("employeeId")}
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      Employee ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    <TableSortLabel
                      active={sortConfig.key === "name"}
                      direction={
                        sortConfig.key === "name" ? sortConfig.direction : "asc"
                      }
                      onClick={() => handleSort("name")}
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    <TableSortLabel
                      active={sortConfig.key === "email"}
                      direction={
                        sortConfig.key === "email"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("email")}
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    <TableSortLabel
                      active={sortConfig.key === "department"}
                      direction={
                        sortConfig.key === "department"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("department")}
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      Department
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    <TableSortLabel
                      active={sortConfig.key === "position"}
                      direction={
                        sortConfig.key === "position"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("position")}
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      Position
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    <TableSortLabel
                      active={sortConfig.key === "salary"}
                      direction={
                        sortConfig.key === "salary"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("salary")}
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      Salary
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    <TableSortLabel
                      active={sortConfig.key === "status"}
                      direction={
                        sortConfig.key === "status"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("status")}
                      sx={{
                        color: "white !important",
                        "&:hover": { color: "white !important" },
                      }}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "white" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((employee, index) => (
                  <TableRow
                    key={employee._id}
                    sx={{
                      "&:hover": {
                        bgcolor: "primary.50",
                      },
                      bgcolor: index % 2 === 0 ? "grey.50" : "white",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {employee.employeeData?.employeeId || "Not assigned"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.firstName && employee.lastName
                          ? `${employee.firstName} ${employee.lastName}`
                          : "Name not provided"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {employee.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {employee.employeeData?.department ? (
                        <Chip
                          label={employee.employeeData.department}
                          variant="outlined"
                          size="small"
                          color="primary"
                          clickable
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDepartmentFilter(
                              employee.employeeData.department
                            );
                          }}
                          sx={{
                            cursor: "pointer",
                            "&:hover": { bgcolor: "primary.50" },
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {employee.employeeData?.position || "Not assigned"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {employee.employeeData?.salary
                          ? `₹${employee.employeeData.salary.toLocaleString()}`
                          : "Not disclosed"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={employee.isActive ? "Active" : "Inactive"}
                        color={employee.isActive ? "success" : "error"}
                        variant="outlined"
                        size="small"
                        clickable
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusFilter(
                            employee.isActive ? "Active" : "Inactive"
                          );
                        }}
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: employee.isActive
                              ? "success.50"
                              : "error.50",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="View employee details">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmployeeClick(employee);
                            }}
                            sx={{ minWidth: "auto", px: 2 }}
                          >
                            View
                          </Button>
                        </Tooltip>
                        <Tooltip title="Assign project">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignProject(employee);
                            }}
                            sx={{ minWidth: "auto", px: 2 }}
                          >
                            Assign
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {selectedEmployee && (
          <EmployeeDetailsModal
            employee={selectedEmployee}
            user={user}
            onClose={handleCloseModal}
            onEmployeeUpdate={handleEmployeeUpdate}
          />
        )}
        {assigningEmployee && (
          <ProjectAssignmentModal
            employee={assigningEmployee}
            open={!!assigningEmployee}
            onClose={handleCloseAssignModal}
            onSuccess={handleAssignmentSuccess}
          />
        )}
      </Container>
    </Box>
  );
};

export default AllEmployees;
