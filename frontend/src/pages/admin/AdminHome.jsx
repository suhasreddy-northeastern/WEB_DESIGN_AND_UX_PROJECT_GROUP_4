import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  useTheme,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { useSelector } from "react-redux";

const AdminHome = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme.palette.mode === 'dark';
  const user = useSelector((state) => state.user.user);
  
  const [stats, setStats] = useState({
    users: 0,
    brokers: 0,
    properties: 0,
    pendingBrokers: 0,
  });
  const [recentBrokers, setRecentBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (!user || user.type !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch users
        const usersRes = await axios.get('/api/admin/users', {
          withCredentials: true,
        });
        
        // Fetch all brokers
        const brokersRes = await axios.get('/api/admin/brokers', {
          withCredentials: true,
        });
        
        // Fetch pending brokers
        const pendingBrokersRes = await axios.get('/api/admin/pending-brokers', {
          withCredentials: true,
        });
        
        // Fetch properties (apartments)
        const propertiesRes = await axios.get('/api/apartments', {
          withCredentials: true,
        });
        
        // Set states with real data
        setStats({
          users: usersRes.data.length || 0,
          brokers: brokersRes.data.length || 0,
          properties: propertiesRes.data.length || 0,
          pendingBrokers: pendingBrokersRes.data.length || 0,
        });
        
        // Get most recent pending brokers (up to 3)
        const sortedPendingBrokers = pendingBrokersRes.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
          
        setRecentBrokers(sortedPendingBrokers);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin data. Please try again later.');
        showSnackbar('Failed to load admin data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, navigate]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleApproveBroker = async (brokerId) => {
    try {
      await axios.post(`/api/admin/approve-broker/${brokerId}`, {}, {
        withCredentials: true,
      });
      
      // Update the recentBrokers list by removing the approved broker
      setRecentBrokers(recentBrokers.filter(broker => broker._id !== brokerId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingBrokers: prev.pendingBrokers - 1,
        brokers: prev.brokers + 1,
      }));
      
      showSnackbar('Broker approved successfully');
    } catch (error) {
      console.error('Error approving broker:', error);
      showSnackbar('Failed to approve broker', 'error');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
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
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to the HomeFit admin portal. Manage users, brokers, and properties.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Users Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Users
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.users}
                </Typography>
                <Button 
                  component={Link} 
                  to="/admin/users" 
                  variant="text" 
                  size="small"
                  color="primary"
                >
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Brokers Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.light', color: 'info.contrastText', mr: 2 }}>
                    <VerifiedUserIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Brokers
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.brokers}
                </Typography>
                <Button 
                  component={Link} 
                  to="/admin/brokers" 
                  variant="text" 
                  size="small"
                  color="primary"
                >
                  Manage Brokers
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Properties Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                height: '100%',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.light', color: 'success.contrastText', mr: 2 }}>
                    <ApartmentIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Properties
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.properties}
                </Typography>
                <Button 
                  component={Link} 
                  to="/admin/listings" 
                  variant="text" 
                  size="small"
                  color="primary"
                >
                  View Properties
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Approvals Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {stats.pendingBrokers > 0 && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '4px', 
                    bgcolor: 'warning.main',
                  }} 
                />
              )}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', mr: 2 }}>
                    <NotificationsActiveIcon />
                  </Avatar>
                  <Typography variant="h6" fontWeight={600}>
                    Pending Approvals
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.pendingBrokers}
                </Typography>
                <Button 
                  component={Link} 
                  to="/admin/brokers?filter=pending" 
                  variant="text" 
                  size="small"
                  color="primary"
                >
                  Review Pending
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Broker Requests */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Recent Broker Requests
              </Typography>
              {recentBrokers.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {recentBrokers.map((broker) => (
                    <React.Fragment key={broker._id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            <PersonIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={broker.fullName}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'block' }}
                              >
                                {broker.email}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                License: {broker.licenseNumber || 'N/A'}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                Submitted: {new Date(broker.createdAt).toLocaleDateString()}
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="View details">
                            <IconButton 
                              edge="end" 
                              onClick={() => navigate(`/admin/brokers/details/${broker._id}`)}
                              sx={{ mr: 1 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Approve">
                            <IconButton 
                              edge="end" 
                              color="success"
                              onClick={() => handleApproveBroker(broker._id)}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No pending broker requests
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  component={Link} 
                  to="/admin/brokers?filter=pending" 
                  size="small"
                  endIcon={<VerifiedUserIcon />}
                >
                  View All Pending
                </Button>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper 
              elevation={2}
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
                border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                height: '100%',
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    component={Link}
                    to="/admin/brokers"
                    startIcon={<VerifiedUserIcon />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                    }}
                  >
                    Manage Brokers
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    size="large"
                    component={Link}
                    to="/admin/users"
                    startIcon={<PersonIcon />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                    }}
                  >
                    View Users
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    size="large"
                    component={Link}
                    to="/admin/listings"
                    startIcon={<ApartmentIcon />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                    }}
                  >
                    View Properties
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    size="large"
                    component={Link}
                    to="/admin/settings"
                    startIcon={<DashboardIcon />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                    }}
                  >
                    Admin Settings
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminHome;