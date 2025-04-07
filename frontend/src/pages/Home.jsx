import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  useTheme,
  Chip,
  Divider,
  Paper,
  Avatar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { useSelector } from "react-redux";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonalizeIcon from "@mui/icons-material/Dashboard";
import FilterListIcon from "@mui/icons-material/FilterList";
import PetsIcon from "@mui/icons-material/Pets";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PoolIcon from "@mui/icons-material/Pool";
import axios from "axios";

const Home = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const theme = useTheme();
  const isBroker = user?.type === "broker";
  const heroTextRef = useRef(null);
const heroCardRef = useRef(null);
const howItWorksRefs = useRef([]);
const stepsRefs = useRef([]);

useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(heroTextRef.current, {
      opacity: 0,
      y: 40,
      duration: 1,
      ease: "power3.out",
    });

    gsap.from(heroCardRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 1.2,
      delay: 0.3,
      ease: "back.out(1.7)",
    });

    gsap.from(howItWorksRefs.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.2,
      delay: 0.2,
      ease: "power2.out",
    });

    gsap.from(stepsRefs.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.2,
      delay: 0.3,
      ease: "power2.out",
    });
  });

  return () => ctx.revert();
}, []);



  // State for login dialog
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLatestPreference = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:4000/api/user/preferences/latest",
        {
          withCredentials: true,
        }
      );

      const prefId = res.data.preference?._id;
      if (prefId) {
        navigate(`/matches/${prefId}`);
      } else {
        navigate("/preferences");
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
      if (err.response?.status === 404) {
        navigate("/preferences");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle button clicks for non-logged in users
  const handleActionClick = (action) => {
    if (!user) {
      setPendingAction(action);
      setLoginDialogOpen(true);
    } else {
      if (action === "recommendations") {
        fetchLatestPreference();
      } else if (action === "preferences") {
        navigate("/preferences");
      }
    }
  };

  // Handle login dialog actions
  const handleLogin = () => {
    setLoginDialogOpen(false);
    navigate("/login", {
      state: {
        from: "/",
        pendingAction: pendingAction,
      },
    });
  };

  const handleCloseDialog = () => {
    setLoginDialogOpen(false);
  };

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, rgba(35, 206, 163, 0.1) 0%, rgba(35, 206, 163, 0.2) 100%)`,
          pt: 8,
          pb: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6} ref={heroTextRef}>
              <Typography
                variant="h2"
                fontWeight={700}
                gutterBottom
                sx={{ color: theme.palette.text.primary }}
              >
                Find Your Perfect Apartment Match
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 4,
                  fontSize: "1.1rem",
                }}
              >
                Answer a few questions and let our smart matching system find
                apartments that perfectly match your preferences, needs, and
                budget.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleActionClick("preferences")}
                  sx={{
                    borderRadius: 6,
                    px: 3,
                    py: 1.5,
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    boxShadow: "0 4px 12px rgba(35, 206, 163, 0.3)",
                  }}
                >
                  Start Matching
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/about"
                  sx={{
                    borderRadius: 6,
                    px: 3,
                    py: 1.5,
                  }}
                >
                  Know More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ position: "relative" }} ref={heroTextRef}>
              <Box
                sx={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Paper
                  elevation={6}
                  sx={{
                    borderRadius: 4,
                    width: "100%",
                    maxWidth: 400,
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardMedia
                    component="img"
                    image="/images/apartment.svg"
                    alt="Sample Apartment"
                  />
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" fontWeight={600}>
                        Luxury Apartment
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        $1,850<span style={{ fontSize: "0.8rem" }}>/mo</span>
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      Downtown • 2 bd • 2 ba • 950 sqft
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Chip
                        size="small"
                        label="Pet Friendly"
                        icon={<PetsIcon fontSize="small" />}
                        sx={{
                          bgcolor: "rgba(35, 206, 163, 0.1)",
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Chip
                        size="small"
                        label="Gym"
                        icon={<FitnessCenterIcon fontSize="small" />}
                        sx={{
                          bgcolor: "rgba(35, 206, 163, 0.1)",
                          color: theme.palette.primary.main,
                        }}
                      />
                      <Chip
                        size="small"
                        label="Pool"
                        icon={<PoolIcon fontSize="small" />}
                        sx={{
                          bgcolor: "rgba(35, 206, 163, 0.1)",
                          color: theme.palette.primary.main,
                        }}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it Works Section */}
      <Container maxWidth="lg" sx={{ my: 10 }}>
        <Typography
          variant="h3"
          align="center"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 6 }}
        >
          How HomeFit Works
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{
            mb: 6,
            maxWidth: 700,
            mx: "auto",
            color: theme.palette.text.secondary,
          }}
        >
          We simplify your apartment search by matching you with properties that
          fit your exact needs.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3} ref={el => howItWorksRefs.current[0] = el}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                height: "100%",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: 4,
                },
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(35, 206, 163, 0.1)",
                  color: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  mb: 2,
                }}
              >
                <SearchIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Smart Matching
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Our algorithm analyzes your preferences to find apartments that
                match your needs.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3} ref={el => howItWorksRefs.current[1] = el}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                height: "100%",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: 4,
                },
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(35, 206, 163, 0.1)",
                  color: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  mb: 2,
                }}
              >
                <AccessTimeIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Save Time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Skip endless browsing and let us find the best matches for you
                in seconds.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3} ref={el => howItWorksRefs.current[2] = el}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                height: "100%",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: 4,
                },
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(35, 206, 163, 0.1)",
                  color: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  mb: 2,
                }}
              >
                <PersonalizeIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Personalized Results
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Get apartment recommendations based on your unique preferences
                and priorities.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3} ref={el => howItWorksRefs.current[3] = el}>
            <Paper
              elevation={1}
              sx={{
                p: 3,
                height: "100%",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-10px)",
                  boxShadow: 4,
                },
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(35, 206, 163, 0.1)",
                  color: theme.palette.primary.main,
                  width: 60,
                  height: 60,
                  mb: 2,
                }}
              >
                <FilterListIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Comprehensive Filters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filter by budget, location, amenities, and more to refine your
                apartment search.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* 4-Step Process Section */}
      <Box sx={{ bgcolor: "rgba(35, 206, 163, 0.05)", py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            fontWeight={700}
            gutterBottom
            sx={{ mb: 2 }}
          >
            Simple 4-Step Process
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              mb: 6,
              maxWidth: 700,
              mx: "auto",
              color: theme.palette.text.secondary,
            }}
          >
            Finding your perfect apartment match has never been easier.
          </Typography>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} sm={6} md={3} ref={el => stepsRefs.current[0] = el}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "#fff",
                    width: 50,
                    height: 50,
                    mb: 2,
                    fontWeight: "bold",
                  }}
                >
                  1
                </Avatar>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Complete the Questionnaire
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Answer questions about your budget, preferred location,
                  must-have amenities, and other preferences.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3} ref={el => stepsRefs.current[1] = el}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "#fff",
                    width: 50,
                    height: 50,
                    mb: 2,
                    fontWeight: "bold",
                  }}
                >
                  2
                </Avatar>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Get Matched
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our algorithm analyzes your answers and matches you with
                  apartments that best fit your criteria.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3} ref={el => stepsRefs.current[2] = el} >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "#fff",
                    width: 50,
                    height: 50,
                    mb: 2,
                    fontWeight: "bold",
                  }}
                >
                  3
                </Avatar>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Explore Recommendations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse your personalized apartment recommendations, filter
                  results, and save your favorites.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3} ref={el => stepsRefs.current[3] = el}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: "#fff",
                    width: 50,
                    height: 50,
                    mb: 2,
                    fontWeight: "bold",
                  }}
                >
                  4
                </Avatar>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Find Your Perfect Home
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact property managers, schedule viewings, and find the
                  perfect apartment that meets all your needs.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => handleActionClick("preferences")}
              sx={{
                borderRadius: 6,
                px: 4,
                py: 1.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: "0 4px 12px rgba(35, 206, 163, 0.3)",
              }}
            >
              Start Your Match
            </Button>
          </Box>
        </Container>
      </Box>
      <Divider sx={{ my: 1 }} />

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingAction === "recommendations"
              ? "You need to be logged in to view apartment recommendations."
              : "You need to be logged in to submit your apartment preferences."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleLogin}
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            }}
          >
            Login Now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Home;
