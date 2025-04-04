// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#23cea3',
      dark: '#1ba583',
      light: '#4fd7b5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2c3e50',
      dark: '#1a252f',
      light: '#546478',
    },
    error: {
      main: '#e74c3c',
    },
    warning: {
      main: '#f9c74f',
    },
    success: {
      main: '#2ecc71',
    },
    info: {
      main: '#3498db',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
    matchScore: {
      high: '#00b386',   // >= 80%
      medium: '#f9c74f', // 50–79%
      low: '#f94144',    // < 50%
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          color: '#444',
          fontWeight: 500,
          '&:hover': {
            color: '#00b386',
            backgroundColor: 'transparent',
          },
        },
        outlined: {
          borderColor: '#00b386',
          color: '#00b386',
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 24px',
          borderRadius: 16,
          '&:hover': {
            backgroundColor: '#e6f9f3',
            borderColor: '#00b386',
          },
        },
        contained: {
          backgroundColor: '#23cea3',
          color: '#fff',
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#1ba583',
            boxShadow: '0 6px 10px rgba(35, 206, 163, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(35, 206, 163, 0.1)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 20px rgba(35, 206, 163, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0 2px 8px rgba(35, 206, 163, 0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(35, 206, 163, 0.1)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(35, 206, 163, 0.12)',
        },
        elevation4: {
          boxShadow: '0 8px 24px rgba(35, 206, 163, 0.14)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(35, 206, 163, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            color: '#23cea3',
            '&.Mui-selected': {
              backgroundColor: '#23cea3',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#1ba583',
              },
            },
          },
        },
      },
    },
    MuiMobileStepper: {
      styleOverrides: {
        dot: {
          backgroundColor: '#ccc',
        },
        dotActive: {
          backgroundColor: '#23cea3',
        },
      },
    },
  },
});

export default theme;
