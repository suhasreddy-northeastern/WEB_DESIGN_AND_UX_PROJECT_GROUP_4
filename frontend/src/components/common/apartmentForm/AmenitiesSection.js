import React from "react";
import {
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";

const amenitiesList = [
  "Gym",
  "Swimming Pool",
  "Parking Space",
  "Pet-Friendly",
  "Balcony",
  "In-Unit Laundry",
];

const AmenitiesSection = ({ formData, handleCheckboxChange, isDarkMode, primaryColor }) => {
  return (
    <Box mt={5}>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        gutterBottom
        color="text.primary"
      >
        Amenities
      </Typography>
      <FormGroup row>
        {amenitiesList.map((name) => (
          <FormControlLabel
            key={name}
            control={
              <Checkbox
                checked={formData.amenities.includes(name)}
                onChange={handleCheckboxChange}
                name={name}
                sx={{
                  color: isDarkMode
                    ? "rgba(0, 179, 134, 0.7)"
                    : primaryColor,
                  "&.Mui-checked": { color: primaryColor },
                }}
              />
            }
            label={name}
            sx={{ color: "text.primary" }}
          />
        ))}
      </FormGroup>
    </Box>
  );
};

export default AmenitiesSection;