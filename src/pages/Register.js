import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '@mui/material/Button';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'GUEST', // Default role
    phone_number: ''
  });
  const [error, setError] = useState('');
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      // Automatically log them in after successful registration
      await login({ email: formData.email, password: formData.password });
      navigate('/');
    } catch (err) {
      setError('Registration failed. Email may already be in use.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Welcome to Airbnb</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min 8 chars)"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number (for M-Pesa later)"
            value={formData.phone_number}
            onChange={handleChange}
          />
          <div className="role-selector">
            <label>I want to:</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="GUEST">Book places (Guest)</option>
              <option value="HOST">Host properties (Host)</option>
            </select>
          </div>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Agree and Continue
          </Button>
        </form>
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;