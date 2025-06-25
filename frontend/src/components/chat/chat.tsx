import InputBar from '../inputbar/inputbar';
import './chat.css'; 
export default function Chat() {
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-info">
          <img src="https://via.placeholder.com/40" alt="Conversation" className="chat-avatar" />
          <span className="chat-name">Nom de la conversation</span>
        </div>
        <button className="chat-settings">
          ⚙️
        </button>
      </div>

      <div className="chat-messages">
        <div className="message received">Salut, comment ça va ?</div>
        <div className="message sent">Très bien et toi ?</div>
        <div className="message received">Je vais bien, merci !</div>
      </div>

      <div className="chat-input">
        <InputBar></InputBar>
      </div>
    </div>
  );
}
