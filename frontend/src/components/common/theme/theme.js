// theme.js
import { createTheme } from '@mui/material/styles';

// Function to create a theme with the selected mode
export const createAppTheme = (mode = 'light') => {
  // Define common palette values
  const primaryMain = '#23cea3';
  const primaryDark = '#1ba583';
  const primaryLight = '#4fd7b5';
  const secondaryMain = '#2c3e50';
  const secondaryDark = '#1a252f';
  const secondaryLight = '#546478';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryMain,
        dark: primaryDark,
        light: primaryLight,
        contrastText: '#ffffff',
      },
      secondary: {
        main: secondaryMain,
        dark: secondaryDark,
        light: secondaryLight,
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
        default: mode === 'light' ? '#ffffff' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#2c3e50' : '#e0e0e0',
        secondary: mode === 'light' ? '#7f8c8d' : '#b0b0b0',
      },
      matchScore: {
        high: '#00b386',   // >= 80%
        medium: '#f9c74f', // 50–79%
        low: '#f94144',    // < 50%
      },
      divider: mode === 'light' ? 'rgba(35, 206, 163, 0.1)' : 'rgba(255, 255, 255, 0.1)',
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
      MuiCssBaseline: {
        styleOverrides: (theme) => ({
          body: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          },
        }),
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            fontWeight: 500,
            '&:hover': {
              color: primaryMain,
              backgroundColor: 'transparent',
            },
          },
          outlined: {
            borderColor: primaryMain,
            color: primaryMain,
            textTransform: 'none',
            fontWeight: 600,
            padding: '8px 24px',
            borderRadius: 16,
            '&:hover': {
              backgroundColor: mode === 'light' ? '#e6f9f3' : 'rgba(35, 206, 163, 0.1)',
              borderColor: primaryMain,
            },
          },
          contained: {
            backgroundColor: primaryMain,
            color: '#fff',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: primaryDark,
              boxShadow: '0 6px 10px rgba(35, 206, 163, 0.3)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            color: mode === 'light' ? '#222' : '#e0e0e0',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light' 
              ? '0 4px 12px rgba(35, 206, 163, 0.1)' 
              : '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'light' 
                ? '0 12px 20px rgba(35, 206, 163, 0.15)' 
                : '0 12px 20px rgba(0, 0, 0, 0.3)',
            },
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
            border: mode === 'light' ? '1px solid #F2F4F7' : '1px solid #333',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
          elevation1: {
            boxShadow: mode === 'light' 
              ? '0 2px 8px rgba(35, 206, 163, 0.08)' 
              : '0 2px 8px rgba(0, 0, 0, 0.2)',
          },
          elevation2: {
            boxShadow: mode === 'light' 
              ? '0 4px 12px rgba(35, 206, 163, 0.1)'
              : '0 4px 12px rgba(0, 0, 0, 0.25)',
          },
          elevation3: {
            boxShadow: mode === 'light' 
              ? '0 6px 16px rgba(35, 206, 163, 0.12)'
              : '0 6px 16px rgba(0, 0, 0, 0.3)',
          },
          elevation4: {
            boxShadow: mode === 'light' 
              ? '0 8px 24px rgba(35, 206, 163, 0.14)'
              : '0 8px 24px rgba(0, 0, 0, 0.35)',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? 'rgba(35, 206, 163, 0.1)' : 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            backgroundColor: mode === 'light' ? '#f0f0f0' : '#333',
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            '& .MuiPaginationItem-root': {
              color: primaryMain,
              '&.Mui-selected': {
                backgroundColor: primaryMain,
                color: '#fff',
                '&:hover': {
                  backgroundColor: primaryDark,
                },
              },
            },
          },
        },
      },
      MuiMobileStepper: {
        styleOverrides: {
          dot: {
            backgroundColor: mode === 'light' ? '#ccc' : '#555',
          },
          dotActive: {
            backgroundColor: primaryMain,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? '#e6f9f3' : 'rgba(35, 206, 163, 0.1)',
              color: primaryMain,
            },
          },
        },
      },
    },
  });
};

// For backward compatibility
const theme = createAppTheme('light');
export default theme;