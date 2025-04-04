import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  ThemeProvider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import theme from "../components/common/theme/theme"; 

const Home = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const username = user?.fullName || user?.name || "User";

  // State for login dialog
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLatestPreference = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/user/preferences/latest", {
        withCredentials: true,
      });
      
      const prefId = res.data.preference?._id;
      if (prefId) {
        navigate(`/matches/${prefId}`);
      } else {
        // No preferences found, redirect to create one
        navigate('/preferences');
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
      if (err.response?.status === 404) {
        // No preferences found, redirect to create one
        navigate('/preferences');
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle button clicks for non-logged in users
  const handleActionClick = (action) => {
    if (!user) {
      setPendingAction(action);
      setLoginDialogOpen(true);
    } else {
      // User is logged in, proceed directly
      if (action === 'recommendations') {
        fetchLatestPreference();
      } else if (action === 'preferences') {
        navigate('/preferences');
      }
    }
  };

  // Handle login dialog actions
  const handleLogin = () => {
    setLoginDialogOpen(false);
    navigate('/login', { 
      state: { 
        from: '/', 
        pendingAction: pendingAction 
      } 
    });
  };

  const handleCloseDialog = () => {
    setLoginDialogOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        {/* Header - Only show when user is logged in */}
        {user && (
          <Box 
            sx={{ 
              textAlign: "center", 
              mb: 6, 
              px: { xs: 2, sm: 0 },
              p: 4,
              borderRadius: 3,
              backgroundColor: 'rgba(0, 179, 134, 0.05)',
              border: '1px solid rgba(0, 179, 134, 0.2)',
            }}
          >
            <Typography variant="h4" fontWeight={600}>
              Welcome, {username}!
            </Typography>
          </Box>
        )}

        {/* Apartment Section */}
        <Typography 
          variant="h5" 
          fontWeight={600} 
          mb={3}
          sx={{ 
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            '&:after': {
              content: '""',
              display: 'block',
              height: '3px',
              flexGrow: 1,
              marginLeft: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, rgba(0, 179, 134, 0.1) 100%)`,
              borderRadius: 4
            }
          }}
        >
          🔎 Find Your Perfect Apartment
        </Typography>

        <Grid container spacing={4}>
          {/* Explore Listings */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                borderRadius: 3, 
                p: 2, 
                height: "100%",
                border: '1px solid rgba(0, 179, 134, 0.1)',
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: '0 10px 20px rgba(0, 179, 134, 0.12)',
                  borderColor: '#00b386',
                },
              }}
            >
              <CardMedia
                component="img"
                image="/images/explore.svg"
                alt="Explore Listings"
                sx={{ height: 180, objectFit: "contain", mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Explore Apartments
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Browse available apartments and discover what fits your lifestyle.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleActionClick('recommendations')}
                  fullWidth
                  disabled={loading}
                  sx={{ 
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "View Recommendations"}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Conditional Card */}
          {user?.type === "broker" ? (
            // Broker-only: List Property
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  p: 2, 
                  height: "100%",
                  border: '1px solid rgba(0, 179, 134, 0.1)',
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: '0 10px 20px rgba(0, 179, 134, 0.12)',
                    borderColor: '#00b386',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image="/images/list.svg"
                  alt="List Property"
                  sx={{ height: 180, objectFit: "contain", mb: 2 }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    List a Property
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Are you a broker? List apartments and connect with renters easily.
                  </Typography>
                  <Button
                    variant="outlined"
                    component={Link}
                    to="/list-apartment"
                    fullWidth
                    color="primary"
                  >
                    List Apartment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            // Normal user: Submit Preferences - show for both logged in users and guests
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  p: 2, 
                  height: "100%",
                  border: '1px solid rgba(0, 179, 134, 0.1)',
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: '0 10px 20px rgba(0, 179, 134, 0.12)',
                    borderColor: '#00b386',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image="/images/preference.svg"
                  alt="Submit Preferences"
                  sx={{ height: 180, objectFit: "contain", mb: 2 }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Set Your Preferences
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Let us know what you're looking for and get matched with the best options.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => handleActionClick('preferences')}
                    fullWidth
                    color="primary"
                    disabled={loading}
                  >
                    Submit Preferences
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Contact */}
          <Grid item xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                borderRadius: 3, 
                p: 2, 
                height: "100%",
                border: '1px solid rgba(0, 179, 134, 0.1)',
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: '0 10px 20px rgba(0, 179, 134, 0.12)',
                  borderColor: '#00b386',
                },
              }}
            >
              <CardMedia
                component="img"
                image="/images/contact.svg"
                alt="Contact Us"
                sx={{ height: 180, objectFit: "contain", mb: 2 }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Need Help?
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Get in touch with our team for any support or guidance.
                </Typography>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/contact"
                  fullWidth
                  color="primary"
                >
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Login Dialog */}
        <Dialog open={loginDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>
            Login Required
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {pendingAction === 'recommendations' 
                ? 'You need to be logged in to view apartment recommendations.'
                : 'You need to be logged in to submit your apartment preferences.'}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleLogin} 
              variant="contained"
              sx={{ 
                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              }}
            >
              Login Now
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default Home;