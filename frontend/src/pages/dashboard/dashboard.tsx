import './dashboard.css';
import LeftSidebar from '../../components/left-side-bar/left-sidebar';
import Chat from '../../components/chat/chat';

const Dashboard = () => {
    console.log("Dashboard component rendered");
    return(
        <div className="animated-background">
        <div className='dashboard-container'>
            <LeftSidebar />
            <Chat></Chat>
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
