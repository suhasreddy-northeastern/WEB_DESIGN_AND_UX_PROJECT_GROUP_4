import React from "react";
import {
  Typography,
  Box,
  Alert,
  Button,
  CircularProgress,
  IconButton,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";

const UploadButton = styled(Button)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  borderRadius: 8,
  border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    borderColor: theme.palette.primary.main,
  },
  marginBottom: theme.spacing(3)
}));

const Input = styled('input')({
  display: 'none',
});

const ImageGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const ImageItem = styled(Paper)(({ theme }) => ({
  position: 'relative',
  borderRadius: 8,
  overflow: 'hidden',
  aspectRatio: '1/1',
  '&:hover .delete-button': {
    opacity: 1,
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  padding: 4,
  opacity: 0,
  transition: 'opacity 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 4,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  borderRadius: 2,
  overflow: 'hidden',
  marginTop: theme.spacing(1),
}));

const ProgressIndicator = styled(Box)(({ progress, theme }) => ({
  width: `${progress}%`,
  height: '100%',
  backgroundColor: theme.palette.primary.main,
  transition: 'width 0.3s ease-in-out',
}));

const ImageUploadSection = ({
  formData,
  handleFileChange,
  uploadProgress,
  uploadStatus,
  isDarkMode,
  primaryColor,
  handleRemoveImage
}) => {
  const fileInputRef = React.useRef(null);

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <Box mt={4}>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        gutterBottom
        color="text.primary"
      >
        <PhotoCameraIcon sx={{ mr: 1 }} /> Upload Apartment Images
      </Typography>
      
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        id="apartment-image-upload"
      />
      
      <UploadButton
        fullWidth
        onClick={triggerFileInput}
        disabled={uploadProgress > 0 && uploadProgress < 100}
      >
        <CloudUploadIcon sx={{ fontSize: 40, mb: 1, color: primaryColor }} />
        <Typography variant="body1" fontWeight={500}>
          {uploadProgress > 0 && uploadProgress < 100 
            ? "Uploading..." 
            : "Click or drag to upload images"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Supported formats: JPG, PNG, WEBP
        </Typography>
      </UploadButton>
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box sx={{ width: '100%', mt: 1, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Uploading: {uploadProgress}%
          </Typography>
          <ProgressBar>
            <ProgressIndicator progress={uploadProgress} />
          </ProgressBar>
        </Box>
      )}
      
      {uploadStatus === 'success' && (
        <Alert severity="success" sx={{ mt: 2, mb: 3 }}>
          Images uploaded successfully
        </Alert>
      )}
      
      {uploadStatus === 'error' && (
        <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
          Failed to upload images. Please try again.
        </Alert>
      )}
      
      {formData.imageUrls.length > 0 && (
        <>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            gutterBottom
            sx={{ mt: 2 }}
          >
            {formData.imageUrls.length} {formData.imageUrls.length === 1 ? 'image' : 'images'} uploaded
          </Typography>
          
          <ImageGrid>
            {formData.imageUrls.map((url, index) => (
              <ImageItem key={index} elevation={2}>
                <Box
                  component="img"
                  src={url}
                  alt={`Apartment ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    console.error(`Error loading image: ${url}`);
                    e.target.src = "https://placehold.co/100x100?text=Error";
                  }}
                />
                <DeleteButton 
                  className="delete-button"
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                >
                  <DeleteIcon fontSize="small" />
                </DeleteButton>
              </ImageItem>
            ))}
          </ImageGrid>
        </>
      )}
    </Box>
  );
};

export default ImageUploadSection;