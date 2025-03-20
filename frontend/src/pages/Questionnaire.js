import React, { useState } from 'react';
import QuestionCard from '../components/cards/QuestionCard';
import ProgressBar from '../components/FormElements/ProgressBar';
import NavigationButtons from '../components/buttons/NavigationButtons';
import QuestionnaireLayout from '../components/layout/QuestionnaireLayout';



// Import placeholder images (replace with your actual images)
import locationImg from '../assets/location.jpg';
import budgetImg from '../assets/budget.jpg';
import bedroomsImg from '../assets/bedrooms.jpg';
import amenitiesImg from '../assets/amenities.jpg';
import moveInImg from '../assets/move-in.jpg';

// Question data
const questions = [
  {
    id: 'location',
    question: 'Where are you looking to live?',
    type: 'dropdown',
    options: [
      { value: 'downtown', label: 'Downtown' },
      { value: 'suburban', label: 'Suburban Area' },
      { value: 'uptown', label: 'Uptown' },
      { value: 'outskirts', label: 'City Outskirts' }
    ],
    image: locationImg,
    validation: (value) => value !== '',
    errorMessage: 'Please select a location'
  },
  {
    id: 'budget',
    question: 'What is your monthly budget?',
    type: 'input',
    inputType: 'number',
    placeholder: 'Enter amount in $',
    image: budgetImg,
    validation: (value) => value >= 500 && value <= 10000,
    errorMessage: 'Budget must be between $500 and $10,000'
  },
  {
    id: 'bedrooms',
    question: 'How many bedrooms do you need?',
    type: 'radio',
    options: [
      { value: 'studio', label: 'Studio' },
      { value: '1', label: '1 Bedroom' },
      { value: '2', label: '2 Bedrooms' },
      { value: '3', label: '3+ Bedrooms' }
    ],
    image: bedroomsImg,
    validation: (value) => value !== '',
    errorMessage: 'Please select the number of bedrooms'
  },
  {
    id: 'amenities',
    question: 'What amenities are important to you?',
    type: 'checkbox',
    options: [
      { value: 'parking', label: 'Parking' },
      { value: 'gym', label: 'Fitness Center' },
      { value: 'pool', label: 'Swimming Pool' },
      { value: 'petFriendly', label: 'Pet Friendly' },
      { value: 'laundry', label: 'In-unit Laundry' }
    ],
    image: amenitiesImg,
    validation: () => true, // Optional selection
    errorMessage: ''
  },
  {
    id: 'moveIn',
    question: 'When would you like to move in?',
    type: 'input',
    inputType: 'date',
    image: moveInImg,
    validation: (value) => {
      const selectedDate = new Date(value);
      const currentDate = new Date();
      return selectedDate >= currentDate;
    },
    errorMessage: 'Please select a date in the future'
  }
];

const QuestionnairePage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    location: '',
    budget: '',
    bedrooms: '',
    amenities: [],
    moveIn: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (id, value) => {
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
    
    // Clear error when user starts typing/selecting
    if (errors[id]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [id]: null
      }));
    }
  };

  const validateCurrentStep = () => {
    const currentQuestion = questions[currentStep];
    const value = formData[currentQuestion.id];
    const isValid = currentQuestion.validation(value);
    
    if (!isValid) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [currentQuestion.id]: currentQuestion.errorMessage
      }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // All validations have passed, form data is complete
    console.log('Form submitted:', formData);
    // Here you would typically send the data to a backend API
    alert('Thank you! We will find apartments based on your preferences.');
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="questionnaire-container">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-800">Find Your Perfect Apartment</h1>
          <p className="mt-2 text-lg text-gray-600">
            Answer a few questions to help us find the best matches for you
          </p>
        </div>

        <div className="questionnaire-card">
          <div className="flex flex-col md:flex-row">
            {/* Question Section */}
            <div className="w-full md:w-1/2 p-8">
              <QuestionCard
                question={currentQuestion}
                value={formData[currentQuestion.id]}
                onChange={handleChange}
                error={errors[currentQuestion.id]}
              />
              
              <div className="mt-8">
                <ProgressBar progress={progress} />
              </div>
              
              <div className="mt-8">
                <NavigationButtons
                  currentStep={currentStep}
                  totalSteps={questions.length}
                  onBack={handleBack}
                  onNext={handleNext}
                />
              </div>
            </div>
            
            {/* Image Section */}
            <div className="w-full md:w-1/2 bg-gray-100">
              <div className="h-full flex items-center justify-center p-6">
                <img
                  src={currentQuestion.image}
                  alt={`Illustration for ${currentQuestion.question}`}
                  className="max-h-full w-full object-cover rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;