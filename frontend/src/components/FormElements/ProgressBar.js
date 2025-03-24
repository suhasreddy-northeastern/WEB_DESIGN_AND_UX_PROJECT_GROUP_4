import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-6 justify-between">
        <p className="text-black text-base font-medium leading-normal">
          Step {currentStep + 1}/{totalSteps}
        </p>
      </div>
      <div className="rounded bg-[#E0E0E0]">
        <div 
          className="h-2 rounded bg-[#EA2831] transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;