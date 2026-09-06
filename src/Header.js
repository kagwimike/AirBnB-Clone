
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AddHomeIcon from '@mui/icons-material/AddHome';

import Avatar from '@mui/material/Avatar';

import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // ================================
  // SEARCH
  // ================================

  const handleSearch = (event) => {
    event.preventDefault();

    const location = searchTerm.trim();

    if (!location) {
      navigate('/');
      return;
    }

    navigate(`/?location=${encodeURIComponent(location)}`);
    setSearchTerm('');
    setShowMenu(false);
  };

  // ================================
  // HOST ACTION
  // ================================

  const handleHostClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'HOST') {
      navigate('/host/dashboard');
    } else {
      navigate('/register');
    }

    setShowMenu(false);
  };

  // ================================
  // AVATAR MENU
  // ================================

  const handleAvatarClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setShowMenu((previous) => !previous);
  };

  // ================================
  // LOGOUT
  // ================================

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/');
  };

  // ================================
  // CLOSE MENU
  // ================================

  const closeMenu = () => {
    setShowMenu(false);
  };

  // ================================
  // DASHBOARD NAVIGATION
  // ================================

  const goToDashboard = () => {
    if (user?.role === 'HOST') {
      navigate('/host/dashboard');
    } else {
      navigate('/guest/dashboard');
    }

    closeMenu();
  };

  return (
    <header className="header">

      {/* ================================
          LOGO
      ================================= */}

      <div className="header__left">
        <Link
          to="/"
          className="header__logo"
          onClick={closeMenu}
        >
          <svg
            className="header__icon"
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            role="presentation"
            focusable="false"
          >
            <path
              d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.396l.011.315c0 4.298-3.084 7.806-7.16 7.806-3.23 0-5.748-2.09-6.34-5.115l-.031-.178-.031.178c-.592 3.025-3.11 5.115-6.34 5.115-4.076 0-7.16-3.508-7.16-7.806 0-.964.218-1.895.83-3.396l.141-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.272 0-2.316.634-3.414 2.592l-.512.983c-1.932 3.788-6.071 12.457-7.042 14.721-.575 1.41-.782 2.19-.824 2.872l-.008.226c0 3.255 2.294 5.806 5.16 5.806 2.505 0 4.606-1.89 4.969-4.542l.063-.563h3.216l.063.563c.363 2.652 2.464 4.542 4.969 4.542 2.866 0 5.16-2.551 5.16-5.806 0-.742-.192-1.528-.737-2.827l-.095-.221c-.971-2.264-5.11-10.933-7.042-14.721l-.512-.983C18.316 3.634 17.272 3 16 3zm0 13a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 0 0 0 2 1 1 0 0 0-2 0 1 1 0 0 0 2 0z"
            />
          </svg>

          <span className="header__logo-text">
            airbnb
          </span>
        </Link>
      </div>

      {/* ================================
          MAIN NAVIGATION
      ================================= */}

      <nav
        className="header__navigation"
        aria-label="Main navigation"
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `header__nav-link ${isActive ? 'active' : ''}`
          }
        >
          Homes
        </NavLink>

        <NavLink
          to="/experiences"
          className={({ isActive }) =>
            `header__nav-link ${isActive ? 'active' : ''}`
          }
        >
          Experiences
        </NavLink>

        <NavLink
          to="/services"
          className={({ isActive }) =>
            `header__nav-link ${isActive ? 'active' : ''}`
          }
        >
          Services
        </NavLink>
      </nav>

      {/* ================================
          SEARCH
      ================================= */}

      <form
        className="header__search"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="Search destinations"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search destinations"
        />

        <button
          type="submit"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </form>

      {/* ================================
          RIGHT SIDE
      ================================= */}

      <div className="header__right">

        {/* HOST */}

        <button
          className="header__host"
          onClick={handleHostClick}
          type="button"
        >
          {user?.role === 'HOST'
            ? 'Host dashboard'
            : 'Become a host'}
        </button>

        {/* LANGUAGE */}

        <button
          className="header__language-button"
          type="button"
          aria-label="Choose language"
        >
          <LanguageIcon className="header__language" />
        </button>

        {/* USER */}

        <div className="header__user">

          <button
            className="header__user-button"
            onClick={handleAvatarClick}
            type="button"
            aria-label={
              user
                ? 'Open account menu'
                : 'Log in'
            }
          >
            <ExpandMoreIcon />

            <Avatar
              src={user?.avatar_url || ''}
              alt={user?.email || 'User'}
            />
          </button>

          {/* ================================
              DROPDOWN
          ================================= */}

          {showMenu && user && (
            <div className="header__dropdown">

              {/* USER INFORMATION */}

              <div className="header__user-info">

                <Avatar
                  src={user?.avatar_url || ''}
                  alt={user?.email || 'User'}
                  className="header__dropdown-avatar"
                />

                <div>
                  <strong>
                    {user.first_name || 'Guest'}
                  </strong>

                  <span>
                    {user.email}
                  </span>
                </div>

              </div>

              <div className="header__menu-divider" />

              {/* DASHBOARD */}

              <button
                type="button"
                onClick={goToDashboard}
              >
                <DashboardIcon />
                <span>Dashboard</span>
              </button>

              {/* HOMES */}

              <button
                type="button"
                onClick={() => {
                  navigate('/');
                  closeMenu();
                }}
              >
                <HomeIcon />
                <span>Homes</span>
              </button>

              {/* BOOKINGS */}

              <button
                type="button"
                onClick={() => {
                  navigate('/bookings');
                  closeMenu();
                }}
              >
                <BookOnlineIcon />
                <span>My Bookings</span>
              </button>

              {/* HOST OPTIONS */}

              {user.role === 'HOST' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/add-property');
                      closeMenu();
                    }}
                  >
                    <AddHomeIcon />
                    <span>Add Property</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigate('/host/dashboard');
                      closeMenu();
                    }}
                  >
                    <DashboardIcon />
                    <span>Host Dashboard</span>
                  </button>
                </>
              )}

              <div className="header__menu-divider" />

              {/* PROFILE */}

              <button
                type="button"
                onClick={() => {
                  navigate('/profile');
                  closeMenu();
                }}
              >
                <PersonIcon />
                <span>Profile</span>
              </button>

              {/* LOGOUT */}

              <button
                type="button"
                className="header__logout"
                onClick={handleLogout}
              >
                <LogoutIcon />
                <span>Logout</span>
              </button>

            </div>
          )}

        </div>

        {/* LOGIN */}

        {!user && (
          <button
            className="header__login"
            type="button"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
        )}

      </div>

    </header>
  );
}

export default Header;

