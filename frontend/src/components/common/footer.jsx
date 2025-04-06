import React from "react";
import {
  Box,
  Typography,
  Container,
  Divider,
  Grid,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const primaryColor = "#00b386"; // HomeFit primary green color
  
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: theme.palette.mode === 'light' ? "#ffffff" : "#1a1a1a",
        py: 4,
        mt: "auto", // makes footer stick to the bottom of the page
        borderTop: '1px solid',
        borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Tagline */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 1,
                fontWeight: 700,
              }}
            >
              <Box component="span" sx={{ color: primaryColor }}>Home</Box>
              <Box component="span" sx={{ color: theme.palette.mode === 'light' ? '#2c3e50' : '#ffffff', fontWeight: 600 }}>Fit</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Finding your perfect apartment match made easy.
            </Typography>
          </Grid>

          {/* Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
              Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/" style={{ 
                textDecoration: 'none', 
                color: theme.palette.text.secondary,
                '&:hover': { textDecoration: 'underline' }
              }}>
                Home
              </Link>
              <Link to="/preferences" style={{ 
                textDecoration: 'none', 
                color: theme.palette.text.secondary,
                '&:hover': { textDecoration: 'underline' }
              }}>
                Find Your Match
              </Link>
              <Link to="/about" style={{ 
                textDecoration: 'none', 
                color: theme.palette.text.secondary,
                '&:hover': { textDecoration: 'underline' }
              }}>
                How It Works
              </Link>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/resource/renting-guide" style={{ 
                textDecoration: 'none', 
                color: theme.palette.text.secondary,
                '&:hover': { textDecoration: 'underline' }
              }}>
                Renting Guide
              </Link>
              <Link to="/resource/apartment-checklist" style={{ 
                textDecoration: 'none', 
                color: theme.palette.text.secondary,
                '&:hover': { textDecoration: 'underline' }
              }}>
                Apartment Checklist
              </Link>
              <Link to="/resource/faq" style={{ 
                textDecoration: 'none', 
                color: theme.palette.text.secondary,
                '&:hover': { textDecoration: 'underline' }
              }}>
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 2 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                help@homefit.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (123) 456-7890
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        
        {/* Copyright */}
        <Typography variant="body2" color="text.secondary" textAlign="center">
          © {currentYear} HomeFit. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;