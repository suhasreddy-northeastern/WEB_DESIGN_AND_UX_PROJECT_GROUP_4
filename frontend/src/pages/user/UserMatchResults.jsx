import React, { useEffect, useState } from "react";
import { Box, Typography, Pagination, Grid, useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingMessage from "../../components/common/LoadingMessage";
import MatchCard from "../../components/common/theme/MatchCard";

dayjs.extend(relativeTime);

const MatchResults = () => {
  const { prefId } = useParams();
  const [matches, setMatches] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeSteps, setActiveSteps] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  
  const primaryColor = "#00b386";
  const itemsPerPage = 4;
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
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
        matches.find((m) => m.apartment._id === aptId)?.apartment.imageUrls ||
        []
      ).length;
      const next =
        direction === "next"
          ? Math.min(current + 1, max - 1)
          : Math.max(current - 1, 0);
      return { ...prev, [aptId]: next };
    });
  };

  const getMatchColor = (score) => {
    if (score >= 80) return "#36B37E";
    if (score >= 50) return "#FFAB00";
    return "#FF5630";
  };

  if (loading) return <LoadingMessage />;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 4 } }}>
      <Typography
        variant="h5"
        fontWeight={600}
        mb={4}
        sx={{
          position: "relative",
          display: "inline-block",
          color: theme.palette.text.primary,
          "&:after": {
            content: '""',
            position: "absolute",
            width: "60px",
            height: "3px",
            bottom: "-8px",
            left: 0,
            backgroundColor: primaryColor,
            borderRadius: "2px",
          },
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
            backgroundColor: isDarkMode
              ? "rgba(0, 179, 134, 0.08)"
              : "rgba(0, 179, 134, 0.05)",
            border: isDarkMode
              ? "1px solid rgba(0, 179, 134, 0.1)"
              : "1px solid rgba(0, 179, 134, 0.1)",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No matches found. Try updating your preferences.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {matches.map((match) => {
              const apt = match.apartment;
              const currentStep = activeSteps[apt._id] || 0;
              const gallery = apt.imageUrls || [apt.imageUrl];
              const createdAt = dayjs(apt.createdAt).fromNow();
              const matchScore = Math.round(match.matchScore);
              const matchColor = getMatchColor(matchScore);

              return (
                <Grid item xs={12} key={apt._id}>
                  <MatchCard
                    apt={apt}
                    matchScore={matchScore}
                    currentStep={currentStep}
                    gallery={gallery}
                    createdAt={createdAt}
                    matchColor={matchColor}
                    onStepChange={(dir) => handleStepChange(apt._id, dir)}
                    explanation={match.explanation} 
                  />
                </Grid>
              );
            })}
          </Grid>

          {/* Pagination */}
          {totalCount > itemsPerPage && (
            <Box mt={4} display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(totalCount / itemsPerPage)}
                page={page}
                onChange={(e, val) => setPage(val)}
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontWeight: 500,
                    color: isDarkMode ? "#e0e0e0" : "#4B5563",
                  },
                  "& .Mui-selected": {
                    backgroundColor: `${primaryColor} !important`,
                    color: "white !important",
                    fontWeight: 600,
                  },
                  "& .MuiPaginationItem-page:hover": {
                    backgroundColor: isDarkMode 
                      ? "rgba(0, 179, 134, 0.15)"
                      : "rgba(0, 179, 134, 0.1)",
                  },
                  "& .MuiPaginationItem-ellipsis": {
                    color: isDarkMode ? "#b0b0b0" : "#4B5563",
                  },
                  "& .MuiPaginationItem-previousNext": {
                    color: primaryColor,
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