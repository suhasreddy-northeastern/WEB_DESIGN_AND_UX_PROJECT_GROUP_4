import React, { useState } from "react";
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { homePageFaq } from "../content/content"; 

const Faq = ({ data = homePageFaq }) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      <Typography
        variant="h5"
        fontWeight={600}
        mb={3}
        sx={{
          color: "text.primary",
          display: "flex",
          alignItems: "center",
          "&:after": {
            content: '""',
            display: "block",
            height: "3px",
            flexGrow: 1,
            marginLeft: 2,
            background: "linear-gradient(90deg, #00b386 0%, rgba(0, 179, 134, 0.1) 100%)",
            borderRadius: 4,
          },
        }}
      >
        {data.title}
      </Typography>

      {data.questions.map((item) => (
        <Accordion
          key={item.id}
          expanded={expanded === item.id}
          onChange={handleChange(item.id)}
          sx={{
            mb: 2,
            borderRadius: "8px !important",
            overflow: "hidden",
            border: "1px solid rgba(0, 179, 134, 0.1)",
            "&:before": { display: "none" },
            "&.Mui-expanded": {
              boxShadow: "0 4px 10px rgba(0, 179, 134, 0.1)",
              borderColor: "rgba(0, 179, 134, 0.3)",
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#00b386" }} />}
            aria-controls={`${item.id}-content`}
            id={`${item.id}-header`}
            sx={{
              backgroundColor: expanded === item.id ? "rgba(0, 179, 134, 0.05)" : "transparent",
              transition: "background-color 0.3s ease",
              "&:hover": { backgroundColor: "rgba(0, 179, 134, 0.05)" },
            }}
          >
            <Typography fontWeight={500}>{item.question}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Typography variant="body2" color="text.secondary">
              {item.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Faq;