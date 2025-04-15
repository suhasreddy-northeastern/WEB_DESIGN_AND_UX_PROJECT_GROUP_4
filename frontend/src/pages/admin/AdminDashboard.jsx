import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  TextField,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

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

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBrokers: 0,
    pendingBrokers: 0,
    totalListings: 0,
  });
  const [pendingBrokers, setPendingBrokers] = useState([]);
  const [allBrokers, setAllBrokers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchText, setSearchText] = useState('');
  
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user || user.type !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Get pending broker requests
        const pendingBrokersRes = await axios.get('/api/admin/pending-brokers', {
          withCredentials: true,
        });
        setPendingBrokers(pendingBrokersRes.data || []);
        
        // Get all brokers
        const allBrokersRes = await axios.get('/api/admin/brokers', {
          withCredentials: true,
        });
        setAllBrokers(allBrokersRes.data || []);
        
        // Get all users
        const allUsersRes = await axios.get('/api/admin/users', {
          withCredentials: true,
        });
        setAllUsers(allUsersRes.data || []);
        
        // Get all listings
        const listingsRes = await axios.get('/api/apartments', {
          withCredentials: true,
        });
        setListings(listingsRes.data || []);
        
        // Update stats with real data
        setStats({
          totalUsers: allUsersRes.data.length,
          totalBrokers: allBrokersRes.data.filter(broker => broker.isApproved).length,
          pendingBrokers: pendingBrokersRes.data.length,
          totalListings: listingsRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Use empty data on error
        setPendingBrokers([]);
        setAllBrokers([]);
        setAllUsers([]);
        setListings([]);
        setStats({
          totalUsers: 0,
          totalBrokers: 0,
          pendingBrokers: 0,
          totalListings: 0,
        });
        
        showSnackbar('Failed to load dashboard data', 'error');
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (broker) => {
    setSelectedBroker(broker);
    setDetailsOpen(true);
  };

  const handleApproveBroker = async (brokerId) => {
    try {
      await axios.post(`/api/admin/approve-broker/${brokerId}`, {}, {
        withCredentials: true,
      });
      
      // Update UI to show broker as approved
      setPendingBrokers(pendingBrokers.filter(broker => broker._id !== brokerId));
      
      // Update all brokers list
      setAllBrokers(prevBrokers => 
        prevBrokers.map(broker => 
          broker._id === brokerId 
            ? { ...broker, isApproved: true } 
            : broker
        )
      );
      
      setStats(prev => ({
        ...prev,
        pendingBrokers: prev.pendingBrokers - 1,
        totalBrokers: prev.totalBrokers + 1,
      }));
      
      showSnackbar('Broker approved successfully');
      
      // Close details dialog if open
      if (detailsOpen && selectedBroker?._id === brokerId) {
        setDetailsOpen(false);
      }
    } catch (error) {
      console.error('Error approving broker:', error);
      showSnackbar('Failed to approve broker', 'error');
    }
  };

  const handleRevokeBroker = async (brokerId) => {
    try {
      await axios.post(`/api/admin/revoke-broker/${brokerId}`, {}, {
        withCredentials: true,
      });
      
      // Update the brokers list to reflect the revocation
      setAllBrokers(prevBrokers => 
        prevBrokers.map(broker => 
          broker._id === brokerId 
            ? { ...broker, isApproved: false } 
            : broker
        )
      );
      
      setStats(prev => ({
        ...prev,
        totalBrokers: prev.totalBrokers - 1,
        pendingBrokers: prev.pendingBrokers + 1,
      }));
      
      // If we're in the pending brokers tab, refresh that list
      if (tabValue === 0) {
        const pendingBrokersRes = await axios.get('/api/admin/pending-brokers', {
          withCredentials: true,
        });
        setPendingBrokers(pendingBrokersRes.data || []);
      }
      
      showSnackbar('Broker approval revoked successfully');
    } catch (error) {
      console.error('Error revoking broker approval:', error);
      showSnackbar('Failed to revoke broker approval', 'error');
    }
  };

  // Filter pending brokers based on search text
  const filteredBrokers = pendingBrokers.filter(broker => 
    broker.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    broker.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    (broker.licenseNumber && broker.licenseNumber.toLowerCase().includes(searchText.toLowerCase()))
  );
  
  // Filter all brokers based on search text
  const filteredAllBrokers = allBrokers.filter(broker => 
    broker.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    broker.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    (broker.licenseNumber && broker.licenseNumber.toLowerCase().includes(searchText.toLowerCase()))
  );
  
  // Filter users based on search text
  const filteredUsers = allUsers.filter(user => 
    user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );
  
  // Filter listings based on search text
  const filteredListings = listings.filter(listing => 
    listing.neighborhood?.toLowerCase().includes(searchText.toLowerCase()) ||
    listing.brokerEmail?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
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
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PersonIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.totalUsers}
            label="Total Users"
            backgroundColor={primaryColor}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<SupervisorAccountIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.totalBrokers}
            label="Active Brokers"
            backgroundColor="#2ecc71"  // Success color
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PersonIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.pendingBrokers}
            label="Pending Approvals"
            backgroundColor="#f9c74f"  // Warning color
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HomeIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.totalListings}
            label="Total Listings"
            backgroundColor="#3498db"  // Info color
          />
        </Grid>
      </Grid>

      {/* Tabs for different admin sections */}
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
            <Tab label="Pending Broker Approvals" />
            <Tab label="All Brokers" />
            <Tab label="Users" />
            <Tab label="Listings" />
          </Tabs>
        </CardContent>
      </Card>

      {/* Pending Broker Approvals Tab */}
      {tabValue === 0 && (
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Broker Approval Requests
              </Typography>
              
              {/* Search box */}
              <Paper
                component="form"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: 300,
                  p: '2px 8px',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 2,
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <TextField
                  size="small"
                  placeholder="Search brokers..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  variant="standard"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                  }}
                />
              </Paper>
            </Box>

            {filteredBrokers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {pendingBrokers.length === 0
                    ? "No pending broker approval requests"
                    : "No brokers match your search criteria"}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>License #</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Submitted</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBrokers.map((broker) => (
                      <TableRow 
                        key={broker._id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.05)' : 'rgba(35, 206, 163, 0.02)',
                          }
                        }}
                      >
                        <TableCell>{broker.fullName}</TableCell>
                        <TableCell>{broker.email}</TableCell>
                        <TableCell>{broker.licenseNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Tooltip title={dayjs(broker.createdAt).format('YYYY-MM-DD HH:mm')}>
                            <span>{dayjs(broker.createdAt).fromNow()}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Pending"
                            size="small"
                            sx={{
                              backgroundColor: isDarkMode ? 'rgba(249, 199, 79, 0.2)' : 'rgba(249, 199, 79, 0.1)',
                              color: theme.palette.warning.main,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(broker)}
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': {
                                    color: primaryColor,
                                  },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleApproveBroker(broker._id)}
                              sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                px: 2,
                              }}
                            >
                              Approve
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Brokers Tab */}
      {tabValue === 1 && (
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                All Brokers
              </Typography>
              
              {/* Search box */}
              <Paper
                component="form"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: 300,
                  p: '2px 8px',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 2,
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <TextField
                  size="small"
                  placeholder="Search brokers..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  variant="standard"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                  }}
                />
              </Paper>
            </Box>

            {filteredAllBrokers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {allBrokers.length === 0
                    ? "No brokers found"
                    : "No brokers match your search criteria"}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>License #</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAllBrokers.map((broker) => (
                      <TableRow 
                        key={broker._id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.05)' : 'rgba(35, 206, 163, 0.02)',
                          }
                        }}
                      >
                        <TableCell>{broker.fullName}</TableCell>
                        <TableCell>{broker.email}</TableCell>
                        <TableCell>{broker.phone || 'N/A'}</TableCell>
                        <TableCell>{broker.licenseNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={broker.isApproved ? "Approved" : "Pending"}
                            size="small"
                            sx={{
                              backgroundColor: broker.isApproved
                                ? (isDarkMode ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)')
                                : (isDarkMode ? 'rgba(249, 199, 79, 0.2)' : 'rgba(249, 199, 79, 0.1)'),
                              color: broker.isApproved
                                ? theme.palette.success.main
                                : theme.palette.warning.main,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewDetails(broker)}
                                sx={{
                                  color: 'text.secondary',
                                  '&:hover': {
                                    color: primaryColor,
                                  },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {broker.isApproved ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleRevokeBroker(broker._id)}
                                sx={{
                                  borderRadius: 1,
                                  textTransform: 'none',
                                  fontSize: '0.8rem',
                                  px: 2,
                                }}
                              >
                                Revoke
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleApproveBroker(broker._id)}
                                sx={{
                                  borderRadius: 1,
                                  textTransform: 'none',
                                  fontSize: '0.8rem',
                                  px: 2,
                                }}
                              >
                                Approve
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Users Tab */}
      {tabValue === 2 && (
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Users
              </Typography>
              
              {/* Search box */}
              <Paper
                component="form"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: 300,
                  p: '2px 8px',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 2,
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <TextField
                  size="small"
                  placeholder="Search users..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  variant="standard"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                  }}
                />
              </Paper>
            </Box>

            {filteredUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {allUsers.length === 0
                    ? "No users found"
                    : "No users match your search criteria"}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Saved Listings</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow 
                        key={user._id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.05)' : 'rgba(35, 206, 163, 0.02)',
                          }
                        }}
                      >
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Tooltip title={user.createdAt ? dayjs(user.createdAt).format('YYYY-MM-DD HH:mm') : 'Unknown'}>
                            <span>{user.createdAt ? dayjs(user.createdAt).fromNow() : 'Unknown'}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{user.savedApartments ? user.savedApartments.length : 0}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {}} // Future feature: view user details
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  color: primaryColor,
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Listings Tab */}
      {tabValue === 3 && (
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                Property Listings
              </Typography>
              
              {/* Search box */}
              <Paper
                component="form"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: 300,
                  p: '2px 8px',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 2,
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <TextField
                  size="small"
                  placeholder="Search listings..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  variant="standard"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                  }}
                />
              </Paper>
            </Box>

            {filteredListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {listings.length === 0
                    ? "No listings found"
                    : "No listings match your search criteria"}
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Property Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Neighborhood</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Bedrooms</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Broker</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredListings.map((listing) => (
                      <TableRow 
                        key={listing._id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.05)' : 'rgba(35, 206, 163, 0.02)',
                          }
                        }}
                      >
                        <TableCell>{listing.type || 'N/A'}</TableCell>
                        <TableCell>{listing.neighborhood || 'N/A'}</TableCell>
                        <TableCell>{listing.bedrooms || 'N/A'}</TableCell>
                        <TableCell>
                          ${typeof listing.price === 'number' 
                            ? listing.price.toLocaleString() 
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{listing.brokerEmail}</TableCell>
                        <TableCell>
                          <Chip
                            label={listing.isActive ? "Active" : "Inactive"}
                            size="small"
                            sx={{
                              backgroundColor: listing.isActive
                                ? (isDarkMode ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)')
                                : (isDarkMode ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)'),
                              color: listing.isActive
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {}} // Future feature: view listing details
                              sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                  color: primaryColor,
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Broker Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          },
        }}
      >
        <DialogTitle>
          Broker Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedBroker && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                <Typography variant="body1" gutterBottom>{selectedBroker.fullName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" gutterBottom>{selectedBroker.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                <Typography variant="body1" gutterBottom>{selectedBroker.phone || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">License Number</Typography>
                <Typography variant="body1" gutterBottom>{selectedBroker.licenseNumber || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                <Typography variant="body1" gutterBottom>{selectedBroker.companyName || 'Not provided'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip
                    label={selectedBroker.isApproved ? "Approved" : "Pending"}
                    size="small"
                    sx={{
                      backgroundColor: selectedBroker.isApproved
                        ? (isDarkMode ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)')
                        : (isDarkMode ? 'rgba(249, 199, 79, 0.2)' : 'rgba(249, 199, 79, 0.1)'),
                      color: selectedBroker.isApproved
                        ? theme.palette.success.main
                        : theme.palette.warning.main,
                      fontWeight: 600,
                    }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Registration Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBroker.createdAt ? dayjs(selectedBroker.createdAt).format('MMMM D, YYYY') : 'Unknown'}
                </Typography>
              </Grid>
              {selectedBroker.bio && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Bio</Typography>
                  <Typography variant="body1" gutterBottom>{selectedBroker.bio}</Typography>
                </Grid>
              )}
              {selectedBroker.licenseDocumentUrl && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>License Document</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    href={selectedBroker.licenseDocumentUrl}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    View Document
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setDetailsOpen(false)}
            variant="outlined"
            sx={{
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              color: 'text.secondary',
            }}
          >
            Close
          </Button>
          {selectedBroker && !selectedBroker.isApproved && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleApproveBroker(selectedBroker._id);
              }}
            >
              Approve Broker
            </Button>
          )}
          {selectedBroker && selectedBroker.isApproved && (
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRevokeBroker(selectedBroker._id);
                setDetailsOpen(false);
              }}
            >
              Revoke Approval
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;