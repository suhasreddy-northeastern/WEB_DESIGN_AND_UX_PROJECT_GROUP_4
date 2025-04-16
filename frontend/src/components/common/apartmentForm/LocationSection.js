import React from "react";
import {
  Typography,
  Grid,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PlaceIcon from "@mui/icons-material/Place";
import PlacesAutocomplete from "./PlacesAutocomplete";
import GoogleMapComponent from "./GoogleMapComponent";

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

const LocationSection = ({
  formData,
  handlePositionChange,
  handlePlaceSelected,
  googleMapsApiKey,
  geocodingError,
}) => {
  return (
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
  );
};

export default LocationSection;