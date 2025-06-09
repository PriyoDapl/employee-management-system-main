"use client";

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackIos";

const ManagementDetails = ({ user, onBack }) => {
  return (
    <Box sx={{ flexGrow: 1, bgcolor: "grey.50", minHeight: "100vh" }}>
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
          <IconButton
            edge="start"
            color="primary"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: "text.primary" }}
          >
            Management Details
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent sx={{ p: 6, textAlign: "center" }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: "primary.main",
                fontWeight: 600,
                mb: 3,
              }}
            >
              Management Profile
            </Typography>

            <Paper sx={{ p: 4, bgcolor: "info.50", mb: 4 }}>
              <Typography
                variant="h6"
                color="info.main"
                gutterBottom
                sx={{ fontWeight: 500 }}
              >
                Feature Under Development
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Management profile functionality will be added in future
                updates. This section will include management-specific settings,
                administrative tools, and profile customization options.
              </Typography>
            </Paper>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Current management privileges include full employee data access,
              project management, and system administration capabilities.
            </Typography>

            <Button
              variant="contained"
              onClick={onBack}
              size="large"
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                textTransform: "none",
                px: 4,
                py: 2,
              }}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ManagementDetails;
