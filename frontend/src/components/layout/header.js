import React from "react";
import { Typography, Box } from "@mui/material";

const Header = () => {
  return (
    <Box sx={{ backgroundColor: "gray.900", paddingY: 2, textAlign: "center" }}>
      <Typography variant="body2" color="white">
        Find your perfect home with HomeFit 🏡
      </Typography>
    </Box>
  );
};

export default Header;
