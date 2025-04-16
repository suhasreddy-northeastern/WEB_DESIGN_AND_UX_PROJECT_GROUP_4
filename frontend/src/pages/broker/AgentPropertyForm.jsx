// AgentApartmentForm.js
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Snackbar,
  Alert,
  Slide,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import {
  loadGoogleMapsApi,
  geocodeAddress,
  reverseGeocode,
} from "../../components/map/GoogleMapsLoader";

// Import components
import FormGroups from "../../components/common/apartmentForm/FormGroups";
import AmenitiesSection from "../../components/common/apartmentForm/AmenitiesSection";
import LocationSection from "../../components/common/apartmentForm/LocationSection";
import ImageUploadSection from "../../components/common/apartmentForm/ImageUploadSection";
import SubmitSection from "../../components/common/apartmentForm/SubmitSection";
import FeedbackModal from "../../components/common/apartmentForm/FeedbackModal";

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
  
  // New state variables for improved feedback
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    success: false,
    message: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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
      setUploadProgress(0);
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
      setSnackbar({
        open: true,
        message: `Successfully uploaded ${files.length} ${files.length === 1 ? 'image' : 'images'}`,
        severity: "success",
      });
      
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
        imageUrls: [...prev.imageUrls, ...processedUrls],
      }));
    } catch (err) {
      setUploadStatus('error');
      console.error("Upload error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      setSnackbar({
        open: true,
        message: `Failed to upload images: ${err.response?.data?.message || err.message}`,
        severity: "error",
      });
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

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
    
    setSnackbar({
      open: true,
      message: "Image removed",
      severity: "info",
    });
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

  const resetForm = () => {
    setFormData({
      brokerEmail: "",
      amenities: [],
      images: [],
      imageUrls: [],
      location: {
        coordinates: [0, 0],
        address: "",
      },
    });
  };

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
      
      // Show success feedback modal instead of alert
      setFeedbackModal({
        open: true,
        success: true,
        message: "Your apartment listing has been submitted successfully!",
      });

      // Clear form
      resetForm();
    } catch (err) {
      console.error("Submit error:", err);
      
      // Log detailed error information
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error status:", err.response.status);
        console.error("Error headers:", err.response.headers);
      }
      
      // Show error feedback modal instead of alert
      setFeedbackModal({
        open: true,
        success: false,
        message: `Failed to submit: ${err.response?.data?.message || err.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseFeedbackModal = () => {
    setFeedbackModal({
      ...feedbackModal,
      open: false,
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({
      ...snackbar,
      open: false,
    });
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
          {/* Form Groups Component */}
          <FormGroups 
            formData={formData}
            handleChange={handleChange}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
          />

          {/* Location Section Component */}
          <LocationSection
            formData={formData}
            handlePositionChange={handlePositionChange}
            handlePlaceSelected={handlePlaceSelected}
            googleMapsApiKey={googleMapsApiKey}
            geocodingError={geocodingError}
          />

          {/* Amenities Section Component */}
          <AmenitiesSection
            formData={formData}
            handleCheckboxChange={handleCheckboxChange}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
          />

          {/* Image Upload Section Component */}
          <ImageUploadSection
            formData={formData}
            handleFileChange={handleFileChange}
            uploadProgress={uploadProgress}
            uploadStatus={uploadStatus}
            isDarkMode={isDarkMode}
            primaryColor={primaryColor}
            handleRemoveImage={handleRemoveImage}
          />

          {/* Submit Section Component */}
          <SubmitSection
            isSubmitting={isSubmitting}
            primaryColor={primaryColor}
          />
        </form>
      </FormContainer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Success/Error Modal */}
      <FeedbackModal
        open={feedbackModal.open}
        onClose={handleCloseFeedbackModal}
        success={feedbackModal.success}
        message={feedbackModal.message}
        primaryColor={primaryColor}
      />

      {/* Backdrop for geolocation loading */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isGeocoding}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default AgentApartmentForm;