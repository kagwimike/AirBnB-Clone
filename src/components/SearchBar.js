import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import './SearchBar.css';

function SearchBar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();

    const location = searchTerm.trim();

    if (!location) {
      navigate('/');
      return;
    }

    navigate(`/?location=${encodeURIComponent(location)}`);
  };

  return (
    <form
      className="search-bar"
      onSubmit={handleSearch}
      role="search"
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
        aria-label="Search destinations"
      >
        <SearchIcon />
      </button>
    </form>
  );
}

export default SearchBar;