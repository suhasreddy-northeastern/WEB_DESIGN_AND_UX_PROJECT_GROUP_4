import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  Tooltip,
  Button,
  CardMedia,
  MobileStepper,
  Pagination,
  Grid,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingMessage from "../components/common/LoadingMessage";

dayjs.extend(relativeTime);

const MatchResults = () => {
  const { prefId } = useParams();
  const [matches, setMatches] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeSteps, setActiveSteps] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const primaryColor = '#00b386'; // Use the exact color from your theme
  const itemsPerPage = 4;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        
        // The backend now handles caching with Redis
        const res = await axios.get(
          `http://localhost:4000/api/user/matches/${prefId}?page=${page}&limit=${itemsPerPage}`,
          { withCredentials: true }
        );
        
        setMatches(res.data.results || []);
        setTotalCount(res.data.totalCount || 0);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setMatches([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    if (prefId) fetchMatches();
  }, [prefId, page]);

  const handleStepChange = (aptId, direction) => {
    setActiveSteps((prev) => {
      const current = prev[aptId] || 0;
      const max = (
        matches.find((m) => m.apartment._id === aptId)?.apartment.imageUrls || []
      ).length;
      const next =
        direction === "next"
          ? Math.min(current + 1, max - 1)
          : Math.max(current - 1, 0);
      return { ...prev, [aptId]: next };
    });
  };

  const renderExplanation = (text) =>
    text.split("\n").map((line, i) => (
      <Typography key={i} variant="body2" color="text.secondary">
        {line}
      </Typography>
    ));

  // Function to get the appropriate color based on match score
  const getMatchColor = (score) => {
    if (score >= 80) return primaryColor; // Use #00b386 for high matches
    if (score >= 50) return '#f9c74f'; // Warning color
    return '#f94144'; // Error color
  };

  if (loading) return <LoadingMessage />;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography 
        variant="h5" 
        fontWeight={600} 
        mb={4}
        sx={{
          position: 'relative',
          display: 'inline-block',
          '&:after': {
            content: '""',
            position: 'absolute',
            width: '60px',
            height: '3px',
            bottom: '-8px',
            left: 0,
            backgroundColor: primaryColor,
            borderRadius: '2px'
          }
        }}
      >
        Top Apartment Matches
      </Typography>

      {matches.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: "center", 
            mt: 8, 
            p: 4, 
            borderRadius: 2,
            backgroundColor: 'rgba(0, 179, 134, 0.05)',
            border: '1px solid rgba(0, 179, 134, 0.1)',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No matches found. Try updating your preferences.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {matches.map((match) => {
              const apt = match.apartment;
              const currentStep = activeSteps[apt._id] || 0;
              const gallery = apt.imageUrls || [apt.imageUrl];
              const createdAt = dayjs(apt.createdAt).fromNow();
              const matchColor = getMatchColor(match.matchScore);

              return (
                <Grid item xs={12} md={6} key={apt._id}>
                  <Card 
                    sx={{ 
                      borderRadius: 3, 
                      height: "100%",
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 20px rgba(0, 179, 134, 0.15)',
                      },
                      overflow: 'hidden',
                      border: '1px solid rgba(0, 179, 134, 0.1)',
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <CardMedia
                        component="img"
                        image={`http://localhost:4000${
                          gallery[currentStep] || "/images/no-image.png"
                        }`}
                        alt="Apartment Preview"
                        sx={{
                          height: 200,
                          objectFit: "cover",
                        }}
                      />

                      {gallery.length > 1 && (
                        <MobileStepper
                          variant="dots"
                          steps={gallery.length}
                          position="static"
                          activeStep={currentStep}
                          sx={{ 
                            justifyContent: "center",
                            backgroundColor: 'rgba(0, 179, 134, 0.05)',
                            '& .MuiMobileStepper-dot': {
                              backgroundColor: 'rgba(0, 179, 134, 0.2)',
                            },
                            '& .MuiMobileStepper-dotActive': {
                              backgroundColor: primaryColor,
                            }
                          }}
                          nextButton={
                            <Button
                              size="small"
                              onClick={() => handleStepChange(apt._id, "next")}
                              disabled={currentStep === gallery.length - 1}
                              sx={{ color: primaryColor }}
                            >
                              Next
                            </Button>
                          }
                          backButton={
                            <Button
                              size="small"
                              onClick={() => handleStepChange(apt._id, "back")}
                              disabled={currentStep === 0}
                              sx={{ color: primaryColor }}
                            >
                              Back
                            </Button>
                          }
                        />
                      )}

                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {apt.bedrooms} BHK in {apt.neighborhood}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: primaryColor,
                                fontWeight: 600 
                              }}
                            >
                              ₹{apt.price}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Listed {createdAt}
                            </Typography>
                          </Box>

                          <Tooltip title="Match Score">
                            <Box sx={{ position: "relative", display: "inline-flex" }}>
                              <CircularProgress
                                variant="determinate"
                                value={match.matchScore}
                                thickness={5}
                                size={50}
                                sx={{
                                  color: matchColor,
                                }}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: "absolute",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  component="div"
                                  fontWeight={600}
                                >
                                  {`${Math.round(match.matchScore)}%`}
                                </Typography>
                              </Box>
                            </Box>
                          </Tooltip>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(0, 179, 134, 0.1)' }} />

                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          gutterBottom
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <Box 
                            component="span" 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              backgroundColor: matchColor,
                              display: 'inline-block',
                              mr: 1
                            }} 
                          />
                          Why we gave this home a {match.matchScore}% match:
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            mt: 1, 
                            mb: 2, 
                            p: 2, 
                            borderRadius: 2,
                            backgroundColor: 'rgba(0, 179, 134, 0.05)', 
                            borderLeft: `3px solid ${matchColor}`
                          }}
                        >
                          {renderExplanation(match.explanation)}
                        </Box>

                        <Box mt={3} display="flex" justifyContent="flex-end">
                          <Button
                            variant="contained"
                            sx={{ 
                              borderRadius: 16,
                              background: `linear-gradient(45deg, #008c69 0%, ${primaryColor} 100%)`,
                              boxShadow: '0 4px 10px rgba(0, 179, 134, 0.25)',
                              '&:hover': {
                                boxShadow: '0 6px 14px rgba(0, 179, 134, 0.35)',
                              }
                            }}
                          >
                            View Apartment
                          </Button>
                        </Box>
                      </CardContent>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Pagination */}
          {totalCount > itemsPerPage && (
            <Box mt={5} display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(totalCount / itemsPerPage)}
                page={page}
                onChange={(e, val) => setPage(val)}
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 500,
                  },
                  '& .Mui-selected': {
                    backgroundColor: 'rgba(0, 179, 134, 0.1) !important',
                    color: primaryColor
                  },
                  '& .MuiPaginationItem-page:hover': {
                    backgroundColor: 'rgba(0, 179, 134, 0.05)',
                  }
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default MatchResults;