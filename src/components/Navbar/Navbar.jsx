import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faSignInAlt, faSignOutAlt, faBars } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "./Navbar.scss";

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [logoUrl, setLogoUrl] = useState(null);
  const navigate = useNavigate();

  // Loginstatus + Rollen prüfen
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserTypes(parsedUser?.userTypes || []);
      } catch (err) {
        console.error("Fehler beim Parsen von user:", err);
        setUserTypes([]);
      }
    } else {
      setUserTypes([]);
    }
  }, []);

  // Logo von API laden (Axios)
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await axios.get(
          "https://restaurant-langhaus-backend.onrender.com/api/logo",
          { headers: { "Content-Type": "application/json" } }
        );
        setLogoUrl(response.data.logoUrl || null);
      } catch (err) {
        console.error("Fehler beim Laden des Logos:", err);
        setLogoUrl(null);
      }
    };
    fetchLogo();
  }, []);

  // Menü schließen, wenn außerhalb geklickt wird
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserTypes([]);
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

        {/* Burger Icon */}
        <div
          className="menu-icon"
          onClick={() => setBurgerMenuActive(!burgerMenuActive)}
        >
          <FontAwesomeIcon icon={faBars} />
        </div>

        {/* Navigation */}
        <ul className={`nav-items ${burgerMenuActive ? "open" : ""}`}>
          <NavItem to="/" text="Home" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="https://www.lunchgate.ch/restaurant/langhaus/" text="Reservation" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/cards" text="Karten" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/galerie" text="Galerie" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />

          {!isLoggedIn ? (
            <NavItem to="/login" text="Login" icon={faSignInAlt} setBurgerMenuActive={setBurgerMenuActive} />
          ) : (
            <>
              <NavItem to="/profil" text="Profil" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />
              <li>
                <button className="nav-link logout" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </li>
            </>
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
