import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { CssBaseline, Box, CircularProgress } from "@mui/material";
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
import ApartmentMapPage from "./components/map/ApartmentMapPage";
import UserTours from "./pages/user/UserTours";

// Broker Dashboard Pages
import BrokerLayout from "./pages/broker/BrokerLayout";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import BrokerListings from "./pages/broker/BrokerListings";
import BrokerInquiries from "./pages/broker/BrokerInquiries";
import BrokerTours from "./pages/broker/BrokerTours"; 
import BrokerProfile from "./pages/broker/BrokerProfile";
import BrokerRegistration from "./pages/broker/BrokerRegistration";
import BrokerSettings from "./pages/broker/BrokerSettings";
import BrokerAnalytics from "./pages/broker/BrokerAnalytics";
import BrokerListingDetail from "./pages/broker/BrokerListingDetail";

// Admin Dashboard Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBrokers from "./pages/admin/AdminBrokers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminSettings from "./pages/admin/AdminSettings";

// Route Guards
import AdminRoute from "./routes/AdminRoute";
import BrokerRoute from "./routes/BrokerRoute";
import UserRoute from "./routes/UserRoute";

// Auth Session
import { checkSession } from "./redux/sessionActions";
import axios from "axios";
import { updateUser } from "./redux/userSlice";

// Maintenance Mode
import { MaintenanceProvider, useMaintenanceMode } from "./components/maintenance/MaintenanceContext";
import MaintenanceMode from "./components/maintenance/MaintenanceMode";

const API_BASE_URL = process.env.REACT_APP_API_URL;
// 👇 Separate component for route logic
function AppRoutes() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  
  
  // Get maintenance mode status
  const { isInMaintenanceMode, maintenanceMessage, estimatedTime, loading: maintenanceLoading, fetchMaintenanceStatus } = useMaintenanceMode();

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
          `${API_BASE_URL}/api/broker/me`,
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          // Update the Redux store with broker-specific data
          dispatch(updateUser(response.data));
          console.log("Broker data updated successfully");
        }
      }
    } catch (error) {
      console.error("Error fetching broker data:", error);
    }
  };

  // Initial session check - runs once on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        await dispatch(checkSession());

        // If logged in as admin, refresh maintenance status
      if (user && user.type === "admin") {
        fetchMaintenanceStatus();
      }
      } catch (error) {
        console.error("Session check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [dispatch]);

  // Set up periodic session refresh for authenticated users
  useEffect(() => {
    let intervalId;

    if (isAuthenticated) {
      // Refresh session every 10 minutes for authenticated users
      intervalId = setInterval(() => {
        dispatch(checkSession());
      }, 10 * 60 * 1000); // 10 minutes
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, dispatch]);

  // Fetch broker data when user changes
  useEffect(() => {
    if (user && user.type === "broker") {
      fetchBrokerData();
    }
  }, [user?.email, dispatch]); // Only run when the user's email changes (i.e., on login/logout)

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
  }, [user, dispatch]);

  // Handle loading state
  if (loading || maintenanceLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Create an array of paths that should be accessible during maintenance mode
  const allowedPaths = [
    "/login",
    "/signup"
  ];

  // Check if maintenance mode is active and user is not an admin
  // Also check if the current path is allowed during maintenance mode
  if (isInMaintenanceMode && 
      (!user || user.type !== "admin") && 
      !allowedPaths.includes(location.pathname)) {
    return <MaintenanceMode message={maintenanceMessage} estimatedTime={estimatedTime} />;
  }

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/broker/register" element={<BrokerRegistration />} />
        <Route path="/map" element={<ApartmentMapPage />} /> {/* New map route */}

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
          <Route path="listings" element={<AdminListings />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

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
          <Route path="listings/:id" element={<BrokerListingDetail />} />
          <Route path="inquiries" element={<BrokerInquiries />} />
          <Route path="tours" element={<BrokerTours />} /> {/* Add broker tours page */}
          <Route path="add-listing" element={<AgentApartmentForm />} />
          <Route path="profile" element={<BrokerProfile />} />
          <Route path="settings" element={<BrokerSettings />} />
          <Route path="analytics" element={<BrokerAnalytics />} />
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
          path="/user/tours"
          element={
            <UserRoute>
              <UserTours />
            </UserRoute>
          }
        /> {/* Add user tours page */}
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
        <Route path="/resource/:resourceType" element={<ResourcePage />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

// ✅ Main App component
function App() {
  return (
    <Provider store={store}>
      <ColorModeProvider>
        <MaintenanceProvider>
          <Router>
            <Box display="flex" flexDirection="column" minHeight="100vh">
              <CssBaseline />
              <AppRoutes />
            </Box>
          </Router>
        </MaintenanceProvider>
      </ColorModeProvider>
    </Provider>
  );
}

export default App;