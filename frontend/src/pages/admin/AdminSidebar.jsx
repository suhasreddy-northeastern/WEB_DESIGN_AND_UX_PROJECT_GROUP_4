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
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import HomeIcon from '@mui/icons-material/Home';

const AdminSidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  const menuItems = [
    { name: 'Home', icon: <HomeIcon />, path: '/' },
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { name: 'Manage Brokers', icon: <SupervisorAccountIcon />, path: '/admin/brokers' },
    { name: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users' },
    { name: 'Review Listings', icon: <ListAltIcon />, path: '/admin/listings' },
    { name: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { name: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Group menu items by category
  const mainMenuItems = menuItems.slice(0, 5);
  const accountMenuItems = menuItems.slice(5);

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
          <Box component="span" sx={{ color: primaryColor }}>Admin</Box>
          <Box component="span" sx={{ color: theme.palette.text.primary }}>Panel</Box>
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
              button
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
              button
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

      {/* Footer with version */}
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          align="center"
          display="block"
          fontSize="0.7rem"
        >
          Admin Portal v1.0
        </Typography>
      </Box>
    </Paper>
  );
};

export default AdminSidebar;