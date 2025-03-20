import React from 'react';

const RadioGroup = ({ options, value, onChange }) => {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            id={option.value}
            name="radio-group"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor={option.value} className="ml-2 block text-gray-700">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

export default RadioGroup;