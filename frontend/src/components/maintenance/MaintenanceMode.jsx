import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  useTheme
} from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Link } from 'react-router-dom';

/**
 * Maintenance Mode Component
 * Displayed when the site is in maintenance mode.
 * Only admin users will be able to see the actual site.
 */
const MaintenanceMode = ({ message, estimatedTime }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: isDarkMode ? 'background.default' : '#f7f9fc',
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: isDarkMode ? 'background.paper' : '#ffffff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }}
        >
          {/* Color bar at top */}
          <Box
            sx={{
              height: 8,
              width: '100%',
              bgcolor: theme.palette.warning.main,
            }}
          />

          <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
            <ConstructionIcon
              sx={{
                fontSize: 80,
                color: theme.palette.warning.main,
                mb: 3,
              }}
            />

            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              fontWeight="bold"
              sx={{ mb: 2 }}
            >
              Site Maintenance
            </Typography>

            <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
              {message || 'We are currently performing scheduled maintenance. Please check back soon.'}
            </Typography>

            {estimatedTime && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mb: 4,
                }}
              >
                <ScheduleIcon color="action" />
                <Typography variant="body1" color="textSecondary">
                  Estimated completion time: {estimatedTime}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                p: 3,
                bgcolor: isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
                borderRadius: 2,
                maxWidth: 550,
                mx: 'auto',
                mt: 3,
              }}
            >
              <Typography variant="body2" color="textSecondary">
                If you're an administrator, please{' '}
                <Link
                  to="/login"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  log in
                </Link>{' '}
                to access the site during maintenance.
              </Typography>
            </Box>

            <Button
              component="a"
              href="mailto:support@homefit.com"
              variant="outlined"
              color="primary"
              sx={{ mt: 4 }}
            >
              Contact Support
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          width: '100%',
          textAlign: 'center',
          py: 3,
          px: 2,
          mt: 'auto',
        }}
      >
        <Typography variant="body2" color="textSecondary">
          &copy; {new Date().getFullYear()} HomeFit. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default MaintenanceMode;