import './typing.css';

const Typing = (senderAvatar: string, senderName: string) => (
    <div>
    <div className="message-header">
        <div className="sender-info">
        {senderAvatar && (
              <img src={senderAvatar} alt={senderName} className="sender-avatar" />
        )}
            <span className="sender-name">{senderName}</span>
        </div>
    </div>
  <div className="typing">
    <div className="typing__dot"></div>
    <div className="typing__dot"></div>
    <div className="typing__dot"></div>
  </div>
  </div>
)
export default Typing;