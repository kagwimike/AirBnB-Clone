import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PaymentsIcon from "@mui/icons-material/Payments";
import PersonIcon from "@mui/icons-material/Person";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

import "./DashboardSidebar.css";

function DashboardSidebar({ role = "GUEST" }) {
  const { user, logout, setMode } = useAuth();
  const navigate = useNavigate();

  const isHost = role === "HOST";

  const dashboardPath = isHost ? "/host/dashboard" : "/guest/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitial = () => {
    const firstName = user?.first_name || user?.username || "U";
    return firstName.charAt(0).toUpperCase();
  };

  const switchMode = async () => {
    const nextMode =
      isHost && user?.mode === "HOSTING" ? "TRAVELING" : "HOSTING";
    try {
      await setMode(nextMode);
      navigate(nextMode === "HOSTING" ? "/host/dashboard" : "/guest/dashboard");
    } catch {
      navigate(isHost ? "/guest/dashboard" : "/login");
    }
  };

  return (
    <aside className="dashboard-sidebar">
      {/* =========================================
          LOGO
      ========================================= */}

      <div className="dashboard-logo">
        <span className="dashboard-logo-icon">A</span>

        <div className="dashboard-logo-text">
          <h2>Airbnb</h2>

          <span>{isHost ? "Host Center" : "Guest Portal"}</span>
        </div>
      </div>

      {/* =========================================
          USER PROFILE
      ========================================= */}

      <div className="dashboard-user">
        <div className="dashboard-user-avatar">{getInitial()}</div>

        <div className="dashboard-user-info">
          <strong>{user?.first_name || user?.username || "Guest"}</strong>

          <span>{isHost ? "Host Account" : "Guest Account"}</span>
        </div>
      </div>

      {/* =========================================
          MAIN NAVIGATION
      ========================================= */}

      <nav className="dashboard-nav">
        <p className="dashboard-nav-title">MAIN MENU</p>

        {/* Overview */}

        <NavLink
          to={dashboardPath}
          className={({ isActive }) =>
            `dashboard-nav-item ${isActive ? "active" : ""}`
          }
        >
          <DashboardIcon />

          <span>Overview</span>
        </NavLink>

        {/* Host Properties */}

        {isHost && (
          <NavLink
            to="/host/properties"
            className={({ isActive }) =>
              `dashboard-nav-item ${isActive ? "active" : ""}`
            }
          >
            <HomeWorkIcon />

            <span>My Properties</span>
          </NavLink>
        )}

        {user?.role === "HOST" && !isHost && (
          <NavLink
            to="/host/dashboard"
            className="dashboard-nav-item"
            onClick={(event) => {
              event.preventDefault();
              switchMode();
            }}
          >
            <HomeWorkIcon />
            <span>Switch to host view</span>
          </NavLink>
        )}

        {isHost && (
          <NavLink
            to="/guest/dashboard"
            className="dashboard-nav-item"
            onClick={(event) => {
              event.preventDefault();
              switchMode();
            }}
          >
            <PersonIcon />
            <span>Switch to guest view</span>
          </NavLink>
        )}

        {/* Bookings / Trips */}

        <NavLink
          to={isHost ? "/host/dashboard#reservations" : "/bookings"}
          className={({ isActive }) =>
            `dashboard-nav-item ${isActive ? "active" : ""}`
          }
        >
          <CalendarMonthIcon />

          <span>{isHost ? "Reservations" : "My Trips"}</span>
        </NavLink>

        {/* Payments */}

        <NavLink
          to="/payments"
          className={({ isActive }) =>
            `dashboard-nav-item ${isActive ? "active" : ""}`
          }
        >
          <PaymentsIcon />

          <span>Payments</span>
        </NavLink>
      </nav>

      {/* =========================================
          BOTTOM NAVIGATION
      ========================================= */}

      <div className="dashboard-bottom-nav">
        {/* Profile */}

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `dashboard-nav-item ${isActive ? "active" : ""}`
          }
        >
          <PersonIcon />

          <span>Profile</span>
        </NavLink>

        {/* Settings */}

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `dashboard-nav-item ${isActive ? "active" : ""}`
          }
        >
          <SettingsOutlinedIcon />

          <span>Settings</span>
        </NavLink>

        {/* Logout */}

        <button
          type="button"
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <LogoutIcon />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
