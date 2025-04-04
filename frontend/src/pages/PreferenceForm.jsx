import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  ToggleButton,
  Container,
  Paper,
  Stack,
  ThemeProvider,
  CircularProgress,
} from "@mui/material";
import { questions } from "../content/content";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import theme from "../components/common/theme/theme";
import SuccessModal from "../components/common/modal/SuccessModal";

const transformAnswers = (raw) => {
  const mapLease = {
    "Just Me": "1",
    "2 People": "2",
    "3 People": "3",
    "4+ People": "4+",
  };

  const mapMoveInDate = {
    "Immediately": new Date(),
    "In the next month": new Date(new Date().setMonth(new Date().getMonth() + 1)),
    "In 3 months or more": new Date(new Date().setMonth(new Date().getMonth() + 3)),
  };

  return {
    ...raw,
    leaseCapacity: mapLease[raw.leaseCapacity] || raw.leaseCapacity,
    moveInDate: mapMoveInDate[raw.moveInDate] || new Date(),
  };
};

const PreferenceForm = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [prefId, setPrefId] = useState(null);
  
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.currentUser);
  console.log("Redux user object:", user);

  const currentQuestion = questions[currentIndex];
  const selected = answers[currentQuestion.key];

  // Auto-redirect after showing success modal
  useEffect(() => {
    let redirectTimer;
    if (successModalOpen && prefId) {
      redirectTimer = setTimeout(() => {
        navigate(`/matches/${prefId}`);
      }, 2000); // Redirect after 2 seconds
    }
    return () => clearTimeout(redirectTimer);
  }, [successModalOpen, prefId, navigate]);

  const handleSelect = (value) => {
    if (currentQuestion.type === "checkbox") {
      const current = answers[currentQuestion.key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [currentQuestion.key]: updated });
    } else {
      setAnswers({ ...answers, [currentQuestion.key]: value });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        ...transformAnswers(answers),
      };
      console.log("Submitting preference payload:", payload);

      const res = await axios.post(
        "http://localhost:4000/api/user/preferences",
        payload,
        { withCredentials: true }
      );
  
      setPrefId(res.data.preference._id);
      setSuccessMessage(res.data.message);
      setSuccessModalOpen(true);
    } catch (err) {
      console.error("Submission failed", err);
      alert("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isSelected = (value) => {
    return currentQuestion.type === "checkbox"
      ? selected?.includes(value)
      : selected === value;
  };

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 3,
            border: '1px solid rgba(0, 179, 134, 0.1)',
            boxShadow: '0 6px 16px rgba(0, 179, 134, 0.12)'
          }}
        >
          <Box mb={4}>
            <Typography variant="body2" color="text.secondary" mb={1} fontWeight={500}>
              Question {currentIndex + 1} of {questions.length}
            </Typography>
            
            <Typography 
              variant="h5" 
              fontWeight={600} 
              mb={3}
              sx={{ 
                position: 'relative',
                display: 'inline-block',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: '60px',
                  height: '3px',
                  bottom: '-10px',
                  left: 0,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '2px'
                }
              }}
            >
              {currentQuestion.question}
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            {currentQuestion.options.map((option, idx) => (
              <ToggleButton
                key={idx}
                value={option}
                selected={isSelected(option)}
                onChange={() => handleSelect(option)}
                sx={{
                  justifyContent: "flex-start",
                  borderRadius: 2,
                  px: 3,
                  py: 2,
                  fontWeight: 500,
                  textAlign: "left",
                  transition: 'all 0.2s ease-in-out',
                  border: isSelected(option) 
                    ? '2px solid #00b386' 
                    : '1px solid rgba(0, 179, 134, 0.1)',
                  backgroundColor: isSelected(option) 
                    ? 'rgba(0, 179, 134, 0.05)'
                    : '#fff',
                  color: isSelected(option) ? '#00b386' : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 179, 134, 0.03)',
                    border: isSelected(option) 
                      ? '2px solid #00b386' 
                      : '1px solid rgba(0, 179, 134, 0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0, 179, 134, 0.1)',
                  }
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: isSelected(option) 
                      ? '#00b386' 
                      : 'rgba(0, 179, 134, 0.1)',
                    color: isSelected(option) ? '#fff' : '#00b386',
                    fontWeight: 600,
                    mr: 2
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </Box>
                {option}
              </ToggleButton>
            ))}
          </Stack>

          <Box sx={{ mt: 5, mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{ 
                height: 8, 
                borderRadius: 5, 
                backgroundColor: "rgba(0, 179, 134, 0.1)",
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#00b386',
                  borderRadius: 5,
                }
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mt: 1, textAlign: 'right' }}
            >
              {progressPercentage.toFixed(0)}% Complete
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mt={4}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentIndex === 0 || submitting}
              sx={{ 
                minWidth: 100,
                px: 3,
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                submitting || (currentQuestion.type === "checkbox"
                  ? !selected || selected.length === 0
                  : !selected)
              }
              sx={{
                minWidth: 100,
                px: 3,
                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              }}
            >
              {submitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : currentIndex === questions.length - 1 ? (
                "Submit"
              ) : (
                "Next"
              )}
            </Button>
          </Box>
        </Paper>

        {/* Success Modal */}
        <SuccessModal 
          open={successModalOpen} 
          message={successMessage || "Preferences Saved!"} 
          subtext="Finding the best apartment matches for you..." 
        />
      </Container>
    </ThemeProvider>
  );
};

export default PreferenceForm;