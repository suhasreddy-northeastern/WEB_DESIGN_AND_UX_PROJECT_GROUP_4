import React from 'react';

const QuestionnaireLayout = ({ children }) => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default QuestionnaireLayout;
