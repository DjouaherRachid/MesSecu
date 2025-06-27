import React, { useEffect, useRef, useState } from 'react';
import './message-bubble.css';
import SeenInfoPopup from '../seen-info-popup/seen-info-popup';
import { MessageRead } from '../../types/message';
import { useSocket } from '../../context/socket-context';
import Cookies from 'js-cookie';

interface MessageBubbleProps {
  messageId: number;
  conversationId?: number;
  content: string;
  senderName?: string;
  senderAvatar?: string;
  time: string;
  reads?: MessageRead[];
  seen?: boolean;
  isSent: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  conversationId,
  messageId,
  content,
  senderName,
  senderAvatar,
  time,
  seen,
  reads = [],
  isSent,
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const ref = useRef(null);
  const [hasSentRead, setHasSentRead] = useState(false);
  const socket = useSocket();
  const userId = Cookies.get('userId') ? parseInt(Cookies.get('userId') as string, 10) : null;

    useEffect(() => {
    if (!ref.current || hasSentRead) return;

      // Vérifier que l'utilisateur n'a pas déjà "vu" ce message
      const userHasRead = reads.some(r => r.user_id === userId);
      if (userHasRead) return; 

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (isSent) return; // Optionnel : ne pas marquer comme lu ses propres messages
          if (!socket) return;
          socket.emit('message_read', {
            conversationId,
            messageId : messageId,
            readerId: Cookies.get('userId') ? parseInt(Cookies.get('userId') as string, 10) : null,
          });
          setHasSentRead(true);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, hasSentRead, messageId, userId, socket, isSent]);

  return (
    <div className={`message ${isSent ? 'sent' : 'received'}`}>
      {!isSent && (
        <div className="message-header">
          <div className="sender-info">
            {senderAvatar && (
              <img src={senderAvatar} alt={senderName} className="sender-avatar" />
            )}
            <span className="sender-name">{senderName}</span>
          </div>
          <span className="message-time">{time}</span>
        </div>
      )}

      <div className="message-content">{content}</div>

      <div className="message-footer">
        {isSent && <span className="message-time">{time}</span>}
        <div className="relative inline-block" ref={ref}>
        <span
          className="message-seen"
          onMouseEnter={() => setShowPopup(true)}
        >
          {seen ? '✔ Vu' : ''}
        </span>
        </div>


        {showPopup && reads.length > 0 && <SeenInfoPopup reads={reads} setShowPopup={setShowPopup} />}
      </div>
    </div>
  );
};

export default MessageBubble;
