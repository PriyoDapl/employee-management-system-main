"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Typography } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "../../components/LoadingScreen";
import Dashboard from "../../components/Dashboard";

export default function ManagementDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && (!user || user.role !== "management")) {
      router.push("/");
      return;
    }
  }, [user, loading, router, mounted]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Show loading screen during initial mount to prevent hydration mismatch
  if (!mounted || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />;
  }

  // If user is not management, show access denied message and signin redirect for development
  if (user.role !== "management") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: "bold",
              color: "error.main",
              mb: 2,
            }}
          >
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            You don't have permission to access this page.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Dashboard user={user} title="Admin Dashboard" onLogout={handleLogout} />
  );
}
