import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
} from "@mui/material";

const PortalSection = ({
  title,
  onLogin,
  onSignup,
  loginVariant = "contained",
  signupVariant = "outlined",
}) => {
  return (
    <Card sx={{ border: 1, borderColor: "grey.300" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ mb: 3, textAlign: "center", color: "primary.main" }}
        >
          {title}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              onClick={onLogin}
              variant={loginVariant}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Login
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              onClick={onSignup}
              variant={signupVariant}
              fullWidth
              sx={{ py: 1.5 }}
            >
              Sign Up
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PortalSection;
