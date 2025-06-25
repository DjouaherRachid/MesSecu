import './conversation-card.css';

interface ConversationCardProps {
  picture?: string | null; 
  name?: string | null; 
  usernames: { username: string; avatar_url: string }[]; 
  senderName: string;
  updatedAt: string;
  lastMessage: string;
  isSeen: boolean;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  picture,
  name,
  senderName,
  usernames,
  updatedAt,
  lastMessage,
  isSeen,
}) => {
  const fallbackAvatar = usernames[0]?.avatar_url || '';
  const displayName = name || usernames.map(u => u.username).join(', ');

  return (
    <div className="conversation">
      <img
        src={picture || fallbackAvatar}
        alt={`${displayName} avatar`}
        className="avatar"
      />
      <div className="conversation-content">
        <div className="top-row">
          <span className="username">{displayName}</span>
          <span className="time">{updatedAt}</span>
        </div>
        <div className="bottom-row">
          <span className="last-message">{senderName} : {lastMessage}</span>
          <span className={`seen-check ${isSeen ? 'seen' : ''}`}>
            {isSeen ? '✓✓' : '✓'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;