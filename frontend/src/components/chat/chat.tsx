import { useEffect, useState } from 'react';
import InputBar from '../inputbar/inputbar';
import './chat.css';
import MessageBubble from './message-bubble/message-bubble';
import { fetchMessages } from '../../api/messages';
import Cookies from 'js-cookie';
import { Conversation } from '../../types/conversation';
import { useSocket } from '../../context/socket-context';
import { Message, NewMessagePayload } from '../../types/message';
import  Typing  from './typing/typing';
import { decryptAndNormalizeAesMessage } from './aes';
import { getOrFetchAesKey } from '../../utils/AES-GSM/aes';

type ChatProps = {
  conversation: Conversation;
};

export default function Chat({ conversation }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = parseInt(Cookies.get('userId') as string, 10); 
  const socket = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<{ name: string; avatar: string } | null>(null);
  const usernames  = conversation.other_users ? [conversation.other_users] : []
  const displayName = conversation.name || usernames.map((u) => u.username).join(', ');
  const otherUsers = Array.isArray(conversation.other_users)
  ? conversation.other_users
  : [conversation.other_users]; 

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const aesKey = await getOrFetchAesKey(conversation.id, userId);

        const rawMessages = await fetchMessages(Number(conversation.id));

        setMessages(rawMessages);
        
        // Transforme et déchiffre chaque message
        const decryptedMessages = await Promise.all(
          rawMessages.map((message: Message) => 
            decryptAndNormalizeAesMessage({
              conversationId: conversation.id.toString(),
              signal_type: Number(message.signal_type),
              message,
            })
          )
        );

        setMessages(decryptedMessages);
      } catch (error) {
        console.error("[loadMessages] Échec du déchiffrement des messages :", error);
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
  const handleNewMessage = async (data: any) => {
    // if (data.conversationId !== conversation.id.toString()) return;

    const message = data.message;

    try {
      const decryptedMessage = await decryptAndNormalizeAesMessage({
              conversationId: data.conversationId.toString(),
              signal_type: 1,
              message,
            })
      setMessages(prev => [...prev, decryptedMessage]);
    } catch (err) {
      console.error('[handleNewMessage] Échec du déchiffrement :', err);
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
    
    const handleUserTyping = (data: { userId: number; conversationId: number }) => {
      if (data.conversationId === conversation.id) {
        setIsTyping(true);
      }
      const user = otherUsers.find(u => u.user_id === data.userId);
      if (user) {
        setTypingUser({ name: user.username, avatar: user.avatar_url });
      }

    };

    const handleUserStoppingTyping = (data: { conversationId: number }) => {
      if (data.conversationId === conversation.id) {
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStoppingTyping);

    // Nettoyage
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStoppingTyping);
    };
  }, [socket, conversation.id]);

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
              { isTyping ? Typing(typingUser?.avatar || 'https://via.placeholder.com/40', typingUser?.name || 'Typing...') : null }
      </div>
      <div className="chat-input">
        <InputBar conversationId={conversation.id} otherUsers={otherUsers}/>
      </div>
    </div>
  );
}