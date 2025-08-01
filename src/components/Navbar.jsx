import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css"; 
import logo from '../assets/discovery-logo.png';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false); // close mobile menu if open
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-header">
  <div className="navbar-top">

  <div className="logo-section" onClick={() => handleNavigate("/")}>
      <img src={logo} alt="Discovery Logo" className="logo-img" />
      <h2 className="logo-text">Discovery</h2>
  </div>

    <div className="auth-section">
      <button className="login-button" onClick={() => handleNavigate("/login")}>
        LOGIN
      </button>
    </div>
  </div>

  <div className="student-overlay">STUDENT</div>

  {/* Nav is now below header */}
  <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
    {[
      { path: "/", label: "HOME" },
      { path: "/wellness", label: "WELLNESS" },
      { path: "/finance", label: "FINANCE" },
      { path: "/campus", label: "CAMPUS" },
      { path: "/dumzii", label: "DUMZII" },
      { path: "/contact", label: "CONTACT" },
    ].map((link) => (
      <button
        key={link.path}
        className={`nav-button ${isActive(link.path) ? "active" : ""}`}
        onClick={() => handleNavigate(link.path)}
      >
        {link.label}
      </button>
    ))}
  </nav>
</header>

  );
}

export default Navbar;

