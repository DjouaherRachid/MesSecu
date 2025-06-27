import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './left-sidebar.css';
import SearchBar from '../searchbar/searchbar';
import ConversationCard from '../conversation-card/conversation-card';
import { fetchMyConversations } from  '../../api/conversations';
import { fetchFavoriteConversations } from '../../api/conversation-participant'; 
import Cookies from 'js-cookie';
import { Conversation } from '../../types/conversation';
import { useSocket } from '../../context/socket-context';

type LeftSidebarProps = {
  setConversation: (conv: Conversation) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ setConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [favorites, setFavorites] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const [allConvs, favoriteConvs] = await Promise.all([
          fetchMyConversations(),
          fetchFavoriteConversations()
        ]);

        // Rejoindre toutes les rooms associées aux conversations
        if (socket && allConvs) {
          (allConvs as Conversation[]).forEach((conv: Conversation) => {
            socket.emit('join_conversation', { conversationId: conv.id });
            console.log(`Socket joined room conversation_${conv.id}`);
          });
        }

        setConversations(allConvs as Conversation[]);
        setFavorites(favoriteConvs as Conversation[]);
        console.log('Conversations:', allConvs);
        console.log('Favorite Conversations:', favoriteConvs);
      } catch (err: any) {
        // setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [socket]);

  // Écoute des nouveaux messages et mise à jour des conversations et favoris
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload : any) => {
      if (payload?.conversationId && payload.message) {
        const newLastMessage = {
          ...payload.message,
          sender_name: payload.message.sender?.name || 'Inconnu', 
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === payload.conversationId
              ? {
                  ...conv,
                  last_message: newLastMessage,
                }
              : conv
          )
        );

        setFavorites((prev) =>
          prev.map((conv) =>
            conv.id === payload.conversationId
              ? {
                  ...conv,
                  last_message: newLastMessage,
                }
              : conv
          )
        );
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket]);

useEffect(() => {
  if (!socket) return;

  const handleMessageRead = ({ conversationId, messageId } : { conversationId: number; messageId: number }) => {
    if (!conversationId || !messageId) {
      console.warn('[message_read] Paramètres manquants:', { conversationId, messageId });
      return;
    }    console.log(`Message ${messageId} lu dans la conversation ${conversationId}`);
    
    setConversations(prevConvs =>
      prevConvs.map(conv =>
        ((conv.id === conversationId) && (messageId === conv.last_message.message_id))
          ? { 
              ...conv, 
              last_message: {
                ...conv.last_message,
                seen: true
              }
            }
          : conv
      )
    );

    setFavorites(prevConvs =>
      prevConvs.map(conv =>
        ((conv.id === conversationId) && (messageId === conv.last_message.message_id))
          ? { 
              ...conv, 
              last_message: {
                ...conv.last_message,
                seen: true
              }
            }
          : conv
      )
    );
  };

    socket.on('message_read', handleMessageRead);

    return () => {
      socket.off('message_read', handleMessageRead);
    };
  }, [socket]);

  if (loading) return <div>Chargement des conversations...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="left-sidebar">
      <div className="sidebar-header">
        <h1>Chats</h1>
        <div id="add-icon">
          <button type="submit" className="add-button">
            <span>+</span>
          </button>
        </div>
      </div>
      <SearchBar onSearch={() => {}} />
      <h2>Favoris :</h2>
      <ul className="vertical ex">
        {favorites.map((conv) => (
          <ConversationCard
            key={conv.id}
            picture={conv.picture || ''}
            usernames={
              conv.other_users
                ? [conv.other_users]
                : [{ username: 'moi', avatar_url: '' }]
            }
            name={conv.name || ''}
            updatedAt={new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            lastMessage={conv.last_message.content}
            isSeen={conv.last_message.seen}
            senderName={conv.last_message.sender_name}
            onClick={() => setConversation(conv)}
          />
        ))}
      </ul>
      <h2>Conversations :</h2>
      <ul className="vertical ex">
        {conversations.map((conv) => (
          <ConversationCard
            key={conv.id}
            picture={conv.picture || ''}
            usernames={
              conv.other_users
                ? [conv.other_users]
                : [{ username: 'moi', avatar_url: '' }]
            }
            name={
              conv.name || 
              (Array.isArray(conv.other_users) 
                ? conv.other_users.map(u => u.username).join(', ') 
                : (conv.other_users?.username || '')
              )
            }
            updatedAt={new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            lastMessage={conv.last_message.content}
            senderName={conv.last_message.sender_name}
            isSeen={conv.last_message.seen}
            onClick={() => setConversation(conv)}
          />
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar;
