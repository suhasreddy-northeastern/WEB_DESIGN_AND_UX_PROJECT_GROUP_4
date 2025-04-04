import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/userSlice";
import axios from "axios";

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const isBroker = user?.type === "broker";
  const isUser = user?.type === "user";
  const isLoggedIn = !!user?.email;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Hide navbar on auth pages
  if (["/login", "/signup"].includes(location.pathname)) return null;

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/api/user/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message);
    }

    dispatch(logout());
    navigate("/login");
  };

  const goToRecommendations = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/user/preferences/latest", {
        withCredentials: true,
      });
      const prefId = res.data.preference?._id;
      if (prefId) navigate(`/matches/${prefId}`);
      else alert("You haven't submitted any preferences yet.");
    } catch (err) {
      if (err.response?.status === 404) {
        alert("No preferences found. Please fill out your preferences first.");
        navigate("/preferences");
      } else {
        console.error("Could not load recommendations", err);
        alert("Something went wrong.");
      }
    }
  };

  const commonLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
  ];

  const brokerLinks = [
    { label: "List Apartment", to: "/list-apartment" },
    { label: "My Listings", to: "/broker/my-listings" },
  ];

  const userLinks = [
    { label: "Find Apartments", to: "/preferences" },
    { label: "Saved Listings", to: "/user/saved" },
    { label: "Recommendations", to: null },
  ];

  const allLinks = [
    ...commonLinks,
    ...(isBroker ? brokerLinks : []),
    ...(isUser ? userLinks : []),
  ];

  const handleLinkClick = (label, to) => {
    if (label === "Recommendations") {
      goToRecommendations();
    } else {
      navigate(to);
    }
  };

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: "#ffffff", color: "#222", py: 1 }}>
      <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/images/logo.png" alt="Logo" style={{ height: 40 }} />
        </Box>

        {!isMobile && (
          <Box sx={{ display: "flex", gap: 2 }}>
            {allLinks.map(({ label, to }) => (
              <Button
                key={label}
                sx={navButtonStyle}
                onClick={() => handleLinkClick(label, to)}
              >
                {label}
              </Button>
            ))}
          </Box>
        )}

        {!isMobile && (
          <Box display="flex" alignItems="center" gap={2}>
            {isLoggedIn ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Logged in as <strong>{user.email}</strong>
                </Typography>
                <Button variant="outlined" onClick={handleLogout} sx={logoutButtonStyle}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate("/login")} sx={navButtonStyle}>
                  Login
                </Button>
                <Button onClick={() => navigate("/signup")} sx={navButtonStyle}>
                  Signup
                </Button>
              </>
            )}
          </Box>
        )}

        {isMobile && (
          <>
            <IconButton onClick={() => setDrawerOpen(true)} edge="end">
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
                <List>
                  {allLinks.map(({ label, to }) => (
                    <ListItem key={label} disablePadding>
                      <ListItemButton onClick={() => handleLinkClick(label, to)}>
                        <ListItemText primary={label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                <Divider />
                <Box px={2} py={1}>
                  {isLoggedIn ? (
                    <>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Logged in as <strong>{user.email}</strong>
                      </Typography>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={handleLogout}
                        sx={logoutButtonStyle}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button fullWidth onClick={() => navigate("/login")} sx={navButtonStyle}>
                        Login
                      </Button>
                      <Button fullWidth onClick={() => navigate("/signup")} sx={navButtonStyle}>
                        Signup
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

const navButtonStyle = {
  color: "#2c3e50",
  fontWeight: 500,
  textTransform: "none",
  "&:hover": {
    color: "#23cea3",
    backgroundColor: "transparent",
  },
};

const logoutButtonStyle = {
  borderColor: "#23cea3",
  color: "#23cea3",
  textTransform: "none",
  fontWeight: 600,
  px: 3,
  borderRadius: 2,
  "&:hover": {
    backgroundColor: "#e6f9f3",
    borderColor: "#23cea3",
  },
};

export default Navbar;
