import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  useTheme,
  Divider,
  CircularProgress,
  List,
  ListItem,
  Card,
  CardContent,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TuneIcon from '@mui/icons-material/Tune';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const StatCard = ({ icon, count, label, backgroundColor }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Card
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: isDarkMode 
            ? '0 8px 24px rgba(0, 0, 0, 0.3)'
            : '0 8px 24px rgba(35, 206, 163, 0.15)',
        },
      }}
    >
      <Box
        sx={{
          backgroundColor,
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h4" fontWeight="bold" mb={0.5}>
        {count}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Card>
  );
};

const BrokerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    newInquiries: 0,
    pendingApprovals: 0,
  });
  const [inquiries, setInquiries] = useState([]);
  const [listingPerformance, setListingPerformance] = useState([]);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchBrokerData = async () => {
      try {
        setLoading(true);
        // Get broker stats
        const statsRes = await axios.get('http://localhost:4000/api/broker/stats', {
          withCredentials: true,
        });
        
        // Get recent inquiries
        const inquiriesRes = await axios.get('http://localhost:4000/api/broker/inquiries', {
          withCredentials: true,
        });
        
        // Get listing performance
        const performanceRes = await axios.get('http://localhost:4000/api/broker/listing-performance', {
          withCredentials: true,
        });
        
        setStats(statsRes.data);
        setInquiries(inquiriesRes.data.inquiries || []);
        setListingPerformance(performanceRes.data.listings || []);
      } catch (error) {
        console.error('Error fetching broker data:', error);
        // Use mock data for demonstration if API fails
        setStats({
          totalListings: 24,
          activeListings: 18,
          newInquiries: 12,
          pendingApprovals: 3,
        });
        
        setInquiries([
          { 
            _id: '1', 
            userEmail: 'user1@example.com', 
            apartmentId: '101', 
            apartmentTitle: 'Apartment 101',
            createdAt: new Date().toISOString()
          },
          { 
            _id: '2', 
            userEmail: 'user2@example.com', 
            apartmentId: '102', 
            apartmentTitle: 'Apartment 102',
            createdAt: new Date().toISOString()
          },
          { 
            _id: '3', 
            userEmail: 'user3@example.com', 
            apartmentId: '103', 
            apartmentTitle: 'Apartment 103',
            createdAt: new Date().toISOString()
          },
        ]);
        
        setListingPerformance([
          { _id: '101', title: 'Apartment 101', views: 45, inquiries: 5 },
          { _id: '102', title: 'Apartment 102', views: 90, inquiries: 10 },
          { _id: '103', title: 'Apartment 103', views: 135, inquiries: 15 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrokerData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
          Broker Dashboard
        </Typography>
        <Button
          component={Link}
          to="/broker/add-listing"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.2,
            bgcolor: primaryColor,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            }
          }}
        >
          Add New Listing
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ListAltIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.totalListings}
            label="Total Listings"
            backgroundColor={primaryColor}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TuneIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.activeListings}
            label="Active Listings"
            backgroundColor="#2ecc71"  // Success color from your theme
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.newInquiries}
            label="New Inquiries"
            backgroundColor="#3498db"  // Info color from your theme
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccessTimeIcon sx={{ color: 'white', fontSize: 28 }} />}
            count={stats.pendingApprovals}
            label="Pending Approvals"
            backgroundColor="#f9c74f"  // Warning color from your theme
          />
        </Grid>
      </Grid>

      {/* Recent Inquiries and Listing Performance */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              height: '100%',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: isDarkMode 
                  ? '0 8px 24px rgba(0, 0, 0, 0.25)'
                  : '0 8px 24px rgba(35, 206, 163, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <div>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Recent Inquiries
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Latest inquiries from potential tenants
                  </Typography>
                </div>
                <Button
                  component={Link}
                  to="/broker/inquiries"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    color: primaryColor,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline', 
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ p: 0 }}>
                {inquiries.length === 0 ? (
                  <Typography variant="body2" textAlign="center" py={3} color="text.secondary">
                    No inquiries yet
                  </Typography>
                ) : (
                  inquiries.slice(0, 3).map((inquiry) => (
                    <ListItem
                      key={inquiry._id}
                      sx={{
                        py: 2,
                        px: 0,
                        borderBottom: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                          {inquiry.userEmail}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Inquiry for {inquiry.apartmentTitle}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(inquiry.createdAt).format('MM/DD/YYYY')}
                      </Typography>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              height: '100%',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                boxShadow: isDarkMode 
                  ? '0 8px 24px rgba(0, 0, 0, 0.25)'
                  : '0 8px 24px rgba(35, 206, 163, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <div>
                  <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Listing Performance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Views and inquiries for your listings
                  </Typography>
                </div>
                <Button
                  component={Link}
                  to="/broker/listings"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    color: primaryColor,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline', 
                    }
                  }}
                >
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ p: 0 }}>
                {listingPerformance.length === 0 ? (
                  <Typography variant="body2" textAlign="center" py={3} color="text.secondary">
                    No listings yet
                  </Typography>
                ) : (
                  listingPerformance.slice(0, 3).map((listing) => (
                    <ListItem
                      key={listing._id}
                      sx={{
                        py: 2,
                        px: 0,
                        borderBottom: '1px solid',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                          {listing.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {listing.views} views, {listing.inquiries} inquiries
                        </Typography>
                      </Box>
                      <Button
                        component={Link}
                        to={`/broker/listings/${listing._id}`}
                        sx={{
                          color: primaryColor,
                          '&:hover': {
                            backgroundColor: 'transparent',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        View
                      </Button>
                    </ListItem>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BrokerDashboard;