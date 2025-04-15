import React from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Box,
  CircularProgress,
  useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

const ProfileEditForm = ({
  profileData,
  errors,
  handleProfileChange,
  handleProfileSubmit,
  updating,
  isDarkMode,
}) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        backgroundColor: isDarkMode
          ? "rgba(255, 255, 255, 0.05)"
          : "#fff",
        border: isDarkMode
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "none",
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        color="text.primary"
      >
        Edit Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Update your profile information below
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box component="form" onSubmit={handleProfileSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Full Name"
              name="fullName"
              value={profileData.fullName}
              onChange={handleProfileChange}
              fullWidth
              required
              error={!!errors.fullName}
              helperText={errors.fullName}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(0, 0, 0, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: primaryColor,
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Email Address"
              name="email"
              value={profileData.email}
              fullWidth
              disabled
              variant="outlined"
              helperText="Email address cannot be changed"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.1)",
                  },
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Bio"
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Tell us a bit about yourself..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(0, 0, 0, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: primaryColor,
                  },
                },
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={updating}
            startIcon={
              updating ? <CircularProgress size={20} /> : <SaveIcon />
            }
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.2,
              bgcolor: primaryColor,
              "&:hover": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileEditForm;