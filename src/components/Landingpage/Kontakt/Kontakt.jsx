import React, { useState } from "react";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaCommentDots,
  FaPaperPlane,
  FaMapMarkerAlt
} from "react-icons/fa";

import "./Kontakt.scss";


const Kontakt = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    nachricht: ""
  });


  const [status, setStatus] = useState("");



  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "https://restaurant-langhaus-backend.onrender.com/api/contact",
        form
      );


      setStatus(
        "Ihre Nachricht wurde erfolgreich gesendet."
      );


      setForm({
        name:"",
        email:"",
        nachricht:""
      });


    } catch(err) {


      setStatus(
        "Nachricht konnte nicht gesendet werden."
      );

    }

  };



  return (

    <main className="contact-page">


      {/* HERO */}

      <section className="contact-hero">

        <div className="hero-content">

          <h1>
            Kontakt
          </h1>

          <p>
            Wir freuen uns auf Ihre Nachricht
          </p>

        </div>

      </section>



      <section className="contact-content">



        {/* INFO */}

        <div className="contact-info">


          <FaMapMarkerAlt className="contact-icon"/>


          <h2>
            Schreiben Sie uns
          </h2>


          <p>
            Haben Sie Fragen, Wünsche oder
            spezielle Anliegen?
          </p>


          <p>
            Nutzen Sie unser Kontaktformular.
            Wir melden uns schnellstmöglich bei Ihnen.
          </p>


          <div className="premium-line"></div>


          <span>
            Restaurant Langhaus
          </span>


        </div>






        {/* FORMULAR */}

        <div className="contact-form-box">


          <h2>
            Nachricht senden
          </h2>



          {status && (

            <div className="contact-status">

              {status}

            </div>

          )}




          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >


            <div className="input-box">

              <FaUser/>

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
              />

            </div>




            <div className="input-box">

              <FaEnvelope/>

              <input
                type="email"
                name="email"
                placeholder="E-Mail"
                value={form.email}
                onChange={handleChange}
                required
              />

            </div>





            <div className="input-box textarea">


              <FaCommentDots/>


              <textarea

                name="nachricht"

                placeholder="Ihre Nachricht"

                value={form.nachricht}

                onChange={handleChange}

                required

              />


            </div>





            <button
              className="contact-submit"
              type="submit"
            >

              <FaPaperPlane/>

              Nachricht senden

            </button>



          </form>



        </div>



      </section>



    </main>

  );

};


export default Kontakt;