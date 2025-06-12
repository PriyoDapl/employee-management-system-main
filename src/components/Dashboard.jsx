"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import Layout from "./Layout";
import ManagementDetails from "./ManagementDetails";
import AllEmployees from "./AllEmployees";
import ProjectsManagement from "./ProjectsManagement";

import TaskManagement from "./TaskManagement";
import Settings from "./Settings";
import MailManagement from "./MailManagement";
import InboxManagement from "./InboxManagement";

const Dashboard = ({ user, title, onLogout }) => {
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchStats();
      fetchTaskCount();
    }
  }, [mounted]);

  const fetchStats = async () => {
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const stats = await response.json();
        setEmployeeCount(stats.employeeCount || 0);
        setProjectCount(stats.projectCount || 0);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTaskCount = async () => {
    try {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/management/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTaskCount(data.tasks?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching task count:", error);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };
  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    // Refresh stats when returning to dashboard to ensure data is up-to-date
    fetchStats();
    fetchTaskCount();
  };

  const handleProjectCountChange = (newCount) => {
    setProjectCount(newCount);
  };

  const handleEmployeeCountChange = (newCount) => {
    setEmployeeCount(newCount);
  };

  const handleTaskCountChange = (newCount) => {
    setTaskCount(newCount);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "employees":
        return <AllEmployees user={user} onBack={handleBackToDashboard} onEmployeeCountChange={handleEmployeeCountChange} />;
      case "projects":
        return (
          <ProjectsManagement
            user={user}
            onBack={handleBackToDashboard}
            onProjectCountChange={handleProjectCountChange}
          />
        );
      case "tasks":
        return (
          <TaskManagement 
            user={user} 
            onBack={handleBackToDashboard}
            onTaskCountChange={handleTaskCountChange}
          />
        );
      case "mailmanagement":
        return (
          <MailManagement
            user={user}
            onBack={handleBackToDashboard}
          />
        );
      case "inbox":
        return (
          <InboxManagement
            user={user}
            onBack={handleBackToDashboard}
          />
        );
      case "hr":
        return <DepartmentPlaceholder department="Human Resources" />;
      case "it":
        return <DepartmentPlaceholder department="IT Department" />;
      case "finance":
        return <DepartmentPlaceholder department="Finance" />;
      case "marketing":
        return <DepartmentPlaceholder department="Marketing" />;
      case "performance":
        return <AnalyticsPlaceholder type="Performance" />;
      case "productivity":
        return <AnalyticsPlaceholder type="Productivity" />;
      case "attendance":
        return <AnalyticsPlaceholder type="Attendance" />;
      case "reports":
        return <ReportsPlaceholder />;
      case "notifications":
        return <NotificationsPlaceholder />;
      case "settings":
        return <Settings user={user} onBack={handleBackToDashboard} />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  // Show simple layout until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "100vh",
            bgcolor: "grey.50",
            pt: 2,
            px: 3,
            py: 2,
          }}
        >
          <DashboardContent user={user} />
        </Box>
      </Box>
    );
  }

  return (
    <Layout
      user={user}
      onLogout={onLogout}
      currentView={currentView}
      onViewChange={handleViewChange}
      employeeCount={employeeCount}
      projectCount={projectCount}
      taskCount={taskCount}
    >
      {renderCurrentView()}
    </Layout>
  );
};

// Management Dashboard main content
const DashboardContent = ({ user }) => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: "center", mt: 8, mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600, color: "primary.main", mb: 2 }}
        >
          Hi {user?.name || user?.email}, welcome to your{" "}
          {user?.role || "management"} dashboard
        </Typography>
      </Box>
    </Container>
  );
};

// Placeholder components for navigation items
const DepartmentPlaceholder = ({ department }) => (
  <Container maxWidth="lg">
    <Typography
      variant="h4"
      gutterBottom
      sx={{ fontWeight: 600, color: "primary.main" }}
    >
      {department}
    </Typography>
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" color="text.secondary">
        {department} management coming soon
      </Typography>
    </Paper>
  </Container>
);

const AnalyticsPlaceholder = ({ type }) => (
  <Container maxWidth="lg">
    <Typography
      variant="h4"
      gutterBottom
      sx={{ fontWeight: 600, color: "primary.main" }}
    >
      {type} Analytics
    </Typography>
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" color="text.secondary">
        {type} analytics dashboard coming soon
      </Typography>
    </Paper>
  </Container>
);

const ReportsPlaceholder = () => (
  <Container maxWidth="lg">
    <Typography
      variant="h4"
      gutterBottom
      sx={{ fontWeight: 600, color: "primary.main" }}
    >
      Reports
    </Typography>
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" color="text.secondary">
        Comprehensive reporting system coming soon
      </Typography>
    </Paper>
  </Container>
);

const NotificationsPlaceholder = () => (
  <Container maxWidth="lg">
    <Typography
      variant="h4"
      gutterBottom
      sx={{ fontWeight: 600, color: "primary.main" }}
    >
      Notifications
    </Typography>
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" color="text.secondary">
        Notification center coming soon
      </Typography>
    </Paper>
  </Container>
);

const SettingsPlaceholder = () => (
  <Container maxWidth="lg">
    <Typography
      variant="h4"
      gutterBottom
      sx={{ fontWeight: 600, color: "primary.main" }}
    >
      Settings
    </Typography>
    <Paper sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h6" color="text.secondary">
        System settings coming soon
      </Typography>
    </Paper>
  </Container>
);

export default Dashboard;
