import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Grid,
  Divider,
  Box,
  Paper,
  Chip,
  useTheme,
} from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import EditIcon from "@mui/icons-material/Edit";

const HousingPreferences = ({ preferences }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const primaryColor = theme.palette.primary.main;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: isDarkMode
          ? "rgba(255, 255, 255, 0.05)"
          : "#fff",
        border: isDarkMode
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "none",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        color="text.primary"
        sx={{ display: "flex", alignItems: "center" }}
      >
        <HomeWorkIcon sx={{ mr: 1 }} /> Housing Preferences
      </Typography>

      <Divider sx={{ my: 2 }} />

      {preferences ? (
        <Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Budget Range:
              </Typography>
              <Typography variant="body1" color="text.primary">
                {preferences.priceRange || "Not specified"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Bedrooms:
              </Typography>
              <Typography variant="body1" color="text.primary">
                {preferences.bedrooms || "Not specified"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Neighborhood:
              </Typography>
              <Typography variant="body1" color="text.primary">
                {preferences.neighborhood || "Not specified"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Move-in Date:
              </Typography>
              <Typography variant="body1" color="text.primary">
                {preferences.moveInDate
                  ? new Date(
                      preferences.moveInDate
                    ).toLocaleDateString()
                  : "Not specified"}
              </Typography>
            </Grid>
            {preferences.amenities &&
              preferences.amenities.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Desired Amenities:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    {preferences.amenities.map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" />
                    ))}
                  </Box>
                </Grid>
              )}
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate("/preferences")}
              sx={{
                borderRadius: 2,
                borderColor: primaryColor,
                color: primaryColor,
              }}
            >
              Update Preferences
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/matches/${preferences._id}`)}
              sx={{
                borderRadius: 2,
                bgcolor: primaryColor,
                "&:hover": {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              View Matches
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            You haven't set your housing preferences yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/preferences")}
            sx={{
              borderRadius: 2,
              bgcolor: primaryColor,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            Set Preferences
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default HousingPreferences;