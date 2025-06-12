"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Collapse,
  Chip,
  useTheme,
  useMediaQuery,
  Tooltip,
  Paper,
  Backdrop,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as ProjectsIcon,
  Person as PersonIcon,
  Business as CompanyIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Description as ReportsIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  AssignmentInd as AssignmentsIcon,
  Task as TaskIcon,
  Mail as MailIcon,
  AlternateEmail as MailAltIcon,
  Send,
} from "@mui/icons-material";

const Sidebar = ({
  user,
  currentView,
  onViewChange,
  isOpen = false,
  isCollapsed = false,
  onClose,
  onToggleSidebar,
  employeeCount,
  projectCount,
  taskCount,
}) => {
  const [mounted, setMounted] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState("");
  const [sidePanel, setSidePanel] = useState({
    open: false,
    title: "",
    items: [],
    anchorEl: null,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setMounted(true);
  }, []);

  // On desktop, sidebar is always visible
  // On mobile, sidebar can be hidden
  const drawerWidth = isCollapsed ? 64 : 240;
  const shouldShowSidebar = isMobile ? isOpen : true;

  const handleSubmenuToggle = (menuName) => {
    if (isCollapsed) return;
    setOpenSubmenu(openSubmenu === menuName ? "" : menuName);
  };

  const handleCollapsedSubmenuClick = (item, event) => {
    if (!isCollapsed || !item.submenu) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    setSidePanel({
      open: true,
      title: item.text,
      items: item.submenu,
      anchorEl: {
        top: rect.top,
        left: rect.right + 8,
        height: rect.height,
      },
    });

    // Add a subtle haptic feedback on desktop (if available)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleCloseSidePanel = () => {
    setSidePanel((prev) => ({ ...prev, open: false }));
  };

  // Close all submenus when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setOpenSubmenu("");
      handleCloseSidePanel(); // Close side panel when collapsing
    }
  }, [isCollapsed]);

  const isEmployee = user?.role === "employee";
  const isManagement = user?.role === "management";

  // Employee navigation items
  const employeeNavItems = [
    {
      id: "dashboard",
      text: "Dashboard",
      icon: <DashboardIcon />,
      view: "dashboard",
    },
    {
      id: "profile",
      text: "My Profile",
      icon: <PersonIcon />,
      view: "details",
    },
    {
      id: "projects",
      text: "My Projects",
      icon: <ProjectsIcon />,
      view: "projects",
      badge: projectCount?.toString() || "0",
    },
    {
      id: "tasks",
      text: "My Tasks",
      icon: <AssignmentsIcon />,
      view: "tasks",
      badge: taskCount?.toString() || "0",
    },
    {
      id: "mailing",
      text: "Mailing",
      icon: <MailIcon />,
      submenu: [
        {
          id: "mailmanagement",
          text: "Send Mail",
          view: "mailmanagement",
        },
        {
          id: "inbox",
          text: "Inbox",
          view: "inbox",
        },
      ],
    },
    {
      id: "reports",
      text: "Reports",
      icon: <ReportsIcon />,
      submenu: [
        { id: "timesheet", text: "Timesheet", view: "timesheet" },
        { id: "performance", text: "Performance", view: "performance" },
      ],
    },
  ];

  // Management navigation items
  const managementNavItems = [
    {
      id: "dashboard",
      text: "Dashboard",
      icon: <DashboardIcon />,
      view: "dashboard",
    },
    {
      id: "employees",
      text: "Employees",
      icon: <PeopleIcon />,
      view: "employees",
      badge: employeeCount?.toString() || "0",
    },
    {
      id: "projects",
      text: "Projects",
      icon: <ProjectsIcon />,
      view: "projects",
      badge: projectCount?.toString() || "0",
    },
    {
      id: "tasks",
      text: "Task Management",
      icon: <TaskIcon />,
      view: "tasks",
      badge: taskCount?.toString() || "0",
    },
    {
      id: "mailing",
      text: "Mailing",
      icon: <MailIcon />,
      submenu: [
        {
          id: "mailmanagement",
          text: "Send Mail",
          view: "mailmanagement",
        },
        {
          id: "inbox",
          text: "Inbox",
          view: "inbox",
        },
      ],
    },
    {
      id: "reports",
      text: "Reports",
      icon: <ReportsIcon />,
      view: "reports",
    },
    {
      id: "settings",
      text: "Settings",
      icon: <SettingsIcon />,
      view: "settings",
    },
  ];

  const navigationItems = isEmployee ? employeeNavItems : managementNavItems;

  const renderNavItem = (item) => {
    const isActive = currentView === item.view;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuOpen = openSubmenu === item.id;

    return (
      <Box key={item.id}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <Tooltip title={isCollapsed ? item.text : ""} placement="right" arrow>
            <ListItemButton
              onClick={(e) => {
                if (hasSubmenu && isCollapsed) {
                  handleCollapsedSubmenuClick(item, e);
                } else if (hasSubmenu && !isCollapsed) {
                  handleSubmenuToggle(item.id);
                } else {
                  // In collapsed mode or no submenu, go directly to view
                  onViewChange(item.view);
                }
              }}
              sx={{
                py: 1.5,
                px: isCollapsed ? 0.5 : 1,
                mx: 0.5,
                borderRadius: 2,
                bgcolor: isActive ? "primary.main" : "transparent",
                color: isActive ? "white" : "text.primary",
                "&:hover": {
                  bgcolor: isActive ? "primary.dark" : "action.hover",
                  transform: "translateX(2px)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                minHeight: 48,
                justifyContent: isCollapsed ? "center" : "flex-start",
                position: "relative",
                cursor: "pointer",
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? "white" : "text.secondary",
                  minWidth: 40,
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {item.icon}
                {/* Small dot indicator for collapsed items with submenu */}
                {isCollapsed && hasSubmenu && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: isActive
                        ? "rgba(255,255,255,0.7)"
                        : "primary.main",
                      animation: "pulse 2s infinite",
                      "@keyframes pulse": {
                        "0%": {
                          opacity: 1,
                        },
                        "50%": {
                          opacity: 0.5,
                        },
                        "100%": {
                          opacity: 1,
                        },
                      },
                    }}
                  />
                )}
              </ListItemIcon>
              {!isCollapsed && (
                <>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: isActive ? 600 : 400,
                        fontSize: "0.85rem",
                      },
                    }}
                  />
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.75rem",
                        bgcolor: isActive
                          ? "rgba(255,255,255,0.2)"
                          : "primary.main",
                        pointerEvents: "none",
                        color: "white",
                        mr: hasSubmenu ? 1 : 0,
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: isActive
                            ? "rgba(255,255,255,0.3)"
                            : "primary.dark",
                        },
                      }}
                    />
                  )}
                  {hasSubmenu && (
                    <Box sx={{ color: isActive ? "white" : "text.secondary" }}>
                      {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        {hasSubmenu && !isCollapsed && (
          <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.submenu.map((subItem) => {
                const isSubActive = currentView === subItem.view;
                return (
                  <ListItem key={subItem.id} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      onClick={() => onViewChange(subItem.view)}
                      sx={{
                        py: 1,
                        pl: 4,
                        pr: 1,
                        mx: 0.5,
                        borderRadius: 2,
                        bgcolor: isSubActive ? "primary.light" : "transparent",
                        color: isSubActive ? "white" : "text.primary",
                        "&:hover": {
                          bgcolor: isSubActive
                            ? "primary.main"
                            : "action.hover",
                          transform: "translateX(4px)",
                        },
                        "&:active": {
                          transform: "scale(0.98)",
                        },
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        minHeight: 40,
                      }}
                    >
                      <ListItemText
                        primary={subItem.text}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: isSubActive ? 600 : 400,
                            fontSize: "0.9rem",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={shouldShowSidebar}
        onClose={onClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            zIndex: (theme) => theme.zIndex.drawer,
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            overflowX: "hidden",
            position: "fixed",
            height: "100vh",
            top: 0,
            boxShadow:
              isCollapsed && !isMobile ? "2px 0 8px rgba(0,0,0,0.1)" : "none",
          },
        }}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
          disableScrollLock: true, // Prevent body scroll lock
        }}
      >
        {/* System Title */}
        <Box
          sx={{
            p: isCollapsed ? 1 : 2,
            textAlign: "center",
            bgcolor: "primary.main",
            color: "white",
            borderBottom: "1px solid",
            borderColor: "primary.dark",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            },
          }}
        >
          <Typography
            variant={isCollapsed ? "caption" : "h6"}
            sx={{
              fontWeight: 600,
              fontSize: isCollapsed ? "1.25rem" : ".9rem",
              lineHeight: isCollapsed ? "2.35" : "2.2",
              whiteSpace: isCollapsed ? "nowrap" : "nowrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            {isCollapsed ? "EMS" : "Employee Management System"}
          </Typography>
        </Box>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, overflow: "auto", py: 0 }}>
          <List sx={{ px: 0 }}>{navigationItems.map(renderNavItem)}</List>
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: isCollapsed ? 1 : 2, textAlign: "center" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: isCollapsed ? "0.6rem" : "0.75rem",
              whiteSpace: "nowrap",
            }}
          >
            {isCollapsed ? "©" : "© 2025 EMS"}
          </Typography>
        </Box>
      </Drawer>

      {/* Side Panel for Collapsed State Dropdowns */}
      {sidePanel.open && (
        <>
          <Backdrop
            open={sidePanel.open}
            onClick={handleCloseSidePanel}
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              backdropFilter: "blur(2px)",
            }}
          />
          <Paper
            elevation={8}
            sx={{
              position: "fixed",
              top: sidePanel.anchorEl?.top || 0,
              left: sidePanel.anchorEl?.left || 0,
              width: 220,
              maxHeight: 320,
              overflow: "auto",
              zIndex: (theme) => theme.zIndex.drawer + 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              animation: "slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              "@keyframes slideIn": {
                from: {
                  opacity: 0,
                  transform: "translateX(-12px) scale(0.9)",
                },
                to: {
                  opacity: 1,
                  transform: "translateX(0) scale(1)",
                },
              },
            }}
          >
            <Box
              sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {sidePanel.title}
              </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <List component="nav" disablePadding>
                {sidePanel.items.map((item) => {
                  const isSubActive = currentView === item.view;
                  return (
                    <ListItem key={item.id} disablePadding sx={{ mb: 0.25 }}>
                      <ListItemButton
                        onClick={() => {
                          onViewChange(item.view);
                          handleCloseSidePanel();
                        }}
                        sx={{
                          py: 0.75,
                          px: 1,
                          borderRadius: 1,
                          bgcolor: isSubActive
                            ? "primary.light"
                            : "transparent",
                          color: isSubActive ? "white" : "text.primary",
                          "&:hover": {
                            bgcolor: isSubActive
                              ? "primary.main"
                              : "action.hover",
                            transform: "translateX(2px)",
                          },
                          "&:active": {
                            transform: "scale(0.98)",
                          },
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          minHeight: 36,
                        }}
                      >
                        <ListItemText
                          primary={item.text}
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontWeight: isSubActive ? 600 : 400,
                              fontSize: "0.875rem",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </Paper>
        </>
      )}
    </>
  );
};

export default Sidebar;
