import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CloseIcon from "@mui/icons-material/Close";

const FeedbackModal = ({ 
  open, 
  onClose, 
  success, 
  message, 
  primaryColor 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 2,
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          py={3}
        >
          {success ? (
            <CheckCircleOutlineIcon
              sx={{ fontSize: 80, color: primaryColor, mb: 2 }}
            />
          ) : (
            <ErrorOutlineIcon
              sx={{ fontSize: 80, color: "error.main", mb: 2 }}
            />
          )}
          
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {success ? "Success!" : "Oops!"}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {message || 
              (success 
                ? "Your apartment listing has been submitted successfully." 
                : "There was an error submitting your listing. Please try again.")}
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: success ? primaryColor : "error.main",
            color: "#fff",
            borderRadius: 2,
            px: 4,
            "&:hover": {
              bgcolor: success ? "#009e75" : "error.dark",
            },
          }}
        >
          {success ? "Done" : "Try Again"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackModal;