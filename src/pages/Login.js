import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '@mui/material/Button';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/'); // Redirect to home on success
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-split-container">
      {/* LEFT SIDE: Cinematic Background Image */}
      <div className="login-image-side">
        <div className="login-image-overlay">
          <h1>Welcome back</h1>
          <p>Discover amazing places and unique homes around the world.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="login-form-side">
        <div className="login-card">
          <h2>Log in to Airbnb</h2>
          {error && <p className="error-message">{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              style={{ backgroundColor: '#ff7779', color: 'white', marginTop: '10px', padding: '12px', fontSize: '16px', fontWeight: 'bold' }}
            >
              Continue
            </Button>
          </form>
          
          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;