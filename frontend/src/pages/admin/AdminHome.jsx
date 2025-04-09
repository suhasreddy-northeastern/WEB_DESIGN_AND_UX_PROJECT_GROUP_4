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
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

const AdminHome = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme.palette.mode === 'dark';
  const [stats, setStats] = useState({
    users: 0,
    brokers: 0,
    properties: 0,
    pendingBrokers: 0,
  });
  const [recentBrokers, setRecentBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Mock data for demonstration
        // In a real app, you would fetch this from your API
        setStats({
          users: 487,
          brokers: 64,
          properties: 238,
          pendingBrokers: 12,
        });

        setRecentBrokers([
          {
            _id: '1',
            fullName: 'Michael Davis',
            email: 'michael.davis@example.com',
            licenseNumber: 'BRK-54321',
            isApproved: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '2',
            fullName: 'Emily Wilson',
            email: 'emily.wilson@example.com',
            licenseNumber: 'BRK-09876',
            isApproved: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '3',
            fullName: 'Robert Johnson',
            email: 'robert.johnson@example.com',
            licenseNumber: 'BRK-13579',
            isApproved: false,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

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
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to the HomeFit admin portal. Manage users, brokers, and properties.
          </Typography>
        </Box>

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
                  to="/admin/properties" 
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
                    to="/admin/properties"
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
                    to="/admin/dashboard"
                    startIcon={<DashboardIcon />}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      justifyContent: 'flex-start',
                    }}
                  >
                    Full Dashboard
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