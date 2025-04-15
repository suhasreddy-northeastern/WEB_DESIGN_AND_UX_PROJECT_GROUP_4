// src/pages/preferences/components/PreferenceFormStepper.jsx
import React from 'react';
import { Stepper, Step, StepLabel, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepIcon-root.Mui-completed, & .MuiStepIcon-root.Mui-active': {
    color: '#00b386',
  },
}));

const PreferenceFormStepper = ({ activeStep, steps }) => {
  return (
    <StyledStepper activeStep={activeStep} alternativeLabel>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </StyledStepper>
  );
};

export default PreferenceFormStepper;