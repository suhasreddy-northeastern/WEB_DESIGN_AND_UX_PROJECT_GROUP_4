import React from "react";
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  Divider, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Chip,
  ThemeProvider
} from "@mui/material";
import RecommendIcon from '@mui/icons-material/Recommend';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { aboutContent } from "../content/content";
import theme from "../components/common/theme/theme"; 

const About = () => {
  // Feature icons mapping
  const featureIcons = [
    <RecommendIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />, 
    <ListAltIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />, 
    <PsychologyIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />, 
    <TouchAppIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4, md: 5 },
            borderRadius: 2,
            backgroundColor: "#FFFFFF",
            boxShadow: '0 2px 20px rgba(35, 206, 163, 0.08)',
            border: '1px solid rgba(35, 206, 163, 0.1)',
          }}
        >
          {/* Header Section */}
          <Grid container spacing={4} alignItems="center">
            {/* Text Content */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ 
                  textAlign: { xs: "center", md: "left" },
                  color: theme.palette.text.primary, 
                }}
              >
                {aboutContent.heading}
              </Typography>

              {aboutContent.mainDescription.map((paragraph, index) => (
                <Typography
                  key={index}
                  variant="body1"
                  color="text.secondary"
                  paragraph
                  sx={{ mt: 2, textAlign: { xs: "center", md: "left" } }}
                >
                  {paragraph}
                </Typography>
              ))}
            </Grid>

            {/* Image */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: { xs: 2, md: 0 },
                }}
              >
                <img
                  src={aboutContent.imagePath}
                  alt="About us"
                  style={{
                    width: "100%",
                    maxWidth: 360,
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Features Section */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ 
                mb: 3, 
                textAlign: "center", 
                color: theme.palette.text.primary,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  width: 60,
                  height: 3,
                  backgroundColor: theme.palette.primary.main,
                  transform: 'translateX(-50%)',
                  borderRadius: 4
                }
              }}
            >
              What Makes Us Different
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {aboutContent.features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                      border: '1px solid rgba(35, 206, 163, 0.1)',
                      borderRadius: 2,
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: '0 10px 20px rgba(35, 206, 163, 0.12)',
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {featureIcons[index]}
                    <Typography variant="h6" gutterBottom color="text.primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Mission Section */}
          <Box sx={{ mb: 5, textAlign: "center" }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ 
                mb: 2, 
                color: theme.palette.text.primary,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  width: 60,
                  height: 3,
                  backgroundColor: theme.palette.primary.main,
                  transform: 'translateX(-50%)',
                  borderRadius: 4
                }
              }}
            >
              Our Mission
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{
                maxWidth: "800px",
                mx: "auto",
                mt: 4,
                fontStyle: "italic",
                color: theme.palette.text.primary,
                backgroundColor: 'rgba(35, 206, 163, 0.05)',
                p: 3,
                borderRadius: 2,
                border: '1px solid rgba(35, 206, 163, 0.1)',
              }}
            >
              "{aboutContent.mission}"
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* How It Works Section */}
          <Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ 
                mb: 3, 
                textAlign: "center", 
                color: theme.palette.text.primary,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  width: 60,
                  height: 3,
                  backgroundColor: theme.palette.primary.main,
                  transform: 'translateX(-50%)',
                  borderRadius: 4
                }
              }}
            >
              How Our AI-Powered Recommendation Works
            </Typography>

            <List sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
              {aboutContent.process.map((step, index) => (
                <ListItem 
                  key={index} 
                  alignItems="flex-start"
                  sx={{ 
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: index % 2 === 0 ? 'rgba(35, 206, 163, 0.05)' : 'transparent',
                    border: index % 2 === 0 ? '1px solid rgba(35, 206, 163, 0.1)' : 'none'
                  }}
                >
                  <ListItemIcon>
                    <Chip
                      label={index + 1}
                      color="primary"
                      size="small"
                      sx={{ 
                        borderRadius: "50%", 
                        width: 30, 
                        height: 30,
                        fontWeight: 'bold' 
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={step} 
                    primaryTypographyProps={{ 
                      color: 'text.primary',
                      fontWeight: 500
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          
          {/* Northeastern University Footer */}
          <Divider sx={{ my: 4 }} />
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontWeight: 500,
                color: 'text.secondary'
              }}
            >
              {aboutContent.footerText.split("❤️")[0]}
              <FavoriteIcon color="error" sx={{ mx: 0.5, fontSize: 16 }} />
              {aboutContent.footerText.split("❤️")[1]}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default About;