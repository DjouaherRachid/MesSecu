import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (event, emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleSend = () => {
    onSendMessage(text);
    setText("");
  };

  return (
    <div className="message-input">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={() => setShowEmojiPicker((prev) => !prev)}>😊</button>
      {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;
