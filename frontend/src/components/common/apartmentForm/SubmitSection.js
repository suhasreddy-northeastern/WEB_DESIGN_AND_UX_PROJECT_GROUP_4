import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const SubmitSection = ({ isSubmitting, primaryColor }) => {
  return (
    <Box mt={5}>
      <Button
        variant="contained"
        fullWidth
        type="submit"
        disabled={isSubmitting}
        endIcon={
          isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <ArrowForwardIcon />
          )
        }
        sx={{
          py: 1.5,
          borderRadius: 3,
          fontSize: "1rem",
          fontWeight: 600,
          backgroundColor: primaryColor,
          "&:hover": { backgroundColor: "#009e75" },
        }}
      >
        {isSubmitting ? "Submitting..." : "Submit Apartment Listing"}
      </Button>
    </Box>
  );
};

export default SubmitSection;