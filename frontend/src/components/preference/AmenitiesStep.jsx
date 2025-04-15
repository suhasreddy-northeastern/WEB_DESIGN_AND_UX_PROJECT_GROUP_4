// src/pages/preferences/components/AmenitiesStep.jsx
import React from 'react';
import {
  Grid,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  useTheme
} from '@mui/material';

const amenitiesList = [
  "Gym",
  "Swimming Pool",
  "Parking Space",
  "Pet-Friendly",
  "Balcony",
  "In-Unit Laundry",
  "Doorman",
  "Elevator",
  "Furnished",
  "Air Conditioning",
  "Dishwasher",
];

const AmenitiesStep = ({ formData, handleCheckboxChange, errors }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          Preferred Amenities
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
                    color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
                    '&.Mui-checked': { color: '#00b386' }
                  }}
                />
              }
              label={name}
              sx={{ width: { xs: '50%', md: '33%' } }}
            />
          ))}
        </FormGroup>
      </Grid>
    </Grid>
  );
};

export default AmenitiesStep;