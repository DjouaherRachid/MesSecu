import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './left-sidebar.css';
import SearchBar from '../../searchbar/searchbar';
import ConversationCard from '../conversation-card/conversation-card';
import { fetchMyConversations } from  '../../../api/conversations'
interface Conversation {
  id: number;
  updatedAt: string;
  otherUser: {
    username: string;
    avatarUrl: string;
  };
  lastMessage: {
    content: string;
    seen: boolean;
    createdAt: string;
  };
}

const LeftSidebar: React.FC = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getActiveClass = (path: string) => (location.pathname === path ? 'active' : '');

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await fetchMyConversations();
        setConversations(data as Conversation[]);
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue');
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
      </ul>
      <h2>Contacts :</h2>
      <ul className="vertical ex">
        {conversations.map((conv) => (
          <ConversationCard
            key={conv.id}
            avatar={conv.otherUser.avatarUrl}
            username={conv.otherUser.username}
            time={new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            lastMessage={conv.lastMessage.content}
            isSeen={conv.lastMessage.seen}
            // className={getActiveClass(`/conversations/${conv.id}`)}
          />
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar;