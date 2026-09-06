import React, { useEffect, useState } from 'react';
import './Search.css';

import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import {
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function Search({ onSearch, onSearchComplete }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [guestCount, setGuestCount] = useState(2);

  const [calendarMonths, setCalendarMonths] = useState(
    window.innerWidth < 768 ? 1 : 2
  );

  // =========================================
  // RESPONSIVE CALENDAR
  // =========================================

  useEffect(() => {
    const handleResize = () => {
      setCalendarMonths(
        window.innerWidth < 768 ? 1 : 2
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // =========================================
  // DATE RANGE
  // =========================================

  const selectionRange = {
    startDate,
    endDate,
    key: 'selection',
  };

  const handleSelect = (ranges) => {
    setStartDate(ranges.selection.startDate);
    setEndDate(ranges.selection.endDate);
  };

  // =========================================
  // SEARCH
  // =========================================

  const handleSearchSubmit = () => {
    const searchData = {
      guests: guestCount,
      checkin: startDate
        ? startDate.toISOString().split('T')[0]
        : null,
      checkout: endDate
        ? endDate.toISOString().split('T')[0]
        : null,
    };

    /*
     * Search does NOT navigate anymore.
     *
     * The parent component decides what should
     * happen with these search parameters.
     */

    if (onSearch) {
      onSearch(searchData);
    }

    if (onSearchComplete) {
      onSearchComplete();
    }
  };

  return (
    <div className="search-modal">

      {/* =====================================
          HEADER
      ====================================== */}

      <Box className="search-modal__header">
        <Typography
          variant="h5"
          className="search-modal__title"
        >
          Search stays
        </Typography>

        <Typography
          variant="body2"
          className="search-modal__subtitle"
        >
          Find a place for your next trip
        </Typography>
      </Box>

      {/* =====================================
          DATES
      ====================================== */}

      <Box className="search-modal__section">

        <Box className="search-modal__section-title">
          <Typography
            variant="h6"
            className="search-modal__heading"
          >
            When are you going?
          </Typography>
        </Box>

        <Box className="search-modal__calendar">
          <DateRangePicker
            ranges={[selectionRange]}
            onChange={handleSelect}
            minDate={new Date()}
            moveRangeOnFirstSelection={false}
            months={calendarMonths}
            direction="horizontal"
            showDateDisplay={false}
          />
        </Box>

      </Box>

      <Divider className="search-modal__divider" />

      {/* =====================================
          GUESTS
      ====================================== */}

      <Box className="search-modal__section">

        <Box className="search-modal__section-title">
          <Typography
            variant="h6"
            className="search-modal__heading"
          >
            Who's coming?
          </Typography>
        </Box>

        <Box className="guest-selector">

          <Box className="guest-selector__left">

            <PeopleIcon className="guest-selector__icon" />

            <Box className="guest-selector__info">

              <Typography className="guest-selector__title">
                Guests
              </Typography>

              <Typography
                variant="body2"
                className="guest-selector__description"
              >
                How many people?
              </Typography>

            </Box>

          </Box>

          <Box className="guest-selector__controls">

            <IconButton
              className="guest-selector__button"
              onClick={() =>
                setGuestCount((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={guestCount <= 1}
              aria-label="Decrease guests"
            >
              <RemoveIcon />
            </IconButton>

            <Typography className="guest-selector__count">
              {guestCount}
            </Typography>

            <IconButton
              className="guest-selector__button"
              onClick={() =>
                setGuestCount(
                  (current) => current + 1
                )
              }
              aria-label="Increase guests"
            >
              <AddIcon />
            </IconButton>

          </Box>

        </Box>

      </Box>

      {/* =====================================
          FOOTER
      ====================================== */}

      <Box className="search-modal__footer">

        <Button
          variant="contained"
          size="large"
          className="search-modal__button"
          onClick={handleSearchSubmit}
          fullWidth
        >
          Search Airbnb
        </Button>

      </Box>

    </div>
  );
}

export default Search;