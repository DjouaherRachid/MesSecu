// import { useEffect, useState } from 'react';
// import { fetchMessages, sendMessage } from '../api/messages';
// import socket from '../api/socket';

// export const useMessages = (conversationId) => {
//   const [messages, setMessages] = useState([]);

//   useEffect(() => {
//     if (!conversationId) return;

//     // Charger les messages existants
//     fetchMessages(conversationId).then(setMessages);

//     // Rejoindre la conversation (room)
//     socket.emit('joinConversation', conversationId);

//     // Écouter les nouveaux messages
//     socket.on('newMessage', (message) => {
//       if (message.conversation_id === conversationId) {
//         setMessages((prev) => [...prev, message]);
//       }
//     });

//     return () => {
//       socket.emit('leaveConversation', conversationId);
//       socket.off('newMessage');
//     };
//   }, [conversationId]);

//   const send = async (message) => {
//     const newMessage = await sendMessage(message);
//     // On n’ajoute pas localement ici, car on recevra le message via le socket
//   };

//   return { messages, send };
// };
