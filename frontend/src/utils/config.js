import axios from 'axios';
import Cookies from 'js-cookie';

const config = {
  backendUrl: process.env.REACT_APP_BACKEND_URL || 'https://localhost:8000', // Default to localhost if not set
};

  console.log('[DEBUG] Backend URL utilisée :', config.backendUrl);

const instance = axios.create({
  baseURL: config.backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  config => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default instance;