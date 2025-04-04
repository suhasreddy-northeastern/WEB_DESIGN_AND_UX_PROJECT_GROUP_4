import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const messages = [
  "Executing data retrieval algorithms...",
  "Optimizing user-specific queries...",
  "Initiating personalized content rendering...",
  "Finalizing data transformation and filtering...",
];

const LoadingMessage = () => {
  const [messageIndex, setMessageIndex] = useState(-1); // -1 for initial message

  useEffect(() => {
    const timer = setTimeout(() => setMessageIndex(0), 4000); // after 4s, start cycling

    let interval;
    if (messageIndex >= 0) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }, 3000); // change every 3s
    }

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [messageIndex]);

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 3,
      }}
    >
      <CircularProgress size={50} color="primary" />
      <Typography variant="h6" fontWeight={500}>
        {messageIndex === -1
          ? "Hang tight, we’re crunching the latest data tailored to you..."
          : messages[messageIndex]}
      </Typography>
    </Box>
  );
};

export default LoadingMessage;
