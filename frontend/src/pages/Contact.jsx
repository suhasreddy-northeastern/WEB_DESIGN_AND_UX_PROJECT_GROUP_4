import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
} from "@mui/material";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent! We will get back to you soon.");
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 6 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Grid container spacing={4} alignItems="center">
          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: { xs: 2, md: 0 },
              }}
            >
              <img
                src="/images/contact.svg"
                alt="Contact Us"
                style={{
                  width: "100%",
                  maxWidth: 350,
                  objectFit: "contain",
                }}
              />
            </Box>
          </Grid>

          {/* Form Section */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
              align={window.innerWidth < 600 ? "center" : "left"}
            >
              Contact Us
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              mb={3}
              sx={{ textAlign: { xs: "center", md: "left" } }}
            >
              We'd love to hear from you! Fill out the form and we’ll get back
              to you.
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Message"
                  multiline
                  rows={4}
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    backgroundColor: "#00b386",
                    "&:hover": {
                      backgroundColor: "#009973",
                    },
                  }}
                >
                  Send Message
                </Button>
              </Box>
            </form>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Contact;
