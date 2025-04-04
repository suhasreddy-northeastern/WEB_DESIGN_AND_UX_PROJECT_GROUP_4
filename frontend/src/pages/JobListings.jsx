import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Skeleton,
} from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";

// 🕒 Format posted date as relative time
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const postedDate = new Date(dateString);
  const diffMs = now - postedDate;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days > 30) return "Posted 30+ days ago";
  if (days > 0) return `Posted ${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `Posted ${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0)
    return `Posted ${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  return "Posted just now";
};

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;

  const user = useSelector((state) => state.user.user);
  const isAdmin = user?.type === "admin";
  const isEmployee = user?.type === "employee";

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:4000/user/jobs", {
        withCredentials: true,
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await axios.delete(`http://localhost:4000/user/jobs/${jobId}`, {
        withCredentials: true,
      });
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const paginatedJobs = jobs.slice(
    (currentPage - 1) * jobsPerPage,
    currentPage * jobsPerPage
  );

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h4" fontWeight={600} align="center" gutterBottom>
        {isAdmin ? "Manage Job Listings" : "Explore Job Opportunities"}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ width: "100%", mb: 2 }}
      >
        Showing {(currentPage - 1) * jobsPerPage + 1}–
        {Math.min(currentPage * jobsPerPage, jobs.length)} of {jobs.length} jobs
      </Typography>

      {loading ? (
        <Grid container spacing={3} mt={2}>
          {[...Array(jobsPerPage)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
                <Skeleton
                  variant="text"
                  height={30}
                  width={{ xs: "80%", sm: "70%" }}
                />
                <Skeleton
                  variant="text"
                  height={20}
                  width={{ xs: "60%", sm: "50%" }}
                />
                <Skeleton
                  variant="rectangular"
                  height={60}
                  sx={{ mt: 1, borderRadius: 1 }}
                />
                <Skeleton
                  variant="text"
                  height={20}
                  width={{ xs: "50%", sm: "40%" }}
                  sx={{ mt: 2 }}
                />
                <Skeleton
                  variant="rectangular"
                  height={36}
                  width="100%"
                  sx={{ mt: 2, borderRadius: 2 }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedJobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job._id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: { xs: 1.5, sm: 2 },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600}>
                      {job.jobTitle}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      mb={1}
                    >
                      {job.companyName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: { xs: 1, sm: 2 }, color: "text.secondary" }}
                    >
                      {job.description.length > 150
                        ? job.description.slice(0, 150) + "..."
                        : job.description}
                    </Typography>

                    <Typography variant="body1" fontWeight="bold">
                      Salary: ${job.salary}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block", mt: 1 }}
                    >
                      {formatRelativeTime(job.postedAt)}
                    </Typography>
                  </CardContent>

                  <Box px={2} pb={2}>
                    {isEmployee && (
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          mt: 1,
                          backgroundColor: "#00b386",
                          "&:hover": {
                            backgroundColor: "#009e75",
                          },
                        }}
                        onClick={() =>
                          alert("Apply functionality coming soon!")
                        }
                      >
                        Apply
                      </Button>
                    )}

                    {isAdmin && (
                      <Button
                        variant="outlined"
                        fullWidth
                        color="error"
                        sx={{
                          textTransform: "none",
                          mt: 1,
                          borderRadius: 2,
                        }}
                        onClick={() => deleteJob(job._id)}
                      >
                        Delete
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          {jobs.length > jobsPerPage && (
            <Box
              mt={4}
              mb={6}
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexWrap="wrap"
              gap={1.5}
              sx={{
                "& > button": {
                  minWidth: { xs: 36, sm: 40 },
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                },
              }}
            >
              <Button
                variant="outlined"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "contained" : "outlined"}
                    sx={{
                      px: 2,
                      backgroundColor:
                        pageNum === currentPage ? "#00b386" : "inherit",
                      color: pageNum === currentPage ? "#fff" : "inherit",
                      "&:hover": {
                        backgroundColor:
                          pageNum === currentPage ? "#009e75" : "#f0f0f0",
                      },
                    }}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="outlined"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default JobListings;
