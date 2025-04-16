import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  useTheme,
  Chip,
  CircularProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  AlertTitle,
  Snackbar,
} from "@mui/material";
import EventIcon from '@mui/icons-material/Event';
import { Link, useNavigate } from "react-router-dom";
import ApartmentIcon from "@mui/icons-material/Apartment";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import MessageIcon from "@mui/icons-material/Message";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../redux/userSlice";
import axios from "axios";

const BrokerHome = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === "dark";
  const [loading, setLoading] = useState(true);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingApproval: 0,
    inquiries: 0,
    viewsThisWeek: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Check broker approval status explicitly
  const isApproved = user && user.isApproved === true;

  // Function to refresh approval status
  const refreshApprovalStatus = async () => {
    setRefreshingStatus(true);
    try {
      // Get updated user data directly from the API
      const response = await axios.get("http://localhost:4000/api/broker/me", {
        withCredentials: true,
      });

      // Update Redux store with the fresh data
      dispatch(updateUser(response.data));

      setSnackbarMessage("Status updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error refreshing status:", error);
      setSnackbarMessage("Failed to refresh status");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setRefreshingStatus(false);
    }
  };

  useEffect(() => {
    const fetchBrokerData = async () => {
      setLoading(true);

      try {
        // Always fetch broker stats, regardless of current isApproved state
        const statsRes = await axios.get(
          "http://localhost:4000/api/broker/stats",
          {
            withCredentials: true,
          }
        );

        const inquiriesRes = await axios.get(
          "http://localhost:4000/api/broker/inquiries",
          {
            withCredentials: true,
          }
        );

        setStats(
          statsRes?.data || {
            activeListings: 0,
            pendingApproval: 0,
            inquiries: 0,
            viewsThisWeek: 0,
          }
        );

        setRecentInquiries(inquiriesRes?.data?.inquiries || []);
      } catch (error) {
        console.error("Error fetching broker dashboard data:", error);

        // Set fallback defaults
        setStats({
          activeListings: 0,
          pendingApproval: 0,
          inquiries: 0,
          viewsThisWeek: 0,
        });

        setRecentInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrokerData();
  }, []);

  // Log user data for debugging
  useEffect(() => {
    console.log("Current user data:", user);
    console.log("isApproved status:", isApproved);
  }, [user, isApproved]);

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
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Header section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            sx={{ mb: 1 }}
          >
            Welcome, {user?.fullName || "Broker"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your property listings and inquiries from potential tenants.
          </Typography>
        </Box>

        {/* Approval Status Alert - Show this only if the broker is not approved */}
        {!isApproved && (
          <Alert
            severity="warning"
            variant="filled"
            sx={{
              mb: 4,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                alignItems: "center",
              },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={refreshApprovalStatus}
                disabled={refreshingStatus}
                startIcon={
                  refreshingStatus && (
                    <CircularProgress size={16} color="inherit" />
                  )
                }
              >
                {refreshingStatus ? "Checking..." : "Refresh Status"}
              </Button>
            }
          >
            <AlertTitle>Pending Approval</AlertTitle>
            Your broker account is currently pending approval from an
            administrator. You'll be able to create and manage property listings
            once approved.
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Active Listings Card */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#fff",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "none",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <ApartmentIcon
                    sx={{ color: theme.palette.primary.main, mr: 1 }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Active Listings
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.activeListings}
                </Typography>
                <Button
                  component={Link}
                  to="/broker/listings"
                  variant="text"
                  size="small"
                  color="primary"
                >
                  View All Listings
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#fff",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "none",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {stats.pendingTours > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "4px",
                    bgcolor: theme.palette.info.main,
                  }}
                />
              )}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <EventIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Tour Requests
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.pendingTours || 0}
                </Typography>
                <Button
                  component={Link}
                  to="/broker/tours"
                  variant="text"
                  size="small"
                  color="primary"
                >
                  Manage Tours
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Approval Card */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#fff",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "none",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CancelIcon
                      sx={{ color: theme.palette.warning.main, mr: 1 }}
                    />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Pending Approval
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.pendingApproval}
                </Typography>
                <Button
                  component={Link}
                  to="/broker/listings?filter=pending"
                  variant="text"
                  size="small"
                  color="primary"
                >
                  View Pending
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Inquiries Card */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#fff",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "none",
                height: "100%",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {stats.inquiries > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "4px",
                    bgcolor: theme.palette.primary.main,
                  }}
                />
              )}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <MessageIcon
                    sx={{ color: theme.palette.primary.main, mr: 1 }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    New Inquiries
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.inquiries}
                </Typography>
                <Button
                  component={Link}
                  to="/broker/inquiries"
                  variant="text"
                  size="small"
                  color="primary"
                >
                  View Inquiries
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Views Card */}
          <Grid item xs={12} sm={6} lg={3}>
            <Card
              elevation={2}
              sx={{
                borderRadius: 2,
                backgroundColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#fff",
                border: isDarkMode
                  ? "1px solid rgba(255, 255, 255, 0.1)"
                  : "none",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <VisibilityIcon
                    sx={{ color: theme.palette.info.main, mr: 1 }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Weekly Views
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                  {stats.viewsThisWeek}
                </Typography>
                <Button
                  component={Link}
                  to="/broker/analytics"
                  variant="text"
                  size="small"
                  color="primary"
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Section */}
        <Grid container spacing={3}>
          {/* Left Side - Recent Inquiries */}
          <Grid item xs={12} md={7}>
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
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Recent Inquiries
              </Typography>
              {recentInquiries.length > 0 ? (
                <List sx={{ width: "100%" }}>
                  {recentInquiries.map((inquiry) => (
                    <React.Fragment key={inquiry.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight={600}>
                                {inquiry.name}
                              </Typography>
                              <Chip
                                size="small"
                                label="New"
                                sx={{
                                  bgcolor: theme.palette.primary.main,
                                  color: "white",
                                  height: 24,
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                {inquiry.property}
                              </Typography>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                {inquiry.message}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 1 }}
                              >
                                {new Date(inquiry.date).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mb: 1,
                        }}
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, borderRadius: 1 }}
                        >
                          Reply
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          sx={{ borderRadius: 1 }}
                        >
                          View Details
                        </Button>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {isApproved
                      ? "No recent inquiries"
                      : "Inquiries will appear here after your account is approved"}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  component={Link}
                  to="/broker/inquiries"
                  variant="contained"
                  color="primary"
                  sx={{ borderRadius: 6 }}
                  disabled={!isApproved}
                >
                  View All Inquiries
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Side - Quick Actions */}
          <Grid item xs={12} md={5}>
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
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Quick Actions
              </Typography>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/broker/listings/new"
                startIcon={<AddIcon />}
                disabled={!isApproved}
                sx={{
                  py: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  justifyContent: "flex-start",
                }}
              >
                Create New Listing
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/broker/listings"
                startIcon={<ApartmentIcon />}
                sx={{
                  py: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  justifyContent: "flex-start",
                }}
              >
                Manage Listings
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/broker/inquiries"
                startIcon={<MessageIcon />}
                disabled={!isApproved}
                sx={{
                  py: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  justifyContent: "flex-start",
                }}
              >
                View Inquiries
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/broker/tours"
                startIcon={<EventIcon />}
                disabled={!isApproved}
                sx={{
                  py: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  justifyContent: "flex-start",
                }}
              >
                Manage Tours
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                component={Link}
                to="/broker/analytics"
                startIcon={<StarIcon />}
                disabled={!isApproved}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  justifyContent: "flex-start",
                }}
              >
                Analytics Dashboard
              </Button>
            </Paper>

            {/* Account Status */}
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
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Account Status
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {isApproved ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Approved"
                    sx={{
                      fontWeight: 600,
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(46, 125, 50, 0.2)"
                          : "rgba(46, 125, 50, 0.1)",
                      color:
                        theme.palette.mode === "dark" ? "#81c784" : "#2e7d32",
                      border: "1px solid",
                      borderColor:
                        theme.palette.mode === "dark"
                          ? "rgba(46, 125, 50, 0.5)"
                          : "rgba(46, 125, 50, 0.3)",
                    }}
                  />
                ) : (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      icon={<CancelIcon />}
                      label="Pending Approval"
                      sx={{
                        fontWeight: 600,
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(237, 108, 2, 0.2)"
                            : "rgba(237, 108, 2, 0.1)",
                        color:
                          theme.palette.mode === "dark" ? "#ffb74d" : "#ed6c02",
                        border: "1px solid",
                        borderColor:
                          theme.palette.mode === "dark"
                            ? "rgba(237, 108, 2, 0.5)"
                            : "rgba(237, 108, 2, 0.3)",
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      startIcon={
                        refreshingStatus ? (
                          <CircularProgress size={16} />
                        ) : (
                          <RefreshIcon />
                        )
                      }
                      onClick={refreshApprovalStatus}
                      disabled={refreshingStatus}
                    >
                      {refreshingStatus ? "Checking..." : "Check Status"}
                    </Button>
                  </Box>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isApproved
                  ? "Your broker account is approved. You can create and manage property listings."
                  : "Your broker account is pending approval. You'll be notified once an administrator reviews your application."}
              </Typography>

              <Button
                variant="text"
                color="primary"
                component={Link}
                to="/broker/profile"
                size="small"
              >
                View Profile
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BrokerHome;
