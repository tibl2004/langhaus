import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faSignInAlt,
  faSignOutAlt,
  faBars,
  faBook,
  faImage,
  faCalendarCheck
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./Navbar.scss";

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const navigate = useNavigate();

  // ✅ Check Login Status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // ✅ Load Logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(
          "https://restaurant-langhaus-backend.onrender.com/api/logo"
        );
        setLogoUrl(response.data.logoUrl || null);
      } catch (err) {
        console.error("Fehler beim Laden des Logos:", err);
      }
    };
    fetchLogo();
  }, []);

  // ✅ Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        burgerMenuActive &&
        !e.target.closest(".navbar-container") &&
        !e.target.closest(".menu-icon")
      ) {
        setBurgerMenuActive(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [burgerMenuActive]);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${burgerMenuActive ? "active" : ""}`}>
      <div className="navbar-container">

        {/* Logo */}
        <div className="logo-box">
          <NavLink to="/" onClick={() => setBurgerMenuActive(false)}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="logo" />
            ) : (
              <span className="logo-placeholder">Logo</span>
            )}
          </NavLink>
        </div>

        {/* Burger */}
        <div
          className="menu-icon"
          onClick={() => setBurgerMenuActive(!burgerMenuActive)}
        >
          <FontAwesomeIcon icon={faBars} />
        </div>

        {/* Navigation */}
        <ul className={`nav-items ${burgerMenuActive ? "open" : ""}`}>
          <NavItem to="/" text="Home" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="https://www.lunchgate.ch/restaurant/langhaus/" text="Reservation" icon={faCalendarCheck} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/cards" text="Karten" icon={faBook} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/galerie" text="Galerie" icon={faImage} setBurgerMenuActive={setBurgerMenuActive} />

          {/* 🔐 Login / Logout */}
          {!isLoggedIn ? (
            <NavItem to="/login" text="Login" icon={faSignInAlt} setBurgerMenuActive={setBurgerMenuActive} />
          ) : (
            <li>
              <button className="nav-link logout" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

function NavItem({ to, text, icon, setBurgerMenuActive }) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        onClick={() => setBurgerMenuActive(false)}
      >
        <FontAwesomeIcon icon={icon} className="icon" /> {text}
      </NavLink>
    </li>
  );
}

export default Navbar;

