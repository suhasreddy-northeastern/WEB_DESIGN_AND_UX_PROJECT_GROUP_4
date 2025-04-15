// src/components/map/EnhancedLocationPreferenceComponent.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  InputAdornment,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  Autocomplete
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EnhancedGoogleMapComponent from './GoogleMapComponent';
import { loadGoogleMapsApi, geocodeAddress as utilGeocodeAddress, reverseGeocode as utilReverseGeocode } from './GoogleMapsLoader';

// Default map configurations
const DEFAULT_CENTER = [0, 0]; // [longitude, latitude]
const DEFAULT_RADIUS = 5; // km

const EnhancedLocationPreferenceComponent = ({ 
  value = { center: DEFAULT_CENTER, radius: DEFAULT_RADIUS, address: '' },
  onChange,
  googleMapsApiKey
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [localValue, setLocalValue] = useState(value);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const sessionTokenRef = useRef(null);
  
  // Initialize Google Places services
  useEffect(() => {
    const initGooglePlaces = async () => {
      try {
        // Load Google Maps API if needed
        await loadGoogleMapsApi(googleMapsApiKey);
        
        // Check if API and Places library are loaded
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error('Google Maps Places library not loaded correctly');
          return;
        }
        
        // Create a session token for autocomplete
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        
        // Create autocomplete service
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        
        // Create places service (needs a map element to initialize)
        const mapDiv = document.createElement('div');
        const tempMap = new window.google.maps.Map(mapDiv);
        placesServiceRef.current = new window.google.maps.places.PlacesService(tempMap);
      } catch (error) {
        console.error('Error initializing Google Places services:', error);
        setGeocodingError('Error initializing Google Maps services. Please refresh and try again.');
      }
    };
    
    initGooglePlaces();
  }, [googleMapsApiKey]);
  
  // Sync with parent component's value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Update local state and call onChange
  const updateValue = useCallback((newValue) => {
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);
  
  // Reverse geocode to get address from coordinates
  const handleReverseGeocode = useCallback(async (lat, lng) => {
    try {
      // Skip if coordinates are default values (0,0)
      if (lat === 0 && lng === 0) return;
      
      // Use the utility function or Google Maps Geocoder API
      try {
        const results = await utilReverseGeocode(lat, lng);
        const address = results[0].formatted_address;
        updateValue({
          ...localValue,
          address
        });
      } catch (geoError) {
        // Fallback to direct Geocoder API if utility fails
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const address = results[0].formatted_address;
              updateValue({
                ...localValue,
                address
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Don't show UI error for reverse geocoding failures
    }
  }, [localValue, updateValue]);
  
  // Handle position change from map
  const handlePositionChange = useCallback((position) => {
    const newValue = {
      ...localValue,
      center: [position.lng, position.lat]
    };
    updateValue(newValue);
    
    // Reverse geocode to get address
    handleReverseGeocode(position.lat, position.lng);
  }, [localValue, updateValue, handleReverseGeocode]);
  
  // Handle address input change
  const handleAddressChange = useCallback((e, newValue) => {
    if (typeof newValue === 'string') {
      // User is typing - update address field only
      updateValue({
        ...localValue,
        address: newValue
      });
      
      // Fetch address suggestions
      fetchAddressSuggestions(newValue);
    } else if (newValue && newValue.description) {
      // User selected an option - update address and fetch place details
      updateValue({
        ...localValue,
        address: newValue.description
      });
      
      getPlaceDetails(newValue.place_id);
    }
  }, [localValue, updateValue]);
  
  // Fetch address suggestions
  const fetchAddressSuggestions = useCallback((input) => {
    if (!input || input.length < 3 || !autocompleteServiceRef.current) return;
    
    setIsLoadingSuggestions(true);
    
    const request = {
      input,
      sessionToken: sessionTokenRef.current,
      types: ['address'], // Use only 'address' type to avoid the "geocode cannot be mixed with other types" error
      componentRestrictions: { country: 'us' } // Restrict to US - modify as needed
    };
    
    autocompleteServiceRef.current.getPlacePredictions(
      request,
      (predictions, status) => {
        setIsLoadingSuggestions(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setAddressSuggestions(predictions);
        } else {
          setAddressSuggestions([]);
          
          // Log specific error for debugging
          if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            console.log('Place autocomplete error status:', status);
          }
        }
      }
    );
  }, []);
  
  // Get place details
  const getPlaceDetails = useCallback((placeId) => {
    if (!placeId || !placesServiceRef.current) return;
    
    setIsGeocoding(true);
    
    const request = {
      placeId,
      fields: ['geometry', 'formatted_address']
    };
    
    placesServiceRef.current.getDetails(
      request,
      (place, status) => {
        setIsGeocoding(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry) {
          const { lat, lng } = place.geometry.location;
          
          updateValue({
            ...localValue,
            center: [lng(), lat()],
            address: place.formatted_address
          });
          
          // Reset session token after successful place selection
          sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        } else {
          setGeocodingError('Error retrieving place details. Please try again or select location manually.');
        }
      }
    );
  }, [localValue, updateValue]);
  
  // Handle radius change
  const handleRadiusChange = useCallback((e, newValue) => {
    updateValue({
      ...localValue,
      radius: newValue
    });
  }, [localValue, updateValue]);
  
  // Manual geocode address for search button
  const handleGeocodeAddress = useCallback(async () => {
    try {
      setGeocodingError('');
      setIsGeocoding(true);
      const address = localValue.address;
      
      if (!address) {
        setGeocodingError('Please enter an address');
        setIsGeocoding(false);
        return;
      }

      // Use the utility function for geocoding
      try {
        const results = await utilGeocodeAddress(address);
        const location = results[0].geometry.location;
        
        updateValue({
          ...localValue,
          center: [location.lng(), location.lat()]
        });
      } catch (geoError) {
        // Fallback to direct Geocoder API if utility fails
        if (window.google && window.google.maps && window.google.maps.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          
          geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              updateValue({
                ...localValue,
                center: [location.lng(), location.lat()]
              });
            } else {
              let errorMessage = 'Address not found. Try a different address or select location on the map.';
              if (status === 'ZERO_RESULTS') {
                errorMessage = 'No results found for this address. Please try a different address.';
              } else if (status === 'OVER_QUERY_LIMIT') {
                errorMessage = 'Too many requests. Please try again later.';
              }
              setGeocodingError(errorMessage);
            }
          });
        } else {
          setGeocodingError('Google Maps API not available. Please refresh the page and try again.');
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setGeocodingError('Error finding address. Please try again or select location manually.');
    } finally {
      setIsGeocoding(false);
    }
  }, [localValue, updateValue]);
  
  // Handle map load error
  const handleMapError = useCallback((error) => {
    console.error('Google Maps error:', error);
    setGeocodingError('Error loading Google Maps. Please check your API key or try again later.');
  }, []);
  
  return (
    <Paper 
      elevation={isDarkMode ? 1 : 2} 
      sx={{ 
        p: 3, 
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
      }}
    >
      <Typography variant="h6" fontWeight={600} gutterBottom>
        <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Location Preference
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Search for a location or click on the map. Adjust the radius to set how far you're willing to commute.
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={8}>
          <Autocomplete
            freeSolo
            options={addressSuggestions}
            getOptionLabel={(option) => {
              // Handle both string and prediction object
              return typeof option === 'string' ? option : option.description;
            }}
            loading={isLoadingSuggestions}
            inputValue={localValue.address || ''}
            onInputChange={handleAddressChange}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label="Address"
                placeholder="Enter your preferred location"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                      <InputAdornment position="end">
                        <Button 
                          onClick={handleGeocodeAddress}
                          disabled={isGeocoding}
                          sx={{ 
                            minWidth: 'auto',
                            color: theme.palette.primary.main
                          }}
                        >
                          {isGeocoding ? (
                            <CircularProgress size={20} />
                          ) : (
                            <SearchIcon />
                          )}
                        </Button>
                      </InputAdornment>
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ px: 2 }}>
            <Typography id="radius-slider" gutterBottom>
              Radius: {localValue.radius} km
            </Typography>
            <Slider
              value={localValue.radius}
              onChange={handleRadiusChange}
              aria-labelledby="radius-slider"
              min={1}
              max={20}
              marks={[
                { value: 1, label: '1 km' },
                { value: 10, label: '10 km' },
                { value: 20, label: '20 km' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value} km`}
            />
          </Box>
        </Grid>
      </Grid>
      
      {geocodingError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {geocodingError}
        </Alert>
      )}
      
      <Box sx={{ height: 300, mb: 2, borderRadius: 1, overflow: 'hidden' }}>
        <EnhancedGoogleMapComponent
          position={localValue.center}
          radius={localValue.radius * 1000} // Convert km to meters
          onPositionChange={handlePositionChange}
          apiKey={googleMapsApiKey}
          zoom={12}
          onError={handleMapError}
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        Selected coordinates: {localValue.center[1]?.toFixed(6) || '0.000000'}, {localValue.center[0]?.toFixed(6) || '0.000000'}
      </Typography>
    </Paper>
  );
};

export default EnhancedLocationPreferenceComponent;