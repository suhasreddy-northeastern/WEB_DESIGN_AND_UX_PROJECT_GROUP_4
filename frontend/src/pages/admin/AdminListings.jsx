import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  useTheme,
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const AdminListings = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Filter states
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    neighborhood: '',
    approvalStatus: '',
  });
  
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchListings = async () => {
      if (!user || user.type !== 'admin') {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        // Get all listings
        const listingsRes = await axios.get('/api/apartments', {
          withCredentials: true,
        });
        
        setListings(listingsRes.data || []);
        setFilteredListings(listingsRes.data || []);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
        setFilteredListings([]);
        showSnackbar('Failed to load listings', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, navigate]);

  useEffect(() => {
    // Apply search filter
    const filtered = listings.filter(listing => 
      (listing.type && listing.type.toLowerCase().includes(searchText.toLowerCase())) ||
      (listing.neighborhood && listing.neighborhood.toLowerCase().includes(searchText.toLowerCase())) ||
      (listing.brokerEmail && listing.brokerEmail.toLowerCase().includes(searchText.toLowerCase()))
    );
    setFilteredListings(filtered);
  }, [searchText, listings]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  const handleDeleteClick = (listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!listingToDelete) return;
    
    try {
      await axios.delete(`/api/apartments/${listingToDelete._id}`, {
        withCredentials: true
      });
      
      // Update lists
      const updatedListings = listings.filter(item => item._id !== listingToDelete._id);
      setListings(updatedListings);
      setFilteredListings(
        filteredListings.filter(item => item._id !== listingToDelete._id)
      );
      
      showSnackbar('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      showSnackbar('Failed to delete listing', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setListingToDelete(null);
  };

  const handleToggleListingStatus = async (listingId, currentStatus) => {
    try {
      await axios.put(`/api/apartments/${listingId}`, {
        isActive: !currentStatus
      }, {
        withCredentials: true
      });
      
      // Update lists
      const updatedListings = listings.map(item => 
        item._id === listingId ? { ...item, isActive: !currentStatus } : item
      );
      
      setListings(updatedListings);
      setFilteredListings(
        filteredListings.map(item => 
          item._id === listingId ? { ...item, isActive: !currentStatus } : item
        )
      );
      
      showSnackbar(`Listing ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      
      // If details dialog is open and showing this listing, update it
      if (detailsOpen && selectedListing?._id === listingId) {
        setSelectedListing({
          ...selectedListing,
          isActive: !currentStatus
        });
      }
    } catch (error) {
      console.error('Error updating listing status:', error);
      showSnackbar('Failed to update listing status', 'error');
    }
  };

  const handleOpenFilterDialog = () => {
    setFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleApplyFilters = () => {
    let filtered = [...listings];
    
    // Apply price filter - min
    if (filters.priceMin) {
      filtered = filtered.filter(listing => 
        listing.price && listing.price >= parseInt(filters.priceMin)
      );
    }
    
    // Apply price filter - max
    if (filters.priceMax) {
      filtered = filtered.filter(listing => 
        listing.price && listing.price <= parseInt(filters.priceMax)
      );
    }
    
    // Apply bedrooms filter
    if (filters.bedrooms) {
      filtered = filtered.filter(listing => {
        if (!listing.bedrooms) return false;
        
        // Handle cases like "Studio", "1 Bedroom", etc.
        const bedroomStr = listing.bedrooms.toString().toLowerCase();
        
        if (filters.bedrooms === 'Studio') {
          return bedroomStr.includes('studio') || bedroomStr === '0';
        } else {
          return bedroomStr.startsWith(filters.bedrooms) || bedroomStr === filters.bedrooms;
        }
      });
    }
    
    // Apply neighborhood filter
    if (filters.neighborhood) {
      filtered = filtered.filter(listing => 
        listing.neighborhood && listing.neighborhood.toLowerCase() === filters.neighborhood.toLowerCase()
      );
    }
    
    // Apply approval status filter
    if (filters.approvalStatus) {
      filtered = filtered.filter(listing => 
        listing.approvalStatus === filters.approvalStatus
      );
    }
    
    setFilteredListings(filtered);
    setFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      neighborhood: '',
      approvalStatus: '',
    });
    setFilteredListings(listings);
    setFilterDialogOpen(false);
  };

  // Get unique neighborhoods for filter dropdown
  const uniqueNeighborhoods = [...new Set(listings
    .filter(listing => listing.neighborhood)
    .map(listing => listing.neighborhood))];

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
        Manage Listings
      </Typography>

      {/* Stats summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Listings
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="text.primary">
                  {listings.length}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: primaryColor,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HomeIcon sx={{ color: 'white' }} />
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Listings
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {listings.filter(listing => listing.isActive).length}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: theme.palette.success.main,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleIcon sx={{ color: 'white' }} />
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Inactive Listings
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  {listings.filter(listing => !listing.isActive).length}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: theme.palette.error.main,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BlockIcon sx={{ color: 'white' }} />
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Average Price
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  ${listings.length > 0
                    ? Math.round(listings.reduce((sum, listing) => sum + (listing.price || 0), 0) / listings.length).toLocaleString()
                    : 0}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: theme.palette.info.main,
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: 'white', fontWeight: 'bold' }}>$</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Listings table */}
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
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Filter button */}
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={handleOpenFilterDialog}
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  },
                  height: 40,
                }}
              >
                Filter
              </Button>
              
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
                  borderRadius: 1,
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
                    <TableCell sx={{ fontWeight: 600 }}>Date Added</TableCell>
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
                        <Tooltip title={dayjs(listing.createdAt).format('YYYY-MM-DD HH:mm')}>
                          <span>{dayjs(listing.createdAt).fromNow()}</span>
                        </Tooltip>
                      </TableCell>
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
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(listing)}
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
                          <Tooltip title={listing.isActive ? "Deactivate" : "Activate"}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleListingStatus(listing._id, listing.isActive)}
                              sx={{
                                color: listing.isActive ? theme.palette.error.main : theme.palette.success.main,
                              }}
                            >
                              {listing.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(listing)}
                              sx={{
                                color: theme.palette.error.main,
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

      {/* Listing Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
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
          <Typography variant="h6" fontWeight="bold">
            Listing Details
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedListing && (
            <Grid container spacing={3}>
              {/* Images */}
              {selectedListing.imageUrls && selectedListing.imageUrls.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                    {selectedListing.imageUrls.map((imgUrl, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={imgUrl}
                        alt={`Property image ${index + 1}`}
                        sx={{
                          width: 200,
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 1,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
              
              {/* Main details */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Property Type</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.type || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                <Typography variant="body1" gutterBottom>
                  ${typeof selectedListing.price === 'number' 
                    ? selectedListing.price.toLocaleString() 
                    : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Bedrooms</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.bedrooms || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Bathrooms</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.bathrooms || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Square Feet</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.sqft || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Neighborhood</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.neighborhood || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Move-in Date</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedListing.moveInDate 
                    ? dayjs(selectedListing.moveInDate).format('MMMM D, YYYY')
                    : 'N/A'
                  }
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1" gutterBottom>
                  <Chip
                    label={selectedListing.isActive ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      backgroundColor: selectedListing.isActive
                        ? (isDarkMode ? 'rgba(46, 204, 113, 0.2)' : 'rgba(46, 204, 113, 0.1)')
                        : (isDarkMode ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)'),
                      color: selectedListing.isActive
                        ? theme.palette.success.main
                        : theme.palette.error.main,
                      fontWeight: 600,
                    }}
                  />
                </Typography>
              </Grid>
              
              {/* Location */}
              {selectedListing.location && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                    <Typography variant="body1" gutterBottom>{selectedListing.location.address || 'N/A'}</Typography>
                  </Grid>
                  {selectedListing.location.coordinates && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Coordinates</Typography>
                      <Typography variant="body1" gutterBottom>
                        {`${selectedListing.location.coordinates[1]}, ${selectedListing.location.coordinates[0]}`}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
              
              {/* Broker info */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Broker Email</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.brokerEmail}</Typography>
              </Grid>
              
              {/* Amenities */}
              {selectedListing.amenities && selectedListing.amenities.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Amenities</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedListing.amenities.map((amenity, index) => (
                      <Chip
                        key={index}
                        label={amenity}
                        size="small"
                        sx={{
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                          color: theme.palette.text.primary,
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              )}
              
              {/* Additional details */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Parking</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.parking || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Transportation</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.transport || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Pets</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.pets || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">View</Typography>
                <Typography variant="body1" gutterBottom>{selectedListing.view || 'N/A'}</Typography>
              </Grid>
              
              {/* Created at */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Listed on</Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedListing.createdAt
                    ? dayjs(selectedListing.createdAt).format('MMMM D, YYYY [at] h:mm A')
                    : 'N/A'
                  }
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDetails}
            variant="outlined"
            sx={{
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              color: 'text.secondary',
            }}
          >
            Close
          </Button>
          {selectedListing && (
            <>
              <Button
                variant="contained"
                color={selectedListing.isActive ? "error" : "success"}
                onClick={() => handleToggleListingStatus(selectedListing._id, selectedListing.isActive)}
                startIcon={selectedListing.isActive ? <BlockIcon /> : <CheckCircleIcon />}
              >
                {selectedListing.isActive ? "Deactivate" : "Activate"} Listing
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
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
          <Typography variant="h6" fontWeight="bold" color="error.main">
            Confirm Deletion
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this listing? This action cannot be undone.
          </Typography>
          {listingToDelete && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {listingToDelete.type || 'Property'} - {listingToDelete.neighborhood || 'Unknown location'}
              </Typography>
              <Typography variant="body2">
                ${typeof listingToDelete.price === 'number' ? listingToDelete.price.toLocaleString() : 'N/A'} • {listingToDelete.bedrooms || 'N/A'} Bed
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={handleCloseFilterDialog}
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
          <Typography variant="h6" fontWeight="bold">
            Filter Listings
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel htmlFor="price-min">Min Price</InputLabel>
                <OutlinedInput
                  id="price-min"
                  name="priceMin"
                  value={filters.priceMin}
                  onChange={handleFilterChange}
                  startAdornment={<InputAdornment position="start">$</InputAdornment>}
                  label="Min Price"
                  type="number"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel htmlFor="price-max">Max Price</InputLabel>
                <OutlinedInput
                  id="price-max"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleFilterChange}
                  startAdornment={<InputAdornment position="start">$</InputAdornment>}
                  label="Max Price"
                  type="number"
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="bedrooms-label">Bedrooms</InputLabel>
                <Select
                  labelId="bedrooms-label"
                  id="bedrooms"
                  name="bedrooms"
                  value={filters.bedrooms}
                  label="Bedrooms"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Studio">Studio</MenuItem>
                  <MenuItem value="1">1 Bedroom</MenuItem>
                  <MenuItem value="2">2 Bedrooms</MenuItem>
                  <MenuItem value="3">3 Bedrooms</MenuItem>
                  <MenuItem value="4">4+ Bedrooms</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="neighborhood-label">Neighborhood</InputLabel>
                <Select
                  labelId="neighborhood-label"
                  id="neighborhood"
                  name="neighborhood"
                  value={filters.neighborhood}
                  label="Neighborhood"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {uniqueNeighborhoods.map(hood => (
                    <MenuItem key={hood} value={hood}>{hood}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Listing Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="approvalStatus"
                  name="approvalStatus"
                  value={filters.approvalStatus}
                  label="Listing Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleResetFilters} color="inherit">
            Reset
          </Button>
          <Button onClick={handleCloseFilterDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleApplyFilters} variant="contained" color="primary">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminListings;