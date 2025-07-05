import React, { useEffect, useMemo, useState } from 'react';
import './left-sidebar.css';
import SearchBar from '../searchbar/searchbar';
import ConversationCard from '../conversation-card/conversation-card';
import { fetchMyConversations } from '../../api/conversations';
import { Conversation, EncryptedConversation } from '../../types/conversation';
import { useSocket } from '../../context/socket-context';
import { decryptWithAesGcm, generateAndStoreAesKey, getOrFetchAesKey, getStoredAesKey } from '../../utils/AES-GSM/aes';
import { logoutUser } from '../../api/auth';
import { useNavigate } from 'react-router-dom';
import { exportKeyPairToJson, saveKeyPairAsFile } from '../../utils/AES-GSM/key-export-import';
import Cookies from 'js-cookie';
import { fetchRsaPublicKey } from '../../api/rsa-key';
import { importPrivateKey, importPublicKey } from '../../utils/AES-GSM/rsa';

type LeftSidebarProps = {
  setConversation: (conv: Conversation) => void;
  addButtonAction?: () => void;
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ setConversation, addButtonAction }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const socket = useSocket();
  const navigate = useNavigate();

  const filteredConversations = useMemo(() => {
    const lower = searchTerm;

    return conversations.filter(conv => {
      const nameMatch = conv.name?.toLowerCase().includes(lower);
      const otherUsersMatch = Array.isArray(conv.other_users)
        ? conv.other_users.some(u => u.username.toLowerCase().includes(lower))
        : conv.other_users?.username.toLowerCase().includes(lower);

      return nameMatch || otherUsersMatch;
    });
  }, [conversations, searchTerm]);

    const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const dateA = a.last_message && a.last_message.message_id !== 0
        ? new Date(a.last_message.created_at).getTime()
        : new Date(a.updated_at).getTime();

      const dateB = b.last_message && b.last_message.message_id !== 0
        ? new Date(b.last_message.created_at).getTime()
        : new Date(b.updated_at).getTime();

      return dateB - dateA; // tri décroissant
    });
  }, [conversations, searchTerm]);

  useEffect(() => {
    if (!socket) return;

    const loadConversations = async () => {
      try {
        const [allConvs] = await Promise.all([
          fetchMyConversations(),
        ]) as [EncryptedConversation[]];

        const decryptedConvs = await Promise.all(
          allConvs.map(async (conv) => {
            const lastMessage = conv.last_message;

            if (lastMessage && lastMessage.content) {
              try {
              const aesKey = await getOrFetchAesKey(conv.id, lastMessage.sender_id);

                const decryptedContent = await decryptWithAesGcm(lastMessage.content, aesKey);

                return {
                  ...conv,
                  last_message: {
                    ...lastMessage,
                    content: decryptedContent,
                    sender_name: lastMessage.sender_name || 'Inconnu',
                  },
                };
              } catch (err) {
                console.error(`[loadConversations] Erreur lors du déchiffrement du message ${lastMessage.message_id}:`, err);
                return conv;
              }
            }

            return conv;
          })
        );

        decryptedConvs.forEach((conv) => {
          socket.emit('join_conversation', { conversationId: conv.id });
        });

        setConversations(decryptedConvs as Conversation[]);
      } catch (err: any) {
        setError(err?.message || 'Erreur inconnue lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    const handleNewMessage = async (payload: any) => {
      if (payload?.conversationId && payload.message) {
        try {
          const aesKey = await getOrFetchAesKey(payload.conversationId, payload.message.sender.user_id);

          const decryptedContent = await decryptWithAesGcm(payload.message.content, aesKey);

          const newLastMessage = {
            ...payload.message,
            content: decryptedContent,
            sender_name: payload.message.sender?.name || 'Inconnu',
            signal_type: 1,
          };

          setConversations(prev =>
            prev.map(conv =>
              conv.id === payload.conversationId
                ? { ...conv, last_message: newLastMessage }
                : conv
            )
          );
        } catch (err) {
          console.error('[handleNewMessage] Erreur lors du déchiffrement du message :', err);
        }
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
    };

    const handleNewConversation = (payload: { conversation: Conversation }) => {
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

  async function importKeyPairAsFile() {
    try {
      const userId = parseInt(Cookies.get('userId') || '0', 10);
      const { rsa_public_key } = await fetchRsaPublicKey(userId);
      const publicKey= rsa_public_key;
      const privateKey = localStorage.getItem(`privateKey_${userId}`);

      saveKeyPairAsFile({privateKey :privateKey as string, publicKey : publicKey},);


    } catch (error) {
      console.error('Erreur lors de la récupération des clés RSA :', error);
    }
  }

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

      <SearchBar onSearch={setSearchTerm} />

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

      <div className="sidebar-footer">
        <button
          type="button"
          className="download-button"
          onClick={() => {
            importKeyPairAsFile();
          }}
        >
          <span>Télécharger les clés</span>
        </button>

        <button
          type="button"
          className="delete-button"
          onClick={() => {
          if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
            logoutUser();
            navigate('/signin', { replace: true });
            }
          }}
        >
          <span>Déconnexion</span>
        </button>
      </div>

    </div>
  );
};

export default LeftSidebar;
