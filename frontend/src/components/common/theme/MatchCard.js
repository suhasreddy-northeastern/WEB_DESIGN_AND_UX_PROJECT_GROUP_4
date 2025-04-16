import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  Button,
  CardMedia,
  MobileStepper,
  Stack,
  Chip,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import InfoIcon from "@mui/icons-material/Info";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import DiamondIcon from "@mui/icons-material/Diamond";
import WarningIcon from "@mui/icons-material/Warning";
import ViewApartmentModal from "../modal/ViewApartmentModal";

const MatchCard = ({
  apt,
  matchScore,
  currentStep,
  gallery,
  createdAt,
  onStepChange,
  matchColor,
  explanation,
  isSaved = false,
  onSaveToggle,
}) => {
  const theme = useTheme();
  const primaryColor = "#00b386";
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedStatus, setSavedStatus] = useState(isSaved);

  // Helper function to properly format image URLs
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return "http://localhost:4000/images/no-image.png";
    
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Otherwise, prepend the base URL
    return `http://localhost:4000${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  // Simple fallback for high scores when API fails
  const generateHighScoreFallback = () => {
    return [
      { type: "check", text: "Within your budget range" },
      { type: "check", text: `Has your required bedrooms (${apt.bedrooms})` },
      { type: "check", text: `In your preferred neighborhood (${apt.neighborhood})` },
      Array.isArray(apt.amenities) && apt.amenities.length > 0 ? 
        { type: "check", text: "Has desired amenities" } : null,
      apt.furnishedStatus ? 
        { type: "check", text: "Matches your furnishing preferences" } : null
    ].filter(Boolean); // Remove null items
  };

  // Simple fallback for low scores when API fails
  const generateLowScoreFallback = () => {
    const items = [];
    
    // Add explanation for why score is low
    items.push({ type: "info", text: `This apartment has a ${matchScore}% match with your preferences` });
    
    // Add common mismatches based on apartment data
    if (apt.bedrooms < 3) {
      items.push({ type: "cancel", text: `Only has ${apt.bedrooms} bedroom${apt.bedrooms !== 1 ? 's' : ''}` });
    }
    
    if (apt.price < 1500) {
      items.push({ 
        type: "cancel", 
        text: `Lower price point ($${apt.price.toLocaleString()}) may mean fewer amenities` 
      });
    } else if (apt.price > 4000) {
      items.push({ 
        type: "cancel", 
        text: `Higher price point ($${apt.price.toLocaleString()}) exceeds typical budget` 
      });
    }
    
    // Add recommendations
    items.push({ 
      type: "lightbulb", 
      text: "Consider your priorities - location, price, and amenities" 
    });
    
    items.push({ 
      type: "lightbulb", 
      text: "View the apartment to see if it meets your needs despite the low match score" 
    });
    
    return items;
  };

  // Process the explanation text from API or generate fallback
  const getProcessedExplanation = () => {
    // ONLY use fallback if explanation is empty or error message
    if (!explanation || explanation === "Could not generate explanation.") {
      return matchScore >= 80 ? generateHighScoreFallback() : generateLowScoreFallback();
    }
    
    // Otherwise, process the explanation from the API
    const lines = explanation.split("\n").filter(Boolean);
    return lines.map(line => {
      if (line.startsWith("✅")) {
        return { type: "check", text: line.substring(2).trim() };
      } else if (line.startsWith("❌")) {
        return { type: "cancel", text: line.substring(2).trim() };
      } else if (line.startsWith("💎")) {
        return { type: "diamond", text: line.substring(2).trim() };
      } else if (line.startsWith("🟡")) {
        return { type: "warning", text: line.substring(2).trim() };
      } else if (line.startsWith("💡")) {
        return { type: "lightbulb", text: line.substring(2).trim() };
      } else {
        return { type: "info", text: line };
      }
    });
  };

  // Update savedStatus when isSaved prop changes
  useEffect(() => {
    setSavedStatus(isSaved);
  }, [isSaved]);

  const handleSaveToggle = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      // Calculate the new saved status (opposite of current)
      const newSavedStatus = !savedStatus;
      
      // Update local state first for immediate UI feedback
      setSavedStatus(newSavedStatus);
      
      // Call the parent component's onSaveToggle function
      // This is critical - pass the apartment ID and the NEW status
      if (onSaveToggle) {
        await onSaveToggle(apt._id, newSavedStatus);
      }
    } catch (err) {
      console.error("Save toggle error:", err);
      // If there was an error, revert the UI
      setSavedStatus(!savedStatus);
    } finally {
      setSaving(false);
    }
  };

  // Get icon component based on type
  const getIconForType = (type) => {
    switch (type) {
      case "check":
        return <CheckCircleIcon sx={{ color: "#10B981", fontSize: 18, mr: 1 }} />;
      case "cancel":
        return <CancelIcon sx={{ color: theme.palette.mode === 'light' ? "#EF4444" : "#f87171", fontSize: 18, mr: 1 }} />;
      case "diamond":
        return <DiamondIcon sx={{ color: theme.palette.mode === 'light' ? "#3B82F6" : "#60a5fa", fontSize: 18, mr: 1 }} />;
      case "warning":
        return <WarningIcon sx={{ color: theme.palette.mode === 'light' ? "#F59E0B" : "#fbbf24", fontSize: 18, mr: 1 }} />;
      case "lightbulb":
        return <LightbulbIcon sx={{ color: theme.palette.mode === 'light' ? "#6366F1" : "#818cf8", fontSize: 18, mr: 1 }} />;
      case "info":
      default:
        return <InfoIcon sx={{ color: theme.palette.mode === 'light' ? "#6B7280" : "#9CA3AF", fontSize: 18, mr: 1 }} />;
    }
  };

  const processedExplanation = getProcessedExplanation();

  return (
    <>
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: theme.palette.mode === 'light' 
            ? "0 2px 12px rgba(20, 20, 43, 0.08)" 
            : "0 2px 12px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.palette.mode === 'light' 
              ? "0 8px 24px rgba(20, 20, 43, 0.12)" 
              : "0 8px 24px rgba(0, 0, 0, 0.3)",
          },
          overflow: "hidden",
          border: theme.palette.mode === 'light' 
            ? "1px solid #F2F4F7" 
            : "1px solid #333",
          position: "relative",
        }}
      >
        {/* Match Score Badge */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            backgroundColor: theme.palette.mode === 'light' 
              ? "white" 
              : "#1e1e1e",
            borderRadius: "50%",
            width: 70,
            height: 70,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: theme.palette.mode === 'light' 
              ? "0 2px 12px rgba(20, 20, 43, 0.1)" 
              : "0 2px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <CircularProgress
            variant="determinate"
            value={matchScore}
            thickness={4}
            size={65}
            sx={{ color: matchColor, position: "absolute" }}
          />
          <Typography
            variant="h6"
            fontWeight={700}
            color={theme.palette.mode === 'light' ? "#111927" : "#e0e0e0"}
            fontSize={20}
          >
            {matchScore}
            <Typography
              component="span"
              variant="caption"
              fontSize={10}
              fontWeight={600}
            >
              %
            </Typography>
          </Typography>
          <Typography
            variant="caption"
            fontSize={10}
            sx={{ mt: -0.5, color: theme.palette.mode === 'light' ? "#6B7280" : "#b0b0b0" }}
          >
            MATCH
          </Typography>
        </Box>

        {/* Save/Favorite Button */}
        <Box
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 10,
          }}
        >
          <Tooltip title={savedStatus ? "Unsave" : "Save"}>
            <IconButton
              onClick={handleSaveToggle}
              disabled={saving}
              sx={{
                backgroundColor: theme.palette.mode === 'light' ? "white" : "#1e1e1e",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                "&:hover": {
                  backgroundColor: theme.palette.mode === 'light' ? "#f9fafb" : "#333",
                },
                color: savedStatus ? "#FF4081" : (theme.palette.mode === 'light' ? "#9CA3AF" : "#9CA3AF"),
              }}
            >
              {savedStatus ? (
                <FavoriteIcon sx={{ fontSize: 22 }} />
              ) : (
                <FavoriteBorderIcon sx={{ fontSize: 22 }} />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          {/* Image Section - UPDATED */}
          <Box sx={{ width: { xs: "100%", md: 240 }, position: "relative" }}>
            <CardMedia
              component="img"
              image={formatImageUrl(gallery[currentStep])}
              alt="Apartment Preview"
              sx={{
                height: { xs: 200, md: "100%" },
                objectFit: "cover",
              }}
              onError={(e) => {
                console.error(`Failed to load image: ${gallery[currentStep]}`);
                e.target.src = "http://localhost:4000/images/no-image.png";
              }}
            />
            {gallery.length > 1 && (
              <MobileStepper
                variant="dots"
                steps={gallery.length}
                position="static"
                activeStep={currentStep}
                sx={{
                  justifyContent: "center",
                  backgroundColor: theme.palette.mode === 'light' 
                    ? "rgba(255, 255, 255, 0.8)" 
                    : "rgba(0, 0, 0, 0.6)",
                  position: "absolute",
                  bottom: 0,
                  width: "100%",
                  "& .MuiMobileStepper-dot": {
                    backgroundColor: theme.palette.mode === 'light' 
                      ? "rgba(0, 0, 0, 0.2)" 
                      : "rgba(255, 255, 255, 0.3)",
                    mx: 0.3,
                  },
                  "& .MuiMobileStepper-dotActive": {
                    backgroundColor: primaryColor,
                  },
                }}
                nextButton={
                  <Button
                    size="small"
                    onClick={() => onStepChange("next")}
                    disabled={currentStep === gallery.length - 1}
                    sx={{ color: primaryColor, minWidth: "auto", px: 1 }}
                  >
                    Next
                  </Button>
                }
                backButton={
                  <Button
                    size="small"
                    onClick={() => onStepChange("back")}
                    disabled={currentStep === 0}
                    sx={{ color: primaryColor, minWidth: "auto", px: 1 }}
                  >
                    Back
                  </Button>
                }
              />
            )}
          </Box>

          {/* Content Section */}
          <CardContent sx={{ p: 3, width: "100%" }}>
            <Box mb={1.5}>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                color={theme.palette.mode === 'light' ? "#111927" : "#e0e0e0"}
              >
                {apt.bedrooms} BHK in {apt.neighborhood}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mt: 0.5 }}
              >
                <LocationOnIcon sx={{ 
                  fontSize: 16, 
                  color: theme.palette.mode === 'light' ? "#6B7280" : "#b0b0b0" 
                }} />
                <Typography 
                  variant="body2" 
                  color={theme.palette.mode === 'light' ? "#6B7280" : "#b0b0b0"}
                >
                  {apt.neighborhood}
                </Typography>
              </Stack>
              <Typography
                variant="h6"
                sx={{ 
                  color: theme.palette.mode === 'light' ? "#111927" : "#e0e0e0", 
                  fontWeight: 700, 
                  mt: 1 
                }}
              >
                ${apt.price.toLocaleString()}
              </Typography>
              <Typography
                variant="caption"
                color={theme.palette.mode === 'light' ? "#6B7280" : "#b0b0b0"}
                sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
              >
                <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Listed {createdAt}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2, mt: 2 }}
            >
              <Chip
                label={`${apt.bedrooms} Bedroom${apt.bedrooms > 1 ? "s" : ""}`}
                sx={{
                  backgroundColor: theme.palette.mode === 'light' ? undefined : "#333",
                  color: theme.palette.mode === 'light' ? undefined : "#e0e0e0",
                }}
              />
              <Chip
                label={`${apt.bathrooms || 1} Bathroom${
                  apt.bathrooms > 1 ? "s" : ""
                }`}
                sx={{
                  backgroundColor: theme.palette.mode === 'light' ? undefined : "#333",
                  color: theme.palette.mode === 'light' ? undefined : "#e0e0e0",
                }}
              />
              <Chip 
                label={apt.furnishedStatus || "Semi-Furnished"} 
                sx={{
                  backgroundColor: theme.palette.mode === 'light' ? undefined : "#333",
                  color: theme.palette.mode === 'light' ? undefined : "#e0e0e0",
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle2"
              fontWeight={600}
              gutterBottom
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                color: theme.palette.mode === 'light' ? "#111927" : "#e0e0e0" 
              }}
            >
              {matchScore >= 80 ? (
                <>
                  <CheckCircleIcon
                    sx={{ color: matchColor, fontSize: 18, mr: 1 }}
                  />
                  Why this is a good match:
                </>
              ) : (
                <>
                  <InfoIcon
                    sx={{ color: matchColor, fontSize: 18, mr: 1 }}
                  />
                  Why this may not be ideal for you:
                </>
              )}
            </Typography>

            <Box
              sx={{
                mt: 1.5,
                mb: 2.5,
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'light' ? "#F9FAFB" : "#2a2a2a",
                borderLeft: `3px solid ${matchColor}`,
                fontSize: 14,
                color: theme.palette.mode === 'light' ? "#374151" : "#d0d0d0",
              }}
            >
              {processedExplanation.length > 0 ? (
                processedExplanation.map((item, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'flex-start',
                      mb: 1,
                      pl: 0.5
                    }}
                  >
                    {getIconForType(item.type)}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        pt: '1px',
                        fontWeight: item.type === "lightbulb" ? 400 : 500,
                        fontStyle: item.type === "lightbulb" ? "italic" : "normal",
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ color: theme.palette.mode === 'light' ? "#6B7280" : "#9CA3AF", fontSize: 18, mr: 1 }} />
                  <Typography variant="body2">No explanation available</Typography>
                </Box>
              )}
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={1}>
              <Button
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: 1.5,
                  backgroundColor: primaryColor,
                  fontWeight: 600,
                  textTransform: "none",
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#009973",
                    boxShadow: "none",
                  },
                }}
                onClick={() => setOpen(true)}
              >
                View Apartment
              </Button>
            </Box>
          </CardContent>
        </Box>
      </Card>

      {/* Modal integrated here */}
      <ViewApartmentModal
        open={open}
        onClose={() => setOpen(false)}
        apartment={{
          ...apt,
          matchScore
        }}
      />
    </>
  );
};

export default MatchCard;