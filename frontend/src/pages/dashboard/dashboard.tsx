import './dashboard.css';
import LeftSidebar from '../../components/left-side-bar/left-sidebar';
import Chat from '../../components/chat/chat';
import { use, useEffect, useState } from 'react';
import { Conversation } from '../../types/conversation';
import CreateConversationModal from '../../components/modals/create-conversation/create-conversation';

const Dashboard = () => {
    const [conversation, setConversation] = useState([] as unknown as Conversation);
    const [showCreateConversationModal, setShowCreateConversationModal] = useState(false);

    useEffect(() => {
        console.log('Conversation', conversation);
    }, [conversation]);

    return(
        <div className="animated-background">
        {showCreateConversationModal && <CreateConversationModal isOpen={showCreateConversationModal} onClose={function (): void {setShowCreateConversationModal(false) } }/>}
        <div className='dashboard-container'>
            <LeftSidebar setConversation={setConversation} addButtonAction={function (): void {setShowCreateConversationModal(true)}}/>
            <Chat conversation={conversation}/>
        </div>

        <div>
            <div className="wave"></div>
            <div className="wave"></div>
            <div className="wave"></div>
        </div>
        </div>
    );
};

export default Dashboard;
