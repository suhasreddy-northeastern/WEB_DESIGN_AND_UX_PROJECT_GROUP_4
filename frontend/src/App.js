import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5001/")
      .then(response => setMessage(response.data))
      .catch(error => console.log(error));
  }, []);

  return <h1>{message}</h1>;
}

export default App;
