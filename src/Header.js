import React from 'react';
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

  const handleHostClick = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'HOST') {
      navigate('/host/add-property');
    } else {
      navigate('/register'); // Or prompt them to switch roles
    }
  };

  return (
    <div className="header">
      {/* Clickable Airbnb logo to return to Home */}
      <Link to="/">
        <img
          className="header__icon"
          src="https://i.pinimg.com/originals/3c/bf/be/3cbfbe148597341fa56f2f87ade90956.png"
          alt="Airbnb logo"
        />
      </Link>

      <div className="header__center">
        <input type="text" placeholder="Start your search" />
        <SearchIcon />
      </div>

      <div className="header__right">
        <p onClick={handleHostClick} className="header__host-link">
          {user?.role === 'HOST' ? 'Airbnb your home' : 'Become a host'}
        </p>

        {user ? (
          <>
            <p className="header__user-greeting">
              Hello, {user.first_name || 'Guest'}
            </p>
            <p onClick={logout} className="header__logout-link">
              Logout
            </p>
          </>
        ) : (
          <p onClick={() => navigate('/login')} className="header__login-link">
            Log in
          </p>
        )}
        
        <LanguageIcon />
        
        <div 
          className="header__avatar-container" 
          onClick={() => !user && navigate('/login')}
        >
          <ExpandMoreIcon />
          <Avatar src={user?.avatar_url || ''} alt={user?.email || 'User Avatar'} />
        </div>
      </div>
    </div>
  );
}

export default Header;