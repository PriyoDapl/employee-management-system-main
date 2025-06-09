"use client";
import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from "@mui/material";

const LoginForm = ({ userType, isSignup, onToggleMode, onBack, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Client-side validation
    if (isSignup && formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignup ? { ...formData, role: userType } : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          email: formData.email,
          role: isSignup ? userType : data.user?.role || userType,
          ...data.user,
        };
        onSubmit(data.token, userData);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                {isSignup ? "Create Account" : "Sign In"}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ textTransform: "capitalize" }}
              >
                {userType} Portal
              </Typography>
            </Box>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                required
                variant="outlined"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                required
                variant="outlined"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                helperText={
                  isSignup ? "Password must be at least 6 characters" : ""
                }
                sx={{ mb: 4 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 2,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: "white" }}
                    />
                    {isSignup ? "Creating Account..." : "Signing In..."}
                  </>
                ) : isSignup ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>

              <Divider sx={{ my: 2 }} />

              {/* Toggle Mode */}
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {isSignup
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </Typography>
                <Button
                  variant="text"
                  onClick={onToggleMode}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  {isSignup ? "Sign In" : "Sign Up"}
                </Button>
              </Box>

              {/* Back Button */}
              <Box sx={{ textAlign: "center", mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={onBack}
                  sx={{ textTransform: "none" }}
                >
                  Back to Portal Selection
                </Button>
              </Box>
            </Box>{" "}
          </CardContent>
        </Card>
      </Container>{" "}
    </Box>
  );
};

export default LoginForm;
