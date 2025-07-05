import axios from 'axios';
import Cookies from 'js-cookie';
import { refreshAccessToken } from './auth';

const config = {
  backendUrl: process.env.REACT_APP_BACKEND_URL, // Default to localhost if not set
};

const instance = axios.create({
  baseURL: config.backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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

instance.interceptors.response.use(
  response => response,
  async error => {
    if (error.config?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Vérifie le code 401 et si on a déjà tenté une fois
    if (error.response?.status === 401 && !originalRequest._retry) {

      console.warn('[DEBUG] Token expiré, tentative de rafraîchissement');

      originalRequest._retry = true; // Marque cette requête comme réessayée

      try {
        const res = await refreshAccessToken();

        if (!res?.data?.accessToken) {
          throw new Error('Échec du rafraîchissement du token');
        }

        const newAccessToken = res.data.accessToken;

        // Met à jour le cookie
        const expirationDate = new Date(Date.now() + 15 * 60 * 1000);
        Cookies.set('accessToken', newAccessToken, {
          expires: expirationDate,
          secure: true,
          sameSite: 'Strict',
        });

        // Met à jour l'en-tête Authorization et rejoue la requête
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;