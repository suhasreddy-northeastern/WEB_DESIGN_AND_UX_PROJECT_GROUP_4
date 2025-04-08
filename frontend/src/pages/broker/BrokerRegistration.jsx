import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Divider,
  FormHelperText,
  Modal,
  Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

const BrokerRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const primaryColor = theme.palette.primary.main;

  // Get data passed from signup page if available
  const { state } = location;

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: state?.fullName || "",
    email: state?.email || "",
    password: state?.password || "",
    confirmPassword: state?.password || "",
    phone: "",
    licenseNumber: "",
    licenseDocument: null,
  });

  // Add modal state
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    // Use location.state directly, no URL parameters
    const { state } = location;
    if (state && state.email && state.fullName && state.password) {
      setFormData((prev) => ({
        ...prev,
        email: state.email,
        fullName: state.fullName,
        password: state.password,
        confirmPassword: state.password,
      }));
      setActiveStep(1);
    }
  }, [location]);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [fileName, setFileName] = useState("");

  const steps = [
    "Account Information",
    "Broker Verification",
    "Review & Submit",
  ];

  const validateStep1 = () => {
    const stepErrors = {};

    if (!formData.fullName.trim()) {
      stepErrors.fullName = "Full name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      stepErrors.fullName = "Name should only contain letters";
    }

    if (!formData.email.trim()) {
      stepErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      stepErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      stepErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      stepErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      stepErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateStep2 = () => {
    const stepErrors = {};

    if (!formData.phone.trim()) {
      stepErrors.phone = "Phone number is required";
    }

    if (!formData.licenseNumber.trim()) {
      stepErrors.licenseNumber = "License number is required";
    }

    if (!formData.licenseDocument) {
      stepErrors.licenseDocument = "License document is required";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = (e) => {
    // Prevent default form submission behavior
    e.preventDefault();
    
    let isValid = false;

    switch (activeStep) {
      case 0:
        isValid = validateStep1();
        break;
      case 1:
        isValid = validateStep2();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = (e) => {
    // Prevent default form submission behavior
    e.preventDefault();
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, licenseDocument: file }));
      setFileName(file.name);

      // Clear error when file is uploaded
      if (errors.licenseDocument) {
        setErrors((prev) => ({ ...prev, licenseDocument: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only allow submission from the final step
    if (activeStep !== steps.length - 1) {
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    // Create form data for file upload
    const formDataToSend = new FormData();
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("type", "broker");
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("licenseNumber", formData.licenseNumber);

    // Add console debug to see if file is being attached
    console.log("License document to upload:", formData.licenseDocument);

    if (formData.licenseDocument) {
      formDataToSend.append("licenseDocument", formData.licenseDocument);
    } else {
      setMessage({
        type: "error",
        text: "License document is required",
      });
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/broker/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Show success modal instead of message
      setSuccessModalOpen(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        setSuccessModalOpen(false);
        navigate("/login");
      }, 5000);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response && error.response.data && error.response.data.error) {
        setMessage({
          type: "error",
          text: error.response.data.error,
        });
      } else {
        setMessage({
          type: "error",
          text: "Registration failed. Please try again later.",
        });
      }

      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          label="Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.fullName}
          helperText={errors.fullName}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.email}
          helperText={errors.email}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleChange}
          fullWidth
          required
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  );

  const renderStep2 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
          required
          placeholder="e.g., +1 (555) 123-4567"
          error={!!errors.phone}
          helperText={errors.phone}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Broker License Number"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={handleChange}
          fullWidth
          required
          placeholder="e.g., LIC-987654"
          error={!!errors.licenseNumber}
          helperText={errors.licenseNumber}
        />
      </Grid>
      <Grid item xs={12}>
        <Box
          sx={{
            border: "1px dashed",
            borderColor: errors.licenseDocument
              ? theme.palette.error.main
              : isDarkMode
              ? "rgba(255, 255, 255, 0.3)"
              : "rgba(0, 0, 0, 0.2)",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.2)"
              : "rgba(0, 0, 0, 0.02)",
          }}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            id="license-document"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label htmlFor="license-document">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              sx={{
                mb: 2,
                borderColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.3)"
                  : "rgba(0, 0, 0, 0.2)",
                color: "text.primary",
              }}
            >
              Upload License Document
            </Button>
          </label>
          <Typography variant="body2" color="text.secondary">
            Upload a PDF or image of your broker license
          </Typography>
          {fileName && (
            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">{fileName}</Typography>
            </Box>
          )}
          {errors.licenseDocument && (
            <FormHelperText error>{errors.licenseDocument}</FormHelperText>
          )}
        </Box>
      </Grid>
    </Grid>
  );

  const renderStep3 = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Review Your Information
        </Typography>
        <Box
          sx={{
            backgroundColor: isDarkMode
              ? "rgba(0, 0, 0, 0.2)"
              : "rgba(0, 0, 0, 0.02)",
            borderRadius: 2,
            p: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Full Name
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.fullName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email Address
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Phone Number
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                License Number
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.licenseNumber}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                License Document
              </Typography>
              <Typography variant="body1" gutterBottom>
                {fileName}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        <Alert severity="info" sx={{ mt: 3 }}>
          Your broker application will be reviewed by an administrator. You'll
          be notified once your account is approved.
        </Alert>
      </Grid>
    </Grid>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return null;
    }
  };

  // Success Modal
  const successModal = (
    <Modal
      open={successModalOpen}
      onClose={() => setSuccessModalOpen(false)}
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-description"
    >
      <Paper
        elevation={3}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 400 },
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          backgroundColor: isDarkMode ? theme.palette.background.paper : "#fff",
        }}
      >
        <CheckCircleOutlineIcon
          sx={{
            fontSize: 80,
            color: primaryColor,
            mb: 2,
          }}
        />
        <Typography
          id="success-modal-title"
          variant="h5"
          component="h2"
          gutterBottom
        >
          Registration Successful!
        </Typography>
        <Typography id="success-modal-description" sx={{ mt: 2 }}>
          Your broker application has been submitted. Please wait for an
          administrator to approve your account.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          You will be redirected to the login page in a few seconds...
        </Typography>
        <Button
          variant="contained"
          sx={{
            mt: 3,
            borderRadius: 2,
            px: 4,
            py: 1.2,
            bgcolor: primaryColor,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
          }}
          onClick={() => {
            setSuccessModalOpen(false);
            navigate("/login");
          }}
        >
          Go to Login
        </Button>
      </Paper>
    </Modal>
  );

  return (
    <Box sx={{ maxWidth: "800px", mx: "auto", p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        mb={4}
        color="text.primary"
        textAlign="center"
      >
        Broker Registration
      </Typography>

      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: "", text: "" })}
        >
          {message.text}
        </Alert>
      )}

      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {renderStepContent()}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 4,
                pt: 2,
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ color: "text.secondary" }}
                type="button"
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      bgcolor: primaryColor,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.2,
                      bgcolor: primaryColor,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: primaryColor, textDecoration: "none" }}
          >
            Login here
          </Link>
        </Typography>
      </Box>

      {/* Success Modal */}
      {successModal}
    </Box>
  );
};

export default BrokerRegistration;