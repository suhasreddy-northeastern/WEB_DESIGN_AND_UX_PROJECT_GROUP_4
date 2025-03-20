import React from 'react';

const NavigationButtons = ({ currentStep, totalSteps, onBack, onNext }) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep}
        className={`btn ${isFirstStep ? 'btn-disabled' : 'btn-secondary'}`}
      >
        Back
      </button>
      
      <button
        type="button"
        onClick={onNext}
        className="btn btn-primary"
      >
        {isLastStep ? 'Submit' : 'Next'}
      </button>
    </div>
  );
};

export default NavigationButtons;