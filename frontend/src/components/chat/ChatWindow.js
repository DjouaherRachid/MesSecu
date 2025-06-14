import React, { useState } from 'react';
import { useMessages } from '../../hooks/useMessages';

const ChatWindow = ({ conversationId, currentUser }) => {
  const { messages, send } = useMessages(conversationId);
  const [messageText, setMessageText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    await send({
      conversation_id: conversationId,
      sender_id: currentUser.user_id,
      content: messageText,
    });

    setMessageText('');
  };

  return (
    <div className="flex flex-col h-full border rounded-lg shadow-md p-4 bg-white">
      {/* Header */}
      <div className="pb-2 border-b font-bold text-lg">
        Conversation #{conversationId}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto my-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.message_id}
            className={`p-2 rounded-lg max-w-[75%] ${
              msg.sender_id === currentUser.user_id
                ? 'ml-auto bg-blue-500 text-white'
                : 'mr-auto bg-gray-200 text-gray-900'
            }`}
          >
            <div className="text-sm">{msg.content}</div>
            <div className="text-xs text-right opacity-70">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex mt-auto gap-2">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Écris un message..."
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
