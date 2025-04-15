import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  useTheme,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
  Badge,
  Card,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const API_BASE_URL = process.env.REACT_APP_API_URL;

dayjs.extend(relativeTime);

const BrokerInquiries = () => {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [searchText, setSearchText] = useState('');
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}'/api/broker/inquiries`, {
          withCredentials: true,
        });
        setInquiries(response.data.inquiries || []);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        // Mock data for demonstration
        setInquiries([
          {
            _id: '1',
            userEmail: 'user1@example.com',
            userName: 'John Doe',
            apartmentId: '101',
            apartmentTitle: 'Apartment 101',
            message: 'Is this apartment still available?',
            status: 'pending',
            createdAt: new Date().toISOString(),
            userAvatar: null,
          },
          {
            _id: '2',
            userEmail: 'user2@example.com',
            userName: 'Jane Smith',
            apartmentId: '102',
            apartmentTitle: 'Apartment 102',
            message: 'When can I schedule a viewing?',
            status: 'responded',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            userAvatar: null,
          },
          {
            _id: '3',
            userEmail: 'user3@example.com',
            userName: 'Robert Johnson',
            apartmentId: '103',
            apartmentTitle: 'Apartment 103',
            message: 'Is parking included in the rent?',
            status: 'pending',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            userAvatar: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleOpenReplyDialog = (inquiry) => {
    setSelectedInquiry(inquiry);
    setReplyDialogOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      await axios.post(
        `${API_BASE_URL}/api/broker/inquiries/${selectedInquiry._id}/reply`,
        { message: replyMessage },
        { withCredentials: true }
      );

      // Update inquiry status in the UI
      setInquiries(
        inquiries.map((inquiry) =>
          inquiry._id === selectedInquiry._id
            ? { ...inquiry, status: 'responded' }
            : inquiry
        )
      );

      // Reset state
      setReplyMessage('');
      setReplyDialogOpen(false);
      setSelectedInquiry(null);
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Filter inquiries based on tab and search text
  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesStatus =
      (tabValue === 0) || // All
      (tabValue === 1 && inquiry.status === 'pending') || // Pending
      (tabValue === 2 && inquiry.status === 'responded'); // Responded

    const matchesSearch =
      searchText === '' ||
      inquiry.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.apartmentTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchText.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Count pending inquiries
  const pendingCount = inquiries.filter(inquiry => inquiry.status === 'pending').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: primaryColor }}/>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Typography variant="h4" component="h1" fontWeight="bold" mb={4} color="text.primary">
        Inquiries
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Card
          elevation={2}
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap',
            px: 1
          }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: primaryColor,
                },
                '& .MuiTab-root': {
                  color: theme.palette.text.secondary,
                  '&.Mui-selected': {
                    color: primaryColor,
                  },
                },
              }}
            >
              <Tab label="All Inquiries" />
              <Tab 
                label={
                  <Badge 
                    badgeContent={pendingCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: theme.palette.error.main,
                      }
                    }}
                  >
                    Pending
                  </Badge>
                } 
              />
              <Tab label="Responded" />
            </Tabs>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', my: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 1,
                  px: 1,
                }}
              >
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <TextField
                  placeholder="Search inquiries..."
                  variant="standard"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  sx={{ minWidth: 150 }}
                />
              </Box>
              <Tooltip title="Filter options">
                <IconButton sx={{ color: 'text.secondary' }}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Card>
      </Box>

      {filteredInquiries.length === 0 ? (
        <Card
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          }}
        >
          <HelpOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" mb={1} color="text.primary">
            No inquiries found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchText
              ? 'No inquiries match your search criteria'
              : tabValue === 1
              ? 'No pending inquiries to handle'
              : tabValue === 2
              ? 'You haven\'t responded to any inquiries yet'
              : 'You don\'t have any inquiries yet'}
          </Typography>
        </Card>
      ) : (
        <TableContainer
          component={Card}
          elevation={2}
          sx={{
            borderRadius: 2,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.03)' }}>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Message</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInquiries.map((inquiry) => (
                <TableRow 
                  key={inquiry._id} 
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: isDarkMode ? 'rgba(35, 206, 163, 0.05)' : 'rgba(35, 206, 163, 0.02)',
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={inquiry.userAvatar} alt={inquiry.userName}>
                        {inquiry.userName ? inquiry.userName[0] : 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium" color="text.primary">
                          {inquiry.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {inquiry.userEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.primary">
                      {inquiry.apartmentTitle}
                    </Typography>
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 250,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    <Typography variant="body2" color="text.primary">
                      {inquiry.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={dayjs(inquiry.createdAt).format('MM/DD/YYYY HH:mm')}>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(inquiry.createdAt).fromNow()}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={inquiry.status === 'pending' ? 'Pending' : 'Responded'}
                      sx={{
                        fontWeight: 600,
                        backgroundColor:
                          inquiry.status === 'pending'
                            ? isDarkMode
                              ? 'rgba(249, 199, 79, 0.2)'
                              : 'rgba(249, 199, 79, 0.1)'
                            : isDarkMode
                            ? 'rgba(35, 206, 163, 0.2)'
                            : 'rgba(35, 206, 163, 0.1)',
                        color:
                          inquiry.status === 'pending' ? theme.palette.warning.main : primaryColor,
                      }}
                      icon={
                        inquiry.status === 'responded' ? (
                          <CheckCircleIcon style={{ fontSize: 14 }} />
                        ) : undefined
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      startIcon={<EmailIcon />}
                      variant={inquiry.status === 'pending' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleOpenReplyDialog(inquiry)}
                      sx={{
                        borderRadius: 2,
                        backgroundColor:
                          inquiry.status === 'pending' ? primaryColor : 'transparent',
                        borderColor: primaryColor,
                        color: inquiry.status === 'pending' ? 'white' : primaryColor,
                        '&:hover': {
                          backgroundColor:
                            inquiry.status === 'pending' ? theme.palette.primary.dark : isDarkMode ? 'rgba(35, 206, 163, 0.1)' : 'rgba(35, 206, 163, 0.05)',
                        },
                      }}
                    >
                      {inquiry.status === 'pending' ? 'Reply' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={() => setReplyDialogOpen(false)}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 480,
            backgroundColor: isDarkMode ? theme.palette.background.paper : '#fff',
            border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          },
        }}
      >
        <DialogTitle color="text.primary">
          Reply to Inquiry
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom color="text.primary">
              Inquiry from {selectedInquiry?.userName}
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="body2" color="text.primary">{selectedInquiry?.message}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                For: {selectedInquiry?.apartmentTitle}
              </Typography>
            </Paper>
          </Box>
          <TextField
            autoFocus
            label="Your Reply"
            multiline
            rows={4}
            fullWidth
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your response here..."
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: primaryColor,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setReplyDialogOpen(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendReply}
            variant="contained"
            disabled={!replyMessage.trim()}
            sx={{
              borderRadius: 2,
              backgroundColor: primaryColor,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Send Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BrokerInquiries;