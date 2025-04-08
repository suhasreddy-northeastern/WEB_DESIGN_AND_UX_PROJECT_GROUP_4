import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Grid
} from '@mui/material';
import axios from '../../axiosConfig';

const BrokerEditListing = ({ open, onClose, apartmentId, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    bedrooms: '',
    location: '',
    amenities: '',
  });

  const [loading, setLoading] = useState(false);

  // Load apartment data
  useEffect(() => {
    if (apartmentId && open) {
      setLoading(true);
      axios.get(`/apartments/${apartmentId}`)
        .then((res) => {
          const apt = res.data;
          setFormData({
            title: apt.title || '',
            price: apt.price || '',
            bedrooms: apt.bedrooms || '',
            location: apt.location || '',
            amenities: apt.amenities?.join(', ') || '',
          });
        })
        .catch((err) => console.error('Error loading apartment:', err))
        .finally(() => setLoading(false));
    }
  }, [apartmentId, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`/apartments/${apartmentId}`, {
        ...formData,
        amenities: formData.amenities.split(',').map(a => a.trim()),
      });
      if (onUpdate) onUpdate(); // refresh listings
      onClose();
    } catch (error) {
      console.error('Failed to update apartment:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Listing</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Grid container justifyContent="center" py={2}>
            <CircularProgress />
          </Grid>
        ) : (
          <>
            <TextField
              label="Title"
              name="title"
              fullWidth
              margin="dense"
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              fullWidth
              margin="dense"
              value={formData.price}
              onChange={handleChange}
            />
            <TextField
              label="Bedrooms"
              name="bedrooms"
              type="number"
              fullWidth
              margin="dense"
              value={formData.bedrooms}
              onChange={handleChange}
            />
            <TextField
              label="Location"
              name="location"
              fullWidth
              margin="dense"
              value={formData.location}
              onChange={handleChange}
            />
            <TextField
              label="Amenities (comma-separated)"
              name="amenities"
              fullWidth
              margin="dense"
              value={formData.amenities}
              onChange={handleChange}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          Update Listing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BrokerEditListing;
