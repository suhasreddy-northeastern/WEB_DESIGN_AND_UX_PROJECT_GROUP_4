import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Paper, Grid, Button, TextField, InputAdornment, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import ViewListIcon from '@mui/icons-material/ViewList';
import ApartmentMapView from '../../components/map/ApartmentMapView';
import axios from 'axios';

const ApartmentMapPage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapError, setMapError] = useState('');
  
  // Get user's current location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setError('');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to retrieve your location. Please allow location access or enter an address.');
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsLoadingLocation(false);
    }
  };
  
  // Search for address using geocoding
  const searchForAddress = async () => {
    if (!searchAddress) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      );
      
      if (response.data.status === 'OK') {
        const location = response.data.results[0].geometry.location;
        setUserLocation({
          lat: location.lat,
          lng: location.lng
        });
      } else {
        const errorMessage = response.data.error_message || 'Address not found. Please try a different address.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Error searching for address. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle address input change
  const handleAddressChange = (e) => {
    setSearchAddress(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    searchForAddress();
  };
  
  // Handle map errors
  const handleMapError = useCallback((error) => {
    console.error('Google Maps error:', error);
    setMapError('Error loading Google Maps. Please check your internet connection or try again later.');
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          <MapIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Apartment Map View
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          View all available apartments on the map. Use your current location or search for a specific address to see apartments nearby.
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Search address"
                variant="outlined"
                value={searchAddress}
                onChange={handleAddressChange}
                placeholder="Enter city, neighborhood, or address"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: isSearching && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  )
                }}
              />
            </form>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<LocationOnIcon />}
                onClick={getUserLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? 'Getting location...' : 'Use my location'}
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={searchForAddress}
                disabled={!searchAddress || isSearching}
                type="submit"
              >
                Search
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {mapError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {mapError}
          </Alert>
        )}
      </Paper>
      
      {userLocation && (
        <Box mb={2}>
          <Alert severity="info" icon={<LocationOnIcon />}>
            Showing apartments near {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </Alert>
        </Box>
      )}
      
      <ApartmentMapView 
        userLocation={userLocation} 
        onError={handleMapError}
      />
      
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="outlined"
          startIcon={<ViewListIcon />}
          href="/matches"
          sx={{ mx: 1 }}
        >
          View as List
        </Button>
        {!userLocation && (
          <Button
            variant="contained"
            startIcon={<LocationOnIcon />}
            onClick={getUserLocation}
            disabled={isLoadingLocation}
            sx={{ mx: 1 }}
          >
            Enable Location
          </Button>
        )}
      </Box>
    </Container>
  );
};

export default ApartmentMapPage;