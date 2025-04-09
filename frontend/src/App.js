import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { CssBaseline, Box } from "@mui/material";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./redux/store";
import { ColorModeProvider } from "./components/common/theme/ColorModeContext";

// Auth & Layout
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Navbar from "./components/common/navbar";
import Footer from "./components/common/footer";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EmployeesPage from "./pages/admin/ManageUsers";
import AgentApartmentForm from "./pages/broker/AgentPropertyForm";
import MatchResults from "./pages/user/UserMatchResults";
import PreferenceForm from "./pages/user/PreferenceForm";
import SavedListings from "./pages/user/SavedListings";
import ResourcePage from "./pages/ResourcePage";
import UserProfile from "./pages/user/UserProfile";

// Broker Dashboard Pages
import BrokerLayout from "./pages/broker/BrokerLayout";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import BrokerListings from "./pages/broker/BrokerListings";
import BrokerInquiries from "./pages/broker/BrokerInquiries";
import BrokerProfile from "./pages/broker/BrokerProfile";
import BrokerRegistration from "./pages/broker/BrokerRegistration";
import BrokerSettings from "./pages/broker/BrokerSettings";
import BrokerAnalytics from "./pages/broker/BrokerAnalytics";

// Admin Dashboard Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBrokers from "./pages/admin/AdminBrokers";
import AdminUsers from "./pages/admin/AdminUsers";

// Route Guards
import AdminRoute from "./routes/AdminRoute";
import BrokerRoute from "./routes/BrokerRoute";
import UserRoute from "./routes/UserRoute";

// Auth Session
import { checkSession } from "./redux/sessionActions";
import PropertyDetailsPage from "./pages/PropertyDetailsPage";
import LandingPage from "./pages/LandingPage";
import ApartmentMatches from "./pages/ApartmentPage";
import ScrollAndFocusHandler from "./components/common/ScrollAndFocusHandler";
import axios from "axios";

// 👇 Separate component for route logic
function AppRoutes() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  const hideNavbar =
    ["/login", "/signup"].includes(location.pathname) ||
    location.pathname.startsWith("/broker/") ||
    location.pathname.startsWith("/admin/");

  const hideFooter =
    ["/login", "/signup"].includes(location.pathname) ||
    location.pathname.startsWith("/broker/") ||
    location.pathname.startsWith("/admin/");

  // Function to fetch and update broker-specific data
  const fetchBrokerData = async () => {
    try {
      if (user && user.type === "broker") {
        console.log("Fetching broker data for user:", user.email);
        const response = await axios.get(
          "http://localhost:4000/api/broker/me",
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          // Update the Redux store with broker-specific data
          dispatch({
            type: "user/updateUser",
            payload: response.data,
          });
          console.log("Broker data updated successfully");
        }
      }
    } catch (error) {
      console.error("Error fetching broker data:", error);
    }
  };

  // Initial session check
  useEffect(() => {
    const fetchSession = async () => {
      await dispatch(checkSession());
      setLoading(false);
    };
    fetchSession();
  }, [dispatch]);

  // Fetch broker data when user changes
  useEffect(() => {
    if (user && user.type === "broker") {
      fetchBrokerData();
    }
  }, [user?.email]); // Only run when the user's email changes (i.e., on login/logout)

  // Set up a refresh interval for broker data
  useEffect(() => {
    let intervalId;

    if (user && user.type === "broker" && !user.isApproved) {
      // If user is a broker and not approved, check status every 5 minutes
      intervalId = setInterval(() => {
        fetchBrokerData();
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <>
      <ScrollAndFocusHandler />
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/broker/register" element={<BrokerRegistration />} />

        {/* Admin Layout with nested routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="brokers" element={<AdminBrokers />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<div>Admin Listings Page</div>} />
        </Route>

        {/* Legacy admin route */}
        <Route
          path="/employees"
          element={
            <AdminRoute>
              <EmployeesPage />
            </AdminRoute>
          }
        />

        {/* Broker Layout with nested routes */}
        <Route
          path="/broker"
          element={
            <BrokerRoute>
              <BrokerLayout />
            </BrokerRoute>
          }
        >
          <Route path="dashboard" element={<BrokerDashboard />} />
          <Route path="listings" element={<BrokerListings />} />
          <Route path="inquiries" element={<BrokerInquiries />} />
          <Route path="add-listing" element={<AgentApartmentForm />} />
          <Route path="profile" element={<BrokerProfile />} />
          <Route path="settings" element={<BrokerSettings />} />
          <Route path="analytics" element={<BrokerAnalytics />} />{" "}
          {/* Add analytics route */}
        </Route>

        {/* Backward compatibility - redirects to the new location within broker layout */}
        <Route
          path="/list-apartment"
          element={
            <BrokerRoute>
              <BrokerLayout />
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
        <Route
          path="/profile"
          element={
            <UserRoute>
              <UserProfile />
            </UserRoute>
          }
        />
        <Route
          path="/profile/password"
          element={
            <UserRoute>
              <UserProfile initialTab={1} />
            </UserRoute>
          }
        />
        <Route
          path="/profile/preferences"
          element={
            <UserRoute>
              <UserProfile initialTab={2} />
            </UserRoute>
          }
        />
        <Route path="/matches/:prefId" element={<MatchResults />} />

        {/* Common */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/landingPage" element={<LandingPage />} />
        <Route path="/propertyDetails" element={<PropertyDetailsPage />} />
        <Route path="/apartmentMatch" element={<ApartmentMatches />} />

        <Route path="/resource/:resourceType" element={<ResourcePage />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

// ✅ Main App component
function App() {
  const mainRef = useRef(null);

  const handleSkipToContent = (e) => {
    e.preventDefault();
    const main = mainRef.current;
    if (main) {
      main.focus();
    }
  };

  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
        onClick={handleSkipToContent}
      >
        Skip to main content
      </a>
      <Provider store={store}>
        <ColorModeProvider>
          <Router>
            <Box display="flex" flexDirection="column" minHeight="100vh">
              <CssBaseline />
              <main id="main-content" ref={mainRef} tabIndex={-1}>
                <AppRoutes />
              </main>
            </Box>
          </Router>
        </ColorModeProvider>
      </Provider>
    </>
  );
}

export default App;
