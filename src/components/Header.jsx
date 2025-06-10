"use client";

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
// import NotificationMenu from "./NotificationMenu";

const Header = ({
  user,
  onLogout,
  onAddDetails,
  onToggleSidebar,
  sidebarWidth = 0,
  hasProfile = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout();
  };

  const handleAddDetails = () => {
    handleProfileMenuClose();
    onAddDetails();
  };

  const isEmployee = user?.role === "employee";
  const isManagement = user?.role === "management";
  const handleViewProfile = () => {
    handleProfileMenuClose();
    // Navigate to profile or trigger profile view
    if (onAddDetails) {
      onAddDetails(); // Reuse the existing function to show profile
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer - 1,
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(8px)",
        background: "rgba(255, 255, 255, 0.95)",
        top: 0,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {/* Hamburger Menu */}
        <IconButton
          onClick={onToggleSidebar}
          sx={{
            mr: 2,
            color: "text.primary",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, maxWidth: 400, mx: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search employees, projects, or documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "grey.50",
                borderRadius: 2,
                "& fieldset": {
                  border: "1px solid",
                  borderColor: "grey.300",
                },
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "grey.500" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* User Profile Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Notifications */}
          {/* <NotificationMenu user={user} /> */}

          <Box
            sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.name || user?.email}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "capitalize" }}
            >
              {user?.role}
            </Typography>
          </Box>

          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 40,
                height: 40,
                fontSize: "1rem",
              }}
            >
              {(user?.name || user?.email)?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                minWidth: 200,
                "& .MuiMenuItem-root": {
                  px: 2,
                  py: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.name || user?.email}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: "capitalize" }}
              >
                {user?.role}
              </Typography>
            </Box>
            <Divider />
            {isEmployee && (
              <MenuItem onClick={handleViewProfile}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Profile</ListItemText>
              </MenuItem>
            )}
            {isEmployee && onAddDetails && !hasProfile && (
              <MenuItem onClick={handleAddDetails}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add Profile Details</ListItemText>
              </MenuItem>
            )}
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
