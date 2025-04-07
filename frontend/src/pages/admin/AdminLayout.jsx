import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 250;

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    // Check if user is admin, if not redirect to login
    if (!user || user.type !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { name: 'Home', icon: <HomeIcon />, path: '/' },
    { name: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { name: 'Brokers', icon: <SupervisorAccountIcon />, path: '/admin/brokers' },
    { name: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { name: 'Listings', icon: <ListAltIcon />, path: '/admin/listings' },
    { name: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
    { name: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const drawer = (
    <Paper
      elevation={0}
      sx={{
        width: drawerWidth,
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        borderRight: '1px solid',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
      }}
    >
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          <Box component="span" sx={{ color: primaryColor }}>Admin</Box>
          <Box component="span" sx={{ color: theme.palette.text.primary }}>Panel</Box>
        </Typography>
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 1, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}
        >
          Main Menu
        </Typography>
        <List sx={{ p: 0 }}>
          {menuItems.slice(0, 5).map((item) => (
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
      
      <Box sx={{ px: 2, py: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ px: 1, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}
        >
          Account
        </Typography>
        <List sx={{ p: 0 }}>
          {menuItems.slice(5).map((item) => (
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
          <ListItem
            button
            onClick={() => {
              // Handle logout logic here
              navigate('/login');
            }}
            sx={{
              mb: 0.5,
              borderRadius: 1.5,
              color: theme.palette.text.primary,
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(231, 76, 60, 0.1)'
                  : 'rgba(231, 76, 60, 0.05)',
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
          Admin Portal v1.0
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile App Bar */}
      {isMobile && (
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            width: '100%',
            borderBottom: '1px solid',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              <Box component="span" sx={{ color: primaryColor }}>
                Admin
              </Box>
              <Box component="span" sx={{ color: theme.palette.text.primary }}>
                Panel
              </Box>
            </Typography>
            <Tooltip title="Profile">
              <Avatar
                alt={user?.fullName || 'Admin'}
                src="/images/default-avatar.png"
                onClick={() => navigate('/profile')}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          </Toolbar>
        </AppBar>
      )}

      {/* Sidebar - Persistent drawer on desktop, temporary on mobile */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          backgroundColor: isDarkMode ? theme.palette.background.default : '#f8fafc',
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: 0 },
          mt: isMobile ? '64px' : 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;