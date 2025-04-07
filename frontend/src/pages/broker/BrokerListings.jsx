import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Button,
  Chip,
  useTheme,
  CircularProgress,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  ListItemIcon,
  Alert,
  Snackbar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BrokerEditListing from "./BrokerEditListing";
import { useSelector } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const BrokerListings = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const primaryColor = theme.palette.primary.main;
  const isDarkMode = theme.palette.mode === "dark";
  
  const isApproved = user?.isApproved;

  useEffect(() => {
    const fetchListings = async () => {
      if (!user || user.type !== 'broker') {
        navigate('/login');
        return;
      }

      // If broker is not approved, don't make API calls
      if (!isApproved) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(
          "/api/broker/listings",
          {
            withCredentials: true,
          }
        );
        setListings(response.data);
      } catch (error) {
        console.error("Error fetching listings:", error);
        
        if (error.response && error.response.status === 403) {
          showSnackbar("You need admin approval before accessing listings", "error");
        } else {
          showSnackbar("Failed to load listings. Please try again later.", "error");
        }
        
        // Set empty listings array on error
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, navigate, isApproved]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleMenuOpen = (event, listing) => {
    setAnchorEl(event.currentTarget);
    setSelectedListing(listing);
  };

  const handleEditClick = (id) => {
    setSelectedId(id);
    setEditOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(
        `/api/broker/listings/${selectedListing._id}`,
        {
          withCredentials: true,
        }
      );
      setListings(
        listings.filter((listing) => listing._id !== selectedListing._id)
      );
      showSnackbar("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      showSnackbar("Failed to delete listing. Please try again.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedListing(null);
    }
  };

  const handleToggleActive = async () => {
    try {
      const updatedListing = {
        ...selectedListing,
        isActive: !selectedListing.isActive,
      };
      await axios.put(
        `/api/broker/listings/${selectedListing._id}/toggle-active`,
        { isActive: updatedListing.isActive },
        { withCredentials: true }
      );

      setListings(
        listings.map((listing) =>
          listing._id === selectedListing._id ? updatedListing : listing
        )
      );
      
      showSnackbar(`Listing ${updatedListing.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error toggling listing status:", error);
      showSnackbar("Failed to update listing status. Please try again.", "error");
    } finally {
      handleMenuClose();
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  // If broker is not approved, show pending approval message
  if (!isApproved) {
    return (
      <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto', textAlign: 'center' }}>
        <Card
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 64, color: theme.palette.warning.main, mb: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" mb={2} color="text.primary">
            Approval Pending
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary">
            Your broker account is currently pending approval from an administrator.
            Once approved, you'll have full access to all broker features.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This typically takes 1-2 business days. You'll receive an email notification once your account is approved.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              component={Link}
              to="/profile"
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.2,
                bgcolor: primaryColor,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                }
              }}
            >
              Check Profile Status
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          color="text.primary"
        >
          My Listings
        </Typography>
        
        <Button
          component={Link}
          to="/broker/add-listing"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.2,
            bgcolor: primaryColor,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
        >
          Add New Listing
        </Button>
      </Box>

      {listings.length === 0 ? (
        <Card
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: "center",
            backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          }}
        >
          <Typography variant="h6" mb={2} color="text.primary">
            You don't have any listings yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Start by adding your first property listing
          </Typography>
          <Button
            component={Link}
            to="/broker/add-listing"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.2,
              bgcolor: primaryColor,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            Add New Listing
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {listings.map((listing) => {
            // Add a check for any pending approval status
            const isPendingApproval = listing.approvalStatus === 'pending';
            
            return (
              <Grid item xs={12} sm={6} md={4} key={listing._id}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : "#fff",
                    border: isDarkMode
                      ? "1px solid rgba(255, 255, 255, 0.1)"
                      : "none",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: isDarkMode
                        ? "0 8px 24px rgba(0, 0, 0, 0.3)"
                        : "0 8px 24px rgba(35, 206, 163, 0.15)",
                    },
                  }}
                >
                  {!listing.isActive && (
                    <Chip
                      label="Inactive"
                      color="default"
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        zIndex: 1,
                        backgroundColor: isDarkMode
                          ? "rgba(0, 0, 0, 0.6)"
                          : "rgba(0, 0, 0, 0.6)",
                        color: "white",
                      }}
                    />
                  )}
                  
                  {isPendingApproval && (
                    <Chip
                      label="Pending Approval"
                      color="warning"
                      sx={{
                        position: "absolute",
                        top: !listing.isActive ? 45 : 10,
                        left: 10,
                        zIndex: 1,
                      }}
                    />
                  )}
                  
                  <IconButton
                    aria-label="more"
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      zIndex: 1,
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.5)"
                        : "rgba(255, 255, 255, 0.8)",
                      "&:hover": {
                        backgroundColor: isDarkMode
                          ? "rgba(0, 0, 0, 0.7)"
                          : "rgba(255, 255, 255, 0.9)",
                      },
                    }}
                    onClick={(e) => handleMenuOpen(e, listing)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <CardActionArea
                    component={Link}
                    to={`/broker/listings/${listing._id}`}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={listing.imageUrls?.[0] || "/images/placeholder.jpg"}
                      alt={`${listing.bedrooms} bedroom in ${listing.neighborhood}`}
                      sx={{
                        opacity: listing.isActive && !isPendingApproval ? 1 : 0.7,
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          component="div"
                          color="text.primary"
                        >
                          ${listing.price?.toLocaleString()}
                        </Typography>
                        <Chip
                          label={listing.type || "Rent"}
                          size="small"
                          sx={{
                            backgroundColor:
                              (listing.type || "Rent") === "Rent"
                                ? isDarkMode
                                  ? "rgba(35, 206, 163, 0.2)"
                                  : "rgba(35, 206, 163, 0.1)"
                                : isDarkMode
                                ? "rgba(249, 199, 79, 0.2)"
                                : "rgba(249, 199, 79, 0.1)",
                            color:
                              (listing.type || "Rent") === "Rent"
                                ? primaryColor
                                : theme.palette.warning.main,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body1"
                        color="text.primary"
                        gutterBottom
                      >
                        {listing.bedrooms} BHK {listing.style || ""} in{" "}
                        {listing.neighborhood}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          mt: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: "text.secondary",
                          }}
                        >
                          <VisibilityOutlinedIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {listing.views || 0}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: "text.secondary",
                          }}
                        >
                          <EmailOutlinedIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: "text.secondary",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {listing.inquiries || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                  <Divider />
                  <CardActions
                    sx={{
                      justifyContent: "space-between",
                      backgroundColor: isDarkMode
                        ? "rgba(0, 0, 0, 0.2)"
                        : "rgba(0, 0, 0, 0.03)",
                      px: 2,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(listing.createdAt).fromNow()}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => handleEditClick(listing._id)}
                      startIcon={<EditIcon />}
                      sx={{
                        color: primaryColor,
                        "&:hover": {
                          backgroundColor: isDarkMode
                            ? "rgba(35, 206, 163, 0.1)"
                            : "rgba(35, 206, 163, 0.05)",
                        },
                      }}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            minWidth: 180,
            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleEditClick(selectedListing?._id);
            handleMenuClose();
          }}
          sx={{
            py: 1.2,
            "&:hover": {
              backgroundColor: isDarkMode
                ? "rgba(35, 206, 163, 0.1)"
                : "rgba(35, 206, 163, 0.05)",
            },
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" sx={{ color: primaryColor }} />
          </ListItemIcon>
          <Typography variant="body2">View Details</Typography>
        </MenuItem>
        <MenuItem
          component={Link}
          to={`/broker/listings/${selectedListing?._id}/edit`}
          onClick={handleMenuClose}
          sx={{
            py: 1.2,
            "&:hover": {
              backgroundColor: isDarkMode
                ? "rgba(35, 206, 163, 0.1)"
                : "rgba(35, 206, 163, 0.05)",
            },
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: primaryColor }} />
          </ListItemIcon>
          <Typography variant="body2">Edit Listing</Typography>
        </MenuItem>
        
        {/* Only show toggle for listings that are not pending approval */}
        {selectedListing && selectedListing.approvalStatus !== 'pending' && (
          <MenuItem
            onClick={handleToggleActive}
            sx={{
              py: 1.2,
              "&:hover": {
                backgroundColor: isDarkMode
                  ? "rgba(35, 206, 163, 0.1)"
                  : "rgba(35, 206, 163, 0.05)",
              },
            }}
          >
            <ListItemIcon>
              {selectedListing?.isActive ? (
                <VisibilityOffIcon
                  fontSize="small"
                  sx={{ color: theme.palette.warning.main }}
                />
              ) : (
                <VisibilityIcon fontSize="small" sx={{ color: primaryColor }} />
              )}
            </ListItemIcon>
            <Typography variant="body2">
              {selectedListing?.isActive ? "Deactivate" : "Activate"}
            </Typography>
          </MenuItem>
        )}
        
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            py: 1.2,
            "&:hover": {
              backgroundColor: isDarkMode
                ? "rgba(231, 76, 60, 0.1)"
                : "rgba(231, 76, 60, 0.05)",
            },
          }}
        >
          <ListItemIcon>
            <DeleteIcon
              fontSize="small"
              sx={{ color: theme.palette.error.main }}
            />
          </ListItemIcon>
          <Typography variant="body2" color="error">
            Delete Listing
          </Typography>
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            width: "100%",
            maxWidth: 360,
            backgroundColor: isDarkMode
              ? theme.palette.background.paper
              : "#fff",
            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          },
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this listing? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: isDarkMode
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.2)",
              color: "text.secondary",
              "&:hover": {
                borderColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.3)",
                backgroundColor: "transparent",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disableElevation
            sx={{
              backgroundColor: theme.palette.error.main,
              "&:hover": {
                backgroundColor: theme.palette.error.dark,
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <BrokerEditListing
        open={editOpen}
        onClose={() => setEditOpen(false)}
        apartmentId={selectedId}
        onUpdate={(updated) => {
          // Replace updated apartment in state
          setListings((prev) =>
            prev.map((apt) => (apt._id === updated._id ? updated : apt))
          );
        }}
      />
    </Box>
  );
};

export default BrokerListings;