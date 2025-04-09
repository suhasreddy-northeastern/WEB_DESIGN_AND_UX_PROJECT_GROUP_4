import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Chip,
  Grid,
  Button,
  CardMedia,
  useTheme,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import dayjs from "dayjs";

const ViewApartmentModal = ({ open, onClose, apartment }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [matchHighlights, setMatchHighlights] = useState([]);
  const theme = useTheme();
  const primaryColor = "#00b386";

  useEffect(() => {
    // Reset active image when modal is opened with a new apartment
    setActiveImage(0);
    
    // Check if apartment is saved
    const checkSavedStatus = async () => {
      if (!apartment || !open) return;
      
      try {
        const res = await axios.get("http://localhost:4000/api/user/saved", {
          withCredentials: true,
        });
        
        const isAptSaved = (res.data || []).some(apt => apt._id === apartment._id);
        setIsSaved(isAptSaved);
      } catch (err) {
        console.error("Failed to check saved status", err);
      }
    };
    
    // Get match highlights from explanation
    const parseMatchHighlights = () => {
      if (!apartment?.explanation) return;
      
      const highlights = [];
      const lines = apartment.explanation.split('\n').filter(Boolean);
      
      lines.forEach(line => {
        if (line.startsWith('✅')) {
          highlights.push(line.substring(2).trim());
        }
      });
      
      setMatchHighlights(highlights.slice(0, 4)); // Limit to 4 highlights
    };
    
    // Get similar properties - would be from API in production
    const fetchSimilarProperties = async () => {
      if (!apartment || !open) return;
      
      try {
        // This would be an actual API call
        // Using existing apartments endpoint for demo purposes
        const res = await axios.get("http://localhost:4000/api/apartments", {
          withCredentials: true,
        });
        
        // Filter to get properties in the same neighborhood
        const similar = (res.data || [])
          .filter(apt => 
            apt._id !== apartment._id && 
            apt.neighborhood === apartment.neighborhood)
          .slice(0, 2); // Limit to 2
          
        setSimilarProperties(similar);
      } catch (err) {
        console.error("Failed to fetch similar properties", err);
        setSimilarProperties([]);
      }
    };
    
    if (open && apartment) {
      checkSavedStatus();
      parseMatchHighlights();
      fetchSimilarProperties();
    }
  }, [open, apartment]);

  if (!apartment) return null;

  const gallery = apartment.imageUrls?.length ? apartment.imageUrls : [apartment.imageUrl];
  const matchScore = Math.round(apartment.matchScore || 0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSaveToggle = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/user/save",
        { apartmentId: apartment._id },
        { withCredentials: true }
      );
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  // Modal styles based on theme mode
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 1000,
    bgcolor: theme.palette.background.paper,
    boxShadow: theme.palette.mode === 'light' 
      ? "0 8px 32px rgba(0, 0, 0, 0.1)" 
      : "0 8px 32px rgba(0, 0, 0, 0.3)",
    borderRadius: 3,
    p: 0,
    maxHeight: "90vh",
    overflowY: "auto",
    border: theme.palette.mode === 'light' 
      ? 'none' 
      : '1px solid rgba(255, 255, 255, 0.05)',
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Top navigation bar */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          px={3} 
          py={2}
          borderBottom={1}
          borderColor="divider"
        >
          <Button 
            variant="text" 
            startIcon={<ArrowBackIcon />} 
            onClick={onClose}
            sx={{ color: theme.palette.text.primary }}
          >
            Back to Results
          </Button>
          <IconButton onClick={onClose} color="inherit">
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Main content */}
        <Box p={0}>
          <Grid container>
            {/* Left section (images) - 60% */}
            <Grid item xs={12} md={7} lg={8}>
              {/* Main image */}
              <Box sx={{ position: "relative", height: 400 }}>
                <CardMedia
                  component="img"
                  sx={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover"
                  }}
                  image={`http://localhost:4000${gallery[activeImage] || "/images/no-image.png"}`}
                  alt="Apartment image"
                />
                
                {/* Overlay actions */}
                <Box 
                  sx={{ 
                    position: "absolute", 
                    top: 16, 
                    right: 16, 
                    display: "flex", 
                    gap: 1 
                  }}
                >
                  <IconButton 
                    onClick={handleSaveToggle}
                    sx={{ 
                      bgcolor: 'white', 
                      '&:hover': { bgcolor: 'white' },
                      color: isSaved ? "#FF4081" : "grey.500"
                    }}
                  >
                    {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <IconButton 
                    sx={{ 
                      bgcolor: 'white', 
                      '&:hover': { bgcolor: 'white' },
                      color: "grey.500"
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Box>
                
                {/* Match score badge */}
                {matchScore > 0 && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      left: 16,
                      bgcolor: primaryColor,
                      color: "white",
                      px: 2,
                      py: 0.5,
                      borderRadius: 4,
                      fontWeight: "bold",
                    }}
                  >
                    {matchScore}% Match
                  </Box>
                )}
              </Box>
              
              {/* Thumbnail images */}
              <Box 
                sx={{ 
                  display: "flex", 
                  gap: 1, 
                  p: 2, 
                  overflowX: "auto"
                }}
              >
                {gallery.map((img, index) => (
                  <Box
                    key={index}
                    onClick={() => setActiveImage(index)}
                    sx={{
                      width: 80,
                      height: 60,
                      flexShrink: 0,
                      cursor: "pointer",
                      border: activeImage === index ? `2px solid ${primaryColor}` : "none",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={`http://localhost:4000${img}`}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                ))}
              </Box>
            </Grid>
            
            {/* Right section (details) - 40% */}
            <Grid item xs={12} md={5} lg={4} sx={{ borderLeft: { md: 1 }, borderColor: "divider" }}>
              <Box p={3}>
                <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                  {apartment.bedrooms} BHK in {apartment.neighborhood}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ display: "flex", alignItems: "center", mb: 1 }}
                >
                  <LocationOnIcon sx={{ fontSize: 18, mr: 0.5 }} />
                  {apartment.neighborhood}, Mumbai
                </Typography>
                
                <Typography variant="h4" fontWeight={700} color="text.primary" mt={1} mb={3}>
                  ${apartment.price.toLocaleString()}<Typography component="span" variant="body2" color="text.secondary">/mo</Typography>
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Interested section */}
                <Box mb={3}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Interested in this property?
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      bgcolor: primaryColor,
                      py: 1.5,
                      mb: 1.5,
                      '&:hover': { bgcolor: "#009973" }
                    }}
                  >
                    Contact Broker
                  </Button>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CalendarTodayIcon />}
                    sx={{
                      color: theme.palette.text.primary,
                      borderColor: "divider",
                      py: 1.5
                    }}
                  >
                    Schedule Tour
                  </Button>
                </Box>
                
                {/* Match highlights */}
                {matchHighlights.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Match Highlights
                    </Typography>
                    
                    <List dense disablePadding>
                      {matchHighlights.map((highlight, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <CheckCircleOutlineIcon sx={{ color: primaryColor }} />
                          </ListItemIcon>
                          <ListItemText primary={highlight} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {/* Similar properties */}
                {similarProperties.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Similar Properties
                    </Typography>
                    
                    {similarProperties.map((prop, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: "flex", 
                          mb: 2,
                          p: 1,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                          cursor: 'pointer'
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 1,
                            overflow: "hidden",
                            mr: 2
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={`http://localhost:4000${prop.imageUrls?.[0] || prop.imageUrl || "/images/no-image.png"}`}
                            alt={`Property ${index + 1}`}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {prop.bedrooms} BHK in {prop.neighborhood}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {prop.neighborhood}
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={600} color={primaryColor}>
                            ${prop.price?.toLocaleString() || "N/A"}/mo
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          
          {/* Tabs section */}
          <Box sx={{ width: '100%', px: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4
                },
                '& .Mui-selected': {
                  color: `${primaryColor} !important`,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: primaryColor,
                }
              }}
            >
              <Tab label="Details" />
              <Tab label="Amenities" />
              <Tab label="Location" />
            </Tabs>
            
            <Box py={3}>
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Bedrooms
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {apartment.bedrooms}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Bathrooms
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {apartment.bathrooms || 1}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Square Feet
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {apartment.sqft || 750}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Available From
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {apartment.moveInDate 
                        ? dayjs(apartment.moveInDate).format('MM/DD/YYYY') 
                        : "5/14/2025"}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {apartment.description || 
                        `This stunning ${apartment.bedrooms}-bedroom apartment in ${apartment.neighborhood} offers modern living with exceptional amenities. 
                        Featuring beautiful bathroom${apartment.bathrooms > 1 ? 's' : ''} and thoughtfully designed space, 
                        this residence provides both comfort and style.`
                      }
                    </Typography>
                  </Grid>
                </Grid>
              )}
              
              {activeTab === 1 && (
                <Grid container spacing={2}>
                  {(apartment.amenities || ['Parking', 'Security', 'Elevator']).map((amenity, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Chip 
                        label={amenity}
                        sx={{
                          bgcolor: theme.palette.mode === 'light' ? undefined : '#333',
                          color: theme.palette.mode === 'light' ? undefined : '#e0e0e0',
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
              
              {activeTab === 2 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {apartment.address || `${apartment.neighborhood}, Mumbai`}
                  </Typography>
                  
                  <Box
                    sx={{
                      width: "100%",
                      height: 300,
                      bgcolor: theme.palette.mode === 'light' ? "#f5f5f5" : "#333",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 2,
                      color: theme.palette.text.secondary,
                      border: theme.palette.mode === 'light' 
                        ? '1px solid #e0e0e0' 
                        : '1px solid #444',
                    }}
                  >
                    <Typography>Map View</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewApartmentModal;