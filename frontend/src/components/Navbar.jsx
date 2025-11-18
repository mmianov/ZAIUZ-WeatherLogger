import React from "react";

export default function Navbar({ onLogout, onLoginClick, onBrandClick, role }) {
  const isLoggedIn = Boolean(role);

  return (
    <nav className="navbar navbar-dark bg-secondary px-3 w-100 sticky-top">
      <span
        className="navbar-brand mb-0 h1"
        style={{ cursor: "pointer" }}
        onClick={onBrandClick}
      >
        🌤️ WeatherLogger
      </span>

      <div className="d-flex align-items-center">
        {isLoggedIn ? (
          <>
            <span className="me-3">Logged in as: {role}</span>
            <button
              onClick={onLogout}
              className="btn btn-outline-light btn-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="btn btn-outline-light btn-sm"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
