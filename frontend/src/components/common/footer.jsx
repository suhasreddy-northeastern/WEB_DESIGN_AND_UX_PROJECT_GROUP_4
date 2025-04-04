import React from "react";
import {
  Box,
  Typography,
  Container,
  Divider,
  Link as MuiLink,
} from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f9f9f9",
        py: 3,
        mt: "auto", // ✅ this makes footer stick to the bottom of the page
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 2 }} />
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          gap={1}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} HomeFit. All rights reserved.
          </Typography>

          <Box display="flex" gap={2}>
            <MuiLink href="/contact" underline="hover" color="text.secondary">
              Contact Us
            </MuiLink>
            <MuiLink href="#" underline="hover" color="text.secondary">
              Privacy Policy
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
