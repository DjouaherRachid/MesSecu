import React, { useState } from "react";
//import Login from "./login";
import ChatRoom from "../components/chat/chatroom";
import '../styles/App.css';

function App() {
  const [token, setToken] = useState(null);

//  if (!token) {
//    return <Login onLoginSuccess={setToken} />;
//  }

  return <ChatRoom />;
}

export default App;
