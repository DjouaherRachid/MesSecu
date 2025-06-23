import { useLocation } from 'react-router-dom';
import './left-sidebar.css';
import SearchBar from '../../searchbar/searchbar.js'
import ConversationCard from '../../chat/conversation-card/conversation-card.js';

const LeftSidebar = () => {
    const location = useLocation();
    const getActiveClass = (path) => location.pathname === path ? 'active' : '';

    return (
      <div className='left-sidebar'>
        <div className="sidebar-header">
          <h1>Chats</h1>
          <div id="add-icon">
            <button type="submit" className='add-button'>
              <span>+</span>
            </button>
          </div>
        </div>
        <SearchBar />
        <h2>Favoris :</h2>
        <ul className="vertical ex">
          <ConversationCard
            avatar="/images/emma.jpg"
            username="Emma Dupont"
            time="12:45"
            lastMessage="À tout à l'heure !"
            isSeen={true}
          />
        </ul>
        <h2>Contacts :</h2>
        <ul className="vertical ex">
        </ul>
      </div>
    );
};

export default LeftSidebar;