import React, { useState } from "react";
//import Login from "./login";
import ChatRoom from "./chatroom";
import './App.css';

function App() {
  const [token, setToken] = useState(null);

//  if (!token) {
//    return <Login onLoginSuccess={setToken} />;
//  }

  return <ChatRoom />;
}

export default App;
