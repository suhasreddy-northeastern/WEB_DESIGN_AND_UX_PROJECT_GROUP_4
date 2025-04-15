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
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "../../redux/userSlice";
import ProfileMenu from "../common/ProfileMenu";
import { useColorMode } from "../common/theme/ColorModeContext";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  
  // Get theme and color mode
  const theme = useTheme();
  const { mode } = useColorMode();
  
  const isBroker = user?.type === "broker";
  const isUser = user?.type === "user";
  const isAdmin = user?.type === "admin";
  const isLoggedIn = !!user?.email;

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [brokerMenuAnchorEl, setBrokerMenuAnchorEl] = useState(null);
  const [adminMenuAnchorEl, setAdminMenuAnchorEl] = useState(null);

  if (["/login", "/signup"].includes(location.pathname)) return null;

  // Logo selection based on theme mode
  const logoSrc = mode === 'dark' ? "/images/logo-dark.png" : "/images/logo.png";

  const goToRecommendations = async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/api/user/preferences/latest",
        {
          withCredentials: true,
        }
      );
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
    { 
      label: "Broker Portal", 
      dropdownItems: [
        { label: "Dashboard", to: "/broker/dashboard" },
        { label: "My Listings", to: "/broker/listings" },
        { label: "Inquiries", to: "/broker/inquiries" },
        { label: "Add Listing", to: "/broker/add-listing" }
      ]
    },
  ];

  const adminLinks = [
    { 
      label: "Admin Portal", 
      dropdownItems: [
        { label: "Dashboard", to: "/admin/dashboard" },
        { label: "Manage Brokers", to: "/admin/brokers" },
        { label: "Manage Users", to: "/admin/users" },
        { label: "Review Listings", to: "/admin/listings" }
      ]
    },
  ];

  const userLinks = [
    { label: "Find Apartments", to: "/preferences" },
    { label: "Saved Listings", to: "/user/saved" },
    { label: "Recommendations", to: null },
  ];

  const allLinks = [
    ...commonLinks,
    ...(isAdmin ? adminLinks : []),
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

  const handleBrokerMenuOpen = (event) => {
    setBrokerMenuAnchorEl(event.currentTarget);
  };

  const handleBrokerMenuClose = () => {
    setBrokerMenuAnchorEl(null);
  };

  const handleBrokerMenuItemClick = (to) => {
    navigate(to);
    handleBrokerMenuClose();
  };

  const handleAdminMenuOpen = (event) => {
    setAdminMenuAnchorEl(event.currentTarget);
  };

  const handleAdminMenuClose = () => {
    setAdminMenuAnchorEl(null);
  };

  const handleAdminMenuItemClick = (to) => {
    navigate(to);
    handleAdminMenuClose();
  };

  // Use the theme's colors
  const navButtonStyle = {
    color: theme.palette.text.primary,
    fontWeight: 500,
    textTransform: "none",
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: "transparent",
    },
  };

  const logoutButtonStyle = {
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    textTransform: "none",
    fontWeight: 600,
    px: 3,
    borderRadius: 2,
    "&:hover": {
      backgroundColor: mode === 'light' ? "#e6f9f3" : "rgba(35, 206, 163, 0.1)",
      borderColor: theme.palette.primary.main,
    },
  };

  const activeNavStyle = {
    color: theme.palette.primary.main,
    fontWeight: 600,
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    borderRadius: 0,
  };

  const activeDrawerStyle = {
    backgroundColor: mode === 'light' ? "#e6f9f3" : "rgba(35, 206, 163, 0.1)",
    fontWeight: 600,
    color: theme.palette.primary.main,
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      color="inherit"
      sx={{ py: 1 }}
    >
      <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <Box
          component={Link}
          to="/"
          sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          <img src={logoSrc} alt="Logo" style={{ height: 40 }} />
        </Box>

        {!isMobile && (
          <Box sx={{ display: "flex", gap: 2 }}>
            {allLinks.map((link) => 
              link.dropdownItems ? (
                <Box key={link.label}>
                  <Button
                    sx={navButtonStyle}
                    endIcon={<ExpandMoreIcon />}
                    onClick={link.label === "Broker Portal" ? handleBrokerMenuOpen : handleAdminMenuOpen}
                  >
                    {link.label}
                  </Button>
                  
                  {/* Broker Portal Menu */}
                  {link.label === "Broker Portal" && (
                    <Menu
                      anchorEl={brokerMenuAnchorEl}
                      open={Boolean(brokerMenuAnchorEl)}
                      onClose={handleBrokerMenuClose}
                      MenuListProps={{ sx: { py: 0 } }}
                    >
                      {link.dropdownItems.map((item) => (
                        <MenuItem 
                          key={item.label} 
                          onClick={() => handleBrokerMenuItemClick(item.to)}
                          sx={{ 
                            py: 1.5, 
                            px: 2,
                            minWidth: 180,
                            ...(location.pathname === item.to || 
                                (item.to === '/broker/add-listing' && location.pathname === '/list-apartment') ? {
                              backgroundColor: 'rgba(35, 206, 163, 0.08)',
                              color: theme.palette.primary.main,
                              fontWeight: 600
                            } : {})
                          }}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  )}
                  
                  {/* Admin Portal Menu */}
                  {link.label === "Admin Portal" && (
                    <Menu
                      anchorEl={adminMenuAnchorEl}
                      open={Boolean(adminMenuAnchorEl)}
                      onClose={handleAdminMenuClose}
                      MenuListProps={{ sx: { py: 0 } }}
                    >
                      {link.dropdownItems.map((item) => (
                        <MenuItem 
                          key={item.label} 
                          onClick={() => handleAdminMenuItemClick(item.to)}
                          sx={{ 
                            py: 1.5, 
                            px: 2,
                            minWidth: 180,
                            ...(location.pathname === item.to ? {
                              backgroundColor: 'rgba(35, 206, 163, 0.08)',
                              color: theme.palette.primary.main,
                              fontWeight: 600
                            } : {})
                          }}
                        >
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  )}
                </Box>
              ) : (
                <Button
                  key={link.label}
                  sx={{
                    ...navButtonStyle,
                    ...(link.to === location.pathname && activeNavStyle),
                  }}
                  onClick={() => handleLinkClick(link.label, link.to)}
                >
                  {link.label}
                </Button>
              )
            )}
          </Box>
        )}

        {!isMobile && (
          <Box display="flex" alignItems="center" gap={2}>
            {isLoggedIn ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  Logged in as <strong>{user.email}</strong>
                  {isAdmin && (
                    <Typography component="span" color="error.main" fontWeight="bold" sx={{ ml: 1 }}>
                      (Admin)
                    </Typography>
                  )}
                </Typography>
                <ProfileMenu user={user} />
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
            <IconButton onClick={() => setDrawerOpen(true)} edge="end" color="inherit">
              <MenuIcon />
            </IconButton>
            
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
            >
              <Box
                sx={{ width: 250 }}
                role="presentation"
              >
                <List>
                  {commonLinks.map(({ label, to }) => (
                    <ListItem key={label} disablePadding>
                      <ListItemButton
                        selected={to === location.pathname}
                        onClick={() => {
                          navigate(to);
                          setDrawerOpen(false);
                        }}
                        sx={to === location.pathname ? activeDrawerStyle : {}}
                      >
                        <ListItemText primary={label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  
                  {/* Admin Portal Links */}
                  {isAdmin && (
                    <>
                      <ListItem sx={{ pt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Admin Portal
                        </Typography>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/admin/dashboard"}
                          onClick={() => {
                            navigate("/admin/dashboard");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/admin/dashboard" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Dashboard" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/admin/brokers"}
                          onClick={() => {
                            navigate("/admin/brokers");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/admin/brokers" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Manage Brokers" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/admin/users"}
                          onClick={() => {
                            navigate("/admin/users");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/admin/users" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Manage Users" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/admin/listings"}
                          onClick={() => {
                            navigate("/admin/listings");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/admin/listings" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Review Listings" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  )}
                  
                  {/* Broker Portal Links */}
                  {isBroker && (
                    <>
                      <ListItem sx={{ pt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Broker Portal
                        </Typography>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/broker/dashboard"}
                          onClick={() => {
                            navigate("/broker/dashboard");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/broker/dashboard" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Dashboard" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/broker/listings"}
                          onClick={() => {
                            navigate("/broker/listings");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/broker/listings" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="My Listings" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/broker/inquiries"}
                          onClick={() => {
                            navigate("/broker/inquiries");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/broker/inquiries" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Inquiries" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/broker/add-listing" || location.pathname === "/list-apartment"}
                          onClick={() => {
                            navigate("/broker/add-listing");
                            setDrawerOpen(false);
                          }}
                          sx={(location.pathname === "/broker/add-listing" || location.pathname === "/list-apartment") ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Add Listing" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  )}
                  
                  {/* Regular User Links */}
                  {isUser && (
                    <>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/preferences"}
                          onClick={() => {
                            navigate("/preferences");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/preferences" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Find Apartments" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          selected={location.pathname === "/user/saved"}
                          onClick={() => {
                            navigate("/user/saved");
                            setDrawerOpen(false);
                          }}
                          sx={location.pathname === "/user/saved" ? activeDrawerStyle : {}}
                        >
                          <ListItemText primary="Saved Listings" />
                        </ListItemButton>
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => {
                            goToRecommendations();
                            setDrawerOpen(false);
                          }}
                        >
                          <ListItemText primary="Recommendations" />
                        </ListItemButton>
                      </ListItem>
                    </>
                  )}
                </List>
                <Divider />
                <Box px={2} py={1}>
                  {isLoggedIn ? (
                    <>
                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Logged in as <strong>{user.email}</strong>
                        {isAdmin && (
                          <Typography component="span" color="error.main" fontWeight="bold" sx={{ ml: 1 }}>
                            (Admin)
                          </Typography>
                        )}
                      </Typography>
                      <Button
                        fullWidth
                        onClick={() => {
                          navigate("/profile");
                          setDrawerOpen(false);
                        }}
                        sx={navButtonStyle}
                      >
                        Profile
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={async () => {
                          try {
                            await axios.post(
                              "http://localhost:4000/api/user/logout",
                              {},
                              { withCredentials: true }
                            );
                            dispatch(logout());
                            navigate("/login");
                          } catch (err) {
                            console.error("Logout error", err);
                          }
                        }}
                        sx={logoutButtonStyle}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        fullWidth
                        onClick={() => {
                          navigate("/login");
                          setDrawerOpen(false);
                        }}
                        sx={navButtonStyle}
                      >
                        Login
                      </Button>
                      <Button
                        fullWidth
                        onClick={() => {
                          navigate("/signup");
                          setDrawerOpen(false);
                        }}
                        sx={navButtonStyle}
                      >
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

export default Navbar;