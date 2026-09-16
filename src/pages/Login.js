import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "@mui/material/Button";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, setMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login({ email, password });
      if (data.user?.role === "HOST") await setMode("HOSTING");
      navigate(
        data.user?.role === "HOST" ? "/host/dashboard" : "/guest/dashboard",
      );
    } catch (err) {
      setError("Invalid email or password. Please try again.");
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
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              style={{
                backgroundColor: "#ff7779",
                color: "white",
                marginTop: "10px",
                padding: "12px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
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
