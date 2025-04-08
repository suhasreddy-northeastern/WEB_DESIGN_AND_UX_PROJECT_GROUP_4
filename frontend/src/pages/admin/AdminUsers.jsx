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
  Divider,
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
  InputAdornment,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.type !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // In a real application, make an API call to get user data
        const response = await axios.get('/api/admin/users', {
          withCredentials: true,
        });
        
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        showSnackbar('Failed to load users. Please try again.', 'error');
        
        // Mock data for demonstration
        setUsers([
          {
            _id: '1',
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            type: 'user',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '2',
            fullName: 'Jane Smith',
            email: 'jane.smith@example.com',
            type: 'user',
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '3',
            fullName: 'Michael Brown',
            email: 'michael.brown@example.com',
            type: 'user',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: '4',
            fullName: 'Sarah Williams',
            email: 'sarah.williams@example.com',
            type: 'user',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, navigate]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleDeleteUser = async () => {
    try {
      // In a real application, make an API call to delete the user
      await axios.delete(`/api/admin/users/${selectedUser._id}`, {
        withCredentials: true,
      });
      
      // Update UI to remove the user
      setUsers(users.filter(u => u._id !== selectedUser._id));
      showSnackbar('User deleted successfully');
      setConfirmDialogOpen(false);
      
      // Close details dialog if open
      if (detailsOpen) {
        setDetailsOpen(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Failed to delete user. Please try again.', 'error');
      setConfirmDialogOpen(false);
    }
  };

  // Filter users based on search text
  const filteredUsers = users.filter(user => {
    return (
      searchText === '' ||
      user.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase())
    );
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
          Manage Users
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
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {searchText
                  ? "No users match your search criteria"
                  : "No users found"}
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Join Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Last Login</TableCell>
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
                        <Tooltip title={dayjs(user.createdAt).format('YYYY-MM-DD')}>
                          <span>{dayjs(user.createdAt).fromNow()}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin && (
                          <Tooltip title={dayjs(user.lastLogin).format('YYYY-MM-DD HH:mm')}>
                            <span>{dayjs(user.lastLogin).fromNow()}</span>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(user)}
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
                          
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedUser(user);
                                setConfirmDialogOpen(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      {/* User Details Dialog */}
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
            <Typography variant="h6">User Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                <Typography variant="body1" gutterBottom>{selectedUser.fullName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" gutterBottom>{selectedUser.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Join Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedUser.createdAt ? dayjs(selectedUser.createdAt).format('MMMM D, YYYY') : 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedUser.lastLogin 
                    ? dayjs(selectedUser.lastLogin).format('MMMM D, YYYY, h:mm A') 
                    : 'Never'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">User Type</Typography>
                <Chip 
                  label={selectedUser.type.charAt(0).toUpperCase() + selectedUser.type.slice(1)} 
                  color="primary"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom color="text.secondary">User Activity</Typography>
                <Typography variant="body2" paragraph>
                  This user has been active for {dayjs().diff(dayjs(selectedUser.createdAt), 'day')} days.
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
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setDetailsOpen(false);
              setConfirmDialogOpen(true);
            }}
          >
            Delete User
          </Button>
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
          Delete User
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete the user {selectedUser?.fullName}? This action cannot be undone.
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
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;