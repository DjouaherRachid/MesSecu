import './dashboard.css';
import LeftSidebar from '../../components/left-side-bar/left-sidebar';
import Chat from '../../components/chat/chat';
import { use, useEffect, useState } from 'react';
import { Conversation } from '../../types/conversation';

const Dashboard = () => {
    const [conversation, setConversation] = useState([] as unknown as Conversation);

    useEffect(() => {
        console.log('Conversation', conversation);
    }, [conversation]);

    return(
        <div className="animated-background">
        <div className='dashboard-container'>
            <LeftSidebar setConversation={setConversation} />
            <Chat conversation={conversation} />
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
