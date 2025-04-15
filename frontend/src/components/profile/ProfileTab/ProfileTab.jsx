import React from "react";
import { Grid } from "@mui/material";
import ProfileSidebar from "./ProfileSidebar";
import ProfileEditForm from "./ProfileEditForm";
import { useTheme } from "@mui/material";

const ProfileTab = ({
  user,
  profileData,
  previewImage,
  savedListings,
  errors,
  handleImageChange,
  handleProfileChange,
  handleProfileSubmit,
  handleRemoveSavedListing,
  updating,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <ProfileSidebar
          user={user}
          profileData={profileData}
          previewImage={previewImage}
          savedListings={savedListings}
          handleImageChange={handleImageChange}
          handleRemoveSavedListing={handleRemoveSavedListing}
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <ProfileEditForm
          profileData={profileData}
          errors={errors}
          handleProfileChange={handleProfileChange}
          handleProfileSubmit={handleProfileSubmit}
          updating={updating}
          isDarkMode={isDarkMode}
        />
      </Grid>
    </Grid>
  );
};

export default ProfileTab;