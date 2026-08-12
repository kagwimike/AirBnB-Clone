import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { Button, IconButton, Typography, Box, Divider } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function Search({ onSearchComplete }) {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [guestCount, setGuestCount] = useState(2);
  
  // UX Fix: Dynamically track window size to prevent horizontal scrolling
  const [calendarMonths, setCalendarMonths] = useState(window.innerWidth < 768 ? 1 : 2);

  useEffect(() => {
    const handleResize = () => {
      setCalendarMonths(window.innerWidth < 768 ? 1 : 2);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectionRange = {
    startDate,
    endDate,
    key: 'selection',
  };

  const handleSelect = (ranges) => {
    setStartDate(ranges.selection.startDate);
    setEndDate(ranges.selection.endDate);
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    params.set('guests', guestCount);
    if (startDate) params.set('checkin', startDate.toISOString().split('T')[0]);
    if (endDate) params.set('checkout', endDate.toISOString().split('T')[0]);

    navigate(`/?${params.toString()}`);
    if (onSearchComplete) onSearchComplete();
  };

  return (
    <div className="search-modal">
      
      <Box className="search-modal__header" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#222222' }}>
          Search stays
        </Typography>
        <Typography variant="body2" sx={{ color: '#717171' }}>
          Find a place for your next trip
        </Typography>
      </Box>

      <Box className="search-modal__section" sx={{ mb: 3 }}>
        <Box className="search-modal__section-title" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            When are you going?
          </Typography>
        </Box>

        <Box className="search-modal__calendar">
          <DateRangePicker
            ranges={[selectionRange]}
            onChange={handleSelect}
            minDate={new Date()}
            moveRangeOnFirstSelection={false}
            months={calendarMonths} /* Dynamically switches 1 or 2 months */
            direction="horizontal"
            showDateDisplay={false}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box className="search-modal__section" sx={{ mb: 3 }}>
        <Box className="search-modal__section-title" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Who's coming?
          </Typography>
        </Box>

        <Box className="guest-selector">
          <Box className="guest-selector__left">
            <PeopleIcon sx={{ color: '#717171', mr: 2, fontSize: 32 }} />
            <Box className="guest-selector__info">
              <Typography sx={{ fontWeight: 600, color: '#222222' }}>
                Guests
              </Typography>
              <Typography variant="body2" sx={{ color: '#717171' }}>
                How many people?
              </Typography>
            </Box>
          </Box>

          <Box className="guest-selector__controls">
            <IconButton 
              onClick={() => setGuestCount((current) => Math.max(1, current - 1))}
              disabled={guestCount <= 1}
              sx={{ border: '1px solid #b0b0b0', padding: '5px' }}
            >
              <RemoveIcon />
            </IconButton>

            <Typography sx={{ width: '30px', textAlign: 'center', fontWeight: 600 }}>
              {guestCount}
            </Typography>

            <IconButton 
              onClick={() => setGuestCount((current) => current + 1)}
              sx={{ border: '1px solid #b0b0b0', padding: '5px' }}
            >
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Box className="search-modal__footer">
        <Button
          variant="contained"
          size="large"
          className="search-modal__button"
          onClick={handleSearchSubmit}
          fullWidth
          sx={{ 
            backgroundColor: '#ff385c', 
            textTransform: 'none', 
            fontWeight: 600, 
            fontSize: '1rem',
            padding: '12px',
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#e31c5f' }
          }}
        >
          Search Airbnb
        </Button>
      </Box>

    </div>
  );
}

export default Search;