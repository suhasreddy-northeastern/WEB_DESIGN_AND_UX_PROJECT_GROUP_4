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


// Broker Dashboard Pages
import BrokerLayout from "./pages/broker/BrokerLayout";
import BrokerDashboard from "./pages/broker/BrokerDashboard";
import BrokerListings from "./pages/broker/BrokerListings";
import BrokerInquiries from "./pages/broker/BrokerInquiries";

// Route Guards
import AdminRoute from "./routes/AdminRoute";
import BrokerRoute from "./routes/BrokerRoute";
import UserRoute from "./routes/UserRoute";

// Auth Session
import { checkSession } from "./redux/sessionActions";

// 👇 Separate component for route logic
function AppRoutes() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const hideNavbar = ["/login", "/signup"].includes(location.pathname) ||
                     location.pathname.startsWith('/broker/');

  const hideFooter = location.pathname.startsWith('/broker/');

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
        <Router>
          <Box display="flex" flexDirection="column" minHeight="100vh">
            <CssBaseline />
            <AppRoutes />
          </Box>
        </Router>
      </ColorModeProvider>
    </Provider>
  );
}

export default App;