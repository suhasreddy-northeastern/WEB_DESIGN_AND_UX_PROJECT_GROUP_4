// src/pages/preferences/components/BudgetFeaturesStep.jsx
import React from 'react';
import {
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme
} from '@mui/material';

const BudgetFeaturesStep = ({ formData, handleChange, errors }) => {
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
            Price Range
          </FormLabel>
          <RadioGroup
            name="priceRange"
            value={formData.priceRange}
            onChange={handleChange}
          >
            <FormControlLabel value="$0-$1,000" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="$0 - $1,000" />
            <FormControlLabel value="$1,000-$2,000" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="$1,000 - $2,000" />
            <FormControlLabel value="$2,000-$3,000" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="$2,000 - $3,000" />
            <FormControlLabel value="$3,000+" control={<Radio sx={{
              color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
              '&.Mui-checked': { color: '#00b386' }
            }} />} label="$3,000+" />
          </RadioGroup>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel 
            component="legend"
            sx={{ color: 'text.secondary', mb: 1 }}
          >
            Features
          </FormLabel>
          
          <Grid container>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel 
                  component="legend"
                  sx={{ color: 'text.secondary', fontSize: 14 }}
                >
                  Parking
                </FormLabel>
                <RadioGroup
                  row
                  name="parking"
                  value={formData.parking}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Yes" control={<Radio size="small" sx={{
                    color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
                    '&.Mui-checked': { color: '#00b386' }
                  }} />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio size="small" sx={{
                    color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
                    '&.Mui-checked': { color: '#00b386' }
                  }} />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <FormLabel 
                  component="legend"
                  sx={{ color: 'text.secondary', fontSize: 14 }}
                >
                  Public Transport
                </FormLabel>
                <RadioGroup
                  row
                  name="transport"
                  value={formData.transport}
                  onChange={handleChange}
                >
                  <FormControlLabel value="Close" control={<Radio size="small" sx={{
                    color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
                    '&.Mui-checked': { color: '#00b386' }
                  }} />} label="Close" />
                  <FormControlLabel value="Average" control={<Radio size="small" sx={{
                    color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
                    '&.Mui-checked': { color: '#00b386' }
                  }} />} label="Average" />
                  <FormControlLabel value="Far" control={<Radio size="small" sx={{
                    color: isDarkMode ? 'rgba(0, 179, 134, 0.7)' : '#00b386',
                    '&.Mui-checked': { color: '#00b386' }
                  }} />} label="Far" />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default BudgetFeaturesStep;