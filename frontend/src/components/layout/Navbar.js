import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Image } from 'react-bootstrap';

const CustomNavbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Detect dark mode from system preference
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(darkModePreference);
  }, []);

  const logoSrc = isDarkMode ? '/Logo.jpg' : '/LogoDark.jpg';

  return (
    <Navbar bg={isDarkMode ? "dark" : "light"} variant={isDarkMode ? "dark" : "light"} expand="lg" className="shadow-sm">
      <Container>
        {/* Brand Logo with Rounded Edges */}
        <Navbar.Brand as={Link} to="/">
          <Image 
            src={logoSrc} 
            alt="HomeFit Logo" 
            height="40" 
            className="rounded"
          />
        </Navbar.Brand>

        {/* Navbar Toggle (for mobile view) */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Navbar Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/recommendations">Recommendations</Nav.Link>
          </Nav>
          <Nav>
            <Button as={Link} to="/signup" variant="outline-light" className="me-2">
              Signup
            </Button>
            <Button as={Link} to="/login" variant="light">
              Login
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
