import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, ProgressBar, Image } from 'react-bootstrap';
import ApartmentImage from '../assets/apartment.jpg';  
import BedroomsImage from '../assets/bedrooms.jpg'; 
import BudgetImage from '../assets/budget.jpg';  
// import LocationImage from '../assets/location.jpg';  
import AmenitiesImage from '../assets/amenities.jpg';  
import StyleImage from '../assets/style.jpg';  
import FloorImage from '../assets/floor.jpg';  
import MoveInImage from '../assets/movein.jpg';  
import ParkingImage from '../assets/parking.jpg';  
import TransportImage from '../assets/transport.jpg';  
import SquareFootageImage from '../assets/squarefootage.jpg';  
import NeighborhoodImage from '../assets/neighborhood.jpg';  
import SafetyImage from '../assets/safety.jpg';  
import PetsImage from '../assets/pets.jpg';  
import ViewImage from '../assets/view.jpg';  
import LeaseImage from '../assets/lease.jpg';  
import RoommatesImage from '../assets/roommates.jpg';  

// Image mapping for each question
const images = {
  0: ApartmentImage,
  1: BedroomsImage,
  2: BudgetImage,
  3: NeighborhoodImage,
  4: AmenitiesImage,
  5: StyleImage,
  6: FloorImage,
  7: MoveInImage,
  8: ParkingImage,
  9: TransportImage,
  10: SquareFootageImage,
  11: SafetyImage,
  12: PetsImage,
  13: ViewImage,
  14: LeaseImage,
  15: RoommatesImage,
};

// Questions array
const questions = [
  { question: 'Are you looking to buy or rent an apartment?', options: ['Rent', 'Buy'], type: 'radio' },
  { question: 'How many bedrooms do you need?', options: ['1 Bedroom', '2 Bedrooms', '3 Bedrooms', '4+ Bedrooms'], type: 'radio' },
  { question: 'What is your budget for rent or purchase?', options: ['Under $1,000', '$1,000 - $2,000', '$2,000 - $3,000', '$3,000+'], type: 'radio' },
  { question: 'What type of neighborhood are you interested in?', options: ['Quiet and Residential', 'Busy Urban Area', 'Close to Entertainment & Dining'], type: 'radio' },
  { question: 'Which amenities are most important to you?', options: ['Gym', 'Swimming Pool', 'Parking Space', 'Pet-Friendly', 'Balcony', 'In-Unit Laundry'], type: 'checkbox' },
  { question: 'What type of apartment style do you prefer?', options: ['Modern', 'Traditional', 'Loft', 'High-rise'], type: 'radio' },
  { question: 'What floor would you prefer for your apartment?', options: ['Ground Floor', 'Mid-level Floor', 'Top Floor'], type: 'radio' },
  { question: 'When would you like to move in?', options: ['Immediately', 'In the next month', 'In 3 months or more'], type: 'radio' },
  { question: 'Do you need parking with your apartment?', options: ['Yes, I need parking', 'No, I don’t need parking'], type: 'radio' },
  { question: 'How important is proximity to public transport?', options: ['Very Important', 'Somewhat Important', 'Not Important'], type: 'radio' },
  { question: 'What is the minimum square footage you’re looking for?', options: ['Under 500 sq. ft.', '500 - 1,000 sq. ft.', '1,000 - 1,500 sq. ft.', '1,500+ sq. ft.'], type: 'radio' },
  { question: 'How important is safety and security in your preferred area?', options: ['Very Important', 'Somewhat Important', 'Not Important'], type: 'radio' },
  { question: 'Do you have pets or plan to have pets?', options: ['Yes', 'No', 'Not sure yet'], type: 'radio' },
  { question: 'Do you have a preference for the apartment view?', options: ['City View', 'Park View', 'Ocean View', 'No Preference'], type: 'radio' },
  { question: 'How many people do you want on the lease?', options: ['Just Me', '2 People', '3 People', '4+ People'], type: 'radio' },
  { question: 'Do you plan to stay with roommates/friends, or are you looking for a place alone?', options: ['With Roommates/Friends', 'Alone'], type: 'radio' },
];

const QuestionnairePage = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (e, questionIndex) => {
    const { value, type, checked } = e.target;
    if (type === "checkbox") {
      setAnswers((prevAnswers) => {
        const updatedAnswers = { ...prevAnswers };
        const selectedOptions = updatedAnswers[questionIndex] || [];

        if (checked) {
          updatedAnswers[questionIndex] = [...selectedOptions, value];
        } else {
          updatedAnswers[questionIndex] = selectedOptions.filter((opt) => opt !== value);
        }
        return updatedAnswers;
      });
    } else {
      setAnswers({ ...answers, [questionIndex]: value });
    }
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'radio':
        return (
          <Form.Group>
            {question.options.map((option, i) => (
              <Form.Check
                key={i}
                type="radio"
                label={option}
                value={option}
                name={`question-${index}`}
                checked={answers[index] === option}
                onChange={(e) => handleAnswerChange(e, index)}
              />
            ))}
          </Form.Group>
        );
      case 'checkbox':
        return (
          <Form.Group>
            {question.options.map((option, i) => (
              <Form.Check
                key={i}
                type="checkbox"
                label={option}
                value={option}
                checked={answers[index]?.includes(option) || false}
                onChange={(e) => handleAnswerChange(e, index)}
              />
            ))}
          </Form.Group>
        );
      case 'dropdown':
        return (
          <Form.Group>
            <Form.Select value={answers[index] || ''} onChange={(e) => handleAnswerChange(e, index)}>
              <option value="">Select an option</option>
              {question.options.map((option, i) => (
                <option key={i} value={option}>{option}</option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="mt-4">
      <h3 className="text-center mb-4">Let’s get you started!</h3>
      <ProgressBar now={(currentQuestionIndex / questions.length) * 100} className="mb-3" />

      <Row className="align-items-center">
        <Col md={6}>
          <h5>{questions[currentQuestionIndex].question}</h5>
          {renderQuestion(questions[currentQuestionIndex], currentQuestionIndex)}
          <div className="mt-3">
            {currentQuestionIndex > 0 && <Button onClick={handleBack} className="me-2">Back</Button>}
            <Button onClick={handleNext}>{currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}</Button>
          </div>
        </Col>
        <Col md={6} className="text-center">
          <Image src={images[currentQuestionIndex]} alt="Question Image" fluid className="rounded" />
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionnairePage;
