// src/pages/preferences/PreferenceForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Container,
  CircularProgress,
  Alert,
  Chip,
  Collapse
} from "@mui/material";
import axios from "axios";
import { styled } from "@mui/material/styles";
import PreferenceFormStepper from "../../components/preference/PreferenceFormStepper";
import BasicInfoStep from "../../components/preference/BasicInfoStep";
import LocationStep from "../../components/preference/LocationStep";
import BudgetFeaturesStep from "../../components/preference/BudgetFeaturesStep";
import AmenitiesStep from "../../components/preference/AmenitiesStep";
import { loadGoogleMapsApi } from "../../components/map/GoogleMapsLoader";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

// Form step labels
const steps = ["Basic Info", "Location", "Budget & Features", "Amenities"];

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Styled components
const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 20px rgba(0,0,0,0.3)' 
    : '0 4px 20px rgba(0,0,0,0.05)',
}));

const DefaultsAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 8,
  backgroundColor: 'rgba(0, 179, 134, 0.1)',
  border: '1px solid rgba(0, 179, 134, 0.2)',
  '& .MuiAlert-icon': {
    color: '#00b386'
  }
}));

const PreferenceForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [mapsApiError, setMapsApiError] = useState('');
  const [isMapsApiLoading, setIsMapsApiLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(true);
  const [showDefaultsAlert, setShowDefaultsAlert] = useState(true);
  const [formData, setFormData] = useState({
    type: "Rent",
    bedrooms: "1",
    priceRange: "$1,000-$2,000",
    neighborhood: "Quiet and Residential",
    amenities: [],
    style: "Modern",
    floor: "Mid-level Floor",
    moveInDate: "",
    parking: "Yes",
    transport: "Close",
    sqft: "",
    safety: "High",
    pets: "Allowed",
    view: "No Specific View",
    leaseCapacity: "1",
    roommates: "No",
    // Add location preference
    locationPreference: {
      center: [0, 0],
      radius: 5,
      address: ""
    }
  });

  // Load Google Maps API
  useEffect(() => {
    const initMapsApi = async () => {
      try {
        setIsMapsApiLoading(true);
        await loadGoogleMapsApi(GOOGLE_MAPS_API_KEY);
        setIsMapsApiLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setMapsApiError('Failed to load Google Maps. Please check your internet connection and refresh the page.');
        setIsMapsApiLoading(false);
      }
    };
    
    initMapsApi();
  }, []);

  // Fetch existing preferences if any
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/user/preferences/latest",
          { withCredentials: true }
        );
        
        if (response.data && response.data.preference) {
          const pref = response.data.preference;
          
          // Merge existing preferences with the default state
          setFormData(prevState => ({
            ...prevState,
            ...pref,
            // Initialize location preference if it exists
            locationPreference: pref.locationPreference || {
              center: [0, 0],
              radius: 5,
              address: ""
            }
          }));
          
          // User has previous preferences
          setIsNewUser(false);
          setShowDefaultsAlert(false);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
        // No preferences found, continue with defaults
        setIsNewUser(true);
        setShowDefaultsAlert(true);
      }
    };

    fetchPreferences();
  }, []);

  // Validate form data for the current step
  const validateStep = (step) => {
    let stepErrors = {};
    let isValid = true;

    switch (step) {
      case 0: // Basic Info
        if (!formData.moveInDate) {
          stepErrors.moveInDate = "Please select a move-in date";
          isValid = false;
        }
        break;
      case 1: // Location
        if (!formData.locationPreference.address) {
          stepErrors.locationAddress = "Please enter a location";
          isValid = false;
        }
        if (formData.locationPreference.center[0] === 0 && formData.locationPreference.center[1] === 0) {
          stepErrors.locationCoordinates = "Please select a location on the map";
          isValid = false;
        }
        break;
      case 2: // Budget & Features
        // All fields have default values, so no validation needed
        break;
      case 3: // Amenities
        // Optional, so no validation needed
        break;
      default:
        break;
    }

    setErrors(stepErrors);
    return isValid;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors for this field if any
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle checkbox changes for amenities
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, name]
        : prev.amenities.filter((item) => item !== name),
    }));
  };

  // Handle location preference changes
  const handleLocationChange = (locationData) => {
    setFormData(prev => ({
      ...prev,
      locationPreference: locationData
    }));

    // Clear location-related errors
    if (errors.locationAddress || errors.locationCoordinates) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.locationAddress;
        delete newErrors.locationCoordinates;
        return newErrors;
      });
    }
  };

  // Move to next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  // Move to previous step
  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  // Submit preferences
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate current step before submitting
    if (!validateStep(activeStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(
        "http://localhost:4000/api/user/preferences",
        formData,
        { withCredentials: true }
      );
      
      // Navigate to matches page with the new preference ID
      navigate(`/matches/${response.data.preference._id}`);
    } catch (error) {
      console.error("Error submitting preferences:", error);
      alert("Failed to submit preferences. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Get content for current step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoStep 
            formData={formData} 
            handleChange={handleChange} 
            errors={errors}
          />
        );
      case 1:
        return (
          <LocationStep
            formData={formData}
            handleLocationChange={handleLocationChange}
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            errors={errors}
          />
        );
      case 2:
        return (
          <BudgetFeaturesStep
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <AmenitiesStep
            formData={formData}
            handleCheckboxChange={handleCheckboxChange}
            errors={errors}
          />
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
        Find Your Perfect Match
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
        Tell us your preferences and we'll match you with the perfect apartment.
      </Typography>

      {mapsApiError && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {mapsApiError}
        </Alert>
      )}

      {/* Default Values Alert for New Users */}
      {isNewUser && (
        <Collapse in={showDefaultsAlert}>
          <DefaultsAlert 
            severity="info" 
            icon={<InfoIcon />}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setShowDefaultsAlert(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                We've pre-filled the form with suggested values
              </Typography>
              <Typography variant="body2">
                These are just starting points. Please review and adjust to find your perfect match!
              </Typography>
              <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                <Chip size="small" label="Budget" color="primary" variant="outlined" sx={{ bgcolor: 'rgba(0, 179, 134, 0.08)' }} />
                <Chip size="small" label="Location" color="primary" variant="outlined" sx={{ bgcolor: 'rgba(0, 179, 134, 0.08)' }} />
                <Chip size="small" label="Size" color="primary" variant="outlined" sx={{ bgcolor: 'rgba(0, 179, 134, 0.08)' }} />
                <Chip size="small" label="Features" color="primary" variant="outlined" sx={{ bgcolor: 'rgba(0, 179, 134, 0.08)' }} />
              </Box>
            </Box>
          </DefaultsAlert>
        </Collapse>
      )}

      {isMapsApiLoading && activeStep === 1 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 8 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Loading Google Maps...</Typography>
        </Box>
      ) : (
        <FormContainer>
          <PreferenceFormStepper activeStep={activeStep} steps={steps} />
          
          <Box>
            {getStepContent(activeStep)}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                sx={{ 
                  borderColor: '#00b386',
                  color: '#00b386',
                  '&:hover': {
                    borderColor: '#00b386',
                    backgroundColor: 'rgba(0, 179, 134, 0.08)',
                  }
                }}
              >
                Back
              </Button>
              
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{
                      bgcolor: '#00b386',
                      '&:hover': { bgcolor: '#008f6c' },
                      px: 4,
                      py: 1
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Find Matches'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      bgcolor: '#00b386',
                      '&:hover': { bgcolor: '#008f6c' },
                      px: 4,
                      py: 1
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </FormContainer>
      )}
    </Container>
  );
};

export default PreferenceForm;