import React, { useState } from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/userSlice";
import { useColorMode } from "../../components/common/theme/ColorModeContext"; 
import { useTheme } from "@mui/material/styles";

const ProfileMenu = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    try {
      await axios.post("http://localhost:4000/api/user/logout", {}, { withCredentials: true });
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleToggleTheme = () => {
    setIsSpinning(true);
    toggleColorMode();
    // Shorter duration for faster animation
    setTimeout(() => setIsSpinning(false), 500); 
  };

  // Helper function to get the full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already an absolute URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path, prepend the base URL
    if (imagePath.startsWith('/')) {
      return `${window.location.origin}${imagePath}`;
    }
    
    // Handle other cases if needed
    return imagePath;
  };

  // Get user's initials for the fallback avatar
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Log image path for debugging
  React.useEffect(() => {
    if (user) {
      console.log("ProfileMenu user data:", user);
      console.log("Image path:", user.imagePath);
      if (user.imagePath) {
        console.log("Full image URL:", getFullImageUrl(user.imagePath));
      }
    }
  }, [user]);

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Avatar 
          alt={user?.fullName || user?.email} 
          src={getFullImageUrl(user?.imagePath)}
          sx={{ 
            bgcolor: theme.palette.primary.main,
            width: 40,
            height: 40
          }}
        >
          {getUserInitials()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            width: 320,
            borderRadius: 3,
            p: 1,
          },
        }}
      >
        <Box px={2} py={1.5} display="flex" alignItems="center">
          <Avatar 
            alt={user?.fullName || user?.email} 
            src={getFullImageUrl(user?.imagePath)}
            sx={{ 
              width: 50, 
              height: 50, 
              mr: 2,
              bgcolor: theme.palette.primary.main
            }}
          >
            {getUserInitials()}
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              sx={{
                wordBreak: "break-word",
                lineHeight: 1.4,
                mb: 0.5,
              }}
            >
              {user.fullName || "User"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ wordBreak: "break-word", fontSize: 13 }}
            >
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={() => { navigate("/profile"); handleClose(); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => { navigate("/user/saved"); handleClose(); }}>
          <ListItemIcon><FavoriteIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Saved Listings</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleToggleTheme}>
          <ListItemIcon>
            <Box
              sx={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transformOrigin: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  animation: isSpinning ? "spin 0.4s linear" : "none", // Faster speed
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7Icon fontSize="small" />
                ) : (
                  <Brightness4Icon fontSize="small" />
                )}
              </Box>
            </Box>
          </ListItemIcon>
          <ListItemText>
            {theme.palette.mode === "dark" ? "Light Mode" : "Dark Mode"}
          </ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>
            <Typography fontWeight={600}>Logout</Typography>
          </ListItemText>
        </MenuItem>
      </Menu>

      {/* Spin animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default ProfileMenu;