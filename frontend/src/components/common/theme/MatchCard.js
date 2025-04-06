import React, { useState } from "react";
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
} from "@mui/material";
import axios from "axios";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  isSavedView = false,
  onRemove,
}) => {
  const theme = useTheme();
  const primaryColor = "#00b386";
  const [open, setOpen] = useState(false);

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

        <Box
          sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}
        >
          {/* Image Section */}
          <Box sx={{ width: { xs: "100%", md: 240 }, position: "relative" }}>
            <CardMedia
              component="img"
              image={`http://localhost:4000${
                gallery[currentStep] || "/images/no-image.png"
              }`}
              alt="Apartment Preview"
              sx={{
                height: { xs: 200, md: "100%" },
                objectFit: "cover",
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
              <CheckCircleIcon
                sx={{ color: matchColor, fontSize: 18, mr: 1 }}
              />
              Why this is a {matchScore}% match:
            </Typography>

            <Box
              sx={{
                mt: 1.5,
                mb: 2.5,
                p: 2,
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'light' ? "#F9FAFB" : "#2a2a2a",
                borderLeft: `3px solid ${matchColor}`,
                fontFamily: "monospace",
                fontSize: 14,
                color: theme.palette.mode === 'light' ? "#374151" : "#d0d0d0",
                whiteSpace: "pre-line",
              }}
            >
              {explanation
                ?.split("\n")
                .filter(Boolean)
                .map((line, i) => {
                  let color;
                  if (line.startsWith("✅")) color = "#10B981";
                  else if (line.startsWith("❌")) color = theme.palette.mode === 'light' ? "#EF4444" : "#f87171";
                  else if (line.startsWith("💎")) color = theme.palette.mode === 'light' ? "#3B82F6" : "#60a5fa";
                  else if (line.startsWith("🟡")) color = theme.palette.mode === 'light' ? "#F59E0B" : "#fbbf24";
                  else color = theme.palette.mode === 'light' ? "#374151" : "#d0d0d0";
                  
                  return (
                    <Box key={i} sx={{ color, mb: 0.5 }}>
                      {line}
                    </Box>
                  );
                })}
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={1} gap={2}>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  borderColor: theme.palette.mode === 'light' ? "#E5E7EB" : "#444",
                  color: theme.palette.mode === 'light' ? "#4B5563" : "#b0b0b0",
                  px: 3,
                  "&:hover": {
                    borderColor: theme.palette.mode === 'light' ? "#D1D5DB" : "#555",
                    backgroundColor: theme.palette.mode === 'light' ? "#F9FAFB" : "#333",
                  },
                }}
                onClick={async () => {
                  try {
                    await axios.post(
                      "http://localhost:4000/api/user/save",
                      { apartmentId: apt._id },
                      { withCredentials: true }
                    );
                    alert("Toggled save status! 🎉"); // or toast
                  } catch (err) {
                    console.error("Save error:", err);
                    alert("Error saving apartment.");
                  }
                }}
              >
                Save
              </Button>

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
        apartment={apt}
      />
    </>
  );
};

export default MatchCard;