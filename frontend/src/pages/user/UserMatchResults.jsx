import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Pagination,
  Grid,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Container,
  Hidden,
  Drawer,
  IconButton,
  useMediaQuery,
  Fab,
  Badge,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import LoadingMessage from "../../components/common/LoadingMessage";
import MatchCard from "../../components/common/theme/MatchCard";
import FilterComponent from "../../components/common/filter/FilterComponent";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";
import SyncIcon from "@mui/icons-material/Sync";

dayjs.extend(relativeTime);

const MatchResults = () => {
  const { prefId } = useParams();
  const location = useLocation();
  const [matches, setMatches] = useState([]);
  const [savedApartments, setSavedApartments] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [activeSteps, setActiveSteps] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("matchScore");
  const [sortOrder, setSortOrder] = useState("desc");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    priceRange: [1000, 3000],
    bedrooms: [],
    bathrooms: [],
    neighborhoods: [],
    amenities: [],
  });
  
  const [forceRefresh, setForceRefresh] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(Date.now());
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  
  // Ref to track if we've already refreshed after the current login
  const hasRefreshedAfterLogin = useRef(false);
  
  // Store the last seen auth token to detect changes
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || '');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const primaryColor = "#00b386";
  const itemsPerPage = 4;
  const isDarkMode = theme.palette.mode === "dark";

  // Function to handle login detection
  const handleAuthChange = useCallback(() => {
    const currentToken = localStorage.getItem('authToken');
    
    // Check if token changed and is not empty (actual login, not logout)
    if (currentToken && currentToken !== authToken) {
      console.log("New login detected");
      
      // Update the stored token
      setAuthToken(currentToken);
      
      // Only refresh if we haven't refreshed for this login session
      if (!hasRefreshedAfterLogin.current) {
        console.log("First refresh after login, forcing data refresh");
        setForceRefresh(true);
        setSnackbar({
          open: true,
          message: "Updating matches after login..."
        });
        
        // Mark that we've refreshed for this login
        hasRefreshedAfterLogin.current = true;
      } else {
        console.log("Already refreshed once after this login, using cache");
      }
    }
  }, [authToken]);

  // Listen for login events
  useEffect(() => {
    // Custom event listener for login events
    const handleLoginEvent = () => {
      console.log("Login event detected");
      
      // Reset the refresh flag to ensure we do a fresh fetch
      hasRefreshedAfterLogin.current = false;
      
      // Trigger auth change handler to refresh data
      handleAuthChange();
    };
    
    // Listen for custom login events
    window.addEventListener('user-logged-in', handleLoginEvent);
    
    // Listen for storage events (when localStorage changes in another tab)
    window.addEventListener('storage', (event) => {
      if (event.key === 'authToken') {
        // Reset the refresh flag to ensure we do a fresh fetch
        hasRefreshedAfterLogin.current = false;
        handleAuthChange();
      }
    });
    
    return () => {
      window.removeEventListener('user-logged-in', handleLoginEvent);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [handleAuthChange]);

  // Initial auth check on component mount
  useEffect(() => {
    // If we already have an auth token when the component mounts,
    // we've likely returned to this page while already logged in
    // In that case, we don't want to force a refresh
    if (authToken) {
      hasRefreshedAfterLogin.current = true;
    }
  }, [authToken]);

  // Check for forceRefresh in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldForceRefresh = searchParams.get("forceRefresh") === "true";

    if (shouldForceRefresh) {
      console.log("Force refresh parameter detected in URL");
      
      // This is a manual refresh request, so we should refresh
      // regardless of whether we've already refreshed after login
      setForceRefresh(true);
      setSnackbar({
        open: true,
        message: "Refreshing matches from server..."
      });
      
      // Remove the parameter from URL after we've read it
      searchParams.delete("forceRefresh");
      const newUrl = `${location.pathname}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location]);

  // Fetch saved apartments to track saved status
  useEffect(() => {
    const fetchSavedApartments = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/user/saved", {
          withCredentials: true,
        });

        // Create a map of apartment IDs to track saved status
        const savedMap = {};
        (res.data || []).forEach((apt) => {
          savedMap[apt._id] = true;
        });

        setSavedApartments(savedMap);
      } catch (err) {
        console.error("Failed to fetch saved apartments", err);
      }
    };

    fetchSavedApartments();
    
    // Also refetch saved apartments when forcing a refresh
    if (forceRefresh) {
      fetchSavedApartments();
    }
  }, [forceRefresh]);

  // Convert filters to API parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    // Add pagination and sorting
    params.append("page", page);
    params.append("limit", itemsPerPage);
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);

    // Add filter parameters
    if (
      activeFilters.priceRange &&
      (activeFilters.priceRange[0] !== 1000 ||
        activeFilters.priceRange[1] !== 3000)
    ) {
      params.append("minPrice", activeFilters.priceRange[0]);
      params.append("maxPrice", activeFilters.priceRange[1]);
    }

    if (activeFilters.bedrooms && activeFilters.bedrooms.length > 0) {
      params.append("bedrooms", activeFilters.bedrooms.join(","));
    }

    if (activeFilters.bathrooms && activeFilters.bathrooms.length > 0) {
      params.append("bathrooms", activeFilters.bathrooms.join(","));
    }

    if (activeFilters.neighborhoods && activeFilters.neighborhoods.length > 0) {
      params.append("neighborhoods", activeFilters.neighborhoods.join(","));
    }

    if (activeFilters.amenities && activeFilters.amenities.length > 0) {
      params.append("amenities", activeFilters.amenities.join(","));
    }

    // Add timestamp or cache buster if forceRefresh is true
    if (forceRefresh) {
      params.append("_t", Date.now());
      params.append("forceRefresh", "true");
    }

    return params;
  }, [page, sortBy, sortOrder, activeFilters, forceRefresh]);

  // Fetch matches with filters
  useEffect(() => {
    const fetchMatches = async () => {
      if (!prefId) return;

      try {
        setLoading(true);
        setError(null);

        const queryParams = buildQueryParams();
        const queryString = queryParams.toString();

        console.log(`Fetching matches with params: ${queryString}`);
        console.log(`Cache control: ${forceRefresh ? 'no-cache' : 'default'}`);
        
        const res = await axios.get(
          `http://localhost:4000/api/user/matches/${prefId}?${queryString}`,
          { 
            withCredentials: true,
            headers: { 
              // Only add no-cache headers when forcing a refresh
              'Cache-Control': forceRefresh ? 'no-cache' : 'default',
              'Pragma': forceRefresh ? 'no-cache' : 'default'
            }
          }
        );

        setMatches(res.data.results || []);
        setTotalCount(res.data.totalCount || 0);
        setFilteredCount(res.data.filteredCount || res.data.totalCount || 0);
        
        // Reset forceRefresh after successful fetch
        if (forceRefresh) {
          setForceRefresh(false);
          setLastFetchTime(Date.now());
        }
      } catch (err) {
        console.error("Error fetching matches:", err);
        setMatches([]);
        setTotalCount(0);
        setFilteredCount(0);
        setError("Failed to fetch apartment matches. Please try again later.");
        
        // Reset forceRefresh after failed fetch too
        if (forceRefresh) {
          setForceRefresh(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [prefId, page, sortBy, sortOrder, activeFilters, forceRefresh, buildQueryParams]);

  // Manual refresh button handler
  const handleManualRefresh = () => {
    // Don't allow refreshes more often than every 30 seconds
    const timeSinceLastFetch = Date.now() - lastFetchTime;
    if (timeSinceLastFetch < 30000) {
      setSnackbar({
        open: true,
        message: `Please wait before refreshing again (${Math.ceil((30000 - timeSinceLastFetch) / 1000)}s)`
      });
      return;
    }
    
    // This is a manual refresh, so we should always do it
    // regardless of login state
    setForceRefresh(true);
    setSnackbar({
      open: true,
      message: "Refreshing matches from server..."
    });
  };

  const handleStepChange = (aptId, direction) => {
    setActiveSteps((prev) => {
      const current = prev[aptId] || 0;
      const matchedApt = matches.find((m) => m.apartment._id === aptId);
      const imageUrls = matchedApt?.apartment?.imageUrls || [];
      const max = imageUrls.length;

      // Handle case where there are no images or only one image
      if (max <= 1) return prev;

      const next =
        direction === "next"
          ? Math.min(current + 1, max - 1)
          : Math.max(current - 1, 0);
      return { ...prev, [aptId]: next };
    });
  };

  const handleSaveToggle = async (aptId, isSaved) => {
    try {
      // Update the saved apartments state
      setSavedApartments((prev) => ({
        ...prev,
        [aptId]: isSaved,
      }));
  
      // Call the API to save/unsave
      await axios.post(
        "http://localhost:4000/api/user/save",
        { apartmentId: aptId },
        {
          withCredentials: true,
        }
      );
    } catch (err) {
      console.error("Failed to toggle save status:", err);
      // Revert the UI state if the API call fails
      setSavedApartments((prev) => ({
        ...prev,
        [aptId]: !isSaved,
      }));
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return "#36B37E";
    if (score >= 50) return "#FFAB00";
    return "#FF5630";
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1); // Reset to first page when sorting changes
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
    setPage(1); // Reset to first page when sort order changes
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setPage(1); // Reset to first page when filters change
    if (isMobile) {
      setMobileFilterOpen(false); // Close mobile filter drawer
    }
  };

  const handleResetFilters = () => {
    setActiveFilters({
      priceRange: [1000, 3000],
      bedrooms: [],
      bathrooms: [],
      neighborhoods: [],
      amenities: [],
    });
    setPage(1);
  };

  const toggleMobileFilter = () => {
    setMobileFilterOpen(!mobileFilterOpen);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading && page === 1) return <LoadingMessage />;

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Desktop Filter Panel */}
        <Hidden mdDown>
          <Grid item md={3} lg={3}>
            <FilterComponent
              onApplyFilters={handleApplyFilters}
              initialFilters={activeFilters}
              onResetFilters={handleResetFilters}
              loading={loading}
            />
          </Grid>
        </Hidden>

        <Grid item xs={12} md={9} lg={9}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={600}
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
              {filteredCount < totalCount && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ ml: 2, color: "text.secondary" }}
                >
                  ({filteredCount} of {totalCount})
                </Typography>
              )}
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              {/* Refresh button */}
              <IconButton
                onClick={handleManualRefresh}
                disabled={loading || forceRefresh}
                sx={{
                  color: primaryColor,
                  border: `1px solid ${
                    isDarkMode
                      ? "rgba(255, 255, 255, 0.23)"
                      : "rgba(0, 0, 0, 0.23)"
                  }`,
                  borderRadius: 1,
                  animation: forceRefresh ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" }
                  }
                }}
              >
                <SyncIcon />
              </IconButton>
            
              {/* Mobile filter toggle button */}
              <Hidden mdUp>
                <IconButton
                  onClick={toggleMobileFilter}
                  sx={{
                    color: primaryColor,
                    border: `1px solid ${
                      isDarkMode
                        ? "rgba(255, 255, 255, 0.23)"
                        : "rgba(0, 0, 0, 0.23)"
                    }`,
                    borderRadius: 1,
                  }}
                >
                  <Badge
                    badgeContent={
                      (activeFilters.bedrooms.length > 0 ? 1 : 0) +
                      (activeFilters.bathrooms.length > 0 ? 1 : 0) +
                      (activeFilters.neighborhoods.length > 0 ? 1 : 0) +
                      (activeFilters.amenities.length > 0 ? 1 : 0) +
                      (activeFilters.priceRange[0] !== 1000 ||
                      activeFilters.priceRange[1] !== 3000
                        ? 1
                        : 0)
                    }
                    color="primary"
                    sx={{
                      "& .MuiBadge-badge": {
                        bgcolor: primaryColor,
                      },
                    }}
                  >
                    <FilterListIcon />
                  </Badge>
                </IconButton>
              </Hidden>

              <FormControl
                size="small"
                variant="outlined"
                sx={{ minWidth: 120 }}
              >
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Sort By"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.23)"
                        : "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                  }}
                >
                  <MenuItem value="matchScore">Match Score</MenuItem>
                  <MenuItem value="price">Price</MenuItem>
                  <MenuItem value="dateAdded">Date Added</MenuItem>
                </Select>
              </FormControl>

              <FormControl
                size="small"
                variant="outlined"
                sx={{ minWidth: 120 }}
              >
                <InputLabel id="sort-order-label">Order</InputLabel>
                <Select
                  labelId="sort-order-label"
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  label="Order"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.23)"
                        : "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: primaryColor,
                    },
                  }}
                >
                  <MenuItem value="desc">Highest First</MenuItem>
                  <MenuItem value="asc">Lowest First</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {/* Active filters display */}
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            {activeFilters.bedrooms && activeFilters.bedrooms.length > 0 && (
              <Chip
                size="small"
                label={`Bedrooms: ${activeFilters.bedrooms.join(", ")}`}
                onDelete={() =>
                  setActiveFilters({ ...activeFilters, bedrooms: [] })
                }
                deleteIcon={<ClearIcon fontSize="small" />}
                sx={{
                  bgcolor: isDarkMode
                    ? "rgba(0, 179, 134, 0.15)"
                    : "rgba(0, 179, 134, 0.08)",
                  color: primaryColor,
                  "& .MuiChip-deleteIcon": {
                    color: primaryColor,
                  },
                }}
              />
            )}

            {activeFilters.bathrooms && activeFilters.bathrooms.length > 0 && (
              <Chip
                size="small"
                label={`Bathrooms: ${activeFilters.bathrooms.join(", ")}`}
                onDelete={() =>
                  setActiveFilters({ ...activeFilters, bathrooms: [] })
                }
                deleteIcon={<ClearIcon fontSize="small" />}
                sx={{
                  bgcolor: isDarkMode
                    ? "rgba(0, 179, 134, 0.15)"
                    : "rgba(0, 179, 134, 0.08)",
                  color: primaryColor,
                  "& .MuiChip-deleteIcon": {
                    color: primaryColor,
                  },
                }}
              />
            )}

            {activeFilters.neighborhoods &&
              activeFilters.neighborhoods.length > 0 && (
                <Chip
                  size="small"
                  label={`Areas: ${activeFilters.neighborhoods.join(", ")}`}
                  onDelete={() =>
                    setActiveFilters({ ...activeFilters, neighborhoods: [] })
                  }
                  deleteIcon={<ClearIcon fontSize="small" />}
                  sx={{
                    bgcolor: isDarkMode
                      ? "rgba(0, 179, 134, 0.15)"
                      : "rgba(0, 179, 134, 0.08)",
                    color: primaryColor,
                    "& .MuiChip-deleteIcon": {
                      color: primaryColor,
                    },
                  }}
                />
              )}

            {activeFilters.amenities && activeFilters.amenities.length > 0 && (
              <Chip
                size="small"
                label={`${activeFilters.amenities.length} amenities`}
                onDelete={() =>
                  setActiveFilters({ ...activeFilters, amenities: [] })
                }
                deleteIcon={<ClearIcon fontSize="small" />}
                sx={{
                  bgcolor: isDarkMode
                    ? "rgba(0, 179, 134, 0.15)"
                    : "rgba(0, 179, 134, 0.08)",
                  color: primaryColor,
                  "& .MuiChip-deleteIcon": {
                    color: primaryColor,
                  },
                }}
              />
            )}

            {(activeFilters.priceRange[0] !== 1000 ||
              activeFilters.priceRange[1] !== 3000) && (
              <Chip
                size="small"
                label={`$${activeFilters.priceRange[0]} - $${activeFilters.priceRange[1]}`}
                onDelete={() =>
                  setActiveFilters({
                    ...activeFilters,
                    priceRange: [1000, 3000],
                  })
                }
                deleteIcon={<ClearIcon fontSize="small" />}
                sx={{
                  bgcolor: isDarkMode
                    ? "rgba(0, 179, 134, 0.15)"
                    : "rgba(0, 179, 134, 0.08)",
                  color: primaryColor,
                  "& .MuiChip-deleteIcon": {
                    color: primaryColor,
                  },
                }}
              />
            )}
          </Box>

          {loading && page > 1 && (
            <Box sx={{ my: 4, display: "flex", justifyContent: "center" }}>
              <LoadingMessage message="Loading apartments..." />
            </Box>
          )}

          {!loading && matches.length === 0 ? (
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
                {totalCount > 0
                  ? "No matches found with current filters. Try adjusting your filters."
                  : "No matches found. Try updating your preferences."}
              </Typography>
            </Box>
          ) : (
            !loading && (
              <>
                <Grid container spacing={3} sx={{ mt: 0.5 }}>
                  {matches.map((match) => {
                    const apt = match.apartment;
                    const currentStep = activeSteps[apt._id] || 0;
                    const gallery = apt.imageUrls || [apt.imageUrl];
                    const createdAt = dayjs(apt.createdAt).fromNow();
                    const matchScore = Math.round(match.matchScore);
                    const matchColor = getMatchColor(matchScore);
                    const isSaved = savedApartments[apt._id] || false;

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
                          isSaved={isSaved}
                          onSaveToggle={handleSaveToggle}
                        />
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Pagination */}
                {totalCount > itemsPerPage && (
                  <Box mt={4} mb={4} display="flex" justifyContent="center">
                    <Pagination
                      count={Math.ceil(filteredCount / itemsPerPage)}
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
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            )
          )}
        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        PaperProps={{
          sx: {
            width: "85%",
            maxWidth: 350,
            p: 2,
            bgcolor: isDarkMode ? theme.palette.background.paper : "#fff",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="text.primary">
            Filters
          </Typography>
          <IconButton onClick={() => setMobileFilterOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <FilterComponent
          onApplyFilters={handleApplyFilters}
          initialFilters={activeFilters}
          onResetFilters={handleResetFilters}
          showFilterDrawer={true}
          loading={loading}
        />
      </Drawer>

      {/* Mobile Filter FAB */}
      <Hidden mdUp>
        <Fab
          color="primary"
          aria-label="filter"
          onClick={toggleMobileFilter}
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            backgroundColor: primaryColor,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          <FilterListIcon />
        </Fab>
      </Hidden>
      
      {/* Refresh notification snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default MatchResults;