import React, { useState } from 'react';
import './Banner.css';

import Button from '@mui/material/Button';
import Search from './Search';

function Banner() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="banner">

      {showSearch && <Search />}

      <Button
        className="banner__searchButton"
        variant="outlined"
        onClick={() => setShowSearch(!showSearch)}
      >
        Search Dates
      </Button>

      <div className="banner__info">
        <h1>Get out and stretch your imagination</h1>

        <h5>
          Plan a different kind of getaway to uncover the hidden gems near you.
        </h5>

        <Button variant="outlined">
          Explore Nearby
        </Button>
      </div>

    </div>
  );
}

export default Banner;