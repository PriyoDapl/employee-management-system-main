"use client";

import { useState, useEffect } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({
  user,
  onLogout,
  children,
  currentView,
  onViewChange,
  onAddDetails,
  employeeCount,
  projectCount,
  taskCount,
  hasProfile = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Set initial sidebar state after mount based on screen size
    if (mounted && !isMobile) {
      setSidebarOpen(true);
      setSidebarCollapsed(false);
    }
  }, [isMobile, mounted]);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
      setSidebarCollapsed(false);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
      if (!sidebarOpen) {
        setSidebarOpen(true);
      }
    }
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSidebarCollapsed(false);
  };

  const drawerWidth = sidebarCollapsed ? 0 : 0;
  const contentMargin = isMobile ? 0 : sidebarOpen ? drawerWidth : 0;

  // Prevent hydration mismatch by showing simple layout until mounted
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
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
      <Sidebar
        user={user}
        currentView={currentView}
        onViewChange={onViewChange}
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={handleCloseSidebar}
        onToggleSidebar={handleToggleSidebar}
        employeeCount={employeeCount}
        projectCount={projectCount}
        taskCount={taskCount}
      />

      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: `${contentMargin}px`,
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          width: isMobile ? "100%" : `calc(100vw - ${contentMargin}px)`,
          minHeight: "100vh",
        }}
      >
        <Header
          user={user}
          onLogout={onLogout}
          onAddDetails={onAddDetails}
          onToggleSidebar={handleToggleSidebar}
          sidebarWidth={contentMargin}
          hasProfile={hasProfile}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "grey.50",
            overflow: "auto",
            position: "relative",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
