import io from "socket.io-client";

const socket = io("http://localhost:3000"); // URL du serveur

export default socket;
