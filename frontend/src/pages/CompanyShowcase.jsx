import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Grid,
  Card,
  CardMedia,
  Typography,
  Container,
  Box,
  Skeleton,
} from "@mui/material";

const CompanyShowcase = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/user/companies",
          {
            withCredentials: true,
          }
        );

        // Simulate shimmer
        setTimeout(() => {
          setCompanies(response.data);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box textAlign="center" mb={4} px={{ xs: 2, sm: 0 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Company Showcase
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover innovative companies hiring talented professionals.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {(loading ? Array.from(new Array(6)) : companies).map(
          (company, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  textAlign: "center",
                  p: { xs: 2, sm: 3 },
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                {loading ? (
                  <>
                    <Skeleton
                      variant="circular"
                      width={80}
                      height={80}
                      sx={{ mx: "auto", mb: 2 }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={24}
                      sx={{ mx: "auto" }}
                    />
                  </>
                ) : (
                  <>
                    <CardMedia
                      component="img"
                      image={`http://localhost:4000${company.imagePath}`}
                      alt={company.name}
                      sx={{
                        width: { xs: 80, sm: 100 },
                        height: { xs: 80, sm: 100 },
                        objectFit: "contain",
                        mx: "auto",
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      fontSize={{ xs: "1rem", sm: "1.1rem" }}
                    >
                      {company.name}
                    </Typography>
                  </>
                )}
              </Card>
            </Grid>
          )
        )}
      </Grid>
    </Container>
  );
};

export default CompanyShowcase;
