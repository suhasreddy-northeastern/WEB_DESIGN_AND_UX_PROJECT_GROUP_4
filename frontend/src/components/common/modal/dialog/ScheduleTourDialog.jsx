import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";
import dayjs from "dayjs";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Custom date picker that doesn't use MUI date pickers
const SimpleDatePicker = ({ value, onChange, disablePast, error, helperText }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Format date to YYYY-MM-DD for the input
  const formatDate = (date) => {
    if (!date) return '';
    return date.format ? date.format('YYYY-MM-DD') : dayjs(date).format('YYYY-MM-DD');
  };

  // Handler for date changes
  const handleDateChange = (e) => {
    const newDate = e.target.value ? dayjs(e.target.value) : null;
    onChange(newDate);
  };

  // Calculate min date if disablePast is true
  const minDate = disablePast ? formatDate(dayjs()) : undefined;

  return (
    <TextField
      label="Preferred Date"
      type="date"
      value={formatDate(value)}
      onChange={handleDateChange}
      fullWidth
      InputLabelProps={{ shrink: true }}
      inputProps={{ min: minDate }}
      error={error}
      helperText={helperText}
      required
    />
  );
};

const ScheduleTourDialog = ({
  open,
  onClose,
  apartmentId,
  brokerName,
  brokerImage,
  apartmentName
}) => {
  const currentUser = useSelector((state) => state.user.user);

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [date, setDate] = useState(dayjs().add(1, 'day'));
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  // Validation states
  const [errors, setErrors] = useState({
    name: false,
    contactNumber: false,
    date: false,
    timeSlot: false
  });

  // Available time slots
  const timeSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM"
  ];

  useEffect(() => {
    if (open && currentUser) {
      setName(currentUser.fullName || "");
      setContactNumber(currentUser.phone || "");
      setMessage(`I'd like to schedule a tour for this ${apartmentName || "property"}.`);
    }
  }, [open, currentUser, apartmentName]);

  const validateForm = () => {
    const newErrors = {
      name: !name.trim(),
      contactNumber: !contactNumber.trim(),
      date: !date,
      timeSlot: !timeSlot
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        text: "Please fill out all required fields.",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Format the request data
      const tourRequest = {
        apartmentId,
        name,
        contactNumber,
        tourDate: date.format ? date.format("YYYY-MM-DD") : dayjs(date).format("YYYY-MM-DD"),
        tourTime: timeSlot,
        message: message || `I'd like to schedule a tour for this property.`
      };
      
      // Send the tour request
      await axios.post(
        `${API_BASE_URL}/api/tours/schedule`,
        tourRequest,
        { withCredentials: true }
      );

      setSnackbar({
        open: true,
        text: "Tour request submitted successfully. The broker will contact you to confirm.",
        severity: "success",
      });

      // Reset form
      setDate(dayjs().add(1, 'day'));
      setTimeSlot("");
      setMessage("");
      
      // Close dialog after success
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (err) {
      console.error("Tour scheduling error:", err);
      setSnackbar({
        open: true,
        text: err.response?.data?.error || "Failed to schedule tour. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setErrors({
      name: false,
      contactNumber: false,
      date: false,
      timeSlot: false
    });
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule a Tour</DialogTitle>
        <DialogContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              src={brokerImage || "/images/default-broker.png"}
              alt={brokerName}
              sx={{ width: 48, height: 48 }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {apartmentName || "Property Tour"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                With {brokerName || "Property Agent"}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                helperText={errors.name && "Name is required"}
                disabled={loading}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                error={errors.contactNumber}
                helperText={errors.contactNumber && "Contact number is required"}
                disabled={loading}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SimpleDatePicker
                value={date}
                onChange={(newDate) => setDate(newDate)}
                disablePast
                error={errors.date}
                helperText={errors.date && "Date is required"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                error={errors.timeSlot} 
                required 
                sx={{ mt: 2, mb: 1 }}
              >
                <InputLabel id="time-slot-label">Preferred Time</InputLabel>
                <Select
                  labelId="time-slot-label"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  label="Preferred Time"
                  disabled={loading}
                >
                  {timeSlots.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </Select>
                {errors.timeSlot && (
                  <FormHelperText>Time slot is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Message (Optional)"
                placeholder="Add any special requests or questions for the tour"
                multiline
                rows={3}
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                margin="normal"
              />
            </Grid>
          </Grid>
          
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary">
              * Tour requests are subject to broker availability and confirmation.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
            color="primary"
          >
            {loading ? "Submitting..." : "Schedule Tour"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ScheduleTourDialog;