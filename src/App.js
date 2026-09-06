import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import './App.css';

// Layout
import Header from './Header';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AddProperty from './pages/AddProperty';
import GuestDashboard from './pages/GuestDashboard';

// Features
import HomesPage from './features/homes/pages/HomesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">

          <Header />

          <Routes>

            {/* Home */}
            <Route
              path="/"
              element={<HomesPage />}
            />

            {/* Guest Dashboard */}
            <Route
              path="/guest/dashboard"
              element={<GuestDashboard />}
            />

            <Route
              path="/bookings"
              element={<GuestDashboard />}
            />

            {/* Authentication */}
            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* Hosting */}
            <Route
              path="/add-property"
              element={<AddProperty />}
            />

          </Routes>

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
