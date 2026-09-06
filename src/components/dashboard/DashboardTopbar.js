import React from 'react';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { useAuth } from '../../context/AuthContext';

import './DashboardTopbar.css';

function DashboardTopbar({ title, subtitle }) {

  const { user } = useAuth();

  return (

    <header className="dashboard-topbar">

      {/* PAGE TITLE */}

      <div className="dashboard-topbar-title">

        <h1>
          {title}
        </h1>

        <p>
          {subtitle}
        </p>

      </div>


      {/* RIGHT SIDE */}

      <div className="dashboard-topbar-actions">


        <button className="notification-button">

          <NotificationsNoneIcon />

          <span className="notification-dot"></span>

        </button>


        <div className="topbar-profile">

          <div className="topbar-avatar">

            {(user?.first_name || 'U')
              .charAt(0)
              .toUpperCase()}

          </div>


          <div className="topbar-profile-info">

            <strong>
              {user?.first_name || 'Guest'}
            </strong>

            <span>
              {user?.email}
            </span>

          </div>


          <KeyboardArrowDownIcon />

        </div>

      </div>

    </header>

  );
}

export default DashboardTopbar;