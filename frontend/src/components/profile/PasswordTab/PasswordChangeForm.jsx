import React from "react";
import {
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
  Box,
  Paper,
  useTheme,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import SaveIcon from "@mui/icons-material/Save";

const PasswordChangeForm = ({
  passwordData,
  errors,
  handlePasswordChange,
  handlePasswordSubmit,
  showCurrentPassword,
  showNewPassword,
  showConfirmPassword,
  setShowCurrentPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  updating,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const primaryColor = theme.palette.primary.main;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
        border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        color="text.primary"
      >
        Change Password
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Update your password to keep your account secure
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Alert severity="info" sx={{ mb: 3 }}>
        Your password should be at least 8 characters and include a mix of
        letters, numbers, and symbols for best security.
      </Alert>

      <Box component="form" onSubmit={handlePasswordSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Current Password"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              fullWidth
              required
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      edge="end"
                    >
                      {showCurrentPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="New Password"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              fullWidth
              required
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              fullWidth
              required
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={updating}
            startIcon={
              updating ? <CircularProgress size={20} /> : <SaveIcon />
            }
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.2,
              bgcolor: primaryColor,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            {updating ? "Updating..." : "Update Password"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PasswordChangeForm;