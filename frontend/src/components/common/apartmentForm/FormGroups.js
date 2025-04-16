import React from "react";
import {
  Typography,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";

const fieldGroups = [
  {
    title: (
      <>
        <HomeIcon sx={{ mr: 1 }} /> Basic Info
      </>
    ),
    fields: [
      { name: "type", label: "Listing Type", options: ["Rent", "Buy"] },
      { name: "bedrooms", label: "Bedrooms", options: ["1", "2", "3", "4+"] },
      { name: "price", label: "Exact Price (USD)", type: "number" },
      { name: "moveInDate", label: "Move-in Date", type: "date" },
    ],
  },
  {
    title: (
      <>
        <LocationOnIcon sx={{ mr: 1 }} /> Location & Design
      </>
    ),
    fields: [
      {
        name: "neighborhood",
        label: "Neighborhood",
        options: [
          "Quiet and Residential",
          "Busy Urban Area",
          "Close to Entertainment & Dining",
        ],
      },
      {
        name: "style",
        label: "Style",
        options: ["Modern", "Traditional", "Loft", "High-rise"],
      },
      {
        name: "floor",
        label: "Floor Level",
        options: ["Ground Floor", "Mid-level Floor", "Top Floor"],
      },
      {
        name: "view",
        label: "View",
        options: ["City View", "Park View", "Ocean View", "No Specific View"],
      },
    ],
  },
  {
    title: (
      <>
        <BuildIcon sx={{ mr: 1 }} /> Features
      </>
    ),
    fields: [
      {
        name: "sqft",
        label: "Exact Square Footage (e.g., 1150)",
        type: "number",
      },
      { name: "floor", label: "Floor Level (e.g., 3 or Ground)", type: "text" },
      { name: "parking", label: "Parking", options: ["Yes", "No"] },
      {
        name: "transport",
        label: "Public Transport Access",
        options: ["Close", "Average", "Far"],
      },
      {
        name: "safety",
        label: "Safety Level",
        options: ["High", "Moderate", "Basic"],
      },
    ],
  },
  {
    title: (
      <>
        <PeopleIcon sx={{ mr: 1 }} /> Tenant Info
      </>
    ),
    fields: [
      {
        name: "pets",
        label: "Pet Policy",
        options: ["Allowed", "Not Allowed"],
      },
      {
        name: "leaseCapacity",
        label: "Lease Capacity",
        options: ["1", "2", "3", "4+"],
      },
      { name: "roommates", label: "Roommate-Friendly", options: ["Yes", "No"] },
    ],
  },
];

const FormGroups = ({ formData, handleChange, isDarkMode, primaryColor }) => {
  return (
    <>
      {fieldGroups.map((group, idx) => (
        <Box mt={4} key={idx}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            gutterBottom
            color="text.primary"
          >
            {group.title}
          </Typography>
          <Grid container spacing={3}>
            {group.fields.map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                {field.options ? (
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel
                      component="legend"
                      sx={{ fontSize: 14, mb: 1, color: "text.secondary" }}
                    >
                      {field.label}
                    </FormLabel>
                    <RadioGroup
                      row
                      name={field.name}
                      value={formData[field.name] || ""}
                      onChange={handleChange}
                    >
                      {field.options.map((opt) => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={
                            <Radio
                              sx={{
                                color: isDarkMode
                                  ? "rgba(0, 179, 134, 0.7)"
                                  : primaryColor,
                                "&.Mui-checked": { color: primaryColor },
                              }}
                            />
                          }
                          label={opt}
                          sx={{ color: "text.primary" }}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    name={field.name}
                    label={field.label}
                    type={field.type || "text"}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    InputLabelProps={
                      field.type === "date" ? { shrink: true } : {}
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.15)"
                            : "rgba(0, 0, 0, 0.23)",
                        },
                        "&:hover fieldset": {
                          borderColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.25)"
                            : "rgba(0, 0, 0, 0.33)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: primaryColor,
                        },
                      },
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </>
  );
};

export default FormGroups;