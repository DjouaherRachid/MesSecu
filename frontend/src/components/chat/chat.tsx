import { useEffect, useState } from 'react';
import InputBar from '../inputbar/inputbar';
import './chat.css';
import MessageBubble from '../message-bubble/message-bubble';
import { fetchMessages } from '../../api/messages';
import Cookies from 'js-cookie';
import { Conversation } from '../../types/conversation';
import { useSocket } from '../../context/socket-context';
import { Message } from '../../types/message';

type ChatProps = {
  conversation: Conversation;
};


export default function Chat({ conversation }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = parseInt(Cookies.get('userId') as string, 10); 
  const socket = useSocket();

    useEffect(() => {
      const loadMessages = async () => {
        try {
          const data = await fetchMessages(Number(conversation.id));
          setMessages(data);
        } finally {
          setLoading(false);
        }
      };

      if (conversation.id) {
        loadMessages();
      }
    }, [conversation.id]);

  useEffect(() => {
    if (!socket) return;

    // Nouveau message reçu
    const handleNewMessage = (data: { conversationId: number; message: Message }) => {
      if (data.conversationId === conversation.id) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    // Un message a été lu
    const handleMessageRead = (data: {
      conversationId: number;
      messageId: number;
      readerId: number;
      readerName: string;
      readAt: string;
    }) => {
      if (data.conversationId !== conversation.id) return;
      
      setMessages(prev =>
        prev.map(msg =>
          msg.message_id === data.messageId ? { ...msg, seen: true, reads : [...msg.reads, { user_id: data.readerId, username: data.readerName, read_at: data.readAt } ] } : msg
        )
      );
      };

    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);

    // Nettoyage
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
    };
  }, [socket, conversation.id]);

  const usernames  = conversation.other_users ? [conversation.other_users] : []
  const displayName = conversation.name || usernames.map((u) => u.username).join(', ');

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-info">
          <img src="https://via.placeholder.com/40" alt="Conversation" className="chat-avatar" />
          <span className="chat-name">{displayName}</span>
        </div>
        <button className="chat-settings">⚙️</button>
      </div>

      <div className="chat-messages">
        {loading && <p>Chargement...</p>}
        {error && <p className="error">{error}</p>}
        
        {!loading && !error && messages.map((msg) => (
          console.log('Message:', msg.reads?.some(r => r.user_id !== msg.sender.user_id)),
          <MessageBubble
            key={msg.message_id}
            messageId={msg.message_id}
            conversationId={conversation.id}
            content={msg.content}
            senderName={msg.sender.name}
            senderAvatar={msg.sender.avatar || 'https://via.placeholder.com/40'}
            time={new Date(msg.created_at).toLocaleTimeString()}
            seen={msg.reads?.some(r => r.user_id !== msg.sender.user_id)}
            reads={msg.reads || []}
            isSent={msg.sender.user_id === userId}           />
        ))}
      </div>

      <div className="chat-input">
        <InputBar conversationId={conversation.id}/>
      </div>
    </div>
  );
}