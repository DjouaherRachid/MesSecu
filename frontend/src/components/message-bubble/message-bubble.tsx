import React, { useRef, useState } from 'react';
import './message-bubble.css';
import SeenInfoPopup from '../seen-info-popup/seen-info-popup';
import { MessageRead } from '../../types/message';

interface MessageBubbleProps {
  content: string;
  senderName?: string;
  senderAvatar?: string;
  time: string;
  reads?: MessageRead[];
  seen?: boolean;
  isSent: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  senderName,
  senderAvatar,
  time,
  seen,
  reads = [],
  isSent,
}) => {
  console.log(` message : ${content} reads ?`, reads);
  const [showPopup, setShowPopup] = useState(false);
  const ref = useRef(null);
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
          className="message-seen text-sm text-gray-500 cursor-pointer"
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
