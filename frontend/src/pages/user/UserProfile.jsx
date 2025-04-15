import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess , updateUser} from "../../redux/userSlice";

// Import components
import TabPanel from "../../components/common/TabPanel";
import ProfileTabs from "../../components/common/ProfileTabs";
import ProfileTab from "../../components/profile/ProfileTab/ProfileTab";
import PasswordTab from "../../components/profile/PasswordTab/PasswordTab";
import PreferencesTab from "../../components/profile/PreferencesTab/PreferencesTab";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const UserProfile = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const primaryColor = theme.palette.primary.main;
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Profile settings state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    bio: "",
    profileImage: null,
  });

  // Password settings state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newListingAlerts: true,
    marketingUpdates: false,
    accountAlerts: true,
  });

  // Housing preferences state
  const [preferences, setPreferences] = useState(null);

  // Saved listings state
  const [savedListings, setSavedListings] = useState([]);

  // Error handling
  const [errors, setErrors] = useState({});

  // Preview image state
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
  
        // Check if user data is already available in Redux store
        if (user) {
          // Initialize profile data from Redux state first
          setProfileData({
            fullName: user.fullName || "",
            email: user.email || "",
            bio: user.bio || "",
          });
  
          // Set initial profile image if available
          if (user.imagePath) {
            // Add cache-buster to prevent stale images
            const cacheBuster = `?t=${Date.now()}`;
            setPreviewImage(`${user.imagePath}${cacheBuster}`);
          }
  
          // Set notification settings if available
          if (user.notificationSettings) {
            setNotificationSettings({
              emailNotifications: user.notificationSettings.emailNotifications ?? true,
              newListingAlerts: user.notificationSettings.newListingAlerts ?? true,
              marketingUpdates: user.notificationSettings.marketingUpdates ?? false,
              accountAlerts: user.notificationSettings.accountAlerts ?? true,
            });
          }
        }
  
        // Fetch fresh user data - use the FULL URL
        const { data } = await axios.get(`${API_BASE_URL}api/user/session`, {
          withCredentials: true,
        });
  
        if (data.user) {
          // Update Redux store with latest data
          dispatch(loginSuccess(data.user));
          
          // Update component state
          setProfileData({
            fullName: data.user.fullName || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
          });
  
          // Set initial profile image if available
          if (data.user.imagePath) {
            // Add cache-buster to prevent stale images
            const cacheBuster = `?t=${Date.now()}`;
            setPreviewImage(`${data.user.imagePath}${cacheBuster}`);
          }
        }
  
        // Fix these endpoints too
        const savedResponse = await axios.get(`${API_BASE_URL}/api/user/saved`, {
          withCredentials: true,
        });
        setSavedListings(savedResponse.data);
  
        try {
          const prefResponse = await axios.get(`${API_BASE_URL}/api/user/preferences/latest`, {
            withCredentials: true,
          });
          setPreferences(prefResponse.data.preference);
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error("Error fetching preferences:", error);
          }
          // It's okay if user doesn't have preferences yet
        }
  
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSnackbar({
          open: true,
          message: "Failed to load profile data",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [user?._id, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const refreshUserData = async () => {
    try {
      console.log("Refreshing user data...");
      setLoading(true);
  
      const { data } = await axios.get(`${API_BASE_URL}/api/user/session`, {
        withCredentials: true,
      });
  
      console.log("Fresh user data received:", data.user);
  
      if (data.user) {
        // Update Redux state first
        dispatch(loginSuccess(data.user));
  
        // Then update local component state
        setProfileData(prevData => ({
          ...prevData,
          fullName: data.user.fullName || "",
          email: data.user.email || "",
          bio: data.user.bio || "",
        }));
  
        // Update preview image - make sure to prevent null values from overriding existing previews
        if (data.user.imagePath) {
          // Force image refresh by adding cache-busting parameter
          const cacheBuster = `?t=${Date.now()}`;
          setPreviewImage(`${data.user.imagePath}${cacheBuster}`);
        }
  
        // Update notification settings if available
        if (data.user.notificationSettings) {
          setNotificationSettings({
            emailNotifications: data.user.notificationSettings.emailNotifications ?? true,
            newListingAlerts: data.user.notificationSettings.newListingAlerts ?? true,
            marketingUpdates: data.user.notificationSettings.marketingUpdates ?? false,
            accountAlerts: data.user.notificationSettings.accountAlerts ?? true,
          });
        }
      }
      
      // Fix this endpoint too
      const savedResponse = await axios.get(`${API_BASE_URL}/api/user/saved`, {
        withCredentials: true,
      });
      setSavedListings(savedResponse.data);
      
      return data.user;
    } catch (error) {
      console.error("Error refreshing user data:", error);
      setSnackbar({
        open: true,
        message: "Failed to refresh user data",
        severity: "error",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    // Clear errors when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Update profile data with the new file
      setProfileData((prev) => ({ ...prev, profileImage: file }));

      // Create and set the image preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagePreview = reader.result;
        console.log("Setting new image preview", imagePreview?.substring(0, 50) + "...");
        setPreviewImage(imagePreview);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateProfileForm()) {
      return;
    }
  
    setUpdating(true);
  
    try {
      // Use the full URL
      const profileResponse = await axios.put(
        `${API_BASE_URL}/api/user/edit`,
        {
          fullName: profileData.fullName,
          bio: profileData.bio || "",
        },
        {
          withCredentials: true,
        }
      );
  
      // If response includes user data, use it to update Redux directly
      if (profileResponse.data && profileResponse.data.user) {
        dispatch(updateUser(profileResponse.data.user));
      } else {
        // Otherwise update Redux manually with what we know changed
        dispatch(updateUser({
          fullName: profileData.fullName,
          bio: profileData.bio || ""
        }));
      }
  
      // If there's a profile image, upload it separately
      if (profileData.profileImage) {
        const formData = new FormData();
        formData.append("profileImage", profileData.profileImage);
  
        // Use the full URL
        const imageResponse = await axios.post(
          `${API_BASE_URL}/api/user/upload-profile-image`, 
          formData, 
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        
        // If the server returns the new image path directly, use it
        if (imageResponse.data && imageResponse.data.imagePath) {
          // Update Redux directly with the new image path
          dispatch(updateUser({ imagePath: imageResponse.data.imagePath }));
          
          // Add cache-buster to force image refresh
          const cacheBuster = `?t=${Date.now()}`;
          setPreviewImage(`${imageResponse.data.imagePath}${cacheBuster}`);
        }
      }
  
      // Ensure UI is updated with the new data immediately
      setProfileData(prev => ({
        ...prev,
        fullName: profileData.fullName,
        bio: profileData.bio || "",
      }));
      
      // Force a complete refresh from the server to synchronize all data
      await refreshUserData();
      
      // Show success message
      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setSnackbar({
        open: true,
        message: "Failed to update profile",
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setUpdating(true);

    try {
      // Use the correct API endpoint with /api prefix
      await axios.put(
        "/api/user/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );

      // Clear password fields after successful update
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSnackbar({
        open: true,
        message: "Password updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating password:", error);

      // Handle specific errors
      if (error.response && error.response.status === 401) {
        setErrors({ currentPassword: "Current password is incorrect" });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update password",
          severity: "error",
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();

    setUpdating(true);

    try {
      // Use the correct API endpoint with /api prefix
      const response = await axios.put("/api/user/notification-settings", notificationSettings, {
        withCredentials: true,
      });

      // Update Redux with the new settings
      if (response.data && response.data.user) {
        dispatch(updateUser(response.data.user));
      } else {
        // Fallback to manual update if response doesn't include full user object
        dispatch(updateUser({ 
          notificationSettings: notificationSettings 
        }));
      }

      setSnackbar({
        open: true,
        message: "Notification settings updated",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      setSnackbar({
        open: true,
        message: "Failed to update notification settings",
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveSavedListing = async (apartmentId) => {
    try {
      // Use the correct API endpoint with /api prefix
      await axios.post(
        "/api/user/save",
        { apartmentId },
        {
          withCredentials: true,
        }
      );

      // Update local state to remove the listing
      setSavedListings(
        savedListings.filter((listing) => listing._id !== apartmentId)
      );

      setSnackbar({
        open: true,
        message: "Listing removed from saved properties",
        severity: "success",
      });
    } catch (error) {
      console.error("Error removing saved listing:", error);
      setSnackbar({
        open: true,
        message: "Failed to remove listing. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        mb={4}
        color="text.primary"
      >
        User Profile
      </Typography>

      <ProfileTabs tabValue={tabValue} handleTabChange={handleTabChange} />

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <ProfileTab
          user={user}
          profileData={profileData}
          previewImage={previewImage}
          savedListings={savedListings}
          errors={errors}
          handleImageChange={handleImageChange}
          handleProfileChange={handleProfileChange}
          handleProfileSubmit={handleProfileSubmit}
          handleRemoveSavedListing={handleRemoveSavedListing}
          updating={updating}
        />
      </TabPanel>

      {/* Password Tab */}
      <TabPanel value={tabValue} index={1}>
        <PasswordTab
          passwordData={passwordData}
          errors={errors}
          handlePasswordChange={handlePasswordChange}
          handlePasswordSubmit={handlePasswordSubmit}
          showCurrentPassword={showCurrentPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          setShowCurrentPassword={setShowCurrentPassword}
          setShowNewPassword={setShowNewPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          updating={updating}
        />
      </TabPanel>

      {/* Preferences Tab */}
      <TabPanel value={tabValue} index={2}>
        <PreferencesTab
          notificationSettings={notificationSettings}
          preferences={preferences}
          handleNotificationChange={handleNotificationChange}
          handleNotificationSubmit={handleNotificationSubmit}
          updating={updating}
        />
      </TabPanel>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;