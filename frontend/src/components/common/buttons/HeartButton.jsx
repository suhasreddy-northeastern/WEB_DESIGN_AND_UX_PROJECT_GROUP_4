import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

const HeartButton = ({ isSaved, onClick }) => {
  return (
    <Tooltip title={isSaved ? "Unsave" : "Save"}>
      <IconButton
        onClick={onClick}
        sx={{
          color: isSaved ? "#EF4444" : "#9CA3AF",
          transition: "color 0.2s ease",
        }}
      >
        {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default HeartButton;
