import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Divider,
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
  InputAdornment,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const AdminBrokers = () => {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchAllBrokers = async () => {
      if (!user || user.type !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // You might need to create a specific API endpoint to get all brokers
        // This is a placeholder for demonstration
        const response = await axios.get('/api/admin/brokers', {
          withCredentials: true,
        });
        
        setBrokers(response.data);
      } catch (error) {
        console.error('Error fetching brokers:', error);
        showSnackbar('Failed to load brokers. Please try again.', 'error');
        
        // Mock data for demonstration
        setBrokers([
          {
            _id: '1',
            fullName: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 (555) 123-4567',
            licenseNumber: 'BRK-12345',
            isApproved: true,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '2',
            fullName: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            phone: '+1 (555) 987-6543',
            licenseNumber: 'BRK-67890',
            isApproved: true,
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '3',
            fullName: 'Michael Davis',
            email: 'michael.davis@example.com',
            phone: '+1 (555) 456-7890',
            licenseNumber: 'BRK-54321',
            isApproved: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '4',
            fullName: 'Emily Wilson',
            email: 'emily.wilson@example.com',
            phone: '+1 (555) 234-5678',
            licenseNumber: 'BRK-09876',
            isApproved: false,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBrokers();
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
      setBrokers(
        brokers.map(broker => 
          broker._id === brokerId 
            ? { ...broker, isApproved: true } 
            : broker
        )
      );
      
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
      
      // Update UI to show broker as revoked
      setBrokers(
        brokers.map(broker => 
          broker._id === brokerId 
            ? { ...broker, isApproved: false } 
            : broker
        )
      );
      
      showSnackbar('Broker approval revoked successfully');
      
      // Close dialogs if open
      setConfirmDialogOpen(false);
      if (detailsOpen && selectedBroker?._id === brokerId) {
        setDetailsOpen(false);
      }
    } catch (error) {
      console.error('Error revoking broker approval:', error);
      showSnackbar('Failed to revoke broker approval', 'error');
      setConfirmDialogOpen(false);
    }
  };

  const openConfirmDialog = (action, broker) => {
    setSelectedBroker(broker);
    setConfirmDialogAction(action);
    setConfirmDialogOpen(true);
  };

  const executeConfirmAction = () => {
    if (confirmDialogAction === 'approve') {
      handleApproveBroker(selectedBroker._id);
    } else if (confirmDialogAction === 'revoke') {
      handleRevokeBroker(selectedBroker._id);
    }
    setConfirmDialogOpen(false);
  };

  // Filter brokers based on tab selection and search text
  const filteredBrokers = brokers.filter(broker => {
    const matchesStatus = 
      (tabValue === 0) || // All brokers
      (tabValue === 1 && broker.isApproved) || // Approved brokers
      (tabValue === 2 && !broker.isApproved); // Pending brokers
      
    const matchesSearch = 
      searchText === '' ||
      broker.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      broker.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (broker.licenseNumber && broker.licenseNumber.toLowerCase().includes(searchText.toLowerCase()));
      
    return matchesStatus && matchesSearch;
  });

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
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
          Manage Brokers
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Paper
            component="form"
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: 300,
              p: '2px 8px',
              border: '1px solid',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
              borderRadius: 2,
              mr: 2,
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
          <Tooltip title="Filter options">
            <IconButton sx={{ color: 'text.secondary' }}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

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
            <Tab label="All Brokers" />
            <Tab label="Approved" icon={<CheckCircleIcon />} iconPosition="start" />
            <Tab label="Pending Approval" icon={<CancelIcon />} iconPosition="start" />
          </Tabs>
        </CardContent>
      </Card>

      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {filteredBrokers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {searchText
                  ? "No brokers match your search criteria"
                  : tabValue === 1
                  ? "No approved brokers found"
                  : tabValue === 2
                  ? "No pending broker requests"
                  : "No brokers found"}
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
                    <TableCell sx={{ fontWeight: 600 }}>Registration Date</TableCell>
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
                          icon={broker.isApproved ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                          label={broker.isApproved ? 'Approved' : 'Pending'}
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            backgroundColor: broker.isApproved 
                              ? theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.1)' 
                              : theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.2)' : 'rgba(237, 108, 2, 0.1)',
                            color: broker.isApproved 
                              ? theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32'
                              : theme.palette.mode === 'dark' ? '#ffb74d' : '#ed6c02',
                            border: '1px solid',
                            borderColor: broker.isApproved 
                              ? theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.5)' : 'rgba(46, 125, 50, 0.3)' 
                              : theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.5)' : 'rgba(237, 108, 2, 0.3)',
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
                            <Tooltip title="Revoke Approval">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => openConfirmDialog('revoke', broker)}
                              >
                                <BlockIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => openConfirmDialog('approve', broker)}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            <Typography variant="h6">Broker Details</Typography>
            {selectedBroker?.isApproved && (
              <Chip
                icon={<VerifiedIcon />}
                label="Approved"
                size="small"
                sx={{ 
                  ml: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.1)',
                  color: theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(46, 125, 50, 0.5)' : 'rgba(46, 125, 50, 0.3)',
                  fontWeight: 600
                }}
              />
            )}
            {!selectedBroker?.isApproved && (
              <Chip
                icon={<CancelIcon />}
                label="Pending Approval"
                size="small"
                sx={{ 
                  ml: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.2)' : 'rgba(237, 108, 2, 0.1)',
                  color: theme.palette.mode === 'dark' ? '#ffb74d' : '#ed6c02',
                  border: '1px solid',
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(237, 108, 2, 0.5)' : 'rgba(237, 108, 2, 0.3)',
                  fontWeight: 600
                }}
              />
            )}
          </Box>
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
                    href={selectedBroker.licenseDocumentUrl.startsWith('http') 
                      ? selectedBroker.licenseDocumentUrl 
                      : `http://localhost:4000${selectedBroker.licenseDocumentUrl}`}
                    target="_blank"
                    sx={{ mt: 1 }}
                  >
                    View Document
                  </Button>
                </Grid>
              )}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>Broker Status</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedBroker.isApproved
                    ? "This broker is currently approved and can create property listings."
                    : "This broker is waiting for approval and cannot create listings yet."}
                </Typography>
              </Grid>
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
              onClick={() => openConfirmDialog('approve', selectedBroker)}
            >
              Approve Broker
            </Button>
          )}
          {selectedBroker && selectedBroker.isApproved && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => openConfirmDialog('revoke', selectedBroker)}
            >
              Revoke Approval
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            width: "100%",
            maxWidth: 400,
            backgroundColor: isDarkMode
              ? theme.palette.background.paper
              : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          },
        }}
      >
        <DialogTitle>
          {confirmDialogAction === 'approve' ? 'Approve Broker' : 'Revoke Broker Approval'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {confirmDialogAction === 'approve' 
              ? `Are you sure you want to approve ${selectedBroker?.fullName}? They will be able to create and manage property listings.`
              : `Are you sure you want to revoke approval for ${selectedBroker?.fullName}? They will no longer be able to create new listings.`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: isDarkMode
                ? 'rgba(255, 255, 255, 0.2)'
                : 'rgba(0, 0, 0, 0.2)',
              color: 'text.secondary',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={executeConfirmAction}
            variant="contained"
            color={confirmDialogAction === 'approve' ? 'primary' : 'warning'}
          >
            {confirmDialogAction === 'approve' ? 'Approve' : 'Revoke Approval'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBrokers;