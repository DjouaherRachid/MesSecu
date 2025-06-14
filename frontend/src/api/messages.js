import axios from 'axios';

const API_URL = 'http://localhost:3001/messages'; // adapte à ton backend

export const fetchMessages = async (conversationId) => {
  const res = await axios.get(`${API_URL}/conversation/${conversationId}`);
  return res.data;
};

export const sendMessage = async (message) => {
  const res = await axios.post(API_URL, message);
  return res.data;
};
