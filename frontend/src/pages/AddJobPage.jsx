import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
} from '@mui/material';
import axios from 'axios';

const AddJobPage = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    description: '',
    salary: ''
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      const res = await axios.post('http://localhost:4000/user/create/job', formData, {
        withCredentials: true
      });

      if (res.status === 201) {
        setSuccess('Job added successfully!');
        setFormData({
          companyName: '',
          jobTitle: '',
          description: '',
          salary: ''
        });
      }
    } catch (err) {
      setError('Failed to add job');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          px: 4,
          py: 5,
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h5" fontWeight="bold" align="center" mb={3}>
          Post a New Job
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Job Title"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Description"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Salary"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
            />

            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 2,
                textTransform: 'none',
                borderRadius: 3,
                backgroundColor: '#00b386',
                '&:hover': {
                  backgroundColor: '#009e75',
                }
              }}
            >
              Submit Job
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddJobPage;
