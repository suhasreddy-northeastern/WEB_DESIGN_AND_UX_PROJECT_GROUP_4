import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  FormGroup,
  Checkbox,
  Button,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import HomeIcon from "@mui/icons-material/Home";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const FormContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 1000,
  margin: "auto",
  padding: theme.spacing(4),
  borderRadius: 16,
  backgroundColor: "#ffffff",
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
}));

const amenitiesList = [
  "Gym",
  "Swimming Pool",
  "Parking Space",
  "Pet-Friendly",
  "Balcony",
  "In-Unit Laundry",
];

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

const AgentApartmentForm = () => {
  const [formData, setFormData] = useState({
    amenities: [],
    images: [],
    imageUrls: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      amenities: checked
        ? [...prev.amenities, name]
        : prev.amenities.filter((item) => item !== name),
    }));
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    const data = new FormData();
    for (let file of files) {
      data.append("images", file);
    }

    try {
      const res = await axios.post(
        "http://localhost:4000/api/apartments/upload-images",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setFormData((prev) => ({ ...prev, imageUrls: res.data.imageUrls }));
    } catch (err) {
      alert("❌ Failed to upload images");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submission = { ...formData };
      delete submission.images;
      await axios.post("http://localhost:4000/api/apartments", submission);
      alert("✅ Apartment listed successfully!");
    } catch (err) {
      alert("❌ Failed to submit");
    }
  };

  return (
    <Box sx={{ my: 10, px: 2 }}>
      <FormContainer elevation={3}>
        <Typography
          variant="h5"
          fontWeight={600}
          color="#00b386"
          textAlign="center"
          gutterBottom
        >
          List a New Apartment
        </Typography>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {fieldGroups.map((group, idx) => (
            <Box mt={4} key={idx}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {group.title}
              </Typography>
              <Grid container spacing={3}>
                {group.fields.map((field) => (
                  <Grid item xs={12} sm={6} key={field.name}>
                    {field.options ? (
                      <FormControl component="fieldset" fullWidth>
                        <FormLabel
                          component="legend"
                          sx={{ fontSize: 14, mb: 1 }}
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
                                    color: "#00b386",
                                    "&.Mui-checked": { color: "#00b386" },
                                  }}
                                />
                              }
                              label={opt}
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
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          <Box mt={5}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
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
                        color: "#00b386",
                        "&.Mui-checked": { color: "#00b386" },
                      }}
                    />
                  }
                  label={name}
                />
              ))}
            </FormGroup>
          </Box>

          <Box mt={4}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              <PhotoCameraIcon sx={{ mr: 1 }} /> Upload Apartment Images
            </Typography>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: 8 }}
            />
          </Box>

          <Box mt={5}>
            <Button
              variant="contained"
              fullWidth
              type="submit"
              endIcon={<ArrowForwardIcon />}
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: "#00b386",
                "&:hover": { backgroundColor: "#009e75" },
              }}
            >
              Submit Apartment Listing
            </Button>
          </Box>
        </form>
      </FormContainer>
    </Box>
  );
};

export default AgentApartmentForm;
