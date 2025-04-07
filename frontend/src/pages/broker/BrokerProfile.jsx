import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  useTheme,
  Chip,
} from '@mui/material';
import { useSelector } from 'react-redux';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import axios from 'axios';

const BrokerProfile = () => {
  const user = useSelector((state) => state.user.user);
  const [isApproved, setIsApproved] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseDocumentUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("/api/broker/me", {
          withCredentials: true,
        });
  
        setProfile({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || '',
          licenseNumber: data.licenseNumber || '',
          licenseDocumentUrl: data.licenseDocumentUrl || '',
        });
  
        setIsApproved(data.isApproved); // 👈 store approval state separately
  
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage({
          type: "error",
          text: "Failed to load profile data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      // Only include fields that can be updated
      const updateData = {
        fullName: profile.fullName,
        phone: profile.phone,
        // Don't include email, password, or other restricted fields
      };

      await axios.put('/api/broker/profile', updateData, {
        withCredentials: true,
      });

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4} color="text.primary">
        Broker Profile
      </Typography>

      {isApproved ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            bgcolor: isDarkMode ? 'rgba(35, 206, 163, 0.1)' : 'rgba(35, 206, 163, 0.05)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(35, 206, 163, 0.2)' : 'rgba(35, 206, 163, 0.1)',
            borderRadius: 2,
          }}
        >
          <VerifiedIcon sx={{ color: primaryColor, mr: 2 }} />
          <Typography variant="body1" color="text.primary">
            Your broker account is approved. You can create and manage property listings.
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            bgcolor: isDarkMode ? 'rgba(249, 199, 79, 0.1)' : 'rgba(249, 199, 79, 0.05)',
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(249, 199, 79, 0.2)' : 'rgba(249, 199, 79, 0.1)',
            borderRadius: 2,
          }}
        >
          <ErrorOutlineIcon sx={{ color: theme.palette.warning.main, mr: 2 }} />
          <Typography variant="body1" color="text.primary">
            Your broker account is pending approval. You'll be notified once an administrator reviews your application.
          </Typography>
        </Paper>
      )}

      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Avatar
                src={user?.imagePath || null}
                alt={profile.fullName}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  backgroundColor: primaryColor,
                }}
              >
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'B'}
              </Avatar>

              <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                {profile.fullName}
              </Typography>

              <Chip
                icon={isApproved ? <VerifiedIcon /> : <ErrorOutlineIcon />}
                label={isApproved ? 'Approved Broker' : 'Pending Approval'}
                color={isApproved ? 'success' : 'warning'}                
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
                  {profile.fullName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, mt: 2 }}>
                  <PhoneIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                </Box>
                <Typography variant="body1" gutterBottom fontWeight="medium" color="text.primary">
                  {profile.phone || 'Not provided'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, mt: 2 }}>
                  <BadgeIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    License Number
                  </Typography>
                </Box>
                <Typography variant="body1" gutterBottom fontWeight="medium" color="text.primary">
                  {profile.licenseNumber || 'Not provided'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                Edit Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Update your profile information below
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Full Name"
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleChange}
                      fullWidth
                      required
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
                      value={profile.email}
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
                      label="Phone Number"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., +1 (555) 123-4567"
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
                      label="License Number"
                      name="licenseNumber"
                      value={profile.licenseNumber}
                      fullWidth
                      disabled
                      variant="outlined"
                      helperText="License number cannot be changed"
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
                    <Box sx={{ mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={updating}
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
                        {updating ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrokerProfile;