import React from 'react';
import { 
  Box, 
  useMediaQuery, 
  useTheme, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar,
  Tooltip
} from '@mui/material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import BrokerSidebar from './BrokerSidebar';
import { useSelector } from 'react-redux';

const BrokerLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Show header only on pages that are not the add-listing page
  const showHeader = !location.pathname.includes('/add-listing');

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
                Home
              </Box>
              <Box component="span" sx={{ color: theme.palette.text.primary }}>
                Fit
              </Box>
            </Typography>
            <Tooltip title="Profile">
              <Avatar
                alt={user?.fullName || 'User'}
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
              width: 250,
              boxSizing: 'border-box',
            },
          }}
        >
          <BrokerSidebar />
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: 250,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
          open
        >
          <BrokerSidebar />
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          backgroundColor: isDarkMode ? theme.palette.background.default : '#f8fafc',
          width: { sm: `calc(100% - 250px)` },
          ml: { sm: 0 },
          mt: isMobile ? '64px' : 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default BrokerLayout;