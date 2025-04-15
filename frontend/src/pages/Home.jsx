import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  DialogContentText, 
  Button,
  CircularProgress,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import the role-specific home pages
import UserHome from "./user/UserHome";
import AdminHome from "./admin/AdminHome";
import BrokerHome from "./broker/BrokerHome";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Home = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State for login dialog
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState("");
  const [loading, setLoading] = useState(false);

  // Log the user data for debugging
  console.log("Home component - Current user:", user);
  
  const fetchLatestPreference = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}"/api/user/preferences/latest`,
        {
          withCredentials: true,
        }
      );

      const prefId = res.data.preference?._id;
      if (prefId) {
        navigate(`/matches/${prefId}`);
      } else {
        navigate("/preferences");
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
      if (err.response?.status === 404) {
        navigate("/preferences");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle button clicks for non-logged in users
  const handleActionClick = (action) => {
    if (!user) {
      setPendingAction(action);
      setLoginDialogOpen(true);
    } else {
      if (action === "recommendations") {
        fetchLatestPreference();
      } else if (action === "preferences") {
        navigate("/preferences");
      }
    }
  };

  // Handle login dialog actions
  const handleLogin = () => {
    setLoginDialogOpen(false);
    navigate("/login", {
      state: {
        from: "/",
        pendingAction: pendingAction,
      },
    });
  };

  const handleCloseDialog = () => {
    setLoginDialogOpen(false);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  // Determine which home page to show based on user role
  const renderHomePage = () => {
    if (!user) {
      // If no user is logged in, show the regular user home page
      return <UserHome onActionClick={handleActionClick} />;
    }

    // Make sure to handle the case where user.type might be undefined/null
    const userType = user.type || 'user';
    
    console.log("Rendering home page for user type:", userType);
    
    switch (userType) {
      case "admin":
        return <AdminHome />;
      case "broker":
        return <BrokerHome />;
      default:
        return <UserHome onActionClick={handleActionClick} />;
    }
  };

  return (
    <>
      {renderHomePage()}

      {/* Login Dialog - Only shown to non-logged in users */}
      <Dialog open={loginDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Login Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingAction === "recommendations"
              ? "You need to be logged in to view apartment recommendations."
              : "You need to be logged in to submit your apartment preferences."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleLogin}
            variant="contained"
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            }}
          >
            Login Now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Home;