import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Page & Component Imports
import Home from './Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddProperty from './pages/AddProperty';
import Header from './Header';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          
          {/* 
            The Header is now active and placed outside the Routes. 
            This ensures it mounts once and stays visible on every page. 
          */}
          <Header /> 

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