import axios from '../axiosConfig';
import { loginSuccess } from './userSlice';


export const checkSession = () => async (dispatch) => {
  try {
    const res = await axios.get('/user/session');
    const user = res.data.user;
    if (user) {
      dispatch(loginSuccess(user));
    }
  } catch (err) {
    console.log('No active session.');
  }
};