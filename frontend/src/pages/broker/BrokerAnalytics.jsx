import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  useTheme,
  Divider,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Sample data for charts
const sampleViewsData = [
  { name: 'Jan', views: 65 },
  { name: 'Feb', views: 90 },
  { name: 'Mar', views: 75 },
  { name: 'Apr', views: 120 },
  { name: 'May', views: 105 },
  { name: 'Jun', views: 130 },
];

const sampleInquiriesData = [
  { name: 'Jan', inquiries: 12 },
  { name: 'Feb', inquiries: 19 },
  { name: 'Mar', inquiries: 15 },
  { name: 'Apr', inquiries: 27 },
  { name: 'May', inquiries: 22 },
  { name: 'Jun', inquiries: 30 },
];

const samplePropertyTypesData = [
  { name: 'Apartment', value: 45 },
  { name: 'House', value: 25 },
  { name: 'Condo', value: 20 },
  { name: 'Townhouse', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const sampleTopListingsData = [
  { id: 1, title: 'Luxury Downtown Apartment', views: 245, inquiries: 18, conversionRate: '7.3%' },
  { id: 2, title: 'Modern Loft with City Views', views: 180, inquiries: 12, conversionRate: '6.7%' },
  { id: 3, title: 'Spacious Family Home', views: 156, inquiries: 9, conversionRate: '5.8%' },
  { id: 4, title: 'Riverside Condo', views: 134, inquiries: 7, conversionRate: '5.2%' },
  { id: 5, title: 'Cozy Studio Apartment', views: 110, inquiries: 5, conversionRate: '4.5%' },
];

const BrokerAnalytics = () => {
  const theme = useTheme();
  const user = useSelector(state => state.user.user);
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6m'); // 1m, 3m, 6m, 1y
  const [tabValue, setTabValue] = useState(0);
  const [analyticsData, setAnalyticsData] = useState({
    viewsData: [],
    inquiriesData: [],
    propertyTypesData: [],
    topListings: []
  });

  // Check if broker is approved
  const isApproved = user && user.isApproved === true;

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      
      try {
        if (isApproved) {
          // In a real application, fetch data from API based on time range
          // For now, use sample data
          
          // Add a delay to simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          setAnalyticsData({
            viewsData: sampleViewsData,
            inquiriesData: sampleInquiriesData,
            propertyTypesData: samplePropertyTypesData,
            topListings: sampleTopListingsData
          });
        } else {
          // For unapproved brokers, use empty data
          setAnalyticsData({
            viewsData: [],
            inquiriesData: [],
            propertyTypesData: [],
            topListings: []
          });
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [isApproved, timeRange]);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  if (!isApproved) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
              Analytics Not Available
            </Typography>
            <Typography variant="body1" paragraph>
              Your broker account is pending approval. Analytics will be available once your account is approved.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/broker/dashboard"
            sx={{ borderRadius: 2 }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 1 }}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track the performance of your listings and inquiries
          </Typography>
        </Box>
        
        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel id="time-range-select-label">Time Range</InputLabel>
          <Select
            labelId="time-range-select-label"
            id="time-range-select"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="1m">Last Month</MenuItem>
            <MenuItem value="3m">Last 3 Months</MenuItem>
            <MenuItem value="6m">Last 6 Months</MenuItem>
            <MenuItem value="1y">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Views
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {analyticsData.viewsData.reduce((sum, item) => sum + item.views, 0)}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                +12.5% from previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Inquiries
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {analyticsData.inquiriesData.reduce((sum, item) => sum + item.inquiries, 0)}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                +8.3% from previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                6.2%
              </Typography>
              <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                -1.3% from previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Active Listings
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {analyticsData.topListings.length}
              </Typography>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                +2 from previous period
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different chart views */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          mb: 4,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            px: 2,
            pt: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
            },
          }}
        >
          <Tab label="Views & Inquiries" />
          <Tab label="Property Types" />
          <Tab label="Top Performing Listings" />
        </Tabs>
        
        <Divider />
        
        <Box sx={{ p: 3 }}>
          {/* Views & Inquiries Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Views & Inquiries Over Time
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Track how your property views and inquiries trend over time
              </Typography>
              
              <Box sx={{ height: 400, mt: 4 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.viewsData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="views"
                      name="Views"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="inquiries"
                      name="Inquiries"
                      stroke="#82ca9d"
                      data={analyticsData.inquiriesData}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* Property Types Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Distribution by Property Type
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Breakdown of your listings by property type
              </Typography>
              
              <Box sx={{ height: 400, mt: 4, display: 'flex', justifyContent: 'space-around' }}>
                <Box sx={{ width: '45%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.propertyTypesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.propertyTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} listings`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                
                <Box sx={{ width: '45%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.propertyTypesData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Number of Listings" fill="#8884d8">
                        {analyticsData.propertyTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>
          )}

          {/* Top Performing Listings Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Top Performing Listings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your listings ranked by views and inquiries
              </Typography>
              
              <TableContainer sx={{ mt: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="top listings table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Views</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Inquiries</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Conversion Rate</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.topListings.map((listing) => (
                      <TableRow
                        key={listing.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {listing.title}
                        </TableCell>
                        <TableCell align="right">{listing.views}</TableCell>
                        <TableCell align="right">{listing.inquiries}</TableCell>
                        <TableCell align="right">{listing.conversionRate}</TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Additional Insights Section */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Performance Insights
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Popular Features
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Most inquired about features in your listings:
              </Typography>
              <ol>
                <li>Modern Kitchen</li>
                <li>Balcony/Patio</li>
                <li>In-unit Laundry</li>
                <li>Hardwood Floors</li>
                <li>Central A/C</li>
              </ol>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Peak Activity Times
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Times when your listings receive the most views:
              </Typography>
              <ul>
                <li>Weekdays: 6-8 PM</li>
                <li>Weekends: 10 AM - 12 PM</li>
                <li>Most active day: Sunday</li>
              </ul>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Recommendations
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Based on your data, we recommend:
              </Typography>
              <ul>
                <li>Add more studio apartments to your listings</li>
                <li>Highlight in-unit laundry in your descriptions</li>
                <li>Update your listings on Sundays for maximum visibility</li>
              </ul>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default BrokerAnalytics;