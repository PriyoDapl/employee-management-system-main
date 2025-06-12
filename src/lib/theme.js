// This file will later be used to change the theme of the application. The dark mode theme will be used in the future.
"use client";

import { createTheme } from "@mui/material/styles";

// A Material-UI theme with light mode and a custom scrollbar
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  components: {
    // Fix modal scrollbar behavior
    MuiModal: {
      defaultProps: {
        // Prevent body scroll lock that causes scrollbar to disappear
        disableScrollLock: true,
      },
      styleOverrides: {
        root: {
          // Ensure backdrop doesn't interfere with scrollbar
          '&.MuiModal-root': {
            zIndex: 1300,
          },
        },
      },
    },
    MuiDialog: {
      defaultProps: {
        // Prevent body scroll lock that causes scrollbar to disappear
        disableScrollLock: true,
      },
      styleOverrides: {
        root: {
          // Ensure dialog doesn't interfere with scrollbar
          '& .MuiDialog-container': {
            outline: 'none',
          },
        },
      },
    },
    MuiDrawer: {
      defaultProps: {
        // Used to prevent scrollbar issues with drawer now it has a fixed width
      },
    },
  },
});

export default theme;
