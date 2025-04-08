import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  useTheme,
  Divider,
  CircularProgress,
  List,
  ListItem,
  Card,
  CardContent,
  Alert,
  Snackbar,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TuneIcon from '@mui/icons-material/Tune';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import dayjs from 'dayjs';
import { updateUser } from '../../redux/userSlice'; 
import relativeTime from 'dayjs/plugin/relativeTime';
import { checkSession } from '../../redux/sessionActions'; // Adjust path as needed

dayjs.extend(relativeTime);

const StatCard = ({ icon, count, label, backgroundColor }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Card
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: isDarkMode 
            ? '0 8px 24px rgba(0, 0, 0, 0.3)'
            : '0 8px 24px rgba(35, 206, 163, 0.15)',
        },
      }}
    >
      <Box
        sx={{
          backgroundColor,
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" fontWeight="bold" mb={0.5}>
        {count}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Card>
  );
};

const BrokerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    newInquiries: 0,
    pendingApprovals: 0,
  });
  const [inquiries, setInquiries] = useState([]);
  const [listingPerformance, setListingPerformance] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;
  
  const isApproved = user?.isApproved;

  // Function to refresh approval status
// Function to refresh approval status
const refreshApprovalStatus = async () => {
  setRefreshingStatus(true);
  try {
    // Get updated user data directly from the API
    const response = await axios.get('/api/broker/me', {
      withCredentials: true,
    });
    
    // Update Redux store with the fresh data
    dispatch(updateUser(response.data));
    
    setSnackbarMessage("Status updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  } catch (error) {
    console.error("Error refreshing status:", error);
    setSnackbarMessage("Failed to refresh status");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
    setRefreshingStatus(false);
  }
};

  useEffect(() => {
    const fetchBrokerData = async () => {
      if (!user || user.type !== 'broker') {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // If broker is not approved, don't make API calls
        if (!isApproved) {
          setLoading(false);
          return;
        }
        
        // Get broker stats
        const statsRes = await axios.get('/api/broker/stats', {
          withCredentials: true,
        });
        
        // Get recent inquiries
        const inquiriesRes = await axios.get('/api/broker/inquiries', {
          withCredentials: true,
        });
        
        // Get listing performance
        const performanceRes = await axios.get('/api/broker/listing-performance', {
          withCredentials: true,
        });
        
        setStats(statsRes.data);
        setInquiries(inquiriesRes.data.inquiries || []);
        setListingPerformance(performanceRes.data.listings || []);
      } catch (error) {
        console.error('Error fetching broker data:', error);
        
        if (error.response && error.response.status === 403) {
          setError("You need admin approval before accessing the broker dashboard");
          setSnackbarOpen(true);
        } else {
          setError("Failed to load dashboard data. Please try again later.");
          setSnackbarOpen(true);
          
          // Use mock data for demonstration if API fails
          setStats({
            totalListings: 0,
            activeListings: 0,
            newInquiries: 0,
            pendingApprovals: 0,
          });
          
          setInquiries([]);
          setListingPerformance([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBrokerData();

    // Set up periodic refresh of session data (every minute)
    const intervalId = setInterval(() => {
      dispatch(checkSession());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user, navigate, isApproved, dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  // If broker is not approved, show pending approval message
  if (!isApproved) {
    return (
      <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto', textAlign: 'center' }}>
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
        
        <Card
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 64, color: theme.palette.warning.main, mb: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" mb={2} color="text.primary">
            Approval Pending
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Your broker account is currently pending approval from an administrator.
            Once approved, you'll have full access to all broker features.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This typically takes 1-2 business days. You'll receive an email notification once your account is approved.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              component={Link}
              to="/broker/profile"
              variant="outlined"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.2,
                borderColor: primaryColor,
                color: primaryColor,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.1)' : 'rgba(35, 206, 163, 0.05)',
                }
              }}
            >
              View Profile
            </Button>
            
            <Button
              onClick={refreshApprovalStatus}
              variant="contained"
              disabled={refreshingStatus}
              startIcon={refreshingStatus ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.2,
                bgcolor: primaryColor,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                }
              }}
            >
              {refreshingStatus ? 'Checking...' : 'Check Approval Status'}
            </Button>
          </Box>
        </Card>
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
          {snackbarSeverity === "error" ? error : snackbarMessage}
        </Alert>
      </Snackbar>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            Broker Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <VerifiedIcon sx={{ color: primaryColor, mr: 1, fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">
              Approved Broker Account
            </Typography>
          </Box>
        </Box>
        <Button
          component={Link}
          to="/broker/add-listing"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.2,
            bgcolor: primaryColor,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            }
          }}
        >
          Add New Listing
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ListAltIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.totalListings}
            label="Total Listings"
            backgroundColor={primaryColor}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TuneIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.activeListings}
            label="Active Listings"
            backgroundColor="#2ecc71"  // Success color
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.newInquiries}
            label="New Inquiries"
            backgroundColor="#3498db"  // Info color
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccessTimeIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.pendingApprovals}
            label="Pending Approvals"
            backgroundColor="#f9c74f"  // Warning color
          />
        </Grid>
      </Grid>

      {/* Recent Inquiries and Listing Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              height: '100%',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: isDarkMode 
                  ? '0 8px 24px rgba(0, 0, 0, 0.25)'
                  : '0 8px 24px rgba(35, 206, 163, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <div>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Recent Inquiries
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest inquiries from potential tenants
                  </Typography>
                </div>
                <Button
                  component={Link}
                  to="/broker/inquiries"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    color: primaryColor,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline', 
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ p: 0 }}>
                {inquiries.length === 0 ? (
                  <Typography variant="body2" textAlign="center" py={3} color="text.secondary">
                    No inquiries yet
                  </Typography>
                ) : (
                  inquiries.slice(0, 3).map((inquiry) => (
                    <ListItem
                      key={inquiry._id}
                      sx={{
                        py: 2,
                        px: 0,
                        borderBottom: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                          {inquiry.userEmail}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Inquiry for {inquiry.apartmentTitle}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(inquiry.createdAt).format('MM/DD/YYYY')}
                      </Typography>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              height: '100%',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: isDarkMode 
                  ? '0 8px 24px rgba(0, 0, 0, 0.25)'
                  : '0 8px 24px rgba(35, 206, 163, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <div>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Listing Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Views and inquiries for your listings
                  </Typography>
                </div>
                <Button
                  component={Link}
                  to="/broker/listings"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    color: primaryColor,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline', 
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ p: 0 }}>
                {listingPerformance.length === 0 ? (
                  <Typography variant="body2" textAlign="center" py={3} color="text.secondary">
                    No listings yet
                  </Typography>
                ) : (
                  listingPerformance.slice(0, 3).map((listing) => (
                    <ListItem
                      key={listing._id}
                      sx={{
                        py: 2,
                        px: 0,
                        borderBottom: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                          {listing.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {listing.views} views, {listing.inquiries} inquiries
                        </Typography>
                      </Box>
                      <Button
                        component={Link}
                        to={`/broker/listings/${listing._id}`}
                        sx={{
                          color: primaryColor,
                          '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        View
                      </Button>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrokerDashboard;