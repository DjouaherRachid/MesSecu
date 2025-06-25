import React from 'react';
import './message-bubble.css';

interface MessageBubbleProps {
  content: string;
  senderName?: string;
  senderAvatar?: string;
  time: string;
  seen?: boolean;
  isSent: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  senderName,
  senderAvatar,
  time,
  seen,
  isSent,
}) => {
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
        {!isSent && <span className="message-seen">{seen ? '✔ Vu' : ''}</span>}
      </div>
    </div>
  );
};

export default MessageBubble;
