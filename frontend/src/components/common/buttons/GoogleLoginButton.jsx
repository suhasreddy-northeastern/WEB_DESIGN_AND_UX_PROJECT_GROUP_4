// components/common/GoogleLoginButton.jsx
import React from "react";
import { Button, Box } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";

const GoogleLoginButton = ({ onClick }) => {
  return (
    <Box mt={2}>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={onClick}
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          borderRadius: 2,
          py: 1.2,
          fontSize: "0.95rem",
        }}
      >
        Continue with Google
      </Button>
    </Box>
  );
};

export default GoogleLoginButton;
