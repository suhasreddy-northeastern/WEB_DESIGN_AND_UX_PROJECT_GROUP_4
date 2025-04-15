import React, { useState, useEffect, useRef } from "react";
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
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ShareIcon from "@mui/icons-material/Share";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import dayjs from "dayjs";
import ContactBrokerDialog from "./dialog/ContactBrokerDialog";
import ScheduleTourDialog from "./dialog/ScheduleTourDialog";
import { loadGoogleMapsApi } from "../../map/GoogleMapsLoader"; 

const ViewApartmentModal = ({ open, onClose, apartment }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);
  const [matchHighlights, setMatchHighlights] = useState([]);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [locationAvailable, setLocationAvailable] = useState(true);
  const [brokerInfo, setBrokerInfo] = useState(null);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [openTourDialog, setOpenTourDialog] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
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

        const isAptSaved = (res.data || []).some(
          (apt) => apt._id === apartment._id
        );
        setIsSaved(isAptSaved);
      } catch (err) {
        console.error("Failed to check saved status", err);
      }
    };

    // Get match highlights from explanation
    const parseMatchHighlights = () => {
      if (!apartment?.explanation) return;

      const highlights = [];
      const lines = apartment.explanation.split("\n").filter(Boolean);

      lines.forEach((line) => {
        if (line.startsWith("✅")) {
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
          .filter(
            (apt) =>
              apt._id !== apartment._id &&
              apt.neighborhood === apartment.neighborhood
          )
          .slice(0, 2); // Limit to 2

        setSimilarProperties(similar);
      } catch (err) {
        console.error("Failed to fetch similar properties", err);
        setSimilarProperties([]);
      }
    };

    // Fetch broker information
    const fetchBrokerInfo = async () => {
      if (!apartment || !open || !apartment.brokerEmail) return;

      try {
        // In a real app, this would be a dedicated API endpoint
        // For demo purposes, we'll simulate it
        const res = await axios.get(`http://localhost:4000/api/broker/${apartment.broker}`, {
          withCredentials: true,
        });

        setBrokerInfo(res.data?.broker || {
          fullName: apartment?.broker?.fullName || "Property Agent",
          email: apartment.brokerEmail,
          phone: apartment?.broker?.phone || "Not available",
          company: apartment?.broker?.companyName || "Real Estate Agency",
          imagePath: apartment?.broker?.imagePath || null
        });
      } catch (err) {
        console.error("Failed to fetch broker info", err);
        // Set default broker info
        setBrokerInfo({
          fullName: apartment?.broker?.fullName || "Property Agent",
          email: apartment.brokerEmail,
          company: "Real Estate Agency",
        });
      }
    };

    if (open && apartment) {
      checkSavedStatus();
      parseMatchHighlights();
      fetchSimilarProperties();
      fetchBrokerInfo();
      
      // Check if location data is available
      const hasCoordinates = apartment.location && 
                            apartment.location.coordinates && 
                            apartment.location.coordinates.length === 2 &&
                            apartment.location.coordinates[0] !== 0 &&
                            apartment.location.coordinates[1] !== 0;
                            
      const hasAddress = apartment.location?.address || apartment.address;
      
      setLocationAvailable(hasCoordinates || hasAddress);
    }
  }, [open, apartment]);

  // Initialize Google Maps when the Location tab is selected
  useEffect(() => {
    if (activeTab === 2 && apartment && open && locationAvailable) {
      initializeGoogleMap();
    }
  }, [activeTab, apartment, open, locationAvailable]);

  // Get actual address or precise location
  const getDisplayAddress = () => {
    if (!apartment) return "Location not available";
    
    // Check for specific address
    if (apartment.location?.address) return apartment.location.address;
    if (apartment.address) return apartment.address;
    
    // If no specific address but we have coordinates
    if (apartment.location?.coordinates && 
        apartment.location.coordinates.length === 2 &&
        apartment.location.coordinates[0] !== 0 &&
        apartment.location.coordinates[1] !== 0) {
      // We have coordinates but no readable address
      return `${apartment.neighborhood}, Mumbai (Exact location available on map)`;
    }
    
    // If we have a neighborhood but no specific address or coordinates
    if (apartment.neighborhood) {
      return `${apartment.neighborhood}, Mumbai`;
    }
    
    return "Location not disclosed";
  };

  // Initialize Google Maps
  const initializeGoogleMap = async () => {
    if (!mapRef.current || !apartment) return;
    
    setIsMapLoading(true);
    setMapError(null);

    try {
      // Load Google Maps API
      await loadGoogleMapsApi(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);

      // Check if the Google Maps API is loaded
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps API failed to load");
      }

      // Get coordinates from apartment
      let lat = 0;
      let lng = 0;

      // Try to get coordinates from apartment.location if available
      if (apartment.location && apartment.location.coordinates) {
        // Apartments use [longitude, latitude] format for GeoJSON compliance
        lng = parseFloat(apartment.location.coordinates[0]);
        lat = parseFloat(apartment.location.coordinates[1]);
      }

      // If valid coordinates are not found, try to geocode the address
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        // Try with specific address first, then fall back to neighborhood
        const address = apartment.location?.address || 
                       apartment.address || 
                       `${apartment.neighborhood}, Mumbai`;
        
        await geocodeAddress(address);
        return; // geocodeAddress will handle the rest
      }

      // Create map
      createMapWithMarker(lat, lng);
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setMapError("Error loading map. Please try again later.");
    } finally {
      setIsMapLoading(false);
    }
  };

  // Geocode address to get coordinates
  const geocodeAddress = async (address) => {
    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps API not loaded");
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          createMapWithMarker(location.lat(), location.lng());
        } else {
          setMapError(`Location not available on map`);
          setIsMapLoading(false);
        }
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      setMapError("Error loading location. Please try again later.");
      setIsMapLoading(false);
    }
  };

  // Create map with marker
  const createMapWithMarker = (lat, lng) => {
    try {
      // Clear previous map instance
      if (mapInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }

      // Create map
      const mapOptions = {
        center: { lat, lng },
        zoom: 14,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
      };

      mapInstanceRef.current = new window.google.maps.Map(
        mapRef.current,
        mapOptions
      );

      // Create marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: apartment.bedrooms + " BHK in " + apartment.neighborhood,
        animation: window.google.maps.Animation.DROP,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      // Get the display address for info window
      const displayAddress = getDisplayAddress();

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="font-family: Arial, sans-serif; padding: 8px; max-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${apartment.bedrooms} BHK in ${apartment.neighborhood}</div>
            <div style="margin-bottom: 5px; font-size: 12px;">${displayAddress}</div>
            <div style="color: #00b386; font-weight: bold;">$${apartment.price.toLocaleString()}/mo</div>
          </div>
        `,
      });

      // Open info window when marker is clicked
      window.google.maps.event.addListener(markerRef.current, "click", () => {
        infoWindow.open(mapInstanceRef.current, markerRef.current);
      });

      // Initially open the info window
      infoWindow.open(mapInstanceRef.current, markerRef.current);

      setIsMapLoading(false);
    } catch (error) {
      console.error("Error creating map:", error);
      setMapError("Error creating map. Please try again later.");
      setIsMapLoading(false);
    }
  };

  // Handle sharing the apartment
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${apartment.bedrooms} BHK Apartment in ${apartment.neighborhood}`,
        text: `Check out this ${apartment.bedrooms} BHK apartment in ${apartment.neighborhood} for $${apartment.price.toLocaleString()}/month!`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      }).catch(err => {
        console.error('Error copying to clipboard:', err);
      });
    }
  };

  if (!apartment) return null;

  const gallery = apartment.imageUrls?.length
    ? apartment.imageUrls
    : [apartment.imageUrl];
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
    boxShadow:
      theme.palette.mode === "light"
        ? "0 8px 32px rgba(0, 0, 0, 0.1)"
        : "0 8px 32px rgba(0, 0, 0, 0.3)",
    borderRadius: 3,
    p: 0,
    maxHeight: "90vh",
    overflowY: "auto",
    border:
      theme.palette.mode === "light"
        ? "none"
        : "1px solid rgba(255, 255, 255, 0.05)",
  };

  return (
    <>
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
                      objectFit: "cover",
                    }}
                    image={`http://localhost:4000${
                      gallery[activeImage] || "/images/no-image.png"
                    }`}
                    alt="Apartment image"
                  />

                  {/* Overlay actions */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      onClick={handleSaveToggle}
                      sx={{
                        bgcolor: "white",
                        "&:hover": { bgcolor: "white" },
                        color: isSaved ? "#FF4081" : "grey.500",
                      }}
                    >
                      {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton
                      onClick={handleShare}
                      sx={{
                        bgcolor: "white",
                        "&:hover": { bgcolor: "white" },
                        color: "grey.500",
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
                    overflowX: "auto",
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
                        border:
                          activeImage === index
                            ? `2px solid ${primaryColor}`
                            : "none",
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
              <Grid
                item
                xs={12}
                md={5}
                lg={4}
                sx={{ borderLeft: { md: 1 }, borderColor: "divider" }}
              >
                <Box p={3}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="text.primary"
                    gutterBottom
                  >
                    {apartment.bedrooms} BHK in {apartment.neighborhood}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", mb: 1 }}
                  >
                    <LocationOnIcon sx={{ fontSize: 18, mr: 0.5 }} />
                    {getDisplayAddress()}
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="text.primary"
                    mt={1}
                    mb={3}
                  >
                    ${apartment.price.toLocaleString()}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      /mo
                    </Typography>
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Broker info */}
                  {brokerInfo && (
                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Listed by:
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight={500}>
                          {brokerInfo.fullName}
                        </Typography>
                        {brokerInfo.company && (
                          <Typography variant="body2" color="text.secondary">
                            ({brokerInfo.company})
                          </Typography>
                        )}
                      </Box>
                      {brokerInfo.email && (
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {brokerInfo.email}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Interested section */}
                  <Box mb={3}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Interested in this property?
                    </Typography>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => setOpenContactDialog(true)}
                      sx={{
                        bgcolor: primaryColor,
                        py: 1.5,
                        mb: 1.5,
                        "&:hover": { bgcolor: "#009973" },
                      }}
                    >
                      Contact Broker
                    </Button>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<CalendarTodayIcon />}
                      onClick={() => setOpenTourDialog(true)}
                      sx={{
                        color: theme.palette.text.primary,
                        borderColor: "divider",
                        py: 1.5,
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
                              <CheckCircleOutlineIcon
                                sx={{ color: primaryColor }}
                              />
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
                            "&:hover": { bgcolor: "action.hover" },
                            cursor: "pointer",
                          }}
                        >
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              overflow: "hidden",
                              mr: 2,
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={`http://localhost:4000${
                                prop.imageUrls?.[0] ||
                                prop.imageUrl ||
                                "/images/no-image.png"
                              }`}
                              alt={`Property ${index + 1}`}
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {prop.bedrooms} BHK in {prop.neighborhood}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {prop.neighborhood}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                              color={primaryColor}
                            >
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
            <Box sx={{ width: "100%", px: 3 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                  },
                  "& .Mui-selected": {
                    color: `${primaryColor} !important`,
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: primaryColor,
                  },
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
                          ? dayjs(apartment.moveInDate).format("MM/DD/YYYY")
                          : "5/14/2025"}
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Description
                      </Typography>
                      <Typography variant="body1">
                        {apartment.description ||
                          `This stunning ${
                            apartment.bedrooms
                          }-bedroom apartment in ${
                            apartment.neighborhood
                          } offers modern living with exceptional amenities. 
                          Featuring beautiful bathroom${
                            apartment.bathrooms > 1 ? "s" : ""
                          } and thoughtfully designed space, 
                          this residence provides both comfort and style.`}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {activeTab === 1 && (
                  <Grid container spacing={2}>
                    {(
                      apartment.amenities || ["Parking", "Security", "Elevator"]
                    ).map((amenity, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Chip
                          label={amenity}
                          sx={{
                            bgcolor:
                              theme.palette.mode === "light" ? undefined : "#333",
                            color:
                              theme.palette.mode === "light"
                                ? undefined
                                : "#e0e0e0",
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}

                {activeTab === 2 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {getDisplayAddress()}
                    </Typography>

                    {!locationAvailable ? (
                      <Box
                        sx={{
                          width: "100%",
                          height: 300,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor:
                            theme.palette.mode === "light" ? "#f5f5f5" : "#333",
                          borderRadius: 2,
                          border:
                            theme.palette.mode === "light"
                              ? "1px solid #e0e0e0"
                              : "1px solid #444",
                        }}
                      >
                        <Typography color="text.secondary" align="center">
                          Exact location not disclosed by landlord.<br />
                          Contact broker for more details.
                        </Typography>
                      </Box>
                    ) : (
                      /* Google Map Container */
                      <Box
                        sx={{
                          width: "100%",
                          height: 300,
                          borderRadius: 2,
                          overflow: "hidden",
                          position: "relative",
                          border:
                            theme.palette.mode === "light"
                              ? "1px solid #e0e0e0"
                              : "1px solid #444",
                        }}
                      >
                        {/* Loading Indicator */}
                        {isMapLoading && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                              bgcolor: "rgba(0,0,0,0.1)",
                            }}
                          >
                            <CircularProgress color="primary" />
                          </Box>
                        )}

                        {/* Error Message */}
                        {mapError && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              zIndex: 1,
                              p: 2,
                            }}
                          >
                            <Alert severity="error" sx={{ width: "100%" }}>
                              {mapError}
                            </Alert>
                          </Box>
                        )}

                        {/* The actual map container */}
                        <Box
                          ref={mapRef}
                          sx={{
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Contact Broker Dialog */}
      <ContactBrokerDialog
        open={openContactDialog}
        onClose={() => setOpenContactDialog(false)}
        apartmentId={apartment._id}
        brokerName={brokerInfo?.fullName || "the broker"}
        brokerEmail={brokerInfo?.email}
        brokerPhone={brokerInfo?.phone}
        brokerImage={brokerInfo?.imagePath ? `http://localhost:4000${brokerInfo.imagePath}` : null}
        brokerCompany={brokerInfo?.company}
        apartmentDetails={apartment}
      />

      {/* Schedule Tour Dialog */}
      <ScheduleTourDialog
        open={openTourDialog}
        onClose={() => setOpenTourDialog(false)}
        apartmentId={apartment._id}
        brokerName={brokerInfo?.fullName || "the broker"}
        brokerImage={brokerInfo?.imagePath ? `http://localhost:4000${brokerInfo.imagePath}` : null}
        apartmentName={`${apartment.bedrooms} BHK in ${apartment.neighborhood}`}
      />
    </>
  );
};

export default ViewApartmentModal