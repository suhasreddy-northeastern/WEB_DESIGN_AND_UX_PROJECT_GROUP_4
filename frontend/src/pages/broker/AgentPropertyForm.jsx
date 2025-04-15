import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  FormGroup,
  Checkbox,
  Button,
  TextField,
  useTheme,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
import {
  loadGoogleMapsApi,
  geocodeAddress,
  reverseGeocode,
} from "../../components/map/GoogleMapsLoader";

// Note: Add the following to your package.json:
// "@react-google-maps/api": "^2.19.2"

const FormContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 1000,
  margin: "auto",
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    theme.palette.mode === "light"
      ? "0 4px 20px rgba(0,0,0,0.05)"
      : "0 4px 20px rgba(0,0,0,0.2)",
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.05)"
      : "none",
}));

const MapContainer = styled(Box)(({ theme }) => ({
  height: 400,
  width: "100%",
  borderRadius: 8,
  overflow: "hidden",
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(0, 0, 0, 0.1)",
}));

const amenitiesList = [
  "Gym",
  "Swimming Pool",
  "Parking Space",
  "Pet-Friendly",
  "Balcony",
  "In-Unit Laundry",
];

const fieldGroups = [
  {
    title: (
      <>
        <HomeIcon sx={{ mr: 1 }} /> Basic Info
      </>
    ),
    fields: [
      { name: "type", label: "Listing Type", options: ["Rent", "Buy"] },
      { name: "bedrooms", label: "Bedrooms", options: ["1", "2", "3", "4+"] },
      { name: "price", label: "Exact Price (USD)", type: "number" },
      { name: "moveInDate", label: "Move-in Date", type: "date" },
    ],
  },
  {
    title: (
      <>
        <LocationOnIcon sx={{ mr: 1 }} /> Location & Design
      </>
    ),
    fields: [
      {
        name: "neighborhood",
        label: "Neighborhood",
        options: [
          "Quiet and Residential",
          "Busy Urban Area",
          "Close to Entertainment & Dining",
        ],
      },
      {
        name: "style",
        label: "Style",
        options: ["Modern", "Traditional", "Loft", "High-rise"],
      },
      {
        name: "floor",
        label: "Floor Level",
        options: ["Ground Floor", "Mid-level Floor", "Top Floor"],
      },
      {
        name: "view",
        label: "View",
        options: ["City View", "Park View", "Ocean View", "No Specific View"],
      },
    ],
  },
  {
    title: (
      <>
        <BuildIcon sx={{ mr: 1 }} /> Features
      </>
    ),
    fields: [
      {
        name: "sqft",
        label: "Exact Square Footage (e.g., 1150)",
        type: "number",
      },
      { name: "floor", label: "Floor Level (e.g., 3 or Ground)", type: "text" },
      { name: "parking", label: "Parking", options: ["Yes", "No"] },
      {
        name: "transport",
        label: "Public Transport Access",
        options: ["Close", "Average", "Far"],
      },
      {
        name: "safety",
        label: "Safety Level",
        options: ["High", "Moderate", "Basic"],
      },
    ],
  },
  {
    title: (
      <>
        <PeopleIcon sx={{ mr: 1 }} /> Tenant Info
      </>
    ),
    fields: [
      {
        name: "pets",
        label: "Pet Policy",
        options: ["Allowed", "Not Allowed"],
      },
      {
        name: "leaseCapacity",
        label: "Lease Capacity",
        options: ["1", "2", "3", "4+"],
      },
      { name: "roommates", label: "Roommate-Friendly", options: ["Yes", "No"] },
    ],
  },
];

// Google Maps component without using @react-google-maps/api
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

// Places Autocomplete component
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

const AgentApartmentForm = () => {
  const theme = useTheme();
  const primaryColor = "#00b386";
  const isDarkMode = theme.palette.mode === "dark";

  // Replace with your actual Google Maps API key
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const [formData, setFormData] = useState({
    brokerEmail: "",
    amenities: [],
    images: [],
    imageUrls: [],
    location: {
      coordinates: [0, 0], // Default [longitude, latitude]
      address: "",
    },
  });

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  // Initialize Google Maps API on component mount
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        await loadGoogleMapsApi(googleMapsApiKey, ["places"]);
      } catch (error) {
        console.error("Error initializing Google Maps API:", error);
        setGeocodingError(
          "Failed to load Google Maps API. Please refresh the page and try again."
        );
      }
    };

    initGoogleMaps();
  }, [googleMapsApiKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, name]
        : prev.amenities.filter((item) => item !== name),
    }));
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("images", files[i]);
    }

    try {
      setUploadStatus('uploading');
      console.log("Starting upload of", files.length, "files");

      const res = await axios.post(
        "http://localhost:4000/api/apartments/upload-images",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      console.log("Upload successful, response:", res.data);
      console.log("Image URLs returned:", res.data.imageUrls);
      
      setUploadStatus('success');
      
      // Process the URLs to ensure they have the correct format
      const processedUrls = res.data.imageUrls.map(url => {
        // Ensure URL has the correct format for loading
        if (url.startsWith('http')) {
          return url;
        } else {
          // Make sure the URL starts with a single slash
          return `http://localhost:4000${url.startsWith('/') ? url : `/${url}`}`;
        }
      });

      setFormData((prev) => ({
        ...prev,
        imageUrls: processedUrls,
      }));
    } catch (err) {
      setUploadStatus('error');
      console.error("Upload error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      alert(
        `❌ Failed to upload images: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        if (uploadStatus === 'success') {
          setUploadStatus('');
        }
      }, 3000);
    }
  };

  // Handle map marker position change
  const handlePositionChange = useCallback((position) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [position.lng, position.lat],
      },
    }));

    // Reverse geocode to get address from coordinates
    handleReverseGeocode(position.lat, position.lng);
  }, []);

  // Reverse geocode using our utility
  const handleReverseGeocode = useCallback(async (lat, lng) => {
    try {
      setIsGeocoding(true);
      const results = await reverseGeocode(lat, lng);
      const address = results[0].formatted_address;

      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          address,
        },
      }));

      setGeocodingError("");
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      // Don't show error for reverse geocoding
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Handle place selection from Places Autocomplete
  const handlePlaceSelected = useCallback((place) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        coordinates: [place.lng, place.lat],
        address: place.address,
      },
    }));

    // Clear any previous errors
    setGeocodingError("");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate location
    if (
      !formData.location.coordinates[0] &&
      !formData.location.coordinates[1]
    ) {
      setGeocodingError(
        "Please select a location on the map before submitting."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const submission = { ...formData };
      delete submission.images;

      // Log what we're sending to the server
      console.log("Submitting apartment data:", submission);

      const response = await axios.post("http://localhost:4000/api/apartments", submission, {
        withCredentials: true,
      });

      console.log("Apartment created successfully:", response.data);
      
      alert("✅ Apartment listed successfully!");

      // Clear form or redirect
      setFormData({
        amenities: [],
        images: [],
        imageUrls: [],
        location: {
          coordinates: [0, 0],
          address: "",
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
      
      // Log detailed error information
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error status:", err.response.status);
        console.error("Error headers:", err.response.headers);
      }
      
      alert(
        `❌ Failed to submit: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ my: 10, px: 2 }}>
      <FormContainer elevation={isDarkMode ? 2 : 3}>
        <Typography
          variant="h5"
          fontWeight={600}
          color={primaryColor}
          textAlign="center"
          gutterBottom
        >
          List a New Apartment
        </Typography>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {fieldGroups.map((group, idx) => (
            <Box mt={4} key={idx}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                gutterBottom
                color="text.primary"
              >
                {group.title}
              </Typography>
              <Grid container spacing={3}>
                {group.fields.map((field) => (
                  <Grid item xs={12} sm={6} key={field.name}>
                    {field.options ? (
                      <FormControl component="fieldset" fullWidth>
                        <FormLabel
                          component="legend"
                          sx={{ fontSize: 14, mb: 1, color: "text.secondary" }}
                        >
                          {field.label}
                        </FormLabel>
                        <RadioGroup
                          row
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                        >
                          {field.options.map((opt) => (
                            <FormControlLabel
                              key={opt}
                              value={opt}
                              control={
                                <Radio
                                  sx={{
                                    color: isDarkMode
                                      ? "rgba(0, 179, 134, 0.7)"
                                      : primaryColor,
                                    "&.Mui-checked": { color: primaryColor },
                                  }}
                                />
                              }
                              label={opt}
                              sx={{ color: "text.primary" }}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        name={field.name}
                        label={field.label}
                        type={field.type || "text"}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        InputLabelProps={
                          field.type === "date" ? { shrink: true } : {}
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.15)"
                                : "rgba(0, 0, 0, 0.23)",
                            },
                            "&:hover fieldset": {
                              borderColor: isDarkMode
                                ? "rgba(255, 255, 255, 0.25)"
                                : "rgba(0, 0, 0, 0.33)",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: primaryColor,
                            },
                          },
                        }}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          <Box mt={5}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              color="text.primary"
            >
              <PlaceIcon sx={{ mr: 1 }} /> Location
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Start typing to search for an address, or click directly on the
              map to set the location.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                {/* Updated PlacesAutocomplete component */}
                <PlacesAutocomplete
                  onPlaceSelected={handlePlaceSelected}
                  apiKey={googleMapsApiKey}
                  initialValue={formData.location.address}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap={1}
                >
                  <TextField
                    label="Longitude"
                    type="number"
                    InputProps={{ readOnly: true }}
                    value={formData.location.coordinates[0]}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Latitude"
                    type="number"
                    InputProps={{ readOnly: true }}
                    value={formData.location.coordinates[1]}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Grid>
            </Grid>

            {geocodingError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {geocodingError}
              </Alert>
            )}

            <MapContainer>
              <GoogleMapComponent
                position={formData.location.coordinates}
                onPositionChange={handlePositionChange}
                apiKey={googleMapsApiKey}
              />
            </MapContainer>
          </Box>

          <Box mt={5}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              color="text.primary"
            >
              Amenities
            </Typography>
            <FormGroup row>
              {amenitiesList.map((name) => (
                <FormControlLabel
                  key={name}
                  control={
                    <Checkbox
                      checked={formData.amenities.includes(name)}
                      onChange={handleCheckboxChange}
                      name={name}
                      sx={{
                        color: isDarkMode
                          ? "rgba(0, 179, 134, 0.7)"
                          : primaryColor,
                        "&.Mui-checked": { color: primaryColor },
                      }}
                    />
                  }
                  label={name}
                  sx={{ color: "text.primary" }}
                />
              ))}
            </FormGroup>
          </Box>

          <Box mt={4}>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              color="text.primary"
            >
              <PhotoCameraIcon sx={{ mr: 1 }} /> Upload Apartment Images
            </Typography>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{
                marginTop: 8,
                color: theme.palette.text.primary,
              }}
            />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Uploading: {uploadProgress}%
                </Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 4, 
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mt: 1
                  }}
                >
                  <Box 
                    sx={{ 
                      width: `${uploadProgress}%`, 
                      height: '100%',
                      backgroundColor: primaryColor,
                      transition: 'width 0.3s ease-in-out'
                    }}
                  />
                </Box>
              </Box>
            )}
            
            {uploadStatus === 'success' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Images uploaded successfully
              </Alert>
            )}
            
            {uploadStatus === 'error' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to upload images. Please try again.
              </Alert>
            )}
            
            {formData.imageUrls.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formData.imageUrls.length} images uploaded
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formData.imageUrls.map((url, index) => {
                    // Log the URL for debugging
                    console.log(`Image URL ${index}:`, url);

                    return (
                      <Box
                        key={index}
                        component="img"
                        src={url}
                        alt={`Apartment ${index + 1}`}
                        sx={{
                          width: 100, 
                          height: 100,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid #eee",
                        }}
                        onError={(e) => {
                          console.error(`Error loading image: ${url}`);
                          e.target.src = "https://placehold.co/100x100?text=Error";
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          <Box mt={5}>
            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={isSubmitting}
              endIcon={
                isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowForwardIcon />
                )
              }
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: primaryColor,
                "&:hover": { backgroundColor: "#009e75" },
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Apartment Listing"}
            </Button>
          </Box>
        </form>
      </FormContainer>
    </Box>
  );
};

export default AgentApartmentForm;