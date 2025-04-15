import React from "react";
import { Box, Tabs, Tab } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsIcon from "@mui/icons-material/Notifications";

const ProfileTabs = ({ tabValue, handleTabChange }) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="profile tabs"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab
          icon={<AccountCircleIcon />}
          iconPosition="start"
          label="Profile"
          id="profile-tab-0"
          aria-controls="profile-tabpanel-0"
        />
        <Tab
          icon={<SecurityIcon />}
          iconPosition="start"
          label="Password"
          id="profile-tab-1"
          aria-controls="profile-tabpanel-1"
        />
        <Tab
          icon={<NotificationsIcon />}
          iconPosition="start"
          label="Preferences"
          id="profile-tab-2"
          aria-controls="profile-tabpanel-2"
        />
      </Tabs>
    </Box>
  );
};

export default ProfileTabs;