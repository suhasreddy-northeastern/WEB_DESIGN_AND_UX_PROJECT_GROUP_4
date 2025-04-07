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
  IconButton
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoogleLoginButton from "../common/buttons/GoogleLoginButton";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:4000/api/user/login', { email, password }, { withCredentials: true });
      const user = res.data.user;
  
      dispatch(loginSuccess(user));
      navigate('/'); // 👈 send all users to home
    } catch (err) {
      setError('Invalid email or password');
      console.error(err);
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Paper elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Grid container>
          {/* Image Section */}
          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                height: '100%',
                backgroundColor: '#f5f7fa',
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
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
                    Login
                  </Button>
                  <GoogleLoginButton onClick={() => alert("Google Login Coming Soon!")} />
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Login;