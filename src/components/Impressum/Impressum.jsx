import React from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaBuilding,
  FaInfoCircle
} from "react-icons/fa";

import "./Impressum.scss";


const Impressum = () => {

  return (

    <main className="impressum-page">


      {/* HERO */}

      <section className="impressum-hero">

        <div className="hero-overlay">

          <div className="hero-content">

            <h1>
              Impressum
            </h1>

            <p>
              Rechtliche Informationen & Kontakt
            </p>

          </div>

        </div>

      </section>




      {/* CONTENT */}

      <section className="impressum-content">


      <div className="impressum-card">

<FaBuilding className="icon"/>

<h2>
  Angaben zum Unternehmen
</h2>


<p>
  <strong>
    Dogan GmbH
  </strong>
</p>


<p>
  Bergan Dogan
  <br/>
  Langhausstrasse 1
  <br/>
  5400 Baden
  <br/>
  Schweiz
</p>

</div>





        <div className="impressum-card">


          <FaMapMarkerAlt className="icon"/>


          <h2>
            Adresse
          </h2>


          <p>

            Restaurant Langhaus
            <br/>

            Musterstrasse 1

            <br/>

            0000 Musterstadt

          </p>


        </div>






        <div className="impressum-card">

<FaPhone className="icon"/>

<h2>
  Kontakt
</h2>


<p>

  Telefon:
  <br/>

  <a href="tel:+41565552112">
    +41 56 555 21 12
  </a>

</p>


<p>

  E-Mail:
  <br/>

  <a href="mailto:gastro@baden-langhaus.ch">
    gastro@baden-langhaus.ch
  </a>

</p>


</div>







        <div className="impressum-card">


          <FaInfoCircle className="icon"/>


          <h2>
            Haftungsausschluss
          </h2>


          <p>

            Trotz sorgfältiger Prüfung übernehmen wir
            keine Haftung für die Inhalte externer Links.
            Für den Inhalt der verlinkten Seiten sind
            ausschliesslich deren Betreiber verantwortlich.

          </p>


        </div>






        <div className="impressum-card">


          <h2>
            Datenschutz
          </h2>


          <p>

            Informationen zum Umgang mit
            personenbezogenen Daten finden Sie in
            unserer Datenschutzerklärung.

          </p>


        </div>

        <div className="impressum-card developer-card">

<FaInfoCircle className="icon"/>

<h2>
  Webentwicklung & technische Umsetzung
</h2>


<p>
  Diese Webseite wurde entwickelt und umgesetzt von:
</p>


<p>

  <strong>
    TBS Solutions
  </strong>

  <br/>

  Webentwicklung & digitale Lösungen

  <br/>

  Schweiz

</p>


<p>

  Verantwortlich für:

  <br/>

  • Konzeption der Webseite

  <br/>

  • Frontend-Entwicklung

  <br/>

  • Backend-Entwicklung

  <br/>

  • Technische Umsetzung

</p>


<p>

  Webseite:
  <br/>

  <a href="https://tbs-solutions.net">

    tbs-solutions.net

  </a>

</p>


</div>

      </section>


    </main>

  );

};


export default Impressum;