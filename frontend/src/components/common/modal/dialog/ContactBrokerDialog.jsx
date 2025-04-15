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
  FormHelperText,
  CircularProgress,
  Chip
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { useSelector } from "react-redux";
import axios from "axios";

const ContactBrokerDialog = ({
  open,
  onClose,
  apartmentId,
  brokerName,
  brokerEmail,
  brokerPhone,
  brokerImage,
  brokerCompany,
  apartmentDetails
}) => {
  const currentUser = useSelector((state) => state.user.user);

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  // Form validation
  const [errors, setErrors] = useState({
    name: false,
    contactNumber: false,
    email: false,
    message: false
  });

  // Generate default message
  const getDefaultMessage = () => {
    if (!apartmentDetails) return "I'm interested in this property. Can we connect?";
    
    return `Hi ${brokerName || "there"},

I'm interested in the ${apartmentDetails.bedrooms} BHK apartment in ${apartmentDetails.neighborhood} that's listed for $${apartmentDetails.price?.toLocaleString() || '(price not available)'}/month. 

Could you please provide more information about this property? I'm particularly interested in availability and viewing options.

Thank you,
${currentUser?.fullName || name}`;
  };

  useEffect(() => {
    if (open && currentUser) {
      setName(currentUser.fullName || "");
      setContactNumber(currentUser.phone || "");
      setEmail(currentUser.email || "");
      setMessage(getDefaultMessage());
    }
  }, [open, currentUser, apartmentDetails, brokerName]);

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const newErrors = {
      name: !name.trim(),
      contactNumber: !contactNumber.trim(),
      email: !email.trim() || !emailRegex.test(email),
      message: !message.trim()
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        text: "Please correct the errors in the form before submitting.",
        severity: "warning",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:4000/api/user/contact-broker",
        {
          apartmentId,
          message,
          name,
          contactNumber,
          email
        },
        { withCredentials: true }
      );

      setSnackbar({
        open: true,
        text: "Message sent successfully! The broker will contact you shortly.",
        severity: "success",
      });

      // Reset the form
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Error contacting broker:", err);
      setSnackbar({
        open: true,
        text: err.response?.data?.error || "Failed to send message. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset validation errors
    setErrors({
      name: false,
      contactNumber: false,
      email: false,
      message: false
    });
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            Contact {brokerName || "the broker"}
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3}>
            {/* Broker info section */}
            <Box 
              flex="1"
              sx={{
                bgcolor: 'background.default',
                p: 2, 
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Avatar
                src={brokerImage || "/images/default-broker.png"}
                alt={brokerName}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              
              <Typography variant="h6" fontWeight={600} align="center" gutterBottom>
                {brokerName || "Property Agent"}
              </Typography>
              
              {brokerCompany && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  align="center"
                  gutterBottom
                >
                  {brokerCompany}
                </Typography>
              )}
              
              <Divider sx={{ my: 2, width: '100%' }} />
              
              {brokerEmail && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    width: '100%'
                  }}
                >
                  <EmailIcon color="action" sx={{ mr: 1 }} fontSize="small" />
                  <Typography variant="body2" noWrap>{brokerEmail}</Typography>
                </Box>
              )}
              
              {brokerPhone && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: '100%' 
                  }}
                >
                  <PhoneIcon color="action" sx={{ mr: 1 }} fontSize="small" />
                  <Typography variant="body2">{brokerPhone}</Typography>
                </Box>
              )}
              
              {apartmentDetails && (
                <>
                  <Divider sx={{ my: 2, width: '100%' }} />
                  <Typography variant="subtitle2" fontWeight={600} align="center" gutterBottom>
                    About the Property
                  </Typography>
                  <Box sx={{ width: '100%' }}>
                    <Chip 
                      label={`${apartmentDetails.bedrooms} BHK`} 
                      size="small" 
                      sx={{ m: 0.5 }}
                    />
                    <Chip 
                      label={apartmentDetails.neighborhood} 
                      size="small" 
                      sx={{ m: 0.5 }}
                    />
                    <Chip 
                      label={`$${apartmentDetails.price?.toLocaleString() || 'N/A'}/mo`} 
                      size="small"
                      color="primary"
                      sx={{ m: 0.5 }}
                    />
                  </Box>
                </>
              )}
            </Box>
            
            {/* Contact form section */}
            <Box flex="2">
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Your Information
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  fullWidth
                  required
                  error={errors.name}
                  helperText={errors.name && "Name is required"}
                />
                
                <TextField
                  label="Contact Number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  disabled={loading}
                  fullWidth
                  required
                  error={errors.contactNumber}
                  helperText={errors.contactNumber && "Contact number is required"}
                />
                
                <TextField
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || (currentUser && currentUser.email)}
                  fullWidth
                  required
                  error={errors.email}
                  helperText={errors.email && "Valid email address is required"}
                />
                
                <FormControl error={errors.message} fullWidth>
                  <TextField
                    label="Your Message"
                    placeholder="Describe what you'd like to know about this property"
                    multiline
                    rows={8}
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    required
                    error={errors.message}
                  />
                  {errors.message && (
                    <FormHelperText>Message is required</FormHelperText>
                  )}
                </FormControl>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? "Sending your message..." : "We'll notify you when the broker responds"}
          </Typography>
          
          <Box>
            <Button 
              onClick={handleClose} 
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </Box>
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

export default ContactBrokerDialog;