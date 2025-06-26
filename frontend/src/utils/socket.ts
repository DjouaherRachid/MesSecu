import { io } from 'socket.io-client';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://localhost:8000';
export const socket = io(backendUrl, {
  withCredentials: true,
  transports: ['websocket'], 
});
