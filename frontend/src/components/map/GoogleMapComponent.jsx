// src/components/map/EnhancedGoogleMapComponent.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { loadGoogleMapsApi } from './GoogleMapsLoader';

const EnhancedGoogleMapComponent = ({
  position = [0, 0], // [lng, lat]
  radius = 5000, // radius in meters
  zoom = 12,
  onPositionChange,
  apiKey,
  onError
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        
        // Use the centralized loader
        await loadGoogleMapsApi(apiKey);
        
        // Initialize map
        initMap();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        if (onError) onError(error);
        setIsLoading(false);
      }
    };
    
    initializeMap();
    
    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        // Clear any listeners when component unmounts
        window.google?.maps?.event?.clearInstanceListeners(mapInstanceRef.current);
      }
      if (markerRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(markerRef.current);
      }
    };
  }, [apiKey, onError]);
  
  // Initialize map
  const initMap = useCallback(() => {
    try {
      if (!mapRef.current || !window.google || !window.google.maps) return;
      
      // Validate position values and use defaults if invalid
      const lat = typeof position[1] === 'number' && !isNaN(position[1]) ? position[1] : 0;
      const lng = typeof position[0] === 'number' && !isNaN(position[0]) ? position[0] : 0;
      
      // Create map instance
      const mapOptions = {
        center: { lat, lng },
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      };
      
      // Create a new map instance
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
      
      // Create marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });
      
      // Create circle
      circleRef.current = new window.google.maps.Circle({
        map: mapInstanceRef.current,
        center: { lat, lng },
        radius: radius,
        strokeColor: '#00b386',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00b386',
        fillOpacity: 0.15
      });
      
      // Add marker drag event
      window.google.maps.event.addListener(markerRef.current, 'dragend', (event) => {
        const newPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        // Update circle position
        if (circleRef.current) {
          circleRef.current.setCenter(newPosition);
        }
        
        // Notify parent component
        if (onPositionChange) {
          onPositionChange(newPosition);
        }
      });
      
      // Add map click event
      window.google.maps.event.addListener(mapInstanceRef.current, 'click', (event) => {
        const newPosition = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition(newPosition);
        }
        
        // Update circle position
        if (circleRef.current) {
          circleRef.current.setCenter(newPosition);
        }
        
        // Notify parent component
        if (onPositionChange) {
          onPositionChange(newPosition);
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      if (onError) onError(error);
    }
  }, [position, zoom, radius, onPositionChange, onError]);
  
  // Update map when position or radius changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;
    
    try {
      // Validate position values and use defaults if invalid
      const lat = typeof position[1] === 'number' && !isNaN(position[1]) ? position[1] : 0;
      const lng = typeof position[0] === 'number' && !isNaN(position[0]) ? position[0] : 0;
      
      const newPosition = { lat, lng };
      
      // Only update map center and zoom if position has changed significantly
      if (Math.abs(lat) > 0.001 || Math.abs(lng) > 0.001) {
        // Set center
        mapInstanceRef.current.setCenter(newPosition);
        
        // Adjust zoom based on radius to show appropriate area
        // Larger radius should result in more zoomed out view
        if (radius > 10000) { // > 10km
          mapInstanceRef.current.setZoom(10);
        } else if (radius > 5000) { // 5-10km
          mapInstanceRef.current.setZoom(11);
        } else if (radius > 2000) { // 2-5km
          mapInstanceRef.current.setZoom(12);
        } else if (radius > 1000) { // 1-2km
          mapInstanceRef.current.setZoom(13);
        } else { // < 1km
          mapInstanceRef.current.setZoom(14);
        }
      }
      
      // Update marker position
      markerRef.current.setPosition(newPosition);
      
      // Update circle position and radius
      circleRef.current.setCenter(newPosition);
      circleRef.current.setRadius(radius);
    } catch (error) {
      console.error('Error updating map:', error);
      if (onError) onError(error);
    }
  }, [position, radius, onError]);
  
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        minHeight: 300,
        bgcolor: 'grey.200'
      }}
    >
      {isLoading && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 2
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box 
        ref={mapRef} 
        sx={{ 
          width: '100%', 
          height: '100%',
          minHeight: 300
        }} 
      />
    </Box>
  );
};

export default EnhancedGoogleMapComponent;