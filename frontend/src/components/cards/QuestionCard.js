import React from 'react';
import RadioGroup from '../FormElements/RadioGroup';
import Dropdown from '../FormElements/Dropdown';
import InputField from '../FormElements/InputField';

const QuestionCard = ({ question, value, onChange, error }) => {
  const renderFormElement = () => {
    switch (question.type) {
      case 'radio':
        return (
          <RadioGroup
            options={question.options}
            value={value}
            onChange={(val) => onChange(question.id, val)}
          />
        );
        
      case 'dropdown':
        return (
          <Dropdown
            options={question.options}
            value={value}
            onChange={(val) => onChange(question.id, val)}
            placeholder="Select an option"
          />
        );
        
      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={option.value}
                  value={option.value}
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const newValue = [...(value || [])];
                    
                    if (checked) {
                      newValue.push(option.value);
                    } else {
                      const index = newValue.indexOf(option.value);
                      if (index !== -1) {
                        newValue.splice(index, 1);
                      }
                    }
                    
                    onChange(question.id, newValue);
                  }}
                  className="h-5 w-5 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor={option.value} className="ml-2 block text-gray-700">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      case 'input':
        return (
          <InputField
            type={question.inputType || 'text'}
            value={value}
            onChange={(val) => onChange(question.id, val)}
            placeholder={question.placeholder}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-primary-800 mb-6">{question.question}</h2>
      {renderFormElement()}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default QuestionCard;