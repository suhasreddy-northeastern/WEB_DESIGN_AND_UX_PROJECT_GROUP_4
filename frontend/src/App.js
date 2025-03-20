import React, { useEffect, useState } from "react";
import axios from "axios";
import Questionnaire from './pages/Questionnaire'; // Import the Questionnaire page

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5001/")
      .then(response => setMessage(response.data))
      .catch(error => console.log(error));
  }, []);

  return (
    <div>
      <h1>{message}</h1>
      <Questionnaire /> {/* Render your Questionnaire component here */}
    </div>
  );
}

export default App;
