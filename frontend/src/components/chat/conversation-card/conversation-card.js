import "./conversation-card.css"; 

const ConversationCard = ({ avatar, username, time, lastMessage, isSeen }) => {
  return (
    <div className="conversation">
      <img src={avatar} alt={`${username} avatar`} className="avatar" />
      <div className="conversation-content">
        <div className="top-row">
          <span className="username">{username}</span>
          <span className="time">{time}</span>
        </div>
        <div className="bottom-row">
          <span className="last-message">{lastMessage}</span>
          <span className={`seen-check ${isSeen ? "seen" : ""}`}>
            {isSeen ? "✓✓" : "✓"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConversationCard;
