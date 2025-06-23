import './dashboard.css';
import LeftSidebar from '../../components/chat/left-side-bar/left-sidebar';

const Dashboard = () => {
    console.log("Dashboard component rendered");
    return(
        <div className="animated-background">
            <LeftSidebar />
            <div>
                    <div className="wave"></div>
                    <div className="wave"></div>
                    <div className="wave"></div>
            </div>
        <div className='center-container'>
          </div>
        </div>
    );
};

export default Dashboard;
