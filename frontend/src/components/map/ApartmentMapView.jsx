import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, CircularProgress, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import axios from 'axios';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import HomeIcon from '@mui/icons-material/Home';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LayersIcon from '@mui/icons-material/Layers';

// Predefined marker URLs to avoid direct use of google object
const MARKER_ICONS = {
  green: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  yellow: 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  orange: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  red: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  blue: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
};

// Libraries to load
const libraries = ['places'];

const MapContainer = styled(Box)(({ theme }) => ({
  height: 500,
  width: '100%',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[4]
}));

const MapControls = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2]
}));

const InfoWindowContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  maxWidth: 200
}));

/**
 * Component to display apartments on a map
 */
const ApartmentMapView = ({ userLocation = null, initialCenter = { lat: 40.7128, lng: -74.0060 }, onError }) => {
  const [apartments, setApartments] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [zoom, setZoom] = useState(12);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState('roadmap');
  const [center, setCenter] = useState(initialCenter);
  const [fetchError, setFetchError] = useState(null);
  
  // Load Google Maps API with useLoadScript hook
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });
  
  // Notify parent component about errors
  useEffect(() => {
    if (loadError && onError) {
      onError(loadError);
    }
  }, [loadError, onError]);
  
  // Fetch apartments
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        
        // If user location is provided, get nearby apartments
        let response;
        if (userLocation && userLocation.lat && userLocation.lng) {
          response = await axios.get(`http://localhost:4000/api/apartments/nearby`, {
            params: {
              latitude: userLocation.lat,
              longitude: userLocation.lng,
              radius: 10 // 10km radius
            }
          });
          
          // Set center to user location
          setCenter({ lat: userLocation.lat, lng: userLocation.lng });
        } else {
          // Otherwise get all apartments
          response = await axios.get('http://localhost:4000/api/apartments');
        }
        
        setApartments(response.data);
      } catch (error) {
        console.error('Error fetching apartments:', error);
        setFetchError('Failed to load apartments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApartments();
  }, [userLocation]);
  
  // Set map ref when loaded
  const onLoad = useCallback((map) => {
    setMapRef(map);
  }, []);
  
  // Clear map ref when unmounted
  const onUnmount = useCallback(() => {
    setMapRef(null);
  }, []);
  
  // Handle marker click
  const handleMarkerClick = (apartment) => {
    setSelectedApartment(apartment);
  };
  
  // Zoom in
  const handleZoomIn = () => {
    if (mapRef && zoom < 20) {
      const newZoom = zoom + 1;
      mapRef.setZoom(newZoom);
      setZoom(newZoom);
    }
  };
  
  // Zoom out
  const handleZoomOut = () => {
    if (mapRef && zoom > 1) {
      const newZoom = zoom - 1;
      mapRef.setZoom(newZoom);
      setZoom(newZoom);
    }
  };
  
  // Toggle map type
  const handleToggleMapType = () => {
    const types = ['roadmap', 'satellite', 'hybrid', 'terrain'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };
  
  // Center on user location
  const handleCenterOnUser = () => {
    if (userLocation && mapRef) {
      mapRef.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      setCenter({ lat: userLocation.lat, lng: userLocation.lng });
    }
  };
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Get marker color based on price
  const getMarkerIcon = (price) => {
    if (!price) return MARKER_ICONS.blue; // Default for missing price
    if (price < 1000) return MARKER_ICONS.green;
    if (price < 2000) return MARKER_ICONS.yellow;
    if (price < 3000) return MARKER_ICONS.orange;
    return MARKER_ICONS.red;
  };
  
  // Create a custom marker for user location
  const createUserLocationMarker = () => {
    return {
      fillColor: '#4285F4',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8,
      path: 0  // Using 0 as a simple circle path instead of SymbolPath.CIRCLE
    };
  };
  
  // Handle rendering error states
  if (loadError) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={500}>
        <Typography color="error">
          Error loading Google Maps. Please check your API key or try again later.
        </Typography>
      </Box>
    );
  }
  
  if (!isLoaded) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={500}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <MapContainer>
      {loading && (
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          zIndex={1} 
          sx={{ transform: 'translate(-50%, -50%)' }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {fetchError && (
        <Box 
          position="absolute" 
          top="50%" 
          left="50%" 
          zIndex={1} 
          sx={{ 
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography color="error">{fetchError}</Typography>
        </Box>
      )}
      
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: mapType,
          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={createUserLocationMarker()}
            zIndex={1000}
          />
        )}
        
        {/* Apartment markers */}
        {apartments.map(apartment => {
          // Skip apartments without valid coordinates
          if (!apartment.location || 
              !apartment.location.coordinates || 
              !apartment.location.coordinates[0] || 
              !apartment.location.coordinates[1]) {
            return null;
          }
          
          // Convert from [longitude, latitude] to { lat, lng }
          const position = {
            lat: apartment.location.coordinates[1],
            lng: apartment.location.coordinates[0]
          };
          
          return (
            <Marker
              key={apartment._id}
              position={position}
              onClick={() => handleMarkerClick(apartment)}
              icon={{
                url: getMarkerIcon(apartment.price)
              }}
            />
          );
        })}
        
        {/* Info window for selected apartment */}
        {selectedApartment && selectedApartment.location && selectedApartment.location.coordinates && (
          <InfoWindow
            position={{
              lat: selectedApartment.location.coordinates[1],
              lng: selectedApartment.location.coordinates[0]
            }}
            onCloseClick={() => setSelectedApartment(null)}
          >
            <InfoWindowContent>
              <Typography variant="subtitle2" gutterBottom>
                {selectedApartment.bedrooms || 'Studio'} {selectedApartment.bedrooms && 'BR'} in {selectedApartment.neighborhood || 'Unknown Area'}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedApartment.location.address || 'Address not available'}
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                {formatPrice(selectedApartment.price)}
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                {selectedApartment.amenities && selectedApartment.amenities.slice(0, 3).map((amenity, index) => (
                  <Chip key={index} label={amenity} size="small" variant="outlined" />
                ))}
                {selectedApartment.amenities && selectedApartment.amenities.length > 3 && (
                  <Chip label={`+${selectedApartment.amenities.length - 3}`} size="small" />
                )}
              </Box>
            </InfoWindowContent>
          </InfoWindow>
        )}
      </GoogleMap>
      
      {/* Map controls */}
      <MapControls>
        <Tooltip title="Zoom in">
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom out">
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Change map type">
          <IconButton size="small" onClick={handleToggleMapType}>
            <LayersIcon />
          </IconButton>
        </Tooltip>
        {userLocation && (
          <Tooltip title="Center on your location">
            <IconButton size="small" onClick={handleCenterOnUser}>
              <MyLocationIcon />
            </IconButton>
          </Tooltip>
        )}
      </MapControls>
    </MapContainer>
  );
};

export default ApartmentMapView;