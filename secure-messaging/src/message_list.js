import React from "react";
import { motion } from "framer-motion";

const MessageList = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <motion.div
          key={index}
          className={`message-bubble ${message.sender === "You" ? "you" : "other"}`}
          initial={{ opacity: 0, x: message.sender === "You" ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <strong>{message.sender}:</strong> {message.text}
        </motion.div>
      ))}
    </div>
  );
};

export default MessageList;
