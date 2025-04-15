import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  useTheme,
  Switch,
  TextField,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettingsCard = ({ title, icon, children }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );
};

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  // Form states
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    bio: '',
  });
  
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newUserAlerts: true,
    brokerApprovalAlerts: true,
    systemUpdates: false,
  });
  
  const [systemSettings, setSystemSettings] = useState({
    autoApproveListings: false,
    darkModeDefault: false,
    maintenanceMode: false,
    maintenanceMessage: '',
    maintenanceTime: '',
    defaultCurrency: 'USD',
    defaultLanguage: 'en',
  });
  
  const [maintenanceStatus, setMaintenanceStatus] = useState({
    isActive: false,
    message: '',
    estimatedTime: '',
    lastUpdated: null
  });
  
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  // Fetch maintenance status
  const fetchMaintenanceStatus = async () => {
    try {
      // Add a cache-busting parameter to prevent caching
      const response = await axios.get(`/api/system/maintenance-status?t=${new Date().getTime()}`, {
        withCredentials: true,
      });
      
      console.log("Maintenance status from server:", response.data); // Debug log
      
      // Update maintenance status
      setMaintenanceStatus({
        isActive: response.data.isInMaintenanceMode || false,
        message: response.data.message || '',
        estimatedTime: response.data.estimatedTime || '',
        lastUpdated: response.data.lastUpdated || new Date()
      });
      
      // Update system settings form - make sure this runs AFTER the API call
      setSystemSettings(prev => ({
        ...prev,
        maintenanceMode: response.data.isInMaintenanceMode || false,
        maintenanceMessage: response.data.message || '',
        maintenanceTime: response.data.estimatedTime || ''
      }));
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch maintenance status:', error);
      showSnackbarMessage('Failed to check system status', 'error');
      return null;
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user || user.type !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user profile
        const userRes = await axios.get('/api/user/profile', {
          withCredentials: true,
        });
        
        if (userRes.data) {
          setProfile({
            fullName: userRes.data.fullName || '',
            email: userRes.data.email || '',
            bio: userRes.data.bio || '',
          });
        }
        
        // Try to fetch notification settings
        try {
          const notificationsRes = await axios.get('/api/user/notification-settings', {
            withCredentials: true,
          });
          
          if (notificationsRes.data?.notificationSettings) {
            setNotifications({
              ...notifications,
              ...notificationsRes.data.notificationSettings,
            });
          }
        } catch (err) {
          console.log('Notification settings API not available:', err);
          // Continue without notification settings
        }
        
        // Fetch maintenance mode status
        await fetchMaintenanceStatus();
        
        // Set system settings
        setSystemSettings(prev => ({
          ...prev,
          darkModeDefault: isDarkMode,
        }));
        
      } catch (error) {
        console.error('Error fetching settings:', error);
        showSnackbarMessage('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, navigate, isDarkMode]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const showSnackbarMessage = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurity({
      ...security,
      [name]: value,
    });
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({
      ...notifications,
      [name]: checked,
    });
  };

  const handleSystemSettingChange = (e) => {
    const { name, value, checked } = e.target;
    setSystemSettings({
      ...systemSettings,
      [name]: e.target.type === 'checkbox' ? checked : value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      await axios.put('/api/user/edit', {
        fullName: profile.fullName,
        bio: profile.bio,
      }, {
        withCredentials: true,
      });
      
      showSnackbarMessage('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      showSnackbarMessage('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      showSnackbarMessage('New passwords do not match', 'error');
      return;
    }
    
    if (security.newPassword.length < 8) {
      showSnackbarMessage('Password must be at least 8 characters', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      await axios.put('/api/user/change-password', {
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      }, {
        withCredentials: true,
      });
      
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      showSnackbarMessage('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      showSnackbarMessage('Failed to update password. Check your current password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      
      await axios.put('/api/user/notification-settings', notifications, {
        withCredentials: true,
      });
      
      showSnackbarMessage('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      showSnackbarMessage('Failed to update notification settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystemSettings = async () => {
    // For safety, show confirmation dialog before enabling maintenance mode
    if (systemSettings.maintenanceMode) {
      setConfirmDialog(true);
      return;
    }
    
    // If we're disabling maintenance mode, proceed without confirmation
    saveSystemSettings();
  };
  
  const saveSystemSettings = async () => {
    try {
      setLoading(true);
      setConfirmDialog(false);
      
      // Update maintenance mode
      const maintenanceChanged = 
        systemSettings.maintenanceMode !== maintenanceStatus.isActive ||
        systemSettings.maintenanceMessage !== maintenanceStatus.message ||
        systemSettings.maintenanceTime !== maintenanceStatus.estimatedTime;
      
      if (maintenanceChanged) {
        const response = await axios.post('/api/admin/set-maintenance-mode', {
          enabled: systemSettings.maintenanceMode,
          message: systemSettings.maintenanceMessage || 'We are currently performing scheduled maintenance. Please check back soon.',
          estimatedTime: systemSettings.maintenanceTime || ''
        }, {
          withCredentials: true
        });
        
        // Update the local state with the response
        if (response.data) {
          setMaintenanceStatus({
            isActive: response.data.isInMaintenanceMode,
            message: response.data.message,
            estimatedTime: response.data.estimatedTime,
            lastUpdated: new Date()
          });
        }
      }
      
      // Here you would update other system settings
      // For now, just show a success message
      
      showSnackbarMessage('System settings updated successfully');
    } catch (error) {
      console.error('Error updating system settings:', error);
      showSnackbarMessage('Failed to update system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.email) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4} color="text.primary">
        Settings
      </Typography>

      {/* Tabs for different settings categories */}
      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: primaryColor,
              },
              '& .MuiTab-root': {
                color: theme.palette.text.secondary,
                '&.Mui-selected': {
                  color: primaryColor,
                },
              },
              borderBottom: '1px solid',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
            }}
          >
            <Tab 
              label="Profile" 
              icon={<PersonIcon />} 
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab 
              label="Security" 
              icon={<LockIcon />} 
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab 
              label="Notifications" 
              icon={<NotificationsIcon />} 
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab 
              label="System" 
              icon={<SettingsIcon />} 
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </CardContent>
      </Card>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <SettingsCard
          title="Profile Information"
          icon={<PersonIcon sx={{ color: 'white' }} />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                variant="outlined"
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={profile.email}
                disabled
                variant="outlined"
                margin="normal"
                helperText="Email cannot be changed"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                variant="outlined"
                margin="normal"
                multiline
                rows={4}
                helperText="A brief description about yourself"
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveProfile}
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Profile'}
              </Button>
            </Grid>
          </Grid>
        </SettingsCard>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={1}>
        <SettingsCard
          title="Change Password"
          icon={<LockIcon sx={{ color: 'white' }} />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={security.currentPassword}
                onChange={handleSecurityChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="New Password"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={security.newPassword}
                onChange={handleSecurityChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm New Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={security.confirmPassword}
                onChange={handleSecurityChange}
                variant="outlined"
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={security.newPassword !== security.confirmPassword && security.confirmPassword !== ''}
                helperText={
                  security.newPassword !== security.confirmPassword && security.confirmPassword !== ''
                    ? 'Passwords do not match'
                    : ''
                }
              />
            </Grid>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSavePassword}
                startIcon={<SaveIcon />}
                disabled={loading || security.currentPassword === '' || security.newPassword === '' || security.confirmPassword === ''}
              >
                {loading ? <CircularProgress size={24} /> : 'Update Password'}
              </Button>
            </Grid>
          </Grid>
        </SettingsCard>

        <SettingsCard
          title="Security Settings"
          icon={<SecurityIcon sx={{ color: 'white' }} />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={true}
                    disabled
                    color="primary"
                  />
                }
                label="Two-Factor Authentication"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5 }}>
                Enhanced security is required for admin accounts
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Last login: {new Date().toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </SettingsCard>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={tabValue} index={2}>
        <SettingsCard
          title="Notification Preferences"
          icon={<NotificationsIcon sx={{ color: 'white' }} />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={handleNotificationChange}
                    name="emailNotifications"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5, mb: 2 }}>
                Receive essential notifications via email
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.newUserAlerts}
                    onChange={handleNotificationChange}
                    name="newUserAlerts"
                    color="primary"
                  />
                }
                label="New User Registrations"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5, mb: 2 }}>
                Get notified when new users register
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.brokerApprovalAlerts}
                    onChange={handleNotificationChange}
                    name="brokerApprovalAlerts"
                    color="primary"
                  />
                }
                label="Broker Approval Requests"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5, mb: 2 }}>
                Alerts for new broker approval requests
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.systemUpdates}
                    onChange={handleNotificationChange}
                    name="systemUpdates"
                    color="primary"
                  />
                }
                label="System Updates"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5, mb: 2 }}>
                Notifications about system maintenance and updates
              </Typography>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveNotifications}
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
              </Button>
            </Grid>
          </Grid>
        </SettingsCard>
      </TabPanel>

      {/* System Tab */}
      <TabPanel value={tabValue} index={3}>
        <SettingsCard
          title="System Settings"
          icon={<SettingsIcon sx={{ color: 'white' }} />}
        >
          <Alert severity="info" sx={{ mb: 3 }}>
            These settings affect the entire application. Please use caution when making changes.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.autoApproveListings}
                    onChange={handleSystemSettingChange}
                    name="autoApproveListings"
                    color="primary"
                  />
                }
                label="Auto-Approve New Listings"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5, mb: 2 }}>
                Automatically approve all new property listings
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.darkModeDefault}
                    onChange={handleSystemSettingChange}
                    name="darkModeDefault"
                    color="primary"
                  />
                }
                label="Default to Dark Mode"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5, mb: 2 }}>
                Set dark mode as the default theme for all users
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onChange={handleSystemSettingChange}
                    name="maintenanceMode"
                    color="error"
                  />
                }
                label="Maintenance Mode"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 0.5, mb: 2 }}>
                Put the site in maintenance mode (only admins can access)
              </Typography>
            </Grid>
            
            {/* Only show these fields if maintenance mode is being enabled */}
            {systemSettings.maintenanceMode && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Maintenance Message"
                    name="maintenanceMessage"
                    value={systemSettings.maintenanceMessage}
                    onChange={handleSystemSettingChange}
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={2}
                    placeholder="We are currently performing scheduled maintenance. Please check back soon."
                    helperText="Message to display to users during maintenance"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Estimated Completion Time"
                    name="maintenanceTime"
                    value={systemSettings.maintenanceTime}
                    onChange={handleSystemSettingChange}
                    variant="outlined"
                    margin="normal"
                    placeholder="April 14, 2025 at 3:00 PM EST"
                    helperText="When maintenance is expected to be completed (optional)"
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Default Currency</Typography>
                <Select
                  value={systemSettings.defaultCurrency}
                  onChange={handleSystemSettingChange}
                  name="defaultCurrency"
                >
                  <MenuItem value="USD">US Dollar (USD)</MenuItem>
                  <MenuItem value="EUR">Euro (EUR)</MenuItem>
                  <MenuItem value="GBP">British Pound (GBP)</MenuItem>
                  <MenuItem value="CAD">Canadian Dollar (CAD)</MenuItem>
                  <MenuItem value="AUD">Australian Dollar (AUD)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Default Language</Typography>
                <Select
                  value={systemSettings.defaultLanguage}
                  onChange={handleSystemSettingChange}
                  name="defaultLanguage"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {maintenanceStatus.isActive && (
              <Grid item xs={12}>
                <Alert 
                  severity="warning" 
                  sx={{ my: 2 }}
                  action={
                    <Button 
                      color="inherit" 
                      size="small"
                      onClick={() => fetchMaintenanceStatus()}
                    >
                      Refresh
                    </Button>
                  }
                >
                  <Typography variant="subtitle2">
                    Maintenance mode is currently active
                  </Typography>
                  <Typography variant="body2">
                    Only administrators can access the site.
                    {maintenanceStatus.lastUpdated && (
                      ` Last updated: ${new Date(maintenanceStatus.lastUpdated).toLocaleString()}`
                    )}
                  </Typography>
                </Alert>
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveSystemSettings}
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save System Settings'}
              </Button>
            </Grid>
          </Grid>
        </SettingsCard>

        <SettingsCard
          title="Database Management"
          icon={<StorageIcon sx={{ color: 'white' }} />}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Backup Database
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="warning"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Run Database Maintenance
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Clear Cached Data
              </Button>
            </Grid>
          </Grid>
        </SettingsCard>
      </TabPanel>

      {/* Confirm Dialog for Maintenance Mode */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          <Typography variant="h6" color="error.main" fontWeight="bold">
            Enable Maintenance Mode?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will make the site inaccessible to all non-admin users!
          </Alert>
          <Typography variant="body1">
            Enabling maintenance mode will log out all current users and display a maintenance message.
            Only administrators will be able to access the site until maintenance mode is disabled.
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Maintenance Message"
              name="maintenanceMessage"
              value={systemSettings.maintenanceMessage}
              onChange={handleSystemSettingChange}
              variant="outlined"
              margin="normal"
              multiline
              rows={2}
              placeholder="We are currently performing scheduled maintenance. Please check back soon."
            />
            
            <TextField
              fullWidth
              label="Estimated Completion Time"
              name="maintenanceTime"
              value={systemSettings.maintenanceTime}
              onChange={handleSystemSettingChange}
              variant="outlined"
              margin="normal"
              placeholder="April 14, 2025 at 3:00 PM EST"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={saveSystemSettings} variant="contained" color="error">
            Enable Maintenance Mode
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Import when StorageIcon is used
const StorageIcon = (props) => {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      {...props}
    >
      <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z"></path>
    </svg>
  );
};

export default AdminSettings;