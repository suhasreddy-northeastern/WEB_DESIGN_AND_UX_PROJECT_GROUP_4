import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Paper,
  Typography,
  Divider,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import BarChartIcon from '@mui/icons-material/BarChart';
import EventIcon from '@mui/icons-material/Event'; // Added for Tours
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/userSlice'; // Adjust import path as needed

const BrokerSidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:4000/api/user/logout', {}, { withCredentials: true });
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { name: 'Home', icon: <HomeIcon />, path: '/' },
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/broker/dashboard' },
    { name: 'My Listings', icon: <ListAltIcon />, path: '/broker/listings' },
    { name: 'Inquiries', icon: <QuestionAnswerIcon />, path: '/broker/inquiries' },
    { name: 'Tours', icon: <EventIcon />, path: '/broker/tours' }, // Added Tours
    { name: 'Analytics', icon: <BarChartIcon />, path: '/broker/analytics' },
    { name: 'Add Listing', icon: <AddCircleOutlineIcon />, path: '/broker/add-listing' },
    { name: 'Profile', icon: <PersonIcon />, path: '/broker/profile' },
    { name: 'Settings', icon: <SettingsIcon />, path: '/broker/settings' },
  ];

  const isActive = (path) => {
    if (path === '/broker/add-listing' && location.pathname === '/list-apartment') {
      return true;
    }
    return location.pathname === path;
  };

  // Group menu items by category (now with Tours in main menu)
  const mainMenuItems = menuItems.slice(0, 7);
  const accountMenuItems = menuItems.slice(7);

  return (
    <Paper
      elevation={0}
      sx={{
        width: 250,
        backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.05)' : 'rgba(35, 206, 163, 0.03)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        borderRight: '1px solid',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Logo and Brand */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          <Box component="span" sx={{ color: primaryColor }}>Home</Box>
          <Box component="span" sx={{ color: theme.palette.text.primary }}>Fit</Box>
        </Typography>
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      {/* Main navigation section */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 1, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}
        >
          Main Menu
        </Typography>
        <List sx={{ p: 0 }}>
          {mainMenuItems.map((item) => (
            <ListItem
            component={Link}
            to={item.path}
            key={item.name}
            sx={{
                mb: 0.5,
                borderRadius: 1.5,
                backgroundColor: isActive(item.path)
                  ? isDarkMode
                    ? 'rgba(35, 206, 163, 0.2)'
                    : 'rgba(35, 206, 163, 0.1)'
                  : 'transparent',
                color: isActive(item.path)
                  ? primaryColor
                  : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? 'rgba(35, 206, 163, 0.1)'
                    : 'rgba(35, 206, 163, 0.05)',
                },
                py: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path)
                    ? primaryColor
                    : theme.palette.text.secondary,
                  minWidth: 36,
                  fontSize: '1.2rem',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.9rem',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 2, opacity: 0.6 }} />
      
      {/* Account section */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 1, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}
        >
          Account
        </Typography>
        <List sx={{ p: 0 }}>
          {accountMenuItems.map((item) => (
            <ListItem
              component={Link}
              to={item.path}
              key={item.name}
              sx={{
                mb: 0.5,
                borderRadius: 1.5,
                backgroundColor: isActive(item.path)
                  ? isDarkMode
                    ? 'rgba(35, 206, 163, 0.2)'
                    : 'rgba(35, 206, 163, 0.1)'
                  : 'transparent',
                color: isActive(item.path)
                  ? primaryColor
                  : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: isDarkMode
                    ? 'rgba(35, 206, 163, 0.1)'
                    : 'rgba(35, 206, 163, 0.05)',
                },
                py: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path)
                    ? primaryColor
                    : theme.palette.text.secondary,
                  minWidth: 36,
                  fontSize: '1.2rem',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontWeight: isActive(item.path) ? 600 : 500,
                  fontSize: '0.9rem',
                }}
              />
            </ListItem>
          ))}
          
          {/* Logout Button - Fixed by removing the 'button' attribute */}
          <ListItem
            onClick={handleLogout}
            sx={{
              mb: 0.5,
              borderRadius: 1.5,
              color: theme.palette.error.main,
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(239, 83, 80, 0.1)'
                  : 'rgba(239, 83, 80, 0.05)',
              },
              py: 1,
            }}
          >
            <ListItemIcon
              sx={{
                color: theme.palette.error.main,
                minWidth: 36,
                fontSize: '1.2rem',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: 500,
                fontSize: '0.9rem',
              }}
            />
          </ListItem>
        </List>
      </Box>

      {/* Footer with version */}
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          align="center"
          display="block"
          fontSize="0.7rem"
        >
          HomeFit Broker Portal v1.0
        </Typography>
      </Box>
    </Paper>
  );
};

export default BrokerSidebar;