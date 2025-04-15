// src/pages/preferences/components/BasicInfoStep.jsx
import React from 'react';
import {
  Grid,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  TextField,
  FormHelperText,
  useTheme
} from '@mui/material';

const BasicInfoStep = ({ formData, handleChange, errors }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel 
            component="legend"
            sx={{ color: 'text.secondary', mb: 1 }}
          >
            Looking to Rent or Buy?
          </FormLabel>
          <RadioGroup
            row
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <FormControlLabel value="Rent" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="Rent" />
            <FormControlLabel value="Buy" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="Buy" />
          </RadioGroup>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel 
            component="legend"
            sx={{ color: 'text.secondary', mb: 1 }}
          >
            Number of Bedrooms
          </FormLabel>
          <RadioGroup
            row
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
          >
            <FormControlLabel value="1" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="1" />
            <FormControlLabel value="2" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="2" />
            <FormControlLabel value="3" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="3" />
            <FormControlLabel value="4+" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="4+" />
          </RadioGroup>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth error={Boolean(errors.moveInDate)}>
          <TextField
            fullWidth
            type="date"
            name="moveInDate"
            label="Desired Move-in Date"
            value={formData.moveInDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={Boolean(errors.moveInDate)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: errors.moveInDate 
                    ? theme.palette.error.main 
                    : (isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.23)'),
                },
                '&:hover fieldset': {
                  borderColor: errors.moveInDate 
                    ? theme.palette.error.main 
                    : (isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.33)'),
                },
                '&.Mui-focused fieldset': {
                  borderColor: errors.moveInDate ? theme.palette.error.main : '#00b386',
                },
              },
            }}
          />
          {errors.moveInDate && (
            <FormHelperText error>{errors.moveInDate}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel 
            component="legend"
            sx={{ color: 'text.secondary', mb: 1 }}
          >
            Apartment Style
          </FormLabel>
          <RadioGroup
            row
            name="style"
            value={formData.style}
            onChange={handleChange}
          >
            <FormControlLabel value="Modern" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="Modern" />
            <FormControlLabel value="Traditional" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="Traditional" />
            <FormControlLabel value="Loft" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="Loft" />
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default BasicInfoStep;