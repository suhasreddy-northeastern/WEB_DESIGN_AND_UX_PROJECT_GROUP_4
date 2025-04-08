import {
  Grid,
  Typography,
  Box,
  Paper,
  Button,
  IconButton,
} from "@mui/material";
import { FaDumbbell, FaBus } from "react-icons/fa";
import { IoIosPhonePortrait } from "react-icons/io";
import { CiClock1 } from "react-icons/ci";
import { SiAmazonapigateway } from "react-icons/si";
import { GrVmMaintenance } from "react-icons/gr";

import listingImageOne from "../images/listing_image_1.jpg";
import listingImageTwo from "../images/listing_image_2.jpg";
import listingImageThree from "../images/listing_image_3.jpg";
import listingImageFour from "../images/listing_image_4.jpg";
import listingImageFive from "../images/listing_image_5.jpg";
import floorPlanOne from "../images/floor_plan_1.jpg";
import floorPlanTwo from "../images/floor_plan_2.jpg";
import floorPlanThree from "../images/floor_plan_3.jpg";
import floorPlanFour from "../images/floor_plan_4.jpg";
import theme from "../components/common/theme/theme";
import MapComponent from "../components/Map";

const PropertyDetailsPage = () => {
  const property = {
    name: "Mezzo Design Lofts",
    price: "$2,500/month",
    address: "30 Caldwell St, Charlestown, MA 02129",
    keyFeatures: {
      bedrooms: 2,
      bathrooms: 2,
      size: "1,200 sq ft",
      amenities: ["Balcony", "Gym", "Pool"],
    },
    media: {
      images: [
        listingImageOne,
        listingImageTwo,
        listingImageThree,
        listingImageFour,
        listingImageFive,
      ],
    },
    description:
      "Your Place. Your Space. At Mezzo Design Lofts, proximity and design are everything. With its cutting edge aesthetic, accessible location along the MBTA Orange Line 'T' stop and inviting amenities, Mezzo Design Lofts are raising the standard of living in Boston. Express your individuality in a brand-new space of your own - with an inspired sense of design within your reach. Apartments in Charlestown MA 02129 Few states are more associated with the American Revolution than Massachusetts. Apartments in Charlestown MA 02129 place you right in the middle of the action. Charlestown is deemed to be one of the oldest neighborhoods in Boston, where the Puritans established their roots. Apartments in Charlestown MA 02129 On June 17, 1775, the Battle of Bunker Hill was waged near the site of Charlestown. The Bunker Hill Monument commemorates this dedication to freedom. The Minutemen defended this area against the British Empire. The old New England Patriots logo showed these revolutionary fighters. The U.S.S. Constitution is docked in the local naval yard. Paul Revere made his famous ride through these very same streets. The Warren Tavern has been a popular destination serving customers since those revolutionary days. In 1848, Charlestown was incorporated; it is located on a peninsula across from downtown Boston. The Charles River and Mystic River run along either side of Charlestown. This neighborhood has a rich history. The Charlestown City Square is a popular destination for tourists. The Bunker Hill Community College is located in this area. Boston Public Schools runs the educational system here. Liberty: A Trust to Be Transmitted to Posterity There are so many great activities in Charlestown, and Boston is within walking distance. It makes sense to enjoy your Charlestown apartments after working downtown. Fidelity Investments, John Hancock Mutual Life Insurance, Gillette and USAir are some of the largest employers in Boston. The Massachusetts General Hospital runs an institute in Charlestown. John Harvard was buried in Charlestown. This town has a long history that mirrors the rise of Massachusetts. Charlestown has experienced a number of redevelopments to upgrade its infrastructure. This has made the area more modern. Theatre on Fire, walking clubs and yoga are only a few of the many things you can do in Charlestown. Underground trains connect Charlestown to other neighborhoods. Boston's Logan International Airport is nearby to help you go wherever you want. Boat service on the river is readily available too. If you love to get on the river for boating activities, then a Charlestown MA 02129 apartment can't be beat. Sail in the morning. Work in downtown Boston during the day. Grab some seafood for dinner. Charlestown combines a rich history of freedom with the modern amenities of the East Coast. This area is full of great universities. Charelstown is full of life, and it is a great place to call home.",
    reviews: [
      {
        user: "Jane Smith",
        rating: 4.5,
        title: "The Apartment is amazing",
        Date: "Aug 8 , 2023",
        comment:
          "The Apartment is great! The building is so clean and the staff is so kind. I recommend the Apartment 10/10 !!!! You will not regret it.",
      },
      {
        user: "Sherlock Holmes",
        rating: 4.6,
        title: "Such a cool place to live!",
        Date: "Oct 9, 2024",
        comment:
          "I was new to Boston (and the US) and booking at the Apartment was the best decision I made...",
      },
    ],
  };

  return (
    <Box p={4}>
      <Grid container spacing={4} alignItems="flex-start">
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={8}>
          <Box>
            {/* Image Section */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <img
                  src={property.media.images[0]}
                  alt="Main Property"
                  style={{ width: "100%", borderRadius: 8 }}
                />
              </Grid>
              <Grid item xs={12} md={6} container spacing={2}>
                {[2, 2, 3, 4].map((i, index) => (
                  <Grid item xs={6} key={index}>
                    <img
                      src={property.media.images[i]}
                      alt={`Property ${i}`}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Details */}
            <Box mt={4}>
              <Typography variant="h4" gutterBottom>
                {property.name}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {property.address}
              </Typography>

              {/* Key Features */}
              <Grid container spacing={2} mt={2}>
                <Grid item xs={6} md={3}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2">Monthly Rent</Typography>
                    <Typography variant="h6">{property.price}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2">Bedrooms</Typography>
                    <Typography variant="h6">
                      {property.keyFeatures.bedrooms}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2">Bathrooms</Typography>
                    <Typography variant="h6">
                      {property.keyFeatures.bathrooms}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="body2">Size</Typography>
                    <Typography variant="h6">
                      {property.keyFeatures.size}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Description */}
              <Box mt={3}>
                <Typography variant="body1">{property.description}</Typography>
              </Box>

              {/* Unique Features */}
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Unique Features
                </Typography>
                <ul>
                  <li>Mezzo Dog Park</li>
                  <li>All Size Pets</li>
                  <li>Track Lighting Washer</li>
                  <li>Designer Bathrooms</li>
                  <li>Dryer in Unit</li>
                  <li>Juliet Balconies & Patios</li>
                </ul>
              </Box>

              {/* Amenities */}
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Community Amenities
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { icon: <FaDumbbell />, label: "Fitness Center" },
                    { icon: <SiAmazonapigateway />, label: "Gated" },
                    { icon: <GrVmMaintenance />, label: "Maintenance" },
                    { icon: <FaBus />, label: "Transport" },
                  ].map((item, index) => (
                    <Grid item xs={6} md={3} key={index}>
                      <Paper
                        elevation={2}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          p: 2,
                        }}
                      >
                        <IconButton>{item.icon}</IconButton>
                        <Typography variant="body2">{item.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Map */}
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Location
                </Typography>
                <MapComponent />
              </Box>

              {/* Floor Plans */}
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Floor Plans
                </Typography>
                <Grid container spacing={2}>
                  {[
                    floorPlanOne,
                    floorPlanTwo,
                    floorPlanThree,
                    floorPlanFour,
                  ].map((img, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <img
                        src={img}
                        alt={`Floor Plan ${index + 1}`}
                        style={{ width: "100%", borderRadius: 8 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Reviews */}
              <Box mt={4}>
                <Typography variant="h5" gutterBottom>
                  Reviews
                </Typography>
                {property.reviews.map((review, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="caption">{review.Date}</Typography>
                    <Typography variant="h6">{review.title}</Typography>
                    <Typography>{review.comment}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* RIGHT COLUMN - Sticky Contact Form */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              position: "sticky",
              top: 20,
              p: 3,
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography variant="h5" gutterBottom>
              Contact This Property
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                mb: 2,
              }}
            >
              Request Tour
            </Button>
            <Button variant="outlined" fullWidth color="primary">
              Submit Preferences
            </Button>

            <Box mt={3}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <IoIosPhonePortrait />
                <Typography>(781) 808-2331</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <CiClock1 />
                <Typography>Open 10am - 6pm</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PropertyDetailsPage;
