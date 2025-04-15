import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  useTheme,
  Badge,
  FormHelperText
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RescheduleIcon from '@mui/icons-material/Update';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import dayjs from 'dayjs';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Simple date picker component that doesn't use MUI date pickers
const SimpleDatePicker = ({ value, onChange, disablePast, label }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Format date to YYYY-MM-DD for the input
  const formatDate = (date) => {
    if (!date) return '';
    return date.format ? date.format('YYYY-MM-DD') : dayjs(date).format('YYYY-MM-DD');
  };

  // Handler for date changes
  const handleDateChange = (e) => {
    const newDate = e.target.value ? dayjs(e.target.value) : null;
    onChange(newDate);
  };

  // Calculate min date if disablePast is true
  const minDate = disablePast ? formatDate(dayjs()) : undefined;

  return (
    <TextField
      label={label || "Date"}
      type="date"
      value={formatDate(value)}
      onChange={handleDateChange}
      fullWidth
      InputLabelProps={{ shrink: true }}
      inputProps={{ min: minDate }}
    />
  );
};

const BrokerTours = () => {
  const theme = useTheme();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog state and selected tour
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseStatus, setResponseStatus] = useState('confirmed');
  const [rescheduleDate, setRescheduleDate] = useState(null);
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Tabs state
  const [activeTab, setActiveTab] = useState(0);
  
  // Time slots for rescheduling
  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM"
  ];
  
  // Fetch tour requests
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/tours/broker`, 
          { withCredentials: true }
        );
        
        setTours(response.data.tours || []);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to load tour requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTours();
  }, []);
  
  // Filter tours based on active tab
  useEffect(() => {
    if (!tours.length) {
      setFilteredTours([]);
      return;
    }
    
    let filtered;
    switch(activeTab) {
      case 0: // Upcoming
        filtered = tours.filter(tour => 
          ['pending', 'confirmed', 'rescheduled'].includes(tour.status) &&
          dayjs(tour.tourDate).isAfter(dayjs())
        );
        break;
      case 1: // Pending Approval
        filtered = tours.filter(tour => tour.status === 'pending');
        break;
      case 2: // Confirmed
        filtered = tours.filter(tour => tour.status === 'confirmed');
        break;
      case 3: // Completed
        filtered = tours.filter(tour => 
          tour.status === 'completed' || 
          (tour.status === 'confirmed' && dayjs(tour.tourDate).isBefore(dayjs()))
        );
        break;
      case 4: // Cancelled
        filtered = tours.filter(tour => tour.status === 'canceled');
        break;
      default:
        filtered = tours;
    }
    
    // Sort by date
    filtered.sort((a, b) => {
      return dayjs(a.tourDate).diff(dayjs(b.tourDate));
    });
    
    setFilteredTours(filtered);
  }, [activeTab, tours]);
  
  // Format date
  const formatDate = (dateString) => {
    return dayjs(dateString).format('MMM D, YYYY');
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Open response dialog
  const handleOpenResponseDialog = (tour) => {
    setSelectedTour(tour);
    setResponseMessage('');
    
    // Set default response message based on status
    if (tour.status === 'pending') {
      setResponseMessage(`Hi ${tour.userDetails.name}, I'm confirming your tour for ${formatDate(tour.tourDate)} at ${tour.tourTime}. Looking forward to showing you the property!`);
      setResponseStatus('confirmed');
    }
    
    setRescheduleDate(dayjs(tour.tourDate));
    setRescheduleTime(tour.tourTime);
    setResponseDialogOpen(true);
  };
  
  // Close response dialog
  const handleCloseResponseDialog = () => {
    setResponseDialogOpen(false);
    setSelectedTour(null);
    setResponseMessage('');
  };
  
  // Handle tour response submission
  const handleSubmitResponse = async () => {
    if (!selectedTour) return;
    
    try {
      setActionLoading(true);
      
      // Create request body based on response status
      const requestBody = {
        status: responseStatus,
        brokerResponse: responseMessage
      };
      
      // Add rescheduling data if applicable
      if (responseStatus === 'rescheduled' && rescheduleDate && rescheduleTime) {
        requestBody.newDate = rescheduleDate.format('YYYY-MM-DD');
        requestBody.newTime = rescheduleTime;
      }
      
      // Submit response
      await axios.put(
        `${API_BASE_URL}/api/tours/status/${selectedTour._id}`,
        requestBody,
        { withCredentials: true }
      );
      
      // Update local state
      setTours(prevTours => 
        prevTours.map(tour => {
          if (tour._id === selectedTour._id) {
            const updatedTour = { ...tour, status: responseStatus, brokerResponse: responseMessage };
            
            // Add updated tour date and time if rescheduled
            if (responseStatus === 'rescheduled') {
              updatedTour.tourDate = rescheduleDate.format('YYYY-MM-DD');
              updatedTour.tourTime = rescheduleTime;
            }
            
            return updatedTour;
          }
          return tour;
        })
      );
      
      // Close dialog
      handleCloseResponseDialog();
    } catch (err) {
      console.error('Error updating tour status:', err);
      setError('Failed to update tour status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  
  // Get status chip
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip 
          icon={<HourglassEmptyIcon />} 
          label="Pending" 
          color="warning" 
          size="small" 
        />;
      case 'confirmed':
        return <Chip 
          icon={<CheckCircleOutlineIcon />} 
          label="Confirmed" 
          color="success" 
          size="small" 
        />;
      case 'canceled':
        return <Chip 
          icon={<CancelIcon />} 
          label="Canceled" 
          color="error" 
          size="small" 
        />;
      case 'rescheduled':
        return <Chip 
          icon={<RescheduleIcon />} 
          label="Rescheduled" 
          color="info" 
          size="small" 
        />;
      case 'completed':
        return <Chip 
          icon={<CheckCircleOutlineIcon />} 
          label="Completed" 
          color="default" 
          size="small" 
        />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  // Calculate pending tours count for badge
  const pendingCount = tours.filter(tour => tour.status === 'pending').length;
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Property Tour Requests
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="tour status tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Upcoming" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab 
            label="Pending Approval" 
            icon={
              <Badge badgeContent={pendingCount} color="error" max={99}>
                <HourglassEmptyIcon />
              </Badge>
            } 
            iconPosition="start" 
          />
          <Tab label="Confirmed" icon={<EventAvailableIcon />} iconPosition="start" />
          <Tab label="Completed" icon={<CheckCircleOutlineIcon />} iconPosition="start" />
          <Tab label="Cancelled" icon={<EventBusyIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {filteredTours.length === 0 ? (
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <CalendarTodayIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No {activeTab === 0 ? 'upcoming' : 
                activeTab === 1 ? 'pending' : 
                activeTab === 2 ? 'confirmed' : 
                activeTab === 3 ? 'completed' : 'cancelled'} tours
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {activeTab === 1 ? 
              'You have no pending tour requests that need your approval.' :
              activeTab === 0 ?
              'You have no upcoming tours scheduled.' :
              `No tours with status: ${
                activeTab === 2 ? 'confirmed' : 
                activeTab === 3 ? 'completed' : 'cancelled'
              }`
            }
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTours.map((tour) => (
                <TableRow
                  key={tour._id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    bgcolor: tour.status === 'pending' ? 
                      (theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)') : 
                      'inherit'
                  }}
                >
                  {/* Property */}
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        component="img"
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          objectFit: 'cover',
                          mr: 2
                        }}
                        src={`${API_BASE_URL}${tour.apartmentDetails.imageUrl || '/images/no-image.png'}`}
                        alt=""
                      />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {tour.apartmentDetails.bedrooms} BHK
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tour.apartmentDetails.neighborhood}, Mumbai
                        </Typography>
                        <Typography variant="body2" color="primary" fontWeight={500}>
                          ${tour.apartmentDetails.price.toLocaleString()}/mo
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  {/* Client */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        src={tour.userDetails.imagePath ? `${API_BASE_URL}${tour.userDetails.imagePath}` : null}
                        sx={{ mr: 1, bgcolor: theme.palette.primary.main }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {tour.userDetails.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tour.userDetails.contactNumber}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  {/* Date & Time */}
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2">
                        {formatDate(tour.tourDate)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {tour.tourTime}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  {/* Status */}
                  <TableCell>
                    {getStatusChip(tour.status)}
                  </TableCell>
                  
                  {/* Actions */}
                  <TableCell align="right">
                    {tour.status === 'pending' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenResponseDialog(tour)}
                        sx={{ mr: 1 }}
                      >
                        Respond
                      </Button>
                    )}
                    
                    {tour.status === 'confirmed' && dayjs(tour.tourDate).isAfter(dayjs()) && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenResponseDialog(tour)}
                      >
                        Reschedule/Cancel
                      </Button>
                    )}
                    
                    {tour.status === 'rescheduled' && dayjs(tour.tourDate).isAfter(dayjs()) && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenResponseDialog(tour)}
                      >
                        Update
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Response Dialog */}
      <Dialog 
        open={responseDialogOpen} 
        onClose={handleCloseResponseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedTour?.status === 'pending' ? 'Respond to Tour Request' : 
          selectedTour?.status === 'confirmed' ? 'Update Confirmed Tour' : 
          'Update Tour Status'}
        </DialogTitle>
        
        <DialogContent dividers>
          {selectedTour && (
            <Grid container spacing={3}>
              {/* Property & User Info */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Property
                </Typography>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <Box
                    component="img"
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      objectFit: 'cover',
                      mr: 2
                    }}
                    src={`${API_BASE_URL}${selectedTour.apartmentDetails.imageUrl || '/images/no-image.png'}`}
                    alt=""
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedTour.apartmentDetails.bedrooms} BHK in {selectedTour.apartmentDetails.neighborhood}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={500}>
                      ${selectedTour.apartmentDetails.price.toLocaleString()}/mo
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Client
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar 
                    src={selectedTour.userDetails.imagePath ? `${API_BASE_URL}${selectedTour.userDetails.imagePath}` : null}
                    sx={{ mr: 1, bgcolor: theme.palette.primary.main }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="body1">
                    {selectedTour.userDetails.name}
                  </Typography>
                </Box>
                <Typography variant="body2" gutterBottom>
                  Email: {selectedTour.userDetails.email}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Phone: {selectedTour.userDetails.contactNumber}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Current Schedule
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarTodayIcon sx={{ mr: 1 }} fontSize="small" color="action" />
                  <Typography variant="body2">
                    {formatDate(selectedTour.tourDate)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ mr: 1 }} fontSize="small" color="action" />
                  <Typography variant="body2">
                    {selectedTour.tourTime}
                  </Typography>
                </Box>
                
                {selectedTour.message && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Client Message
                    </Typography>
                    <Typography variant="body2">
                      {selectedTour.message}
                    </Typography>
                  </>
                )}
              </Grid>
              
              {/* Response Form */}
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedTour.status === 'pending' ? 'How would you like to respond?' : 'Update tour status'}
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="response-status-label">Response</InputLabel>
                  <Select
                    labelId="response-status-label"
                    value={responseStatus}
                    label="Response"
                    onChange={(e) => setResponseStatus(e.target.value)}
                  >
                    {selectedTour.status === 'pending' && (
                      <>
                        <MenuItem value="confirmed">Confirm Tour</MenuItem>
                        <MenuItem value="rescheduled">Suggest Different Time</MenuItem>
                        <MenuItem value="canceled">Decline Tour Request</MenuItem>
                      </>
                    )}
                    
                    {selectedTour.status === 'confirmed' && (
                      <>
                        <MenuItem value="rescheduled">Reschedule Tour</MenuItem>
                        <MenuItem value="canceled">Cancel Tour</MenuItem>
                        <MenuItem value="completed">Mark as Completed</MenuItem>
                      </>
                    )}
                    
                    {selectedTour.status === 'rescheduled' && (
                      <>
                        <MenuItem value="confirmed">Confirm Tour</MenuItem>
                        <MenuItem value="rescheduled">Reschedule Again</MenuItem>
                        <MenuItem value="canceled">Cancel Tour</MenuItem>
                      </>
                    )}
                  </Select>
                </FormControl>
                
                {responseStatus === 'rescheduled' && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <SimpleDatePicker
                        label="New Date"
                        value={rescheduleDate}
                        onChange={(newDate) => setRescheduleDate(newDate)}
                        disablePast
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="time-slot-label">New Time</InputLabel>
                        <Select
                          labelId="time-slot-label"
                          value={rescheduleTime}
                          label="New Time"
                          onChange={(e) => setRescheduleTime(e.target.value)}
                        >
                          {timeSlots.map((slot) => (
                            <MenuItem key={slot} value={slot}>
                              {slot}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                )}
                
                <TextField
                  label="Message to Client"
                  multiline
                  rows={6}
                  fullWidth
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Enter your response to the client..."
                  variant="outlined"
                  required
                />
                
                {responseStatus === 'confirmed' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    By confirming this tour, you are committing to be available at the scheduled time. 
                    The client will be notified of your confirmation.
                  </Alert>
                )}
                
                {responseStatus === 'canceled' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Cancellations should only be made when necessary. Please provide a clear explanation 
                    to the client and, if possible, suggest alternative options.
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseResponseDialog} disabled={actionLoading}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmitResponse}
            disabled={actionLoading || !responseMessage.trim()}
            startIcon={actionLoading ? <CircularProgress size={20} /> : null}
          >
            {actionLoading ? 'Submitting...' : 'Submit Response'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrokerTours;