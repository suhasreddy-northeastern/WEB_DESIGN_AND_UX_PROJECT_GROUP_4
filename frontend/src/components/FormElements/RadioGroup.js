import React from 'react';

const RadioGroup = ({ options, value, onChange, name }) => {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <label 
          key={option.value} 
          className="flex items-center gap-4 rounded-xl border border-solid border-[#E0E0E0] p-[15px]"
        >
          <input
            type="radio"
            className="h-5 w-5 border-2 border-[#E0E0E0] bg-transparent text-transparent checked:border-[#EA2831] checked:bg-[image:--radio-dot-svg] focus:outline-none focus:ring-0 focus:ring-offset-0 checked:focus:border-[#EA2831]"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <div className="flex grow flex-col">
            <p className="text-black text-sm font-medium leading-normal">{option.label}</p>
          </div>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;