import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  Paper,
  Button,
  Chip,
  Divider,
  Grid,
  Checkbox,
  FormControlLabel,
  useTheme,
  CircularProgress,
  Fade,
  Slide
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FilterComponent = ({ 
  onApplyFilters, 
  initialFilters = {}, 
  onResetFilters, 
  showFilterDrawer = true,
  loading = false,
  scrollVisible = true // New prop to control visibility based on scroll
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = "#00b386";
  
  // Filter state
  const [priceRange, setPriceRange] = useState([1000, 3000]);
  const [bedrooms, setBedrooms] = useState([]);
  const [bathrooms, setBathrooms] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [amenities, setAmenities] = useState([]);
  
  // Available options
  const bedroomOptions = ['Studio', '1', '2', '3+'];
  const bathroomOptions = ['1', '2', '3+'];
  const neighborhoodOptions = ['Downtown', 'Midtown', 'West End', 'East Side'];
  const amenityOptions = [
    'In-unit Washer/Dryer',
    'Gym',
    'Pool',
    'Parking',
    'Balcony',
    'Doorman',
    'Elevator',
    'Pet Friendly',
  ];
  
  // Initialize filters from props when component mounts or props change
  useEffect(() => {
    if (initialFilters.priceRange) setPriceRange(initialFilters.priceRange);
    if (initialFilters.bedrooms) setBedrooms(initialFilters.bedrooms);
    if (initialFilters.bathrooms) setBathrooms(initialFilters.bathrooms);
    if (initialFilters.neighborhoods) setNeighborhoods(initialFilters.neighborhoods);
    if (initialFilters.amenities) setAmenities(initialFilters.amenities);
  }, [initialFilters]);
  
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };
  
  const handleBedroomToggle = (value) => {
    setBedrooms(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };
  
  const handleBathroomToggle = (value) => {
    setBathrooms(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };
  
  const handleNeighborhoodToggle = (value) => {
    setNeighborhoods(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };
  
  const handleAmenityToggle = (value) => {
    setAmenities(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
  };
  
  const handleApplyFilters = () => {
    const filters = {
      priceRange,
      bedrooms,
      bathrooms,
      neighborhoods,
      amenities,
    };
    onApplyFilters(filters);
  };
  
  const handleResetFilters = () => {
    setPriceRange([1000, 3000]);
    setBedrooms([]);
    setBathrooms([]);
    setNeighborhoods([]);
    setAmenities([]);
    
    if (onResetFilters) {
      onResetFilters();
    }
  };
  
  // Helper function to render filter chips with toggle ability
  const renderFilterChips = (options, selectedValues, handleToggle, colorLight = false) => {
    return options.map((option) => (
      <Chip
        key={option}
        label={option}
        onClick={() => handleToggle(option)}
        variant={selectedValues.includes(option) ? "filled" : "outlined"}
        sx={{
          m: 0.5,
          fontWeight: 500,
          color: selectedValues.includes(option)
            ? "#fff"
            : colorLight ? primaryColor : theme.palette.text.primary,
          bgcolor: selectedValues.includes(option)
            ? primaryColor
            : colorLight ? `rgba(0, 179, 134, 0.08)` : 'transparent',
          borderColor: selectedValues.includes(option)
            ? primaryColor
            : isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
          '&:hover': {
            bgcolor: selectedValues.includes(option)
              ? primaryColor
              : isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          },
        }}
      />
    ));
  };
  
  // If filter drawer is not shown, return null
  if (!showFilterDrawer) return null;
  
  return (
    <Fade in={scrollVisible}>
      <Paper
        elevation={isDarkMode ? 2 : 3}
        sx={{
          p: 3,
          borderRadius: 2,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.12)' : 'none',
          bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
          position: 'sticky',
          top: 20, // Keep some space from the top
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Filters
          </Typography>
          <Button
            onClick={handleResetFilters}
            sx={{ 
              color: primaryColor, 
              '&:hover': { 
                bgcolor: isDarkMode 
                  ? 'rgba(0, 179, 134, 0.08)' 
                  : 'rgba(0, 179, 134, 0.04)' 
              } 
            }}
          >
            Reset All
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Price Range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
            Price Range
          </Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="off"
            min={1000}
            max={3500}
            step={100}
            sx={{
              color: primaryColor,
              '& .MuiSlider-thumb': {
                height: 18,
                width: 18,
                '&:focus, &:hover': {
                  boxShadow: `0 0 0 8px ${isDarkMode 
                    ? 'rgba(0, 179, 134, 0.16)' 
                    : 'rgba(0, 179, 134, 0.12)'}`,
                },
              },
              '& .MuiSlider-track': {
                height: 6,
              },
              '& .MuiSlider-rail': {
                height: 6,
                opacity: 0.2,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" fontWeight="medium" color="text.secondary">
              ${priceRange[0]}
            </Typography>
            <Typography variant="body2" fontWeight="medium" color="text.secondary">
              ${priceRange[1]}
            </Typography>
          </Box>
        </Box>
        
        {/* Bedrooms */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
            Bedrooms
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
            {renderFilterChips(bedroomOptions, bedrooms, handleBedroomToggle)}
          </Box>
        </Box>
        
        {/* Bathrooms */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
            Bathrooms
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
            {renderFilterChips(bathroomOptions, bathrooms, handleBathroomToggle)}
          </Box>
        </Box>
        
        {/* Neighborhoods */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
            Neighborhoods
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 1 }}>
            {renderFilterChips(neighborhoodOptions, neighborhoods, handleNeighborhoodToggle)}
          </Box>
        </Box>
        
        {/* Amenities */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="text.primary" gutterBottom>
            Amenities
          </Typography>
          <Grid container spacing={1}>
            {amenityOptions.map(option => (
              <Grid item xs={6} key={option}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={amenities.includes(option)}
                      onChange={() => handleAmenityToggle(option)}
                      sx={{
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.54)',
                        '&.Mui-checked': {
                          color: primaryColor,
                        },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      {option}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Button
          variant="contained"
          fullWidth
          onClick={handleApplyFilters}
          disabled={loading}
          sx={{
            borderRadius: 2,
            backgroundColor: primaryColor,
            color: '#fff',
            py: 1.2,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#fff' }} />
          ) : (
            'Apply Filters'
          )}
        </Button>
      </Paper>
    </Fade>
  );
};

export default FilterComponent;