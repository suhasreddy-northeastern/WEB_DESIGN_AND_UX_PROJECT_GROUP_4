import React from 'react';

const NavigationButtons = ({ currentStep, totalSteps, onBack, onNext }) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex justify-stretch">
      <div className="flex flex-1 gap-3 flex-wrap py-3 justify-end">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#EEEEEE] text-black text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">Back</span>
        </button>
        
        <button
          type="button"
          onClick={onNext}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#EA2831] text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">{isLastStep ? 'Submit' : 'Next'}</span>
        </button>
      </div>
    </div>
  );
};

export default NavigationButtons;