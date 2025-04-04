import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const ManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:4000/user/jobs", {
        withCredentials: true,
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const handleDelete = async (jobId) => {
    setDeletingJobId(jobId);
    try {
      await axios.delete(`http://localhost:4000/user/jobs/${jobId}`, {
        withCredentials: true,
      });
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      console.error("Failed to delete job:", err);
    } finally {
      setDeletingJobId(null);
    }
  };

  const handleEditOpen = (job) => {
    setEditingJob(job);
    setOpen(true);
  };

  const handleEditClose = () => {
    setOpen(false);
    setEditingJob(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingJob((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async () => {
    setSaving(true);
    try {
      const res = await axios.put(
        `http://localhost:4000/user/jobs/${editingJob._id}`,
        {
          jobTitle: editingJob.jobTitle,
          description: editingJob.description,
          salary: editingJob.salary,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        setJobs((prev) =>
          prev.map((job) =>
            job._id === editingJob._id ? { ...job, ...editingJob } : job
          )
        );
        handleEditClose();
      }
    } catch (err) {
      console.error("Failed to update job:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <Typography variant="h5" fontWeight="bold" align="center" mb={4}>
        Manage Posted Jobs
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress size={40} />
        </Box>
      ) : (
        <>
          {/* 💡 Jobs count and title */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight="bold">
              Job Listings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Jobs: {jobs.length}
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              borderRadius: 4,
              p: 2,
              maxHeight: 500, // adjust height as needed
              overflow: "auto",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Job Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Salary</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No jobs posted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow
                      key={job._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f9f9f9",
                        },
                      }}
                    >
                      <TableCell>{job.jobTitle}</TableCell>
                      <TableCell>{job.companyName}</TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        {job.description.length > 120
                          ? `${job.description.slice(0, 120)}...`
                          : job.description}
                      </TableCell>
                      <TableCell>${job.salary}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit Job">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditOpen(job)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Job">
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(job._id)}
                              disabled={deletingJobId === job._id}
                            >
                              {deletingJobId === job._id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleEditClose}
        fullWidth
        maxWidth="sm"
        scroll="paper"
      >
        <DialogTitle>Edit Job</DialogTitle>
        <DialogContent
          dividers
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          <TextField
            label="Job Title"
            name="jobTitle"
            value={editingJob?.jobTitle || ""}
            onChange={handleEditChange}
            fullWidth
          />
          <TextField
            label="Description"
            name="description"
            value={editingJob?.description || ""}
            onChange={handleEditChange}
            fullWidth
            multiline
            rows={6}
          />
          <TextField
            label="Salary"
            name="salary"
            type="number"
            value={editingJob?.salary || ""}
            onChange={handleEditChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} variant="text" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={saving}
            sx={{
              backgroundColor: "#00b386",
              "&:hover": { backgroundColor: "#009e75" },
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageJobsPage;
