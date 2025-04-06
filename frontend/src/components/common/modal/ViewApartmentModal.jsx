import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Chip,
  MobileStepper,
  Button,
  CardMedia,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import dayjs from "dayjs";

const ViewApartmentModal = ({ open, onClose, apartment }) => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const primaryColor = "#00b386";

  if (!apartment) return null;

  const gallery = apartment.imageUrls?.length ? apartment.imageUrls : [apartment.imageUrl];

  const handleStep = (dir) => {
    if (dir === "next" && activeStep < gallery.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else if (dir === "back" && activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };
  
  // Dynamic styles based on theme mode
  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 700,
    bgcolor: theme.palette.background.paper,
    boxShadow: theme.palette.mode === 'light' 
      ? "0 8px 32px rgba(0, 0, 0, 0.1)" 
      : "0 8px 32px rgba(0, 0, 0, 0.3)",
    borderRadius: 3,
    p: 4,
    maxHeight: "90vh",
    overflowY: "auto",
    border: theme.palette.mode === 'light' 
      ? 'none' 
      : '1px solid rgba(255, 255, 255, 0.05)',
  };
  
  const mapPlaceholderBg = theme.palette.mode === 'light' 
    ? "#E5E7EB" 
    : "#2a2a2a";
    
  const mapPlaceholderColor = theme.palette.mode === 'light' 
    ? "#6B7280" 
    : "#a0a0a0";

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {apartment.bedrooms} BHK in {apartment.neighborhood}
          </Typography>
          <IconButton onClick={onClose} color="inherit">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Location */}
        <Typography variant="body2" color="text.secondary" mb={1}>
          <LocationOnIcon sx={{ fontSize: 16, verticalAlign: "middle" }} />{" "}
          {apartment.neighborhood}, Mumbai
        </Typography>

        {/* Image Gallery */}
        <Box mb={2} sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="260"
            image={`http://localhost:4000${gallery[activeStep]}`}
            alt="Apartment"
            sx={{ borderRadius: 2, objectFit: "cover", width: "100%" }}
          />
          {gallery.length > 1 && (
            <MobileStepper
              variant="dots"
              steps={gallery.length}
              position="static"
              activeStep={activeStep}
              sx={{
                background: "transparent",
                justifyContent: "center",
                mt: 1,
                "& .MuiMobileStepper-dot": {
                  backgroundColor: theme.palette.mode === 'light' 
                    ? "rgba(0,0,0,0.2)" 
                    : "rgba(255,255,255,0.2)",
                },
                "& .MuiMobileStepper-dotActive": {
                  backgroundColor: primaryColor,
                },
              }}
              nextButton={
                <Button
                  size="small"
                  onClick={() => handleStep("next")}
                  disabled={activeStep === gallery.length - 1}
                  sx={{ color: primaryColor }}
                >
                  Next
                </Button>
              }
              backButton={
                <Button
                  size="small"
                  onClick={() => handleStep("back")}
                  disabled={activeStep === 0}
                  sx={{ color: primaryColor }}
                >
                  Back
                </Button>
              }
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Apartment Details */}
        <Box>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1}>
            Apartment Details
          </Typography>
          <Stack direction="row" flexWrap="wrap" spacing={1} rowGap={1} mb={2}>
            <Chip 
              label={`${apartment.bedrooms} Bedrooms`} 
              sx={{
                bgcolor: theme.palette.mode === 'light' ? undefined : '#333',
                color: theme.palette.mode === 'light' ? undefined : '#e0e0e0',
              }}
            />
            <Chip 
              label={`${apartment.bathrooms || 1} Bathrooms`}
              sx={{
                bgcolor: theme.palette.mode === 'light' ? undefined : '#333',
                color: theme.palette.mode === 'light' ? undefined : '#e0e0e0',
              }}
            />
            <Chip 
              label={apartment.furnishedStatus || "Semi-Furnished"}
              sx={{
                bgcolor: theme.palette.mode === 'light' ? undefined : '#333',
                color: theme.palette.mode === 'light' ? undefined : '#e0e0e0',
              }}
            />
            <Chip 
              label={`Price: $${apartment.price.toLocaleString()}`}
              sx={{
                bgcolor: theme.palette.mode === 'light' ? undefined : '#333',
                color: theme.palette.mode === 'light' ? undefined : '#e0e0e0',
              }}
            />
            <Chip 
              label={`Type: ${apartment.type || "N/A"}`}
              sx={{
                bgcolor: theme.palette.mode === 'light' ? undefined : '#333',
                color: theme.palette.mode === 'light' ? undefined : '#e0e0e0',
              }}
            />
            <Chip 
              label={`Floor: ${apartment.floor || "N/A"}`}
              sx={{
                bgcolor: theme.palette.mode === 'light' ? undefined : '#333',
                color: theme.palette.mode === 'light' ? undefined : '#e0e0e0',
              }}
            />
            <Chip 
              label={`Lease: ${apartment.leaseCapacity || "N/A"}`}
              sx={{
                bgcolor: theme.palette.mode === 'light' ? undefined : '#333',
                color: theme.palette.mode === 'light' ? undefined : '#e0e0e0',
              }}
            />
          </Stack>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Listed {dayjs(apartment.createdAt).fromNow()}
        </Typography>

        {/* Google Maps Placeholder */}
        <Box mt={4}>
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={1}>
            Location on Map
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: 200,
              borderRadius: 2,
              backgroundColor: mapPlaceholderBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: mapPlaceholderColor,
              fontStyle: "italic",
            }}
          >
            Google Maps Placeholder
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewApartmentModal;