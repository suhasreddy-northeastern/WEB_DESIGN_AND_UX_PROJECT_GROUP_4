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

  return (
    <>
      <IconButton onClick={handleOpen}>
        <Avatar alt={user?.email} src="/images/default-avatar.png" />
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
        <Box px={2} py={1.5}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              wordBreak: "break-word",
              lineHeight: 1.4,
              mb: 0.5,
            }}
          >
            {user.name || "User"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ wordBreak: "break-word", fontSize: 13 }}
          >
            {user.email}
          </Typography>
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