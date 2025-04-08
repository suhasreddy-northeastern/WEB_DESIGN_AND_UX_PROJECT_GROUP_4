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
        
        // In a real app, fetch actual stats from backend
        // Using mock stats for demonstration
        setStats({
          totalUsers: 128,
          totalBrokers: 24,
          pendingBrokers: pendingBrokersRes.data.length,
          totalListings: 187,
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Use empty data on error
        setPendingBrokers([]);
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
      
      // Update UI to show broker as revoked if they were previously approved
      // In practice, you might want to refresh the full list instead
      showSnackbar('Broker approval revoked successfully');
      
    } catch (error) {
      console.error('Error revoking broker approval:', error);
      showSnackbar('Failed to revoke broker approval', 'error');
    }
  };

  // Filter pending brokers based on search text
  const filteredBrokers = pendingBrokers.filter(broker => 
    broker.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchText.toLowerCase()) ||
    (broker.licenseNumber && broker.licenseNumber.toLowerCase().includes(searchText.toLowerCase()))
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

      {/* Pending Broker Approvals */}
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
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Registration Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBroker.createdAt ? dayjs(selectedBroker.createdAt).format('MMMM D, YYYY') : 'Unknown'}
                </Typography>
              </Grid>
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
          {selectedBroker && (
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
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;