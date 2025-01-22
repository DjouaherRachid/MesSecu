import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // Remplacez par votre backend
  headers: { "Content-Type": "application/json" },
});

export default api;
