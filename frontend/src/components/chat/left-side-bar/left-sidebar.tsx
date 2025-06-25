import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './left-sidebar.css';
import SearchBar from '../../searchbar/searchbar';
import ConversationCard from '../conversation-card/conversation-card';
import { fetchMyConversations } from  '../../../api/conversations';
import { fetchFavoriteConversations } from '../../../api/conversation-participant'; 
import Cookies from 'js-cookie';

interface Conversation {
  id: number;
  name: string;
  picture?: string | null;
  updatedAt: string;
  other_users: {
    username: string;
    avatar_url: string;
  };
  last_message: {
    content: string;
    sender_name: string;
    seen: boolean;
    created_at: string;
  };
}

const LeftSidebar: React.FC = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [favorites, setFavorites] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = Cookies.get('userId') ? parseInt(Cookies.get('userId') as string, 10) : 0;

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const [allConvs, favoriteConvs] = await Promise.all([
          fetchMyConversations(),
          fetchFavoriteConversations()
        ]);

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
  }, []);

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
            usernames={conv.other_users ? [conv.other_users] : []}
            name={conv.name || ''}
            updatedAt={new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            lastMessage={conv.last_message.content}
            isSeen={conv.last_message.seen}
            senderName={conv.last_message.sender_name}
            // className={getActiveClass(`/conversations/${conv.id}`)}
          />
        ))}
      </ul>
      <h2>Contacts :</h2>
      <ul className="vertical ex">
        {conversations.map((conv) => (
          <ConversationCard
            key={conv.id}
            picture={conv.picture || ''}
            usernames={conv.other_users ? [conv.other_users] : []}
            name={conv.name || ''}
            updatedAt={new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            lastMessage={conv.last_message.content}
            senderName={conv.last_message.sender_name}
            isSeen={conv.last_message.seen}
            // className={getActiveClass(`/conversations/${conv.id}`)}
          />
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar;