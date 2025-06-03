import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import { createDefaultAdmin } from "../../services/adminApi";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [adminForm, setAdminForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAdminForm({
      ...adminForm,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!adminForm.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!adminForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(adminForm.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!adminForm.password) {
      newErrors.password = "Password is required";
    } else if (adminForm.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (adminForm.password !== adminForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await createDefaultAdmin(
        adminForm.email,
        adminForm.password,
        adminForm.username
      );

      setSnackbar({
        open: true,
        message: "Default admin account created successfully!",
        severity: "success",
      });

      // Reset form
      setAdminForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error creating default admin:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Failed to create admin account",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader title="Create Default Admin Account" />
            <Divider />
            <CardContent>
              <form onSubmit={handleCreateAdmin}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Username"
                  name="username"
                  value={adminForm.username}
                  onChange={handleInputChange}
                  error={!!errors.username}
                  helperText={errors.username}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  type="email"
                  value={adminForm.email}
                  onChange={handleInputChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  name="password"
                  type="password"
                  value={adminForm.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />

                <TextField
                  fullWidth
                  margin="normal"
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={adminForm.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                />

                <Box
                  sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ minWidth: 150 }}
                  >
                    {loading ? <CircularProgress size={24} /> : "Create Admin"}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader title="Admin Panel Settings" />
            <Divider />
            <CardContent>
              <Typography variant="body1" paragraph>
                This section allows you to configure settings for the admin
                panel. Currently, you can create a default admin account that
                will have full access to the admin features.
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Note: The default admin account should be created only once.
                Additional admin users can be created by promoting existing
                users through the Customer Management section.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
