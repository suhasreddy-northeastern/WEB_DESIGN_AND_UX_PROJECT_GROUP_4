import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Divider,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import MatchCard from "../../components/common/theme/MatchCard";
import LoadingMessage from "../../components/common/LoadingMessage";

const SavedListings = () => {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const primaryColor = "#00b386";

  const fetchSavedListings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/api/user/saved", {
        withCredentials: true,
      });

      const apartments = res.data || [];

      const enriched = await Promise.all(
        apartments.map(async (apt) => {
          try {
            const response = await axios.post(
              "http://localhost:4000/api/groq/explanation",
              { apartment: apt }, // optionally send latest preferences too
              { withCredentials: true }
            );
            return {
              ...apt,
              explanation: response.data.explanation,
              matchScore: response.data.matchScore || 0,
              currentStep: 0, // Initialize currentStep for gallery
            };
          } catch {
            return { 
              ...apt, 
              explanation: "Explanation unavailable", 
              matchScore: 0,
              currentStep: 0, 
            };
          }
        })
      );

      setSaved(enriched);
    } catch (err) {
      console.error("Failed to fetch saved listings", err);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedListings();
  }, []);

  const handleSaveToggle = async (aptId, isSaved) => {
    if (!isSaved) {
      // If apartment was unsaved, remove it from the list
      setSaved(prev => prev.filter(apt => apt._id !== aptId));
    }
  };

  const handleStepChange = (aptId, dir) => {
    setSaved((prev) =>
      prev.map((item) => {
        if (item._id !== aptId) return item;
        const current = item.currentStep || 0;
        const imageUrls = item.imageUrls || [];
        const max = imageUrls.length;
        
        // Handle case where there are no images or only one image
        if (max <= 1) return item;
        
        const next =
          dir === "next"
            ? Math.min(current + 1, max - 1)
            : Math.max(current - 1, 0);
        return { ...item, currentStep: next };
      })
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={600} color="#111927">
          Saved Listings
        </Typography>
      </Box>

      <Divider sx={{ mb: 3, borderColor: "#E5E7EB" }} />

      {loading ? (
        <LoadingMessage />
      ) : saved.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            mt: 8,
            p: 4,
            borderRadius: 2,
            backgroundColor: "rgba(0, 179, 134, 0.05)",
            border: "1px solid rgba(0, 179, 134, 0.1)",
          }}
        >
          <FavoriteIcon sx={{ fontSize: 40, color: primaryColor, mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            You haven't saved any apartments yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {saved.map((apt) => {
            const gallery = apt.imageUrls || [apt.imageUrl];
            const matchScore = Math.round(apt.matchScore || 0);
            const matchColor =
              matchScore >= 80 ? "#36B37E" : matchScore >= 50 ? "#FFAB00" : "#FF5630";
            const currentStep = apt.currentStep || 0;
            const createdAt = dayjs(apt.createdAt).fromNow();

            return (
              <Grid item xs={12} key={apt._id}>
                <MatchCard
                  apt={apt}
                  matchScore={matchScore}
                  matchColor={matchColor}
                  currentStep={currentStep}
                  gallery={gallery}
                  createdAt={createdAt}
                  onStepChange={(dir) => handleStepChange(apt._id, dir)}
                  explanation={apt.explanation}
                  isSaved={true}
                  onSaveToggle={handleSaveToggle}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default SavedListings;