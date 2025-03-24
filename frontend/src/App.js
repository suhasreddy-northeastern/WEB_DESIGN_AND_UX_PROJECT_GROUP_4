// src/App.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import RecommendationsPage from './pages/RecommendationsPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import QuestionnairePage from './pages/QuestionnairePage'; // Import your QuestionnairePage
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recommendations" element={<QuestionnairePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} /> {/* Add this route */}
      </Routes>
    </div>
  );git 
}

export default App;
