import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../axiosConfig";

// Async thunks for broker-related actions
export const fetchBrokerStatus = createAsyncThunk(
  "user/fetchBrokerStatus",
  async (_, { getState }) => {
    const { user } = getState().user;
    
    // Only proceed if the user is a broker
    if (user && user.type === "broker") {
      const response = await axios.get("/broker/me", {
        withCredentials: true,
      });
      return response.data;
    }
    return null;
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  statusLoading: false,
  statusError: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.statusLoading = false;
      state.statusError = null;
    },
    updateUser: (state, action) => {
      // Update specific user properties
      state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrokerStatus.pending, (state) => {
        state.statusLoading = true;
      })
      .addCase(fetchBrokerStatus.fulfilled, (state, action) => {
        if (action.payload) {
          // Update the broker status fields in the user object
          state.user = { 
            ...state.user, 
            isApproved: action.payload.isApproved,
            // Include any other broker-specific fields
          };
        }
        state.statusLoading = false;
      })
      .addCase(fetchBrokerStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError = action.error.message;
      });
  },
});

export const { loginSuccess, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;