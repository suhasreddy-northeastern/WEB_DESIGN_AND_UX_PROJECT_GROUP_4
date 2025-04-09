import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
  Tab,
  Tabs,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import HouseIcon from '@mui/icons-material/House';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserProfile = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    bio: '',
    profileImage: null,
  });
  
  // Password settings state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
        
        // Fetch user profile data
        const { data } = await axios.get('/api/user/session', {
          withCredentials: true,
        });
        
        setProfileData({
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
        });
        
        // Set initial profile image if available
        if (user?.imagePath) {
          setPreviewImage(user.imagePath);
        }
        
        // Fetch saved listings
        const savedResponse = await axios.get('/api/user/saved', {
          withCredentials: true,
        });
        setSavedListings(savedResponse.data);
        
        // Fetch latest preference
        try {
          const prefResponse = await axios.get('/api/user/preferences/latest', {
            withCredentials: true,
          });
          setPreferences(prefResponse.data.preference);
        } catch (error) {
          if (error.response?.status !== 404) {
            console.error("Error fetching preferences:", error);
          }
          // It's okay if user doesn't have preferences yet
        }
        
        // For now, use default notification settings
        // In a real implementation, you'd fetch these from the backend
        setNotificationSettings({
          emailNotifications: user?.notificationSettings?.emailNotifications || true,
          newListingAlerts: user?.notificationSettings?.newInquiryAlerts || true,
          marketingUpdates: user?.notificationSettings?.marketingUpdates || false,
          accountAlerts: user?.notificationSettings?.accountAlerts || true,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSnackbar({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    
    // Clear errors when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileData((prev) => ({ ...prev, profileImage: file }));
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const formData = new FormData();
      formData.append('fullName', profileData.fullName);
      formData.append('bio', profileData.bio || '');
      
      if (profileData.profileImage) {
        formData.append('profileImage', profileData.profileImage);
      }
      
      await axios.put('/api/user/edit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      
      // Update the Redux store with the new user data
      dispatch({
        type: 'user/updateUser',
        payload: { ...user, fullName: profileData.fullName, bio: profileData.bio }
      });
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error',
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
      await axios.put('/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }, { withCredentials: true });
      
      // Clear password fields after successful update
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      
      // Handle specific errors
      if (error.response && error.response.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to update password',
          severity: 'error',
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
      await axios.put('/api/user/notification-settings', notificationSettings, { 
        withCredentials: true 
      });
      
      setSnackbar({
        open: true,
        message: 'Notification settings updated',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update notification settings',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveSavedListing = async (apartmentId) => {
    try {
      await axios.post('/api/user/save', { apartmentId }, {
        withCredentials: true,
      });
      
      // Update local state to remove the listing
      setSavedListings(savedListings.filter(listing => listing._id !== apartmentId));
      
      setSnackbar({
        open: true,
        message: 'Listing removed from saved properties',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error removing saved listing:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove listing. Please try again.',
        severity: 'error',
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4} color="text.primary">
        User Profile
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
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
      
      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                <Avatar
                  src={user?.imagePath || previewImage || null}
                  alt={profileData.fullName}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2,
                    bgcolor: primaryColor
                  }}
                >
                  {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                  {profileData.fullName}
                </Typography>
                
                <Chip
                  icon={<PersonIcon />}
                  label="User Account"
                  color="primary"
                  sx={{ mt: 1, mb: 2 }}
                />
                
                <Divider sx={{ width: '100%', my: 2 }} />
                
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <PersonIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom fontWeight="medium" color="text.primary">
                    {profileData.fullName}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, mt: 2 }}>
                    <EmailIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom fontWeight="medium" color="text.primary">
                    {profileData.email}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, mt: 2 }}>
                    <HouseIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Saved Properties
                    </Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom fontWeight="medium" color="text.primary">
                    {savedListings.length || 0}
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
              </CardContent>
            </Card>
            
            {savedListings.length > 0 && (
              <Card
                elevation={2}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                  border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                  mt: 3,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    Saved Properties
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <List>
                    {savedListings.slice(0, 3).map((listing) => (
                      <ListItem key={listing._id} divider>
                        <ListItemText
                          primary={listing.title || 'Apartment'}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                ${listing.price}/month
                              </Typography>
                              {" — "}{listing.neighborhood || 'Unknown area'}, {listing.bedrooms || '?'} bed
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => navigate(`/apartment/${listing._id}`)}
                          >
                            View
                          </Button>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => handleRemoveSavedListing(listing._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  
                  {savedListings.length > 3 && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/user/saved')}
                        sx={{
                          borderRadius: 2,
                          borderColor: primaryColor,
                          color: primaryColor,
                        }}
                      >
                        View All ({savedListings.length})
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                Edit Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Update your profile information below
              </Typography>

              <Divider sx={{ my: 2 }} />
              
              <Box component="form" onSubmit={handleProfileSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      fullWidth
                      required
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                          },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Email Address"
                      name="email"
                      value={profileData.email}
                      fullWidth
                      disabled
                      variant="outlined"
                      helperText="Email address cannot be changed"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      placeholder="Tell us a bit about yourself..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                          },
                        },
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updating}
                    startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      bgcolor: primaryColor,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Password Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            maxWidth: 600,
            mx: 'auto',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
            Change Password
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Update your password to keep your account secure
          </Typography>

          <Divider sx={{ my: 2 }} />
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Your password should be at least 8 characters and include a mix of letters, numbers, and symbols for best security.
          </Alert>
          
          <Box component="form" onSubmit={handlePasswordSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Current Password"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
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
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
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
                  type={showNewPassword ? 'text' : 'password'}
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
                  type={showConfirmPassword ? 'text' : 'password'}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={updating}
                startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.2,
                  bgcolor: primaryColor,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                {updating ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </TabPanel>
      
      {/* Preferences Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Important notifications about your account
                    </Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updating}
                    startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.2,
                      bgcolor: primaryColor,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {updating ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <HomeWorkIcon sx={{ mr: 1 }} /> Housing Preferences
              </Typography>

              <Divider sx={{ my: 2 }} />

              {preferences ? (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Budget Range:</Typography>
                      <Typography variant="body1" color="text.primary">{preferences.priceRange || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Bedrooms:</Typography>
                      <Typography variant="body1" color="text.primary">{preferences.bedrooms || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Neighborhood:</Typography>
                      <Typography variant="body1" color="text.primary">{preferences.neighborhood || 'Not specified'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Move-in Date:</Typography>
                      <Typography variant="body1" color="text.primary">
                        {preferences.moveInDate 
                          ? new Date(preferences.moveInDate).toLocaleDateString() 
                          : 'Not specified'}
                      </Typography>
                    </Grid>
                    {preferences.amenities && preferences.amenities.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Desired Amenities:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {preferences.amenities.map((amenity, index) => (
                            <Chip key={index} label={amenity} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                  
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => navigate('/preferences')}
                      sx={{
                        borderRadius: 2,
                        borderColor: primaryColor,
                        color: primaryColor,
                      }}
                    >
                      Update Preferences
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/matches/${preferences._id}`)}
                      sx={{
                        borderRadius: 2,
                        bgcolor: primaryColor,
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                        },
                      }}
                    >
                      View Matches
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    You haven't set your housing preferences yet.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/preferences')}
                    sx={{
                      borderRadius: 2,
                      bgcolor: primaryColor,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Set Preferences
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;