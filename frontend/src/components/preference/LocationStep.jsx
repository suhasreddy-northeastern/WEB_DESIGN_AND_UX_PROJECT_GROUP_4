// src/pages/preferences/components/LocationStep.jsx
import React from 'react';
import { Alert } from '@mui/material';
import EnhancedLocationPreferenceComponent from '../../components/map/LocationPreferenceComponent';

const LocationStep = ({ formData, handleLocationChange, googleMapsApiKey, errors }) => {
  return (
    <>
      {(errors.locationAddress || errors.locationCoordinates) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.locationAddress || errors.locationCoordinates}
        </Alert>
      )}
      
      <EnhancedLocationPreferenceComponent
        value={formData.locationPreference}
        onChange={handleLocationChange}
        googleMapsApiKey={googleMapsApiKey}
      />
    </>
  );
};

export default LocationStep;