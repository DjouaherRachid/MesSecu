import axios from 'axios';

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

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Session is invalid');
      alert('Session is invalid');
    }
    return Promise.reject(error);
  }
);

export default instance;