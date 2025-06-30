import React, { useEffect, useMemo, useState } from 'react';
import './left-sidebar.css';
import SearchBar from '../searchbar/searchbar';
import ConversationCard from '../conversation-card/conversation-card';
import { fetchMyConversations } from '../../api/conversations';
import { fetchFavoriteConversations } from '../../api/conversation-participant';
import { Conversation } from '../../types/conversation';
import { useSocket } from '../../context/socket-context';

type LeftSidebarProps = {
  setConversation: (conv: Conversation) => void;
  addButtonAction?: () => void;
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ setConversation, addButtonAction }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [favorites, setFavorites] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

    const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const dateA = a.last_message && a.last_message.message_id !== 0
        ? new Date(a.last_message.created_at).getTime()
        : new Date(a.updated_at).getTime();

      const dateB = b.last_message && b.last_message.message_id !== 0
        ? new Date(b.last_message.created_at).getTime()
        : new Date(b.updated_at).getTime();

      return dateB - dateA; // tri décroissant
    });
  }, [conversations]);

  useEffect(() => {
    if (!socket) return;

    const loadConversations = async () => {
      try {
        const [allConvs, favoriteConvs] = await Promise.all([
          fetchMyConversations(),
          fetchFavoriteConversations()
        ]) as [Conversation[], Conversation[]];

        // Joindre les rooms socket des conversations pour recevoir les événements en temps réel
        allConvs.forEach((conv) => {
          socket.emit('join_conversation', { conversationId: conv.id });
          console.log(`[Socket] Joined room conversation_${conv.id}`);
        });

        setConversations(allConvs);
        setFavorites(favoriteConvs);
      } catch (err: any) {
        setError(err?.message || 'Erreur inconnue lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    const handleNewMessage = (payload: any) => {
      console.log('[Socket] Nouveau message reçu:', payload.conversation);
      if (payload?.conversationId && payload.message) {
        const newLastMessage = {
          ...payload.message,
          sender_name: payload.message.sender?.name || 'Inconnu',
        };

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === payload.conversationId
              ? { ...conv, last_message: newLastMessage }
              : conv
          )
        );

        setFavorites((prev) =>
          prev.map((conv) =>
            conv.id === payload.conversationId
              ? { ...conv, last_message: newLastMessage }
              : conv
          )
        );
      }
    };

    const handleMessageRead = ({
      conversationId,
      messageId,
    }: {
      conversationId: number;
      messageId: number;
    }) => {
      if (!conversationId || !messageId) {
        console.warn('[message_read] Paramètres manquants:', {
          conversationId,
          messageId,
        });
        return;
      }
      console.log(`Message ${messageId} lu dans la conversation ${conversationId}`);

      const updateSeen = (convs: Conversation[]) =>
        convs.map((conv) =>
          conv.id === conversationId && conv.last_message?.message_id === messageId
            ? {
                ...conv,
                last_message: {
                  ...conv.last_message,
                  seen: true,
                },
              }
            : conv
        );

      setConversations((prev) => updateSeen(prev));
      setFavorites((prev) => updateSeen(prev));
    };

    const handleNewConversation = (payload: { conversation: Conversation }) => {
      console.log('[Socket] Nouvelle conversation reçue:', payload.conversation);
      setConversations((prev) => {
        if (prev.some((conv) => conv.id === payload.conversation.id)) return prev;
        return [payload.conversation, ...prev];
      });
      socket.emit('join_conversation', { conversationId: payload.conversation.id });
    };

    // Inscription aux événements socket
    socket.on('new_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);
    socket.on('new_conversation', handleNewConversation);

    // Chargement initial
    loadConversations();

    // Nettoyage des écouteurs à la désactivation du composant ou changement de socket
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
      socket.off('new_conversation', handleNewConversation);
    };
  }, [socket]);

  if (loading) return <div>Chargement des conversations...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="left-sidebar">
      <div className="sidebar-header">
        <h1>Chats</h1>
        <div id="add-icon">
          <button
            type="button"
            className="add-button"
            onClick={() => addButtonAction && addButtonAction()}
          >
            <span>+</span>
          </button>
        </div>
      </div>

      <SearchBar onSearch={() => {}} />

      {/* Favoris */}
      <ul className="vertical ex">
        {favorites.map((conv) => (
          <ConversationCard
            key={conv.id}
            picture={conv.picture || ''}
            usernames={
              conv.other_users
                ? Array.isArray(conv.other_users)
                  ? conv.other_users
                  : [conv.other_users]
                : [{ username: 'moi', avatar_url: '' }]
            }
            name={conv.name || ''}
            updatedAt={new Date(
              conv.last_message && conv.last_message.message_id !== 0
                ? conv.last_message.created_at
                : conv.updated_at
            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            lastMessage={conv.last_message?.content || ''}
            isSeen={conv.last_message?.seen}
            senderName={conv.last_message?.sender_name}
            onClick={() => setConversation(conv)}
          />
        ))}
      </ul>

      <h2>Conversations :</h2>
      <ul className="vertical ex">
        {sortedConversations.map((conv) => (
          <ConversationCard
            key={conv.id}
            picture={conv.picture || ''}
            usernames={
              conv.other_users
                ? Array.isArray(conv.other_users)
                  ? conv.other_users
                  : [conv.other_users]
                : [{ username: 'moi', avatar_url: '' }]
            }
            name={
              conv.name ||
              (Array.isArray(conv.other_users)
                ? conv.other_users.map((u) => u.username).join(', ')
                : conv.other_users?.username || '')
            }
            updatedAt={new Date(
              conv.last_message && conv.last_message.message_id !== 0
                ? conv.last_message.created_at
                : conv.updated_at
            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            lastMessage={conv.last_message?.content || ''}
            senderName={conv.last_message?.sender_name}
            isSeen={conv.last_message?.seen}
            onClick={() => setConversation(conv)}
          />
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar;
