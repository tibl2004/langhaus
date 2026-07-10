import React from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaTripadvisor,
  FaArrowUp,
  FaUtensils,
  FaChevronRight,
  FaCar,
} from "react-icons/fa";

import "./Footer.scss";

function Footer() {
  const year = new Date().getFullYear();

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="footer">

      {/* GOLDENE LINIE */}
      <div className="footer-top-line"></div>

      <div className="footer-wrapper">

        {/* ================================================= */}
        {/* INFO */}
        {/* ================================================= */}

        <div className="footer-column about">

          <div className="footer-logo">

            <div className="logo-circle">
              <FaUtensils />
            </div>

            <div>
              <h2>Restaurant Langhaus</h2>
              <span>Tradition • Genuss • Gastfreundschaft</span>
            </div>

          </div>

          <p>
            Willkommen im Restaurant Langhaus.
            Wir verwöhnen unsere Gäste mit frischen,
            saisonalen Gerichten, regionalen Zutaten
            und einer grossen Auswahl an erlesenen
            Weinen.
          </p>
          <div className="footer-social">

<a
  href="https://www.facebook.com"
  target="_blank"
  rel="noreferrer"
  aria-label="Facebook"
>
  <FaFacebookF />
</a>


<a
  href="https://www.instagram.com"
  target="_blank"
  rel="noreferrer"
  aria-label="Instagram"
>
  <FaInstagram />
</a>


<a
  href="https://www.tripadvisor.ch/Restaurant_Review-g198855-d19769579-Reviews-Restaurant_Langhaus-Baden_Canton_of_Aargau.html"
  target="_blank"
  rel="noreferrer"
  aria-label="Tripadvisor"
>
  <FaTripadvisor />
</a>

</div>

        </div>

        {/* ================================================= */}
        {/* KONTAKT */}
        {/* ================================================= */}

        <div className="footer-column">

          <h3>Kontakt</h3>

          <div className="footer-contact">

            <div className="contact-item">
              <FaMapMarkerAlt />
              <div>
                <strong>Adresse</strong>
                <span>
                Langhausstrasse 1
                  <br />
                  5400 Baden
                </span>
              </div>
            </div>

            <div className="contact-item">
              <FaPhoneAlt />
              <div>
                <strong>Telefon</strong>
                <span>+41 56 555 21 12</span>
              </div>
            </div>

            <div className="contact-item">
              <FaEnvelope />
              <div>
                <strong>E-Mail</strong>
                <span>gastro@baden-langhaus.ch</span>
              </div>
            </div>

          </div>

          <div className="footer-buttons">

            <a
              href="tel:+41565552112"
              className="gold-btn"
            >
              Jetzt anrufen
            </a>

            <a
              href="/kontakt"
              className="outline-btn"
            >
              Kontakt aufnehmen
            </a>

          </div>

        </div>

        {/* ================================================= */}
        {/* ÖFFNUNGSZEITEN */}
        {/* ================================================= */}

        <div className="footer-column">

          <h3>Öffnungszeiten</h3>

          <div className="opening-card">

            <div className="opening-title">
              <FaClock />
              Restaurant
            </div>

            <div className="opening-row">
              <span>Mo – Fr</span>
              <strong>
                11:00 – 14:00
                <br />
                17:00 – 23:00
              </strong>
            </div>

            <div className="opening-row">
              <span>Sa</span>
              <strong>17:00 – 23:00</strong>
            </div>

            <div className="opening-row closed">
              <span>So</span>
              <strong>Geschlossen</strong>
            </div>

            <hr />

            <div className="opening-title kitchen">
              <FaClock />
              Küche
            </div>

            <div className="opening-row">
              <span>Mo – Fr</span>
              <strong>
                11:30 – 14:00
                <br />
                17:00 – 22:00
              </strong>
            </div>

            <div className="opening-row">
              <span>Sa</span>
              <strong>17:00 – 22:00</strong>
            </div>

            <div className="opening-row closed">
              <span>So</span>
              <strong>Geschlossen</strong>
            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* SERVICE */}
        {/* ================================================= */}

        <div className="footer-column">

          <h3>Service</h3>

          <ul className="footer-links">

            <li>
              <FaChevronRight />
              <a href="/">Home</a>
            </li>

            <li>
              <FaChevronRight />
              <a href="/speisekarte">
                Speisekarte
              </a>
            </li>

            <li>
              <FaChevronRight />
              <a href="/reservation">
                Reservation
              </a>
            </li>

            <li>
              <FaChevronRight />
              <a href="/events">
                Events
              </a>
            </li>

            <li>
              <FaChevronRight />
              <a href="/kontakt">
                Kontakt
              </a>
            </li>

          </ul>

          <div className="route-box">

            <FaCar />

            <div>

              <strong>Anfahrt</strong>

              <p>
                Kostenlose Parkplätze direkt
                vor dem Restaurant.
              </p>

            </div>

          </div>

          <a
            className="gold-btn full"
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
          >
            Route planen
          </a>

        </div>

      </div>

      {/* ================================================= */}
      {/* COPYRIGHT */}
      {/* ================================================= */}

      <div className="footer-bottom">

        <div className="footer-bottom-left">

          © {year} Restaurant Langhaus

        </div>

        <div className="footer-bottom-center">

          <a href="/impressum">
            Impressum
          </a>

          <a href="/datenschutz">
            Datenschutz
          </a>

          <a href="/agb">
            AGB
          </a>

        </div>

        <button
          className="scroll-top"
          onClick={scrollTop}
        >
          <FaArrowUp />
        </button>

      </div>

    </footer>
  );
}

export default Footer;