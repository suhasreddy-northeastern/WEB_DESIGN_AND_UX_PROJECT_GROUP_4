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
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CancelIcon from '@mui/icons-material/Cancel';
import HomeIcon from '@mui/icons-material/Home';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import RescheduleIcon from '@mui/icons-material/Update';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

const UserTours = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const primaryColor = "#00b386";

  // Fetch user's tour requests
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/tours/user`,
          { withCredentials: true }
        );
        
        setTours(response.data.tours || []);
      } catch (err) {
        console.error('Error fetching tours:', err);
        setError('Failed to load your tour requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Get status chip based on tour status
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
          icon={<CheckCircleIcon />} 
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
          icon={<CheckCircleIcon />} 
          label="Completed" 
          color="default" 
          size="small" 
        />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    const date = dayjs(dateString);
    return date.format('dddd, MMMM D, YYYY');
  };

  // Open cancel dialog
  const handleOpenCancelDialog = (tourId) => {
    setSelectedTourId(tourId);
    setCancelDialogOpen(true);
  };

  // Close cancel dialog
  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setCancelReason('');
    setSelectedTourId(null);
  };

  // Handle tour cancellation
  const handleCancelTour = async () => {
    if (!selectedTourId) return;
    
    try {
      setCancelLoading(true);
      await axios.put(
        `${API_BASE_URL}/api/tours/cancel/${selectedTourId}`,
        { 
          cancelReason 
        },
        { withCredentials: true }
      );

      // Update the tour in the local state
      setTours(prevTours => 
        prevTours.map(tour => 
          tour._id === selectedTourId
            ? { ...tour, status: 'canceled' }
            : tour
        )
      );

      // Close dialog
      handleCloseCancelDialog();
    } catch (err) {
      console.error('Error canceling tour:', err);
      setError('Failed to cancel tour. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Navigate to apartment details
  const viewApartmentDetails = (apartmentId) => {
    // You'll need to implement this based on your app's routing
    // For example, navigate to the matches page with the apartment highlighted
    navigate(`/matches?apartment=${apartmentId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Your Property Tours
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your scheduled property tours
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {tours.length === 0 ? (
        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <HomeIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No tours scheduled yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              You haven't scheduled any property tours yet. Browse available properties and schedule a tour to get started.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
              sx={{ 
                bgcolor: primaryColor,
                '&:hover': { bgcolor: '#009973' }
              }}
            >
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {tours.map((tour) => (
            <Grid item xs={12} md={6} key={tour._id}>
              <Card sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme.shadows[3],
                height: '100%'
              }}>
                {/* Image section */}
                <Box sx={{ 
                  width: { xs: '100%', sm: 200 },
                  height: { xs: 180, sm: 'auto' }
                }}>
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    image={`${API_BASE_URL}${tour.apartmentDetails.imageUrl || '/images/no-image.png'}`}
                    alt={`${tour.apartmentDetails.bedrooms} BHK in ${tour.apartmentDetails.neighborhood}`}
                  />
                </Box>
                
                {/* Content section */}
                <Box sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1
                }}>
                  <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" component="div" gutterBottom>
                        {tour.apartmentDetails.bedrooms} BHK in {tour.apartmentDetails.neighborhood}
                      </Typography>
                      {getStatusChip(tour.status)}
                    </Box>
                    
                    <Typography 
                      variant="subtitle1" 
                      color="primary" 
                      fontWeight={600}
                      sx={{ color: primaryColor }}
                    >
                      ${tour.apartmentDetails.price.toLocaleString()}/mo
                    </Typography>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(tour.tourDate)}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {tour.tourTime}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          {tour.apartmentDetails.neighborhood}, Mumbai
                        </Typography>
                      </Box>
                    </Box>
                    
                    {tour.brokerResponse && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Broker Response:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {tour.brokerResponse}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => viewApartmentDetails(tour.apartmentId)}
                      >
                        View Property
                      </Button>
                      
                      {tour.status === 'pending' && (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          color="error"
                          startIcon={<EventBusyIcon />}
                          onClick={() => handleOpenCancelDialog(tour._id)}
                        >
                          Cancel Tour
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Tour Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Tour Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to cancel this tour request? This action cannot be undone.
          </Typography>
          <TextField
            label="Reason for cancellation (optional)"
            multiline
            rows={3}
            fullWidth
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={cancelLoading}>
            Keep Tour
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleCancelTour}
            disabled={cancelLoading}
            startIcon={cancelLoading ? <CircularProgress size={20} /> : null}
          >
            {cancelLoading ? 'Canceling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserTours;