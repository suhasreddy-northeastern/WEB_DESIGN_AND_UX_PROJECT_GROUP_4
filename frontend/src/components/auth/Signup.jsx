import React, { useState } from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton,
  Link
} from "@mui/material";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import GoogleLoginButton from "../common/buttons/GoogleLoginButton";
import SuccessModal from "../common/modal/SuccessModal";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AnimatedBackground from '../common/theme/AnimatedBackground';

const Signup = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    type: "user",
  });
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Check password match when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password' && form.confirmPassword && value !== form.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else if (name === 'confirmPassword' && value && value !== form.password) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else if (name === 'confirmPassword' && value && value === form.password) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // Confirm password validation
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Full name validation
    if (form.fullName.trim().length < 2) {
      newErrors.fullName = "Full name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    // If the user is registering as a broker, redirect to the broker registration page
    if (form.type === "broker") {
      console.log("Redirecting to broker registration...");
      navigate("/broker/register", { 
        state: {
          email: form.email,
          fullName: form.fullName,
          password: form.password
        }
      });
      return;
    }
    
    // Continue with regular user registration
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...formDataToSend } = form;
      await axios.post("http://localhost:4000/api/user/create", formDataToSend);
      setModalOpen(true);
      setTimeout(() => {
        setModalOpen(false);
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error?.includes('email')) {
        setErrors(prev => ({ ...prev, email: err.response.data.error }));
      } else {
        setErrors(prev => ({ ...prev, general: err.response?.data?.error || "Signup failed" }));
      }
    }
  };
  
  return (
    <>
    {/* Animated Background */}
    <AnimatedBackground />
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <SuccessModal
        open={modalOpen}
        message="Signup Successful"
        subtext="Redirecting to login..."
      />

      <Paper elevation={4} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Grid container>
          {/* Image Section */}
          <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
            <Box
              sx={{
                height: "100%",
                backgroundColor: "#f5f7fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              <img
                src="/images/signup.svg"
                alt="Signup Illustration"
                style={{ width: "100%", maxHeight: 400, objectFit: "contain" }}
              />
            </Box>
          </Grid>

          {/* Signup Form Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 5 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom align="center">
                Create Account
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" mb={3}>
                Join us by filling the details below
              </Typography>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    label="Full Name"
                    name="fullName"
                    variant="outlined"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    variant="outlined"
                    value={form.email}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={form.password}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password || "Password must be at least 8 characters"}
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
                  <TextField
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    variant="outlined"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    select
                    label="Account Type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    fullWidth
                    helperText={form.type === "broker" ? "Broker accounts require additional verification" : ""}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="broker">Broker</MenuItem>
                  </TextField>

                  {errors.general && (
                    <Typography color="error" variant="body2">
                      {errors.general}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "bold",
                      py: 1.5,
                      fontSize: "1rem",
                      backgroundColor: "#00b386",
                      "&:hover": {
                        backgroundColor: "#009973",
                      },
                    }}
                  >
                    {form.type === "broker" ? "Continue to Broker Verification" : "Sign Up"}
                  </Button>
                  <GoogleLoginButton onClick={() => alert("Google Login Coming Soon!")} />
                  
                  {/* Added Login Link */}
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link component={RouterLink} to="/login" sx={{ color: '#00b386', fontWeight: 'medium' }}>
                        Log in
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

export default Signup;