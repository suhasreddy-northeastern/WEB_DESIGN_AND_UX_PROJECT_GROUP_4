// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Grid,
//   Typography,
//   Card,
//   CardContent,
//   Chip,
//   Button,
//   Slider,
//   FormGroup,
//   FormControlLabel,
//   Checkbox,
//   RadioGroup,
//   Radio,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
//   Skeleton,
// } from "@mui/material";

// const apartments = [
//   {
//     title: "Luxury Downtown Loft",
//     location: "Downtown",
//     price: 1950,
//     beds: 1,
//     baths: 1,
//     size: "750 sqft",
//     match: 95,
//     tags: ["In-unit Washer/Dryer", "Gym", "Pool"],
//     available: "5/14/2025",
//   },
//   {
//     title: "Modern Midtown Apartment",
//     location: "Midtown",
//     price: 2200,
//     beds: 2,
//     baths: 2,
//     size: "950 sqft",
//     match: 92,
//     tags: ["In-unit Washer/Dryer", "Balcony", "Doorman"],
//     available: "4/29/2025",
//   },
//   {
//     title: "Cozy East Side Studio",
//     location: "East Side",
//     price: 1650,
//     beds: 1,
//     baths: 1,
//     size: "550 sqft",
//     match: 88,
//     tags: ["Parking", "Air Conditioning"],
//     available: "4/30/2025",
//   },
//   {
//     title: "Spacious West End Apartment",
//     location: "West End",
//     price: 2600,
//     beds: 2,
//     baths: 2,
//     size: "1100 sqft",
//     match: 85,
//     tags: ["In-unit Washer/Dryer", "Gym", "Pool", "Balcony", "Doorman"],
//     available: "4/14/2025",
//   },
//   {
//     title: "Riverside Penthouse",
//     location: "Riverside",
//     price: 3200,
//     beds: 3,
//     baths: 2,
//     size: "1400 sqft",
//     match: 80,
//     tags: ["In-unit Washer/Dryer", "Gym", "Pool"],
//     available: "5/9/2025",
//   },
//   {
//     title: "North Hills Townhouse",
//     location: "North Hills",
//     price: 2400,
//     beds: 2,
//     baths: 1.5,
//     size: "1050 sqft",
//     match: 78,
//     tags: ["In-unit Washer/Dryer", "Parking", "Air Conditioning"],
//     available: "4/19/2025",
//   },
//   {
//     title: "Downtown Micro Apartment",
//     location: "Downtown",
//     price: 1300,
//     beds: 0,
//     baths: 1,
//     size: "400 sqft",
//     match: 82,
//     tags: ["Gym"],
//     available: "4/20/2025",
//   },
//   {
//     title: "Midtown High-Rise Studio",
//     location: "Midtown",
//     price: 1800,
//     beds: 1,
//     baths: 1,
//     size: "600 sqft",
//     match: 89,
//     tags: ["Balcony", "Doorman", "Pool"],
//     available: "5/1/2025",
//   },
//   {
//     title: "West End Designer Loft",
//     location: "West End",
//     price: 2700,
//     beds: 2,
//     baths: 2,
//     size: "1150 sqft",
//     match: 87,
//     tags: ["Gym", "In-unit Washer/Dryer", "Balcony"],
//     available: "5/11/2025",
//   },
//   {
//     title: "East Side Compact Studio",
//     location: "East Side",
//     price: 1450,
//     beds: 0,
//     baths: 1,
//     size: "500 sqft",
//     match: 76,
//     tags: ["Parking"],
//     available: "4/25/2025",
//   },
//   {
//     title: "Riverside Family Home",
//     location: "Riverside",
//     price: 3100,
//     beds: 3,
//     baths: 2,
//     size: "1350 sqft",
//     match: 90,
//     tags: ["In-unit Washer/Dryer", "Gym", "Parking"],
//     available: "5/5/2025",
//   },
//   {
//     title: "North Hills Quiet Retreat",
//     location: "North Hills",
//     price: 2250,
//     beds: 2,
//     baths: 2,
//     size: "1000 sqft",
//     match: 84,
//     tags: ["Pool", "Air Conditioning"],
//     available: "4/28/2025",
//   },
// ];

// const SkeletonCard = () => (
//   <Card variant="outlined">
//     <Skeleton variant="rectangular" height={150} animation="wave" />
//     <CardContent>
//       <Skeleton height={28} width="80%" />
//       <Skeleton height={20} width="60%" />
//       <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 1 }}>
//         <Skeleton height={30} width={80} variant="rounded" />
//         <Skeleton height={30} width={100} variant="rounded" />
//       </Box>
//       <Skeleton height={16} width="40%" />
//     </CardContent>
//   </Card>
// );

// export default function ApartmentMatches() {
//   const [loading, setLoading] = useState(true);
//   const [priceRange, setPriceRange] = useState([1000, 3000]);

//   useEffect(() => {
//     const timeout = setTimeout(() => setLoading(false), 2000);
//     return () => clearTimeout(timeout);
//   }, []);

//   const handlePriceChange = (event, newValue) => {
//     setPriceRange(newValue);
//   };

//   return (
//     <Box sx={{ display: "flex", px: 4, py: 4 }}>
//       {/* Filters Sidebar */}
//       <Box
//         sx={{
//           width: 280,
//           mr: 4,
//           position: "sticky",
//           top: 100,
//           alignSelf: "flex-start",
//           height: "fit-content",
//         }}
//       >
//         <Typography variant="h6" fontWeight={600} gutterBottom>
//           Filters
//         </Typography>

//         <Typography variant="body2" sx={{ mb: 1 }}>
//           ${priceRange[0]} – ${priceRange[1]}
//         </Typography>
//         <Slider
//           min={1000}
//           max={3500}
//           value={priceRange}
//           onChange={handlePriceChange}
//           valueLabelDisplay="auto"
//           sx={{ mb: 2 }}
//         />

//         <Typography gutterBottom>Bedrooms</Typography>
//         <RadioGroup row defaultValue="2" sx={{ mb: 2 }}>
//           <FormControlLabel value="1" control={<Radio />} label="Studio" />
//           <FormControlLabel value="2" control={<Radio />} label="1" />
//           <FormControlLabel value="3" control={<Radio />} label="2" />
//           <FormControlLabel value="4" control={<Radio />} label="3+" />
//         </RadioGroup>

//         <Typography gutterBottom>Bathrooms</Typography>
//         <RadioGroup row defaultValue="2" sx={{ mb: 2 }}>
//           <FormControlLabel value="1" control={<Radio />} label="1" />
//           <FormControlLabel value="2" control={<Radio />} label="2" />
//           <FormControlLabel value="3" control={<Radio />} label="3+" />
//         </RadioGroup>

//         <Typography gutterBottom>Neighborhoods</Typography>
//         <FormGroup row sx={{ mb: 2 }}>
//           {["Downtown", "Midtown", "West End", "East Side"].map((area) => (
//             <FormControlLabel key={area} control={<Checkbox />} label={area} />
//           ))}
//         </FormGroup>

//         <Typography gutterBottom>Amenities</Typography>
//         <FormGroup sx={{ mb: 2 }}>
//           {["In-unit Washer/Dryer", "Gym", "Pool", "Parking"].map((amenity) => (
//             <FormControlLabel
//               key={amenity}
//               control={<Checkbox />}
//               label={amenity}
//             />
//           ))}
//         </FormGroup>

//         <Button variant="contained" fullWidth>
//           Apply Filters
//         </Button>
//       </Box>

//       {/* Right Side Content */}
//       <Box sx={{ flex: 1 }}>
//         <Typography variant="h5" fontWeight={600} gutterBottom>
//           Your Apartment Matches
//         </Typography>
//         <Typography variant="body2" sx={{ mb: 2 }}>
//           We found {apartments.length} apartments that match your preferences
//         </Typography>

//         <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
//           <FormControl size="small">
//             <InputLabel>Best Match</InputLabel>
//             <Select defaultValue="Best Match" label="Best Match">
//               <MenuItem value="Best Match">Best Match</MenuItem>
//               <MenuItem value="Lowest Price">Lowest Price</MenuItem>
//               <MenuItem value="Highest Match">Highest Match</MenuItem>
//             </Select>
//           </FormControl>
//         </Box>

//         <Grid container spacing={2}>
//           {loading
//             ? Array.from({ length: apartments.length }).map((_, i) => (
//                 <Grid item xs={12} md={6} key={i}>
//                   <SkeletonCard />
//                 </Grid>
//               ))
//             : apartments.map((apt, i) => (
//                 <Grid item xs={12} md={6} key={i}>
//                   <Card variant="outlined">
//                     <Box
//                       sx={{
//                         backgroundColor: "#f5f5f5",
//                         height: 150,
//                         position: "relative",
//                       }}
//                     >
//                       <Chip
//                         label={`${apt.match}% Match`}
//                         color="secondary"
//                         sx={{ position: "absolute", top: 8, right: 8 }}
//                       />
//                     </Box>
//                     <CardContent>
//                       <Box
//                         sx={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                         }}
//                       >
//                         <Typography fontWeight={600}>{apt.title}</Typography>
//                         <Typography fontWeight={600} color="primary">
//                           ${apt.price}/mo
//                         </Typography>
//                       </Box>
//                       <Typography
//                         variant="body2"
//                         color="textSecondary"
//                         gutterBottom
//                       >
//                         {apt.location} • {apt.beds} bd • {apt.baths} ba •{" "}
//                         {apt.size}
//                       </Typography>
//                       <Box
//                         sx={{
//                           display: "flex",
//                           flexWrap: "wrap",
//                           gap: 0.5,
//                           my: 1,
//                         }}
//                       >
//                         {apt.tags.map((tag) => (
//                           <Chip key={tag} label={tag} size="small" />
//                         ))}
//                       </Box>
//                       <Typography variant="caption" color="textSecondary">
//                         Available {apt.available}
//                       </Typography>
//                       <Box sx={{ textAlign: "right" }}>
//                         <Button size="small">View Details</Button>
//                       </Box>
//                     </CardContent>
//                   </Card>
//                 </Grid>
//               ))}
//         </Grid>
//       </Box>
//     </Box>
//   );
// }

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Skeleton,
} from "@mui/material";
import { filterOptions } from "../content/content"; // Adjust path as needed

const SkeletonCard = () => (
  <Card variant="outlined">
    <Skeleton variant="rectangular" height={150} animation="wave" />
    <CardContent>
      <Skeleton height={28} width="80%" />
      <Skeleton height={20} width="60%" />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 1 }}>
        <Skeleton height={30} width={80} variant="rounded" />
        <Skeleton height={30} width={100} variant="rounded" />
      </Box>
      <Skeleton height={16} width="40%" />
    </CardContent>
  </Card>
);

export default function ApartmentMatches() {
  const [loading, setLoading] = useState(true);
  const [apartments, setApartments] = useState([
    {
      title: "Luxury Downtown Loft",
      location: "Downtown",
      price: 1950,
      beds: 1,
      baths: 1,
      size: "750 sqft",
      match: 95,
      tags: ["In-unit Washer/Dryer", "Gym", "Pool"],
      available: "5/14/2025",
    },
    {
      title: "Modern Midtown Apartment",
      location: "Midtown",
      price: 2200,
      beds: 2,
      baths: 2,
      size: "950 sqft",
      match: 92,
      tags: ["In-unit Washer/Dryer", "Balcony", "Doorman"],
      available: "4/29/2025",
    },
    {
      title: "Cozy East Side Studio",
      location: "East Side",
      price: 1650,
      beds: 1,
      baths: 1,
      size: "550 sqft",
      match: 88,
      tags: ["Parking", "Air Conditioning"],
      available: "4/30/2025",
    },
    {
      title: "Spacious West End Apartment",
      location: "West End",
      price: 2600,
      beds: 2,
      baths: 2,
      size: "1100 sqft",
      match: 85,
      tags: ["In-unit Washer/Dryer", "Gym", "Pool", "Balcony", "Doorman"],
      available: "4/14/2025",
    },
    {
      title: "Riverside Penthouse",
      location: "Riverside",
      price: 3200,
      beds: 3,
      baths: 2,
      size: "1400 sqft",
      match: 80,
      tags: ["In-unit Washer/Dryer", "Gym", "Pool"],
      available: "5/9/2025",
    },
    {
      title: "North Hills Townhouse",
      location: "North Hills",
      price: 2400,
      beds: 2,
      baths: 1.5,
      size: "1050 sqft",
      match: 78,
      tags: ["In-unit Washer/Dryer", "Parking", "Air Conditioning"],
      available: "4/19/2025",
    },
    {
      title: "Downtown Micro Apartment",
      location: "Downtown",
      price: 1300,
      beds: 0,
      baths: 1,
      size: "400 sqft",
      match: 82,
      tags: ["Gym"],
      available: "4/20/2025",
    },
    {
      title: "Midtown High-Rise Studio",
      location: "Midtown",
      price: 1800,
      beds: 1,
      baths: 1,
      size: "600 sqft",
      match: 89,
      tags: ["Balcony", "Doorman", "Pool"],
      available: "5/1/2025",
    },
    {
      title: "West End Designer Loft",
      location: "West End",
      price: 2700,
      beds: 2,
      baths: 2,
      size: "1150 sqft",
      match: 87,
      tags: ["Gym", "In-unit Washer/Dryer", "Balcony"],
      available: "5/11/2025",
    },
    {
      title: "East Side Compact Studio",
      location: "East Side",
      price: 1450,
      beds: 0,
      baths: 1,
      size: "500 sqft",
      match: 76,
      tags: ["Parking"],
      available: "4/25/2025",
    },
    {
      title: "Riverside Family Home",
      location: "Riverside",
      price: 3100,
      beds: 3,
      baths: 2,
      size: "1350 sqft",
      match: 90,
      tags: ["In-unit Washer/Dryer", "Gym", "Parking"],
      available: "5/5/2025",
    },
    {
      title: "North Hills Quiet Retreat",
      location: "North Hills",
      price: 2250,
      beds: 2,
      baths: 2,
      size: "1000 sqft",
      match: 84,
      tags: ["Pool", "Air Conditioning"],
      available: "4/28/2025",
    },
  ]);
  const [priceRange, setPriceRange] = useState([1000, 3000]);

  useEffect(() => {
    // Simulate API call
    const timeout = setTimeout(() => {
      //setApartments([]); // replace with fetched data
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  return (
    <Box sx={{ display: "flex", px: 4, py: 4 }}>
      {/* Filters Sidebar */}
      <Box
        sx={{
          width: 280,
          mr: 4,
          position: "sticky",
          top: 100,
          alignSelf: "flex-start",
          height: "fit-content",
        }}
      >
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Filters
        </Typography>

        <Typography variant="body2" sx={{ mb: 1 }}>
          ${priceRange[0]} – ${priceRange[1]}
        </Typography>
        <Slider
          min={1000}
          max={3500}
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          sx={{ mb: 2 }}
        />

        <Typography gutterBottom>Bedrooms</Typography>
        <RadioGroup row defaultValue="2" sx={{ mb: 2 }}>
          <FormControlLabel value="1" control={<Radio />} label="Studio" />
          <FormControlLabel value="2" control={<Radio />} label="1" />
          <FormControlLabel value="3" control={<Radio />} label="2" />
          <FormControlLabel value="4" control={<Radio />} label="3+" />
        </RadioGroup>

        <Typography gutterBottom>Bathrooms</Typography>
        <RadioGroup row defaultValue="2" sx={{ mb: 2 }}>
          <FormControlLabel value="1" control={<Radio />} label="1" />
          <FormControlLabel value="2" control={<Radio />} label="2" />
          <FormControlLabel value="3" control={<Radio />} label="3+" />
        </RadioGroup>

        <Typography gutterBottom>Neighborhoods</Typography>
        <FormGroup row sx={{ mb: 2 }}>
          {filterOptions.neighborhoods.map((area) => (
            <FormControlLabel key={area} control={<Checkbox />} label={area} />
          ))}
        </FormGroup>

        <Typography gutterBottom>Amenities</Typography>
        <FormGroup sx={{ mb: 2 }}>
          {filterOptions.amenities.map((amenity) => (
            <FormControlLabel
              key={amenity}
              control={<Checkbox />}
              label={amenity}
            />
          ))}
        </FormGroup>

        <Button variant="contained" fullWidth>
          Apply Filters
        </Button>
      </Box>

      {/* Right Side Content */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Your Apartment Matches
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          We found {apartments.length} apartments that match your preferences
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <FormControl size="small">
            <InputLabel>Sort By</InputLabel>
            <Select defaultValue="Best Match" label="Sort By">
              {filterOptions.sortOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={2}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <SkeletonCard />
                </Grid>
              ))
            : apartments.map((apt, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Card variant="outlined">
                    <Box
                      sx={{
                        backgroundColor: "#f5f5f5",
                        height: 150,
                        position: "relative",
                      }}
                    >
                      <Chip
                        label={`${apt.match || "?"}% Match`}
                        color="secondary"
                        sx={{ position: "absolute", top: 8, right: 8 }}
                      />
                    </Box>
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography fontWeight={600}>{apt.title}</Typography>
                        <Typography fontWeight={600} color="primary">
                          ${apt.price}/mo
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        {apt.location} • {apt.beds} bd • {apt.baths} ba •{" "}
                        {apt.size}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 0.5,
                          my: 1,
                        }}
                      >
                        {apt.tags?.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Available {apt.available}
                      </Typography>
                      <Box sx={{ textAlign: "right" }}>
                        <Button size="small">View Details</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
        </Grid>
      </Box>
    </Box>
  );
}
