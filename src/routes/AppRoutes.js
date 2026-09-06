import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from '../Header';

import Home from '../Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AddProperty from '../pages/AddProperty';

function AppRoutes() {
  return (
    <>
      <Header />

      <Routes>
        {/* Homes */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Hosting */}
        <Route path="/add-property" element={<AddProperty />} />

        {/* Experiences */}
        {/* Future route: /experiences */}

        {/* Services */}
        {/* Future route: /services */}

        {/* Bookings */}
        {/* Future route: /bookings */}

        {/* Profile */}
        {/* Future route: /profile */}
      </Routes>
    </>
  );
}

export default AppRoutes;