import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

const CustomNavbar = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        {/* Brand Logo */}
        <Navbar.Brand as={Link} to="/">
          HomeFit
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
 