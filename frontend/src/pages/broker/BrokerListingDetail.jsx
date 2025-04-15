import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BarChartIcon from "@mui/icons-material/BarChart";
import MessageIcon from "@mui/icons-material/Message";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const BrokerListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const primaryColor = "#00b386";
  const isDarkMode = theme.palette.mode === "dark";

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/broker/listings/${id}`,
          {
            withCredentials: true,
          }
        );
        console.log("Listing data:", response.data);
        setListing(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching listing:", err);
        if (err.response?.status === 404) {
          setError("Listing not found. It may have been deleted.");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view this listing.");
        } else {
          setError("Failed to load listing details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleEditClick = () => {
    navigate(`/broker/listings`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation !== "DELETE") return;

    try {
      setIsDeleting(true);
      await axios.delete(`${API_BASE_URL}/api/broker/listings/${id}`, {
        withCredentials: true,
      });
      setDeleteDialogOpen(false);
      navigate("/broker/listings", {
        state: { message: "Listing deleted successfully" },
      });
    } catch (err) {
      console.error("Error deleting listing:", err);
      setError("Failed to delete listing. Please try again.");
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/broker/listings/${id}/toggle-active`,
        { isActive: !listing.isActive },
        { withCredentials: true }
      );

      setListing({
        ...listing,
        isActive: !listing.isActive,
      });
    } catch (err) {
      console.error("Error toggling listing status:", err);
      setError("Failed to update listing status. Please try again.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/broker/listings")}
          sx={{ mb: 2 }}
        >
          Back to Listings
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/broker/listings")}
          sx={{ mb: 2 }}
        >
          Back to Listings
        </Button>
        <Alert severity="info">Listing not found.</Alert>
      </Box>
    );
  }

  // Format move-in date
  const moveInDate = listing.moveInDate
    ? new Date(listing.moveInDate).toLocaleDateString()
    : "Flexible";

  // Format bedrooms
  const bedrooms =
    typeof listing.bedrooms === "number"
      ? `${listing.bedrooms} BR`
      : listing.bedrooms || "Not specified";

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/broker/listings")}
          sx={{ mr: "auto" }}
        >
          Back to Listings
        </Button>

        <Button
          variant={listing.isActive ? "outlined" : "contained"}
          color={listing.isActive ? "error" : "success"}
          onClick={handleToggleActive}
          sx={{ mr: 1 }}
        >
          {listing.isActive ? "Deactivate" : "Activate"}
        </Button>

        <IconButton color="primary" onClick={handleEditClick} sx={{ mr: 1 }}>
          <EditIcon />
        </IconButton>

        <IconButton color="error" onClick={handleDeleteClick}>
          <DeleteIcon />
        </IconButton>
      </Box>

      <Paper
        elevation={isDarkMode ? 2 : 3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
        }}
      >
        {/* Status indicator */}
        {!listing.isActive && (
          <Box
            sx={{
              bgcolor: "error.main",
              color: "white",
              py: 0.5,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            INACTIVE LISTING
          </Box>
        )}

        {/* Image gallery */}
        <Box sx={{ position: "relative", height: 400, bgcolor: "grey.100" }}>
          {listing.imageUrls && listing.imageUrls.length > 0 ? (
            <Box
              component="img"
              src={
                listing.imageUrls[0].startsWith("http")
                  ? listing.imageUrls[0]
                  : `${API_BASE_URL}${listing.imageUrls[0]}`
              }
              alt={`${bedrooms} in ${listing.neighborhood}`}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                console.error(`Error loading image: ${listing.imageUrls[0]}`);
                e.target.src =
                  "https://placehold.co/800x400?text=No+Image+Available";
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "grey.200",
                color: "text.secondary",
              }}
            >
              <Typography variant="h6">No images available</Typography>
            </Box>
          )}

          {/* Price chip */}
          <Chip
            label={`$${listing.price?.toLocaleString() || "Price not set"}`}
            color="primary"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              fontSize: "1.2rem",
              fontWeight: "bold",
              height: "auto",
              py: 1,
              backgroundColor: primaryColor,
            }}
          />

          {/* Thumbnail gallery (if more than one image) */}
          {listing.imageUrls && listing.imageUrls.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                display: "flex",
                overflowX: "auto",
                gap: 1,
                pb: 1,
              }}
            >
              {listing.imageUrls.slice(1).map((url, index) => (
                <Box
                  key={index}
                  component="img"
                  src={
                    url.startsWith("http") ? url : `${API_BASE_URL}${url}`
                  }
                  alt={`Apartment view ${index + 2}`}
                  sx={{
                    width: 80,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: 1,
                    cursor: "pointer",
                    border: "2px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onError={(e) => {
                    console.error(`Error loading thumbnail: ${url}`);
                    e.target.src = "https://placehold.co/80x60?text=Error";
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="bold"
            color="text.primary"
          >
            {bedrooms} in {listing.neighborhood || "Location not specified"}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            paragraph
            sx={{ display: "flex", alignItems: "center" }}
          >
            <LocationOnIcon sx={{ mr: 1, color: primaryColor }} />
            {listing.location?.address || "Address not specified"}
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <BedIcon
                      sx={{ fontSize: 16, mr: 0.5, color: primaryColor }}
                    />
                    Bedrooms
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {bedrooms}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <BathtubIcon
                      sx={{ fontSize: 16, mr: 0.5, color: primaryColor }}
                    />
                    Bathrooms
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {listing.bathrooms || "Not specified"}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <SquareFootIcon
                      sx={{ fontSize: 16, mr: 0.5, color: primaryColor }}
                    />
                    Square Feet
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {listing.sqft ? `${listing.sqft} sqft` : "Not specified"}
                  </Typography>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, mr: 0.5, color: primaryColor }}
                    />
                    Move-in Date
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {moveInDate}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Details
              </Typography>

              <Grid container spacing={2}>
                {[
                  { label: "Type", value: listing.type },
                  { label: "Style", value: listing.style },
                  { label: "Floor", value: listing.floor },
                  { label: "Parking", value: listing.parking },
                  { label: "Public Transport", value: listing.transport },
                  { label: "Safety Level", value: listing.safety },
                  { label: "Pets Policy", value: listing.pets },
                  { label: "View", value: listing.view },
                ].map(
                  (item, index) =>
                    item.value && (
                      <Grid item xs={6} sm={4} key={index}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="body2">{item.value}</Typography>
                      </Grid>
                    )
                )}
              </Grid>

              {listing.amenities && listing.amenities.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Amenities
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {listing.amenities.map((amenity, index) => (
                      <Chip
                        key={index}
                        label={amenity}
                        variant="outlined"
                        sx={{
                          borderColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.02)",
                  border: isDarkMode
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <BarChartIcon sx={{ mr: 1, color: primaryColor }} />
                    Performance Metrics
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Views
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        color={primaryColor}
                      >
                        {listing.views !== undefined ? listing.views : "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        <MessageIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        Inquiries
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="medium"
                        color={primaryColor}
                      >
                        {listing.inquiries !== undefined
                          ? listing.inquiries
                          : "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <PriceCheckIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Listed Price
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={primaryColor}
                  >
                    ${listing.price?.toLocaleString() || "Not set"}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" color="text.secondary">
                    <CalendarTodayIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Listed Date
                  </Typography>
                  <Typography variant="body1">
                    {listing.createdAt
                      ? new Date(listing.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to delete this listing? This action cannot be
            undone.
          </Typography>
          <Typography paragraph fontWeight="bold">
            Type DELETE to confirm:
          </Typography>
          <TextField
            fullWidth
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            variant="outlined"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleteConfirmation !== "DELETE" || isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : null}
          >
            {isDeleting ? "Deleting..." : "Delete Listing"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrokerListingDetail;
