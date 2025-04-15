import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL;

const instance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

export default instance;
