import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Breadcrumbs,
  Link,
  useTheme,
  Alert,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import { footerContent } from "../content/content";

// This component handles all the different resource types from footer links
const ResourcePage = () => {
  const { resourceType } = useParams();
  const [content, setContent] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme.palette.mode === 'dark';
  const primaryColor = "#00b386"; // HomeFit primary color

  useEffect(() => {
    // Validate that footerContent exists
    if (!footerContent) {
      console.error("footerContent is not defined");
      setError(true);
      return;
    }

    // Set page content based on the resource type from URL
    switch (resourceType) {
      case "renting-guide":
        if (footerContent.rentingGuide) {
          setContent(footerContent.rentingGuide);
          setTitle("Renting Guide");
        } else {
          console.error("rentingGuide content not found");
          setError(true);
        }
        break;
      case "apartment-checklist":
        if (footerContent.apartmentChecklist) {
          setContent(footerContent.apartmentChecklist);
          setTitle("Apartment Checklist");
        } else {
          console.error("apartmentChecklist content not found");
          setError(true);
        }
        break;
      case "faq":
        if (footerContent.faq) {
          setContent(footerContent.faq);
          setTitle("Frequently Asked Questions");
        } else {
          console.error("faq content not found");
          setError(true);
        }
        break;
      default:
        navigate("/"); // Redirect to home if no valid resource type
        break;
    }
  }, [resourceType, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!content) return;
    
    // Create a text version of the content
    let text = `# ${content.title || title}\n\n`;
    
    if (resourceType === "apartment-checklist" && content.sections) {
      content.sections.forEach(section => {
        text += `## ${section.heading}\n`;
        if (section.items) {
          section.items.forEach(item => {
            text += `- ${item}\n`;
          });
        }
        text += "\n";
      });
    } else if (resourceType === "renting-guide" && content.sections) {
      content.sections.forEach(section => {
        text += `## ${section.heading}\n`;
        if (section.content) {
          section.content.forEach(item => {
            text += `- ${item}\n`;
          });
        }
        text += "\n";
      });
    } else if (resourceType === "faq" && content.questions) {
      content.questions.forEach(item => {
        text += `## ${item.question}\n${item.answer}\n\n`;
      });
    }
    
    // Create download link
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `homefit-${resourceType}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Show error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Sorry, the requested content could not be loaded.
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/")}
          variant="outlined"
        >
          Return to Home
        </Button>
      </Container>
    );
  }

  // Show loading state or if no content yet
  if (!content) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography textAlign="center">Loading content...</Typography>
      </Container>
    );
  }

  // Render different layouts based on resource type
  const renderContent = () => {
    switch (resourceType) {
      case "renting-guide":
        return (
          <>
            {content.sections && content.sections.map((section, index) => (
              <Box key={index} mb={4}>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  gutterBottom
                  sx={{ color: primaryColor }}
                >
                  {section.heading}
                </Typography>
                <List>
                  {section.content && section.content.map((item, itemIndex) => (
                    <ListItem key={itemIndex} alignItems="flex-start" sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleOutlineIcon sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </>
        );

      case "apartment-checklist":
        return (
          <>
            <Box mb={3} display="flex" justifyContent="flex-end" gap={2} className="no-print">
              <Button 
                startIcon={<PrintIcon />} 
                onClick={handlePrint}
                variant="outlined"
                sx={{ borderColor: primaryColor, color: primaryColor }}
              >
                Print Checklist
              </Button>
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={handleDownload}
                variant="contained"
                sx={{ backgroundColor: primaryColor, '&:hover': { backgroundColor: '#009973' } }}
              >
                Download
              </Button>
            </Box>
            {content.sections && content.sections.map((section, index) => (
              <Box key={index} mb={4}>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  gutterBottom
                  sx={{ color: primaryColor }}
                >
                  {section.heading}
                </Typography>
                <List>
                  {section.items && section.items.map((item, itemIndex) => (
                    <ListItem key={itemIndex} alignItems="flex-start" sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CheckCircleOutlineIcon sx={{ color: primaryColor }} />
                      </ListItemIcon>
                      <ListItemText primary={item} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}
          </>
        );

      case "faq":
        return (
          <>
            {content.questions && content.questions.map((faq, index) => (
              <Accordion 
                key={index} 
                sx={{ 
                  mb: 2, 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  boxShadow: 'none',
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ 
                    backgroundColor: isDarkMode ? 'rgba(0, 179, 134, 0.08)' : 'rgba(0, 179, 134, 0.05)',
                    '&.Mui-expanded': {
                      backgroundColor: isDarkMode ? 'rgba(0, 179, 134, 0.12)' : 'rgba(0, 179, 134, 0.08)',
                    }
                  }}
                >
                  <Typography fontWeight={600}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        );

      default:
        return (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Unknown resource type: {resourceType}
          </Alert>
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box className="no-print" mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            underline="hover" 
            color="text.secondary" 
            href="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            Home
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>
      </Box>
      
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
        className="no-print"
      >
        Back
      </Button>

      <Paper 
        elevation={isDarkMode ? 2 : 3}
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: isDarkMode 
            ? '0 4px 20px rgba(0, 0, 0, 0.15)' 
            : '0 4px 20px rgba(0, 0, 0, 0.05)',
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight={700} 
          gutterBottom 
          textAlign="center"
          sx={{ mb: 4, color: theme.palette.text.primary }}
        >
          {content.title}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {renderContent()}
      </Paper>

      {/* Print styles */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              font-size: 12pt;
              color: black;
              background-color: white;
            }
            .MuiPaper-root {
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}
      </style>
    </Container>
  );
};

export default ResourcePage;