import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';

import Home from './Home';
import Header from './Header';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProperty from './pages/AddProperty';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* <Header /> */}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add-property" element={<AddProperty />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;