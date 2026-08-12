import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './Header.css';

import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Avatar from '@mui/material/Avatar';

function Header() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // ==============================
  // SEARCH
  // ==============================

  const handleSearch = (e) => {
    e.preventDefault();

    const location = searchTerm.trim();

    if (location) {
      navigate(`/?location=${encodeURIComponent(location)}`);
    } else {
      navigate('/');
    }
  };

  // ==============================
  // HOST
  // ==============================

  const handleHostClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'HOST') {
      navigate('/add-property');
    } else {
      navigate('/register');
    }

    setShowMenu(false);
  };

  // ==============================
  // USER MENU
  // ==============================

  const handleAvatarClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setShowMenu((prev) => !prev);
  };

  // ==============================
  // LOGOUT
  // ==============================

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    navigate('/');
  };

  return (
    <header className="header">

      {/* ==========================
          LOGO
      =========================== */}

      <div className="header__left">

        <Link to="/" className="header__logo">
          Airbnb
        </Link>

      </div>


      {/* ==========================
          SEARCH
      =========================== */}

      <form
        className="header__search"
        onSubmit={handleSearch}
      >

        <input
          type="text"
          placeholder="Search destinations"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button type="submit">
          <SearchIcon />
        </button>

      </form>


      {/* ==========================
          RIGHT SIDE
      =========================== */}

      <div className="header__right">

        <button
          className="header__host"
          onClick={handleHostClick}
        >
          {user?.role === 'HOST'
            ? 'Airbnb your home'
            : 'Become a host'}
        </button>


        <LanguageIcon className="header__language" />


        {/* ==========================
            USER MENU
        =========================== */}

        <div className="header__user">

          <button
            className="header__user-button"
            onClick={handleAvatarClick}
          >

            <ExpandMoreIcon />

            <Avatar
              src={user?.avatar_url || ''}
              alt={user?.email || 'User'}
            />

          </button>


          {/* ==========================
              DROPDOWN
          =========================== */}

          {showMenu && user && (

            <div className="header__dropdown">

              <div className="header__user-info">

                <strong>
                  {user.first_name || 'Guest'}
                </strong>

                <span>
                  {user.email}
                </span>

              </div>


              <button
                onClick={() => {
                  navigate('/');
                  setShowMenu(false);
                }}
              >
                Home
              </button>


              {user.role === 'HOST' && (

                <button
                  onClick={() => {
                    navigate('/add-property');
                    setShowMenu(false);
                  }}
                >
                  Add Property
                </button>

              )}


              <button
                onClick={() => {
                  navigate('/bookings');
                  setShowMenu(false);
                }}
              >
                My Bookings
              </button>


              <button
                onClick={() => {
                  navigate('/profile');
                  setShowMenu(false);
                }}
              >
                Profile
              </button>


              <button
                className="header__logout"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          )}

        </div>


        {/* ==========================
            LOGIN
        =========================== */}

        {!user && (

          <button
            className="header__login"
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
