import React, { useState, useRef, useEffect } from 'react';
import './inputbar.css';
import { useSocket } from '../../context/socket-context';
import {  encryptMessageForRecipient } from '../../utils/signal/encryption';
import { decryptWithAesGcm, encryptWithAesGcm, getOrFetchAesKey } from '../../utils/AES-GSM/aes';
import Cookies from 'js-cookie';


interface InputBarProps {
  onInput?: (query: string) => void;
  conversationId: number;
  otherUsers: {user_id: number, username: string, avatar_url: string,}[] | [];
}

const InputBar: React.FC<InputBarProps> = ({ onInput, conversationId, otherUsers }) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const socket = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   const trimmed = query.trim();

  //   if (!trimmed || !socket || !otherUsers.length) return;
  //   try {
  //     for (const user of otherUsers) {
  //       const encryptedPayload = await encryptMessageForRecipient(user.user_id, trimmed);
        
  //       socket.emit('send_message', {
  //         conversationId,
  //         ...encryptedPayload,
  //       });
  //     }

  //     setQuery('');
  //   } catch (error) {
  //     console.error("Erreur lors du chiffrement ou de l'envoi :", error);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (!trimmed || !socket || !otherUsers.length) return;

    try {
      const userId = parseInt(Cookies.get('userId') as string);
      // 1. Récupération de la clé AES de la conversation (depuis cache local ou génération)
      const aesKey = await getOrFetchAesKey(conversationId, userId);

      // 2. Chiffrement du message avec AES-GCM
      const encryptedContent = await encryptWithAesGcm(trimmed, aesKey);
    
      // 4. Envoi du message chiffré via socket
      socket.emit("send_message", {
        conversationId,
        content: encryptedContent,
        signal_type: 1, // ou autre identifiant pour RSA-GCM
      });

      setQuery("");
    } catch (error) {
      console.error("Erreur lors du chiffrement ou de l'envoi :", error);
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const maxHeight = parseFloat(getComputedStyle(textarea).lineHeight) * 4 + 40;
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;

    // Émettre "typing" quand on commence à écrire
    if (!socket) return;
      socket.emit('user_typing', { conversationId :conversationId});

    // Clear et reset un timeout pour envoyer "stop_typing"
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user_stop_typing', { conversationId :conversationId});
    }, 2000); // 2 sec sans taper = arrêt de la saisie
  };

  useEffect(() => {
    handleInput();
  }, [query]);


    const onKeyPressHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
      e.preventDefault();
    }
  }

  return (
    <form className='input-form' onSubmit={handleSubmit}>
      <div className="fx fx-gap">
        <textarea
          ref={textareaRef}
          className='input-input'
          placeholder="Ecrivez votre message..."
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={onKeyPressHandler}
          rows={1}
        />
        <div 
        // id="input-icon"
        >
          <button type="submit" className='input-button'>
            <div id="input-icon-circle"></div>
            <span></span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default InputBar;
