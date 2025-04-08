import React, { useLayoutEffect, useRef } from "react";
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
  useTheme,
} from "@mui/material";
import RecommendIcon from "@mui/icons-material/Recommend";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PsychologyIcon from "@mui/icons-material/Psychology";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { aboutContent } from "../content/content";
import { gsap } from "gsap";

const About = () => {
  const theme = useTheme();

  // Refs for animations
  const headerRef = useRef(null);
  const imageRef = useRef(null);
  const featuresRef = useRef([]);
  const missionRef = useRef(null);
  const processRef = useRef([]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(imageRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        delay: 0.3,
        ease: "back.out(1.7)",
      });

      gsap.from(featuresRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2,
        delay: 0.5,
        ease: "power2.out",
      });

      gsap.from(missionRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
      });

      gsap.from(processRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.6,
        stagger: 0.15,
        delay: 0.5,
        ease: "power2.out",
      });
    });

    // Cleanup
    return () => ctx.revert();
  }, []);

  const featureIcons = [
    <RecommendIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />,
    <ListAltIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />,
    <PsychologyIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />,
    <TouchAppIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />,
  ];

  const paperBgColor =
    theme.palette.mode === "light" ? "#FFFFFF" : theme.palette.background.paper;
  const paperShadow =
    theme.palette.mode === "light"
      ? "0 2px 20px rgba(35, 206, 163, 0.08)"
      : "0 2px 20px rgba(0, 0, 0, 0.2)";
  const paperBorder =
    theme.palette.mode === "light"
      ? "1px solid rgba(35, 206, 163, 0.1)"
      : "1px solid rgba(35, 206, 163, 0.05)";
  const featureBgHover =
    theme.palette.mode === "light"
      ? "0 10px 20px rgba(35, 206, 163, 0.12)"
      : "0 10px 20px rgba(0, 0, 0, 0.3)";
  const alternatingBgColor =
    theme.palette.mode === "light"
      ? "rgba(35, 206, 163, 0.05)"
      : "rgba(35, 206, 163, 0.03)";
  const missionBgColor =
    theme.palette.mode === "light"
      ? "rgba(35, 206, 163, 0.05)"
      : "rgba(35, 206, 163, 0.03)";
  const greenChipBg = "#00b386";

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 4, md: 5 },
          borderRadius: 2,
          backgroundColor: paperBgColor,
          boxShadow: paperShadow,
          border: paperBorder,
        }}
      >
        {/* Header Section */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6} ref={headerRef}>
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

          <Grid item xs={12} md={6}>
            <Box
              ref={imageRef}
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
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                width: 60,
                height: 3,
                backgroundColor: theme.palette.primary.main,
                transform: "translateX(-50%)",
                borderRadius: 4,
              },
            }}
          >
            What Makes Us Different
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {aboutContent.features.map((feature, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                key={index}
                ref={(el) => (featuresRef.current[index] = el)}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    transition:
                      "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                    border: paperBorder,
                    borderRadius: 2,
                    backgroundColor: paperBgColor,
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: featureBgHover,
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
        <Box sx={{ mb: 5, textAlign: "center" }} ref={missionRef}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              mb: 2,
              color: theme.palette.text.primary,
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                width: 60,
                height: 3,
                backgroundColor: theme.palette.primary.main,
                transform: "translateX(-50%)",
                borderRadius: 4,
              },
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
              backgroundColor: missionBgColor,
              p: 3,
              borderRadius: 2,
              border: paperBorder,
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
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                width: 60,
                height: 3,
                backgroundColor: theme.palette.primary.main,
                transform: "translateX(-50%)",
                borderRadius: 4,
              },
            }}
          >
            How Our AI-Powered Recommendation Works
          </Typography>

          <List sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
            {aboutContent.process.map((step, index) => (
              <ListItem
                key={index}
                alignItems="flex-start"
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor:
                    index % 2 === 0 ? alternatingBgColor : "transparent",
                  border: index % 2 === 0 ? paperBorder : "none",
                }}
                ref={(el) => (processRef.current[index] = el)}
              >
                <ListItemIcon>
                  <Chip
                    label={index + 1}
                    size="small"
                    sx={{
                      borderRadius: "50%",
                      width: 30,
                      height: 30,
                      fontWeight: "bold",
                      backgroundColor: greenChipBg,
                      color: "white",
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={step}
                  primaryTypographyProps={{
                    color: "text.primary",
                    fontWeight: 500,
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Footer */}
        <Divider sx={{ my: 4 }} />
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 500,
              color: "text.secondary",
            }}
          >
            {aboutContent.footerText.split("❤️")[0]}
            <FavoriteIcon color="error" sx={{ mx: 0.5, fontSize: 16 }} />
            {aboutContent.footerText.split("❤️")[1]}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
