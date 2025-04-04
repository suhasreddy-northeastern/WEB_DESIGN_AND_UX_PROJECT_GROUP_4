import React, { useState } from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../common/buttons/GoogleLoginButton";
import SuccessModal from "../common/modal/SuccessModal";

const Signup = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    type: "user",
  });
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("http://localhost:4000/api/user/create", form);
      setModalOpen(true);
      setTimeout(() => {
        setModalOpen(false);
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <SuccessModal
        open={modalOpen}
        message="Signup Successful"
        subtext="Redirecting to login..."
      />

      <Paper elevation={4} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Grid container>
          {/* Image Section */}
          <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
            <Box
              sx={{
                height: "100%",
                backgroundColor: "#f5f7fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              <img
                src="/images/signup.svg"
                alt="Signup Illustration"
                style={{ width: "100%", maxHeight: 400, objectFit: "contain" }}
              />
            </Box>
          </Grid>

          {/* Signup Form Section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 5 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom align="center">
                Create Account
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" mb={3}>
                Join us by filling the details below
              </Typography>

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    label="Full Name"
                    name="fullName"
                    variant="outlined"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    variant="outlined"
                    value={form.email}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    variant="outlined"
                    value={form.password}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                  <TextField
                    select
                    label="Account Type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="broker">Broker</MenuItem>
                  </TextField>

                  {error && (
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: "bold",
                      py: 1.5,
                      fontSize: "1rem",
                      backgroundColor: "#00b386",
                      "&:hover": {
                        backgroundColor: "#009973",
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                  <GoogleLoginButton onClick={() => alert("Google Login Coming Soon!")} />
                </Box>
              </form>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Signup;
