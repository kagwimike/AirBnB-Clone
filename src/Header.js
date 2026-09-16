import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "./context/AuthContext";
import "./Header.css";

const tabs = [
  { label: "All", icon: "🌍", path: "/" },
  { label: "Homes", icon: "🏠", path: "/" },
  { label: "Experiences", icon: "🎈", path: "/experiences" },
  { label: "Services", icon: "🛎️", path: "/services" },
];

function Header() {
  const { user, logout, setMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [activePanel, setActivePanel] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dates, setDates] = useState({ checkin: "", checkout: "" });
  const [guests, setGuests] = useState(1);

  const isCategoryActive = (tab) =>
    tab.label === "Experiences"
      ? location.pathname === "/experiences"
      : tab.label === "Services"
        ? location.pathname === "/services"
        : tab.label === "All" && location.pathname === "/" && !location.search;

  const submitSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("location", searchTerm.trim());
    if (dates.checkin) params.set("checkin", dates.checkin);
    if (dates.checkout) params.set("checkout", dates.checkout);
    if (user) params.set("guests", String(guests));
    navigate(`/?${params.toString()}`);
    setActivePanel(null);
  };

  const selectTab = (tab) => {
    navigate(tab.label === "Homes" ? "/" : tab.path);
    setMenuOpen(false);
  };

  const handleHostSwitch = async () => {
    if (!user) return navigate("/login");
    if (user.role === "HOST") {
      if (user.mode !== "HOSTING") await setMode("HOSTING");
      navigate("/host/dashboard");
    } else {
      navigate("/register");
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const initial = (user?.first_name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <header className="header">
      <div className="header__top-row">
        <Link to="/" className="header__logo" aria-label="Airbnb home">
          <svg className="header__icon" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.396l.011.315c0 4.298-3.084 7.806-7.16 7.806-3.23 0-5.748-2.09-6.34-5.115l-.031-.178-.031.178c-.592 3.025-3.11 5.115-6.34 5.115-4.076 0-7.16-3.508-7.16-7.806 0-.964.218-1.895.83-3.396l.141-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.272 0-2.316.634-3.414 2.592l-.512.983c-1.932 3.788-6.071 12.457-7.042 14.721-.575 1.41-.782 2.19-.824 2.872l-.008.226c0 3.255 2.294 5.806 5.16 5.806 2.505 0 4.606-1.89 4.969-4.542l.063-.563h3.216l.063.563c.363 2.652 2.464 4.542 4.969 4.542 2.866 0 5.16-2.551 5.16-5.806 0-.742-.192-1.528-.737-2.827l-.095-.221c-.971-2.264-5.11-10.933-7.042-14.721l-.512-.983C18.316 3.634 17.272 3 16 3zm0 13a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 2a1 1 0 0 0 0 2 1 1 0 0 0 2 0z" />
          </svg>
          <span>airbnb</span>
        </Link>

        <nav className="header__navigation" aria-label="Browse categories">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.label}
              className={`header__nav-tab ${isCategoryActive(tab) ? "active" : ""}`}
              onClick={() => selectTab(tab)}
            >
              <span className="header__nav-icon" aria-hidden="true">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="header__actions">
          <button
            type="button"
            className="header__host"
            onClick={handleHostSwitch}
          >
            {user?.role === "HOST" ? "Switch to hosting" : "Become a host"}
          </button>
          {user ? (
            <button
              type="button"
              className="header__avatar"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open account menu"
            >
              {initial}
            </button>
          ) : (
            <button
              type="button"
              className="header__login"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          )}
          <button
            type="button"
            className={`header__menu-button ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <form
        className={`header__search ${user ? "header__search--segmented" : "header__search--simple"}`}
        onSubmit={submitSearch}
      >
        {user ? (
          <>
            <button
              type="button"
              className={`header__search-segment ${activePanel === "where" ? "selected" : ""}`}
              onClick={() =>
                setActivePanel(activePanel === "where" ? null : "where")
              }
            >
              <strong>Where</strong>
              <span>{searchTerm || "Search destinations"}</span>
            </button>
            <span className="header__search-divider" />
            <button
              type="button"
              className={`header__search-segment ${activePanel === "when" ? "selected" : ""}`}
              onClick={() =>
                setActivePanel(activePanel === "when" ? null : "when")
              }
            >
              <strong>When</strong>
              <span>
                {dates.checkin && dates.checkout
                  ? `${dates.checkin} - ${dates.checkout}`
                  : "Add dates"}
              </span>
            </button>
            <span className="header__search-divider" />
            <button
              type="button"
              className={`header__search-segment ${activePanel === "who" ? "selected" : ""}`}
              onClick={() =>
                setActivePanel(activePanel === "who" ? null : "who")
              }
            >
              <strong>Who</strong>
              <span>{guests > 1 ? `${guests} guests` : "Add guests"}</span>
            </button>
          </>
        ) : (
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search destinations"
            aria-label="Search destinations"
          />
        )}
        <button
          className="header__search-button"
          type="submit"
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </form>

      {activePanel && user && (
        <div className="header__search-panel">
          {activePanel === "where" && (
            <label>
              Search destinations
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="e.g. Nairobi"
              />
            </label>
          )}
          {activePanel === "when" && (
            <div className="header__date-fields">
              <label>
                Check in
                <input
                  type="date"
                  value={dates.checkin}
                  onChange={(event) =>
                    setDates({ ...dates, checkin: event.target.value })
                  }
                />
              </label>
              <label>
                Check out
                <input
                  type="date"
                  min={dates.checkin}
                  value={dates.checkout}
                  onChange={(event) =>
                    setDates({ ...dates, checkout: event.target.value })
                  }
                />
              </label>
            </div>
          )}
          {activePanel === "who" && (
            <div className="header__guest-picker">
              <span>
                <strong>Guests</strong>
                <small>How many people?</small>
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => setGuests((count) => Math.max(1, count - 1))}
                >
                  -
                </button>
                <b>{guests}</b>
                <button
                  type="button"
                  onClick={() => setGuests((count) => count + 1)}
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {menuOpen && (
        <div className="header__menu-panel">
          <div className="header__mobile-tabs">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.label}
                onClick={() => selectTab(tab)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          {user ? (
            <>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    user.role === "HOST" && user.mode === "HOSTING"
                      ? "/host/dashboard"
                      : "/guest/dashboard",
                  )
                }
              >
                Dashboard
              </button>
              <button type="button" onClick={() => navigate("/bookings")}>
                My trips
              </button>
              <button type="button" onClick={() => navigate("/profile")}>
                Profile
              </button>
              <button type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <button type="button" onClick={() => navigate("/login")}>
              Log in
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
