"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Divider,
} from "@mui/material";

const WelcomeScreen = ({
  onEmployeeLogin,
  onEmployeeSignup,
  onManagementLogin,
  onManagementSignup,
}) => {
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
      <Container maxWidth="md">
        <Paper sx={{ p: 6, textAlign: "center", boxShadow: 3 }}>
          {/* Header */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "primary.main",
              mb: 2,
            }}
          >
            Employee Management System
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Streamline your workforce management with our comprehensive platform
          </Typography>
          <Divider sx={{ my: 4 }} /> {/* Employee Portal */}
          <Box sx={{ mt: 4, maxWidth: 500, mx: "auto" }}>
            <Card
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ p: 5, textAlign: "center" }}>
                <Typography
                  variant="h5"
                  component="h2"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: "primary.main",
                    mb: 3,
                  }}
                >
                  Employee Portal
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Access your personal dashboard, manage your profile, and view
                  assigned projects. Management users can log in through the
                  employee portal.
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={onEmployeeLogin}
                    sx={{
                      py: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={onEmployeeSignup}
                    sx={{
                      py: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "1.1rem",
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default WelcomeScreen;
