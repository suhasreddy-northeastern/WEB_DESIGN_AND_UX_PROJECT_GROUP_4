import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store";

// Auth & Layout
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup"; // ✅ Import your Signup component
import Navbar from "./components/common/navbar";
import Footer from "./components/common/footer";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EmployeesPage from "./pages/ManageUsers";
import AgentApartmentForm from "./pages/AgentPropertyForm";
import MatchResults from "./pages/UserMatchResults";
import PreferenceForm from "./pages/PreferenceForm";
import SavedListings from "./pages/SavedListings";

// Route Guards
import AdminRoute from "./routes/AdminRoute";
import BrokerRoute from "./routes/BrokerRoute";
import UserRoute from "./routes/UserRoute";

// Auth Session
import { checkSession } from "./redux/sessionActions";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import LandingPage from "./pages/LandingPage";

function AppRoutes() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  // 👇 Hide navbar on login and signup pages
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);

  useEffect(() => {
    const fetchSession = async () => {
      await dispatch(checkSession());
      setLoading(false);
    };
    fetchSession();
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin-only */}
        <Route
          path="/employees"
          element={
            <AdminRoute>
              <EmployeesPage />
            </AdminRoute>
          }
        />

        {/* Broker-only */}
        <Route
          path="/list-apartment"
          element={
            <BrokerRoute>
              <AgentApartmentForm />
            </BrokerRoute>
          }
        />

        {/* User-only */}
        <Route
          path="/preferences"
          element={
            <UserRoute>
              <PreferenceForm />
            </UserRoute>
          }
        />
        <Route
          path="/user/saved"
          element={
            <UserRoute>
              <SavedListings />
            </UserRoute>
          }
        />
        <Route path="/matches/:prefId" element={<MatchResults />} />

        {/* Common */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/landingPage" element={<LandingPage />} />
        <Route path="/propertyDetails" element={<PropertyDetailsPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Box display="flex" flexDirection="column" minHeight="100vh">
          <CssBaseline />
          <AppRoutes />
          <Footer />
        </Box>
      </Router>
    </Provider>
  );
}

export default App;
