"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
} from "@mui/material";
import { API_ROUTES } from "../lib/routes";

const UsersList = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
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

        const response = await fetch(API_ROUTES.MANAGEMENT.USERS, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const userData = await response.json();
        setUsers(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is management
    if (user?.role === "management") {
      fetchUsers();
    } else {
      setLoading(false);
      setError("Access denied");
    }
  }, [user]);
  if (loading) {
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
            <Typography
              variant="h6"
              component="div"
              sx={{ color: "text.primary" }}
            >
              Users Management
            </Typography>
          </Toolbar>
        </AppBar>
        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Loading users...</Typography>
          </Box>
        </Container>
      </Box>
    );
  }
  if (error) {
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
            <Typography
              variant="h6"
              component="div"
              sx={{ color: "text.primary" }}
            >
              Users Management
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Error: {error}</Alert>
        </Container>
      </Box>
    );
  }
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
          <Typography
            variant="h6"
            component="div"
            sx={{ color: "text.primary" }}
          >
            Users Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 4, color: "primary.main" }}
        >
          Users Management
        </Typography>

        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table sx={{ minWidth: 650 }} aria-label="users table">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Employee ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((userData) => (
                <TableRow
                  key={userData._id}
                  sx={{ "&:hover": { bgcolor: "grey.50" } }}
                >
                  <TableCell>{userData.email}</TableCell>
                  <TableCell>
                    {userData.firstName || userData.lastName
                      ? `${userData.firstName} ${userData.lastName}`.trim()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userData.role}
                      color={
                        userData.role === "management" ? "primary" : "secondary"
                      }
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={userData.isActive ? "Active" : "Inactive"}
                      color={userData.isActive ? "success" : "error"}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {userData.employeeData?.employeeId || "N/A"}
                  </TableCell>
                  <TableCell>
                    {userData.employeeData?.department || "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography color="text.secondary">No users found</Typography>
            </Box>
          )}
        </TableContainer>
      </Container>
    </Box>
  );
};

export default UsersList;
