import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUserPlus,
  faBars,
  faUser,
  faLink,
  faSignInAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../../logo.png";

function Navbar() {
  const [burgerMenuActive, setBurgerMenuActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${burgerMenuActive ? "burger-menu-active" : ""}`}>
      <div className="navbar-container">
        <div className="logo-box">
          <Link to="/" onClick={() => setBurgerMenuActive(false)}>
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </div>

        <div
          className="menu-icon"
          onClick={() => setBurgerMenuActive(!burgerMenuActive)}
        >
          <FontAwesomeIcon icon={faBars} />
        </div>

        <ul className={`nav-items ${burgerMenuActive ? "active" : ""}`}>
          <NavItem to="/" text="Home" icon={faHome} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/events" text="Events" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/links" text="Links" icon={faLink} setBurgerMenuActive={setBurgerMenuActive} />
          <NavItem to="/ueber-uns" text="Über Uns" icon={faUser} setBurgerMenuActive={setBurgerMenuActive} />

          {!isLoggedIn ? (
            <NavItem
              to="/login"
              text="Login"
              icon={faSignInAlt}
              setBurgerMenuActive={setBurgerMenuActive}
            />
          ) : (
            <>
              <NavItem
                to="/profil"
                text="Profil"
                icon={faUser}
                setBurgerMenuActive={setBurgerMenuActive}
              />
              <li>
                <button className="nav-link logout-button" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> Logout
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
      <Link
        to={to}
        className="nav-link"
        onClick={() => setBurgerMenuActive(false)}
      >
        <FontAwesomeIcon icon={icon} className="icon" /> {text}
      </Link>
    </li>
  );
}

export default Navbar;
