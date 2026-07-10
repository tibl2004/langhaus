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


  useEffect(() => {

    const token = localStorage.getItem("token");

    setIsLoggedIn(Boolean(token));

  }, []);



  useEffect(() => {

    const fetchLogo = async () => {

      try {

        const response = await axios.get(
          "https://restaurant-langhaus-backend.onrender.com/api/logo"
        );


        setLogoUrl(response.data.logoUrl || null);


      } catch(error){

        console.error(
          "Logo konnte nicht geladen werden",
          error
        );

      }

    };


    fetchLogo();


  }, []);




  useEffect(() => {


    const closeMenu = (event)=>{


      if(
        burgerMenuActive &&
        !event.target.closest(".navbar")
      ){

        setBurgerMenuActive(false);

      }

    };


    document.addEventListener(
      "click",
      closeMenu
    );


    return()=>{

      document.removeEventListener(
        "click",
        closeMenu
      );

    };


  },[burgerMenuActive]);





  const handleLogout = ()=>{


    localStorage.removeItem("token");
    localStorage.removeItem("user");


    setIsLoggedIn(false);


    navigate("/login");


  };





return (

<nav className={`navbar ${burgerMenuActive ? "open" : ""}`}>



<div className="navbar-container">



{/* LOGO */}

<div className="navbar-logo">


<NavLink 
to="/"
onClick={()=>setBurgerMenuActive(false)}
>


{

logoUrl ?

<img
src={logoUrl}
alt="Restaurant Langhaus Logo"
/>

:

<span>
Langhaus
</span>

}


</NavLink>


</div>





{/* BURGER */}

<button
className="burger-button"
onClick={(e)=>{

e.stopPropagation();

setBurgerMenuActive(
!burgerMenuActive
);

}}

>


<FontAwesomeIcon icon={faBars}/>


</button>






{/* MENU */}


<ul className={`navbar-links ${burgerMenuActive ? "active":""}`}>



<NavbarItem
to="/"
text="Home"
icon={faHome}
close={setBurgerMenuActive}
/>



<NavbarItem
to="https://www.lunchgate.ch/restaurant/langhaus/"
text="Reservation"
icon={faCalendarCheck}
close={setBurgerMenuActive}
/>



<NavbarItem
to="/cards"
text="Karten"
icon={faBook}
close={setBurgerMenuActive}
/>




<NavbarItem
to="/galerie"
text="Galerie"
icon={faImage}
close={setBurgerMenuActive}
/>





{

!isLoggedIn ?


<NavbarItem
to="/login"
text="Login"
icon={faSignInAlt}
close={setBurgerMenuActive}
/>


:

<li>


<button
className="logout-button"
onClick={handleLogout}
>


<FontAwesomeIcon icon={faSignOutAlt}/>

Logout


</button>


</li>


}




</ul>



</div>


</nav>

);


}





function NavbarItem({
to,
text,
icon,
close
}){


return(

<li>


<NavLink

to={to}

className={({isActive})=>

`navbar-link ${isActive ? "active":""}`

}


onClick={()=>close(false)}

>


<FontAwesomeIcon icon={icon}/>


<span>
{text}
</span>


</NavLink>


</li>


);


}



export default Navbar;