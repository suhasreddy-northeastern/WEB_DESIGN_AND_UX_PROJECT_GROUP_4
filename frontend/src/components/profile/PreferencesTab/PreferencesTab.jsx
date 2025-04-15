import React from "react";
import { Grid } from "@mui/material";
import NotificationForm from "./NotificationForm";
import HousingPreferences from "./HousingPreferences";

const PreferencesTab = ({
  notificationSettings,
  preferences,
  handleNotificationChange,
  handleNotificationSubmit,
  updating,
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <NotificationForm
          notificationSettings={notificationSettings}
          handleNotificationChange={handleNotificationChange}
          handleNotificationSubmit={handleNotificationSubmit}
          updating={updating}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <HousingPreferences preferences={preferences} />
      </Grid>
    </Grid>
  );
};

export default PreferencesTab;