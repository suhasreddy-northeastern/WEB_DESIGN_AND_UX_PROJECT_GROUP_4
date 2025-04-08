import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import axios from 'axios';

dayjs.extend(relativeTime);

const AdminBrokerApproval = () => {
  const [brokers, setBrokers] = useState({
    pending: [],
    approved: [],
    revoked: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loadingApproval, setLoadingApproval] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  // Fetch brokers data
  useEffect(() => {
    const fetchBrokers = async () => {
      setLoading(true);
      try {
        // Get pending brokers
        const pendingRes = await axios.get('/api/admin/pending-brokers', {
          withCredentials: true
        });
        
        // In a real app, you would have endpoints for approved/revoked brokers too
        // This is simulating those calls for demo purposes
        const approvedRes = await axios.get('/api/users?type=broker&isApproved=true', {
          withCredentials: true
        });
        
        const revokedRes = await axios.get('/api/users?type=broker&isApproved=false&notPending=true', {
          withCredentials: true
        });

        setBrokers({
          pending: pendingRes.data || [],
          approved: approvedRes.data?.users || [],
          revoked: revokedRes.data?.users || []
        });
      } catch (error) {
        console.error('Error fetching brokers:', error);
        // Mock data for demonstration
        setBrokers({
          pending: [
            {
              _id: '1',
              fullName: 'John Doe',
              email: 'john@example.com',
              phone: '(123) 456-7890',
              licenseNumber: 'BRK12345',
              licenseDocumentUrl: '/documents/license1.pdf',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              _id: '2',
              fullName: 'Jane Smith',
              email: 'jane@example.com',
              phone: '(456) 789-0123',
              licenseNumber: 'BRK67890',
              licenseDocumentUrl: '/documents/license2.pdf',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
          approved: [
            {
              _id: '3',
              fullName: 'Michael Johnson',
              email: 'michael@example.com',
              phone: '(789) 012-3456',
              licenseNumber: 'BRK54321',
              isApproved: true,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
          revoked: [
            {
              _id: '4',
              fullName: 'Sarah Williams',
              email: 'sarah@example.com',
              phone: '(012) 345-6789',
              licenseNumber: 'BRK09876',
              isApproved: false,
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBrokers();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (broker) => {
    setSelectedBroker(broker);
    setDialogOpen(true);
  };

  const handleApproveBroker = async (brokerId) => {
    setLoadingApproval(true);
    try {
      await axios.post(`/api/admin/approve-broker/${brokerId}`, {}, {
        withCredentials: true
      });
      
      // Update local state
      const updatedBroker = brokers.pending.find(b => b._id === brokerId);
      if (updatedBroker) {
        const updatedPending = brokers.pending.filter(b => b._id !== brokerId);
        const updatedApproved = [...brokers.approved, {...updatedBroker, isApproved: true}];
        
        setBrokers({
          ...brokers,
          pending: updatedPending,
          approved: updatedApproved
        });
      }
      
      // Close dialog if open
      if (dialogOpen && selectedBroker?._id === brokerId) {
        setDialogOpen(false);
        setSelectedBroker(null);
      }
    } catch (error) {
      console.error('Error approving broker:', error);
      alert('Failed to approve broker. Please try again.');
    } finally {
      setLoadingApproval(false);
    }
  };

  const handleRevokeBroker = async (brokerId) => {
    setLoadingApproval(true);
    try {
      await axios.post(`/api/admin/revoke-broker/${brokerId}`, {}, {
        withCredentials: true
      });
      
      // Update local state
      const updatedBroker = brokers.approved.find(b => b._id === brokerId);
      if (updatedBroker) {
        const updatedApproved = brokers.approved.filter(b => b._id !== brokerId);
        const updatedRevoked = [...brokers.revoked, {...updatedBroker, isApproved: false}];
        
        setBrokers({
          ...brokers,
          approved: updatedApproved,
          revoked: updatedRevoked
        });
      }
      
      // Close dialog if open
      if (dialogOpen && selectedBroker?._id === brokerId) {
        setDialogOpen(false);
        setSelectedBroker(null);
      }
    } catch (error) {
      console.error('Error revoking broker:', error);
      alert('Failed to revoke broker approval. Please try again.');
    } finally {
      setLoadingApproval(false);
    }
  };

  // Get current brokers list based on tab
  const getCurrentBrokers = () => {
    switch(tabValue) {
      case 0:
        return brokers.pending;
      case 1:
        return brokers.approved;
      case 2:
        return brokers.revoked;
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4} color="text.primary">
        Broker Approval Management
      </Typography>

      <Card
        elevation={2}
        sx={{
          mb: 4,
          borderRadius: 2,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
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
            }}
          >
            <Tab 
              label={
                <Badge 
                  badgeContent={brokers.pending.length} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: theme.palette.error.main,
                    }
                  }}
                >
                  Pending Approval
                </Badge>
              }
            />
            <Tab label="Approved Brokers" />
            <Tab label="Revoked Brokers" />
          </Tabs>
        </Box>
      </Card>

      {getCurrentBrokers().length === 0 ? (
        <Card
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" mb={1} color="text.primary">
            {tabValue === 0 
              ? 'No pending broker approvals' 
              : tabValue === 1 
                ? 'No approved brokers' 
                : 'No revoked brokers'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 
              ? 'All broker applications have been processed' 
              : tabValue === 1 
                ? 'You haven\'t approved any brokers yet' 
                : 'You haven\'t revoked any broker approvals'}
          </Typography>
        </Card>
      ) : (
        <TableContainer
          component={Card}
          elevation={2}
          sx={{
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Broker</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Contact Info</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>License</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Registration Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getCurrentBrokers().map((broker) => (
                <TableRow 
                  key={broker._id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.05)' : 'rgba(35, 206, 163, 0.02)',
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar alt={broker.fullName}>
                        {broker.fullName ? broker.fullName[0] : 'B'}
                      </Avatar>
                      <Typography variant="body2" fontWeight="medium" color="text.primary">
                        {broker.fullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.primary">
                      {broker.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {broker.phone || 'No phone provided'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.primary">
                      {broker.licenseNumber || 'Not provided'}
                    </Typography>
                    {broker.licenseDocumentUrl && (
                      <Link href={broker.licenseDocumentUrl} target="_blank" variant="caption" sx={{ color: primaryColor }}>
                        View License
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={dayjs(broker.createdAt).format('MM/DD/YYYY HH:mm')}>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(broker.createdAt).fromNow()}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewDetails(broker)}
                          sx={{ 
                            color: primaryColor,
                            backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.1)' : 'rgba(35, 206, 163, 0.05)',
                            '&:hover': {
                              backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.2)' : 'rgba(35, 206, 163, 0.1)',
                            } 
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {tabValue === 0 && (
                        <Tooltip title="Approve Broker">
                          <IconButton 
                            size="small"
                            onClick={() => handleApproveBroker(broker._id)}
                            sx={{ 
                              color: 'white',
                              backgroundColor: theme.palette.success.main,
                              '&:hover': {
                                backgroundColor: theme.palette.success.dark,
                              } 
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {tabValue === 1 && (
                        <Tooltip title="Revoke Approval">
                          <IconButton 
                            size="small"
                            onClick={() => handleRevokeBroker(broker._id)}
                            sx={{ 
                              color: 'white',
                              backgroundColor: theme.palette.error.main,
                              '&:hover': {
                                backgroundColor: theme.palette.error.dark,
                              } 
                            }}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Broker details dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          },
        }}
      >
        {selectedBroker && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  alt={selectedBroker.fullName}
                  src={selectedBroker.imagePath}
                  sx={{ width: 56, height: 56 }}
                >
                  {selectedBroker.fullName ? selectedBroker.fullName[0] : 'B'}
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.primary">{selectedBroker.fullName}</Typography>
                  <Chip 
                    size="small" 
                    label={
                      selectedBroker.isApproved 
                        ? "Approved" 
                        : tabValue === 0 
                          ? "Pending Approval" 
                          : "Approval Revoked"
                    }
                    sx={{
                      backgroundColor: selectedBroker.isApproved 
                        ? isDarkMode ? 'rgba(35, 206, 163, 0.2)' : 'rgba(35, 206, 163, 0.1)'
                        : tabValue === 0
                          ? isDarkMode ? 'rgba(249, 199, 79, 0.2)' : 'rgba(249, 199, 79, 0.1)'
                          : isDarkMode ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)',
                      color: selectedBroker.isApproved 
                        ? primaryColor
                        : tabValue === 0
                          ? theme.palette.warning.main
                          : theme.palette.error.main,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                    Contact Information
                  </Typography>
                  <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Typography variant="body1" color="text.primary" gutterBottom>
                        {selectedBroker.email}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Phone
                      </Typography>
                      <Typography variant="body1" color="text.primary">
                        {selectedBroker.phone || 'Not provided'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                    License Information
                  </Typography>
                  <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        License Number
                      </Typography>
                      <Typography variant="body1" color="text.primary" gutterBottom>
                        {selectedBroker.licenseNumber || 'Not provided'}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        License Document
                      </Typography>
                      {selectedBroker.licenseDocumentUrl ? (
                        <Button
                          variant="outlined"
                          size="small"
                          component="a"
                          href={selectedBroker.licenseDocumentUrl}
                          target="_blank"
                          sx={{
                            borderRadius: 1,
                            borderColor: primaryColor,
                            color: primaryColor,
                            '&:hover': {
                              borderColor: theme.palette.primary.dark,
                              backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.1)' : 'rgba(35, 206, 163, 0.05)',
                            }
                          }}
                        >
                          View License Document
                        </Button>
                      ) : (
                        <Typography variant="body1" color="text.primary">
                          No document provided
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.secondary">
                    Account Information
                  </Typography>
                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Registration Date
                          </Typography>
                          <Typography variant="body1" color="text.primary">
                            {dayjs(selectedBroker.createdAt).format('MMMM D, YYYY')}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Account Status
                          </Typography>
                          <Chip 
                            label={selectedBroker.isApproved ? "Approved" : "Not Approved"}
                            size="small"
                            sx={{
                              backgroundColor: selectedBroker.isApproved 
                                ? isDarkMode ? 'rgba(35, 206, 163, 0.2)' : 'rgba(35, 206, 163, 0.1)'
                                : isDarkMode ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)',
                              color: selectedBroker.isApproved ? primaryColor : theme.palette.error.main,
                              fontWeight: 600,
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={() => setDialogOpen(false)}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                Close
              </Button>
              
              {tabValue === 0 && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleApproveBroker(selectedBroker._id)}
                  disabled={loadingApproval}
                  startIcon={<CheckCircleIcon />}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: theme.palette.success.dark,
                    },
                  }}
                >
                  {loadingApproval ? <CircularProgress size={24} color="inherit" /> : 'Approve Broker'}
                </Button>
              )}
              
              {tabValue === 1 && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleRevokeBroker(selectedBroker._id)}
                  disabled={loadingApproval}
                  startIcon={<CancelIcon />}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: theme.palette.error.dark,
                    },
                  }}
                >
                  {loadingApproval ? <CircularProgress size={24} color="inherit" /> : 'Revoke Approval'}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AdminBrokerApproval;