import React, { useRef, useState, useEffect } from "react";
import { TextField, InputAdornment, CircularProgress } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
    loadGoogleMapsApi,
    geocodeAddress,
    reverseGeocode,
  } from "../../map/GoogleMapsLoader";

const PlacesAutocomplete = ({ onPlaceSelected, apiKey, initialValue = "" }) => {
  const autocompleteInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState(initialValue);

  // Initialize Google Maps and Places API
  useEffect(() => {
    const initializePlaces = async () => {
      try {
        setIsLoading(true);

        // Use centralized loader with Places library
        await loadGoogleMapsApi(apiKey, ["places"]);

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Google Places API:", error);
        setIsLoading(false);
      }
    };

    initializePlaces();
  }, [apiKey]);

  // Initialize Places Autocomplete after API is loaded
  useEffect(() => {
    if (
      isLoading ||
      !autocompleteInputRef.current ||
      !window.google ||
      !window.google.maps ||
      !window.google.maps.places
    )
      return;

    try {
      // Initialize the Google Places Autocomplete
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "us" }, // Limit to a specific country (optional)
          fields: ["address_components", "formatted_address", "geometry"],
        }
      );

      // Listen for place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }

        // Pass the selected place back to the parent component
        onPlaceSelected({
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });

        // Update the input value
        setInputValue(place.formatted_address);
      });

      return () => {
        // Cleanup
        window.google.maps.event.clearInstanceListeners(autocomplete);
      };
    } catch (error) {
      console.error("Error initializing Places Autocomplete:", error);
    }
  }, [isLoading, onPlaceSelected]);

  // Update input value when initialValue changes
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <TextField
      fullWidth
      label="Address"
      placeholder="Start typing to search for an address"
      inputRef={autocompleteInputRef}
      variant="outlined"
      value={inputValue}
      onChange={handleInputChange}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <LocationOnIcon color="action" />
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default PlacesAutocomplete;
