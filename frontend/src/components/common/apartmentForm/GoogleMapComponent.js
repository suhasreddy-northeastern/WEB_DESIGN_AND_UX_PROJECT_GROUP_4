import React, { useRef, useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { loadGoogleMapsApi } from "../../map/GoogleMapsLoader";

const GoogleMapComponent = ({ position, onPositionChange, apiKey }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);

        // Use centralized loader
        await loadGoogleMapsApi(apiKey);

        if (!mapRef.current || !window.google || !window.google.maps) return;

        // Validate position values and use defaults if invalid
        const lat =
          typeof position[1] === "number" && !isNaN(position[1])
            ? position[1]
            : 40.7128; // Default to New York
        const lng =
          typeof position[0] === "number" && !isNaN(position[0])
            ? position[0]
            : -74.006;

        // Create map instance
        const mapOptions = {
          center: { lat, lng },
          zoom: 14,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        };

        // Create a new map instance
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions
        );

        // Create marker
        markerRef.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: mapInstanceRef.current,
          draggable: true,
        });

        // Add marker drag event
        window.google.maps.event.addListener(
          markerRef.current,
          "dragend",
          (event) => {
            const newPosition = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            };

            onPositionChange(newPosition);
          }
        );

        // Add map click event
        window.google.maps.event.addListener(
          mapInstanceRef.current,
          "click",
          (event) => {
            const newPosition = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            };

            // Update marker position
            if (markerRef.current) {
              markerRef.current.setPosition(newPosition);
            }

            onPositionChange(newPosition);
          }
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(
          mapInstanceRef.current
        );
      }
      if (markerRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(markerRef.current);
      }
    };
  }, [apiKey, onPositionChange]);

  // Update map when position changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !window.google) return;

    try {
      // Validate position values and use defaults if invalid
      const lat =
        typeof position[1] === "number" && !isNaN(position[1])
          ? position[1]
          : 40.7128;
      const lng =
        typeof position[0] === "number" && !isNaN(position[0])
          ? position[0]
          : -74.006;

      const newPosition = { lat, lng };

      // Only update if position has changed significantly
      if (Math.abs(lat) > 0.001 || Math.abs(lng) > 0.001) {
        mapInstanceRef.current.setCenter(newPosition);
      }

      // Update marker position
      markerRef.current.setPosition(newPosition);
    } catch (error) {
      console.error("Error updating map:", error);
    }
  }, [position]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 2,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <Box
        ref={mapRef}
        sx={{
          width: "100%",
          height: "100%",
        }}
      />
    </Box>
  );
};

export default GoogleMapComponent;