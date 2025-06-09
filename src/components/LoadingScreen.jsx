"use client";

import { Box, Typography, CircularProgress } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    </Box>
  );
};

export default LoadingScreen;
