import React, { useEffect, useState } from 'react';
import './dashboard.css';
import instance from '../../utils/config';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../components/chat/left-side-bar/left-sidebar.js';

const Dashboard = () => {

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
