import React, { useState } from 'react';
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import GoogleLoginButton from "../common/buttons/GoogleLoginButton";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Fixed Background Animation Component using inline styles instead of Tailwind classes
const AnimatedBackground = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -10,
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          backgroundColor: 'rgba(20, 184, 166, 0.2)', // teal-400 with opacity
          animation: 'floatSlow 20s infinite ease-in-out'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: '75%',
          right: '25%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          backgroundColor: 'rgba(134, 239, 172, 0.2)', // green-300 with opacity
          animation: 'floatMedium 15s infinite ease-in-out'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '25%',
          left: '33%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.1)', // emerald-500 with opacity
          animation: 'floatFast 12s infinite ease-in-out'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          top: '33%',
          right: '33%',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: 'rgba(20, 184, 166, 0.15)', // teal-500 with opacity
          animation: 'floatReverse 18s infinite ease-in-out'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '33%',
          right: '16%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          backgroundColor: 'rgba(74, 222, 128, 0.2)', // green-400 with opacity
          animation: 'floatSlowReverse 25s infinite ease-in-out'
        }}
      />

      {/* Inline styles for keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatSlow {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        @keyframes floatMedium {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 25px) scale(1.08); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        @keyframes floatFast {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 15px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        @keyframes floatReverse {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, -15px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        @keyframes floatSlowReverse {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-15px, 30px) scale(1.03); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}} />
    </div>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Helper function to load complete user profile
  const fetchCompleteUserProfile = async () => {
    try {
      // This is the same API call that UserProfile uses to refresh data
      const sessionRes = await axios.get('http://localhost:4000/api/user/session', {
        withCredentials: true
      });
      
      if (sessionRes.data && sessionRes.data.user) {
        // This ensures we have the complete, properly formatted user data
        dispatch(loginSuccess(sessionRes.data.user));
        console.log('Complete user profile loaded successfully');
        return sessionRes.data.user;
      }
      return null;
    } catch (error) {
      console.error('Error fetching complete user profile:', error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Regular login API call
      const res = await axios.post('http://localhost:4000/api/user/login', 
        { email, password }, 
        { withCredentials: true }
      );
      
      const userData = res.data.user;

      // If the user is a broker, fetch additional broker data with approval status
      if (userData && userData.type === 'broker') {
        try {
          // Make an additional API call to get broker-specific data
          const brokerRes = await axios.get('http://localhost:4000/api/broker/me', {
            withCredentials: true
          });
          
          // Combine the broker data with the user data
          const updatedUserData = {
            ...userData,
            ...brokerRes.data // This should include the isApproved status
          };
          
          // Initial dispatch with broker data
          dispatch(loginSuccess(updatedUserData));
          
          console.log('Broker login successful with approval status:', updatedUserData.isApproved);
        } catch (brokerErr) {
          console.error('Error fetching broker data:', brokerErr);
          // Still login with basic user data if broker data fetch fails
          dispatch(loginSuccess(userData));
        }
      } else {
        // For non-broker users, just dispatch the regular user data
        dispatch(loginSuccess(userData));
      }
      
      // IMPORTANT: Now fetch complete user profile to ensure all data is loaded properly
      await fetchCompleteUserProfile();
      
      // Navigate to home page or appropriate dashboard
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      {/* Animated Background */}
      <AnimatedBackground />
      
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <Paper elevation={4} sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          backdropFilter: 'blur(4px)',
          background: 'rgba(255, 255, 255, 0.9)', // Slightly transparent paper
        }}>
          <Grid container>
            {/* Image Section */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  height: '100%',
                  backgroundColor: 'rgba(245, 247, 250, 0.8)', // Slightly transparent background
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                }}
              >
                <img
                  src="/images/login.svg"
                  alt="Login Illustration"
                  style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                />
              </Box>
            </Grid>

            {/* Login Form Section */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 5 }}>
                <Typography variant="h5" fontWeight="600" gutterBottom align="center">
                  Welcome Back
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary" mb={3}>
                  Please login to your account
                </Typography>
                <form onSubmit={handleLogin}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="Email"
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      fullWidth
                      type="email"
                      sx={{ borderRadius: 2 }}
                      disabled={loading}
                    />
                    <TextField
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      fullWidth
                      sx={{ borderRadius: 2 }}
                      disabled={loading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                              disabled={loading}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {error && (
                      <Typography color="error" variant="body2">
                        {error}
                      </Typography>
                    )}
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        py: 1.5,
                        fontSize: '1rem',
                        backgroundColor: '#00b386',
                        '&:hover': {
                          backgroundColor: '#009973',
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Login'
                      )}
                    </Button>
                    <GoogleLoginButton onClick={() => alert("Google Login Coming Soon!")} disabled={loading} />
                    
                    {/* Added Sign Up Link */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Don't have an account?{' '}
                        <Link component={RouterLink} to="/signup" sx={{ color: '#00b386', fontWeight: 'medium' }}>
                          Sign up
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                </form>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default Login;