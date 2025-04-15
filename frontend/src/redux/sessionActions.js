import axios from '../axiosConfig';
import { loginSuccess } from './userSlice';

export const checkSession = () => async (dispatch) => {
  try {
    // Get the latest user data from the server
    const res = await axios.get('/user/session');
    const user = res.data.user;
    
    if (user) {
      // For broker users, fetch the latest broker-specific data
      if (user.type === 'broker') {
        try {
          // Make a specific API call to get broker data with approval status
          const brokerRes = await axios.get('/broker/me', {
            withCredentials: true
          });
          
          // Combine the broker-specific data with the user data
          const updatedUser = {
            ...user,
            ...brokerRes.data // This should include the isApproved status
          };
          
          // Dispatch the combined user data
          dispatch(loginSuccess(updatedUser));
        } catch (brokerErr) {
          console.error('Error fetching broker data:', brokerErr);
          // Still dispatch the basic user data if broker data fetch fails
          dispatch(loginSuccess(user));
        }
      } else {
        // For non-broker users, just dispatch the regular user data
        dispatch(loginSuccess(user));
      }
    }
  } catch (err) {
    console.log('No active session.');
  }
};