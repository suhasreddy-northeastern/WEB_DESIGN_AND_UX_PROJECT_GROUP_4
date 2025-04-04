import React from "react";
import { Modal, Box, Typography, Fade, Backdrop } from "@mui/material";

const SuccessModal = ({ open, message, subtext }) => {
  return (
    <Modal
      open={open}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            textAlign: "center",
            minWidth: 300,
          }}
        >
          <Typography variant="h6" fontWeight="600" mb={1}>
            {message || "Success"} 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtext || "You will be redirected shortly..."}
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SuccessModal;
