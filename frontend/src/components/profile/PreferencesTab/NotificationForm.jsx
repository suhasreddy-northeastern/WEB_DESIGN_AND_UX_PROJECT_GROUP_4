import React from "react";
import {
  Typography,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Divider,
  Box,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SaveIcon from "@mui/icons-material/Save";

const NotificationForm = ({
  notificationSettings,
  handleNotificationChange,
  handleNotificationSubmit,
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
        backgroundColor: isDarkMode
          ? "rgba(255, 255, 255, 0.05)"
          : "#fff",
        border: isDarkMode
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "none",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        color="text.primary"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <NotificationsIcon sx={{ mr: 1 }} /> Notification Preferences
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box component="form" onSubmit={handleNotificationSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  name="emailNotifications"
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 4 }}
            >
              Receive all notifications via email
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.newListingAlerts}
                  onChange={handleNotificationChange}
                  name="newListingAlerts"
                  color="primary"
                />
              }
              label="New Listing Alerts"
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 4 }}
            >
              Get notified when new properties match your preferences
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.marketingUpdates}
                  onChange={handleNotificationChange}
                  name="marketingUpdates"
                  color="primary"
                />
              }
              label="Marketing Updates"
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 4 }}
            >
              Receive news and special offers
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.accountAlerts}
                  onChange={handleNotificationChange}
                  name="accountAlerts"
                  color="primary"
                />
              }
              label="Account Alerts"
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: 4 }}
            >
              Important notifications about your account
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}
        >
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
            {updating ? "Saving..." : "Save Preferences"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default NotificationForm;