import React, {
  useEffect,
  useState,
  useCallback
} from "react";

import axios from "axios";

import {
  FaTrash,
  FaEdit,
  FaSave,
  FaPlus
} from "react-icons/fa";

import "./Home.scss";


const API =
  "https://restaurant-langhaus-backend.onrender.com/api";

const GALERIE_API =
  `${API}/galerie`;

const WOCHENTAGE = [
  "Mo",
  "Di",
  "Mi",
  "Do",
  "Fr",
  "Sa",
  "So"
];


const Home = () => {


  const token =
    localStorage.getItem("token");


  const user =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );


  const isAdmin =
    user?.userTypes?.includes("admin");



  const [homeContent, setHomeContent] =
    useState(null);


  const [oeffnungszeiten, setOeffnungszeiten] =
    useState([]);


  const [editTimes, setEditTimes] =
    useState({});


  const [editingCategory, setEditingCategory] =
    useState(null);


  const [bilder, setBilder] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [activeIndex, setActiveIndex] =
    useState(null);


  const [ferienPopup, setFerienPopup] =
    useState(null);



  /*
  ===================================
      DATEN LADEN
  ===================================
  */


  const fetchHomeContent =
    useCallback(async () => {

      try {

        const res =
          await axios.get(
            `${API}/home`
          );

        setHomeContent(res.data);


      } catch (err) {

        console.error(err);

      }


    }, []);



  const fetchOeffnungszeiten =
    useCallback(async () => {


      try {


        const res =
          await axios.get(
            `${API}/oeffnungszeiten`
          );


        setOeffnungszeiten(
          res.data
        );


        setLoading(false);


      } catch (err) {

        console.error(err);

      }


    }, []);



  const fetchGalerie =
    useCallback(async () => {


      try {


        const res =
          await axios.get(
            GALERIE_API
          );


        setBilder(
          res.data
        );


      } catch (err) {

        console.error(err);

      }


    }, []);



  const fetchBetriebsferien =
    useCallback(async () => {


      try {


        const res =
          await axios.get(
            `${API}/betriebsferien/active`
          );


        if (res.data.active) {

          setFerienPopup(
            res.data.ferien[0]
          );

        }


      } catch (err) {

        console.error(err);

      }


    }, []);





  useEffect(() => {


    fetchHomeContent();

    fetchOeffnungszeiten();

    fetchGalerie();

    fetchBetriebsferien();


  }, [
    fetchHomeContent,
    fetchOeffnungszeiten,
    fetchGalerie,
    fetchBetriebsferien
  ]);




  /*
  ===================================
      ÖFFNUNGSZEITEN ADMIN
  ===================================
  */


  const fetchOeffzeitenForEdit =
    async (catKey) => {


      const res =
        await axios.get(
          `${API}/oeffnungszeiten/edit`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      setEditTimes({

        [catKey]:
          res.data[catKey] || []

      });


      setEditingCategory(
        catKey
      );


    };



  const handleAddTime =
    (catKey) => {


      const newEntry = {


        id:
          `new-${Date.now()}`,

        wochentag:
          "Mo",

        von:
          "09:00",

        bis:
          "18:00",

        isNew:
          true


      };



      setEditTimes(prev => ({


        ...prev,


        [catKey]: [

          ...(prev[catKey] || []),

          newEntry

        ]


      }));


    };




  const handleEditTime =
    (
      catKey,
      id,
      field,
      value
    ) => {


      setEditTimes(prev => ({


        ...prev,


        [catKey]:
          prev[catKey].map(e =>

            e.id === id

              ?

              {
                ...e,
                [field]: value
              }

              :

              e

          )


      }));


    };


  /*
  ===================================
      ÖFFNUNGSZEITEN SPEICHERN
  ===================================
  */


  const handleDelete =
    async (id) => {


      if (
        String(id)
          .startsWith("new-")
      )
        return;


      try {


        await axios.delete(

          `${API}/oeffnungszeiten/${id}`,

          {

            headers: {

              Authorization:
                `Bearer ${token}`

            }

          }

        );


        fetchOeffzeitenForEdit(
          editingCategory
        );


      } catch (err) {

        console.error(err);

      }


    };




  const handleSaveCategory =
    async (catKey) => {


      try {


        for (
          const item of editTimes[catKey]
        ) {


          const payload = {


            wochentag:
              item.wochentag,


            von:
              item.von,


            bis:
              item.bis,


            kategorie:
              catKey === "__DEFAULT__"
                ?
                null
                :
                catKey


          };



          if (item.isNew) {


            await axios.post(

              `${API}/oeffnungszeiten`,

              payload,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`

                }

              }

            );


          } else {


            await axios.put(

              `${API}/oeffnungszeiten/${item.id}`,

              payload,

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`

                }

              }

            );


          }


        }



        setEditingCategory(null);


        fetchOeffnungszeiten();



      } catch (err) {

        console.error(err);

      }


    };





  /*
  ===================================
        GALERIE LIGHTBOX
  ===================================
  */


  const closeFullscreen =
    () => {


      setActiveIndex(null);


    };




  const nextBild =
    useCallback(() => {


      setActiveIndex(

        i =>

          (i + 1)
          %
          bilder.length

      );


    }, [bilder.length]);




  const prevBild =
    useCallback(() => {


      setActiveIndex(

        i =>

          (
            i - 1 +
            bilder.length
          )
          %
          bilder.length

      );


    }, [bilder.length]);




  useEffect(() => {


    if (activeIndex === null)
      return;



    const handleKey =
      (e) => {


        if (
          e.key === "Escape"
        )
          closeFullscreen();



        if (
          e.key === "ArrowRight"
        )
          nextBild();



        if (
          e.key === "ArrowLeft"
        )
          prevBild();


      };



    window.addEventListener(
      "keydown",
      handleKey
    );



    return () => {


      window.removeEventListener(
        "keydown",
        handleKey
      );


    };


  }, [
    activeIndex,
    nextBild,
    prevBild
  ]);





  if (loading)

    return (

      <div className="loading">

        Lädt...

      </div>

    );




  /*
  ===================================
          RENDER
  ===================================
  */


  return (


    <div className="home-container">



      {/* ==========================
        BETRIEBSFERIEN
========================== */}


      {
        ferienPopup && (


          <div className="ferien-popup">


            <div className="popup-box">


              <h2>

                ⚠️ Betriebsferien

              </h2>



              <p>

                Geschlossen von

                {" "}

                <b>

                  {ferienPopup.von}

                </b>


                {" "}bis{" "}


                <b>

                  {ferienPopup.bis}

                </b>


              </p>



              {
                ferienPopup.beschreibung &&


                <p className="desc">

                  {ferienPopup.beschreibung}

                </p>

              }



              <div className="actions">


                <button

                  onClick={() =>
                    setFerienPopup(null)
                  }

                >

                  OK

                </button>



                <button

                  onClick={() =>
                    setFerienPopup(null)
                  }

                >

                  Schließen

                </button>



              </div>



            </div>


          </div>


        )

      }





      {/* ==========================
          HERO
========================== */}



      {
        homeContent && (


          <section

            className="premium-hero"

            style={{

              backgroundImage:

                `url(${homeContent.bild || ""})`

            }}

          >



            <div className="hero-overlay">


              <div className="hero-content">


                <h1>

                  {homeContent.willkommenText}

                </h1>


              </div>


            </div>


          </section>


        )

      }




      {/* ==========================
       ÖFFNUNGSZEITEN
========================== */}



      <section

        className="oeffnungszeiten-section"

      >



        <div className="section-header">


          <h2>

            Öffnungszeiten

          </h2>


        </div>




        <div className="opening-grid">


          {
            oeffnungszeiten.map(
              (cat, idx) => {


                const catKey =
                  cat.kategorie ?? "__DEFAULT__";


                const isEditing =
                  editingCategory === catKey;



                const entries =
                  isEditing

                    ?

                    editTimes[catKey] || []

                    :

                    cat.eintraege;



                return (


                  <div

                    key={idx}

                    className="category-block"

                  >


                    <h3>

                      {cat.kategorie ?? "Restaurant"}

                    </h3>




                    {
                      !isEditing && (


                        <div className="times-list">


                          {

                            entries.map(
                              (e, i) => (

                                e.wochentage.map(
                                  (d, j) => (


                                    <div

                                      key={`${i}-${j}`}

                                      className="time-item"

                                    >


                                      <span>

                                        {d}

                                      </span>


                                      <span>

                                        {
                                          e.geschlossen

                                            ?

                                            "geschlossen"

                                            :

                                            e.zeiten.join(", ")

                                        }

                                      </span>


                                    </div>


                                  )

                                )

                              )

                            )

                          }


                        </div>


                      )

                    }


                    {
                      isEditing && (


                        <div className="edit-times">


                          {
                            entries.map((e) => (


                              <div

                                key={e.id}

                                className="edit-row"


                              >


                                <select

                                  value={e.wochentag}

                                  onChange={(ev) =>

                                    handleEditTime(

                                      catKey,

                                      e.id,

                                      "wochentag",

                                      ev.target.value

                                    )

                                  }


                                >


                                  {
                                    WOCHENTAGE.map((d) => (

                                      <option key={d}>

                                        {d}

                                      </option>

                                    ))

                                  }


                                </select>





                                <input

                                  type="time"

                                  value={e.von}

                                  onChange={(ev) =>

                                    handleEditTime(

                                      catKey,

                                      e.id,

                                      "von",

                                      ev.target.value

                                    )

                                  }


                                />





                                <input

                                  type="time"

                                  value={e.bis}

                                  onChange={(ev) =>

                                    handleEditTime(

                                      catKey,

                                      e.id,

                                      "bis",

                                      ev.target.value

                                    )

                                  }


                                />




                                <FaTrash

                                  onClick={() =>

                                    handleDelete(e.id)

                                  }


                                />



                              </div>


                            ))

                          }



                          <div className="edit-actions">


                            <button

                              onClick={() =>

                                handleAddTime(catKey)

                              }


                            >

                              <FaPlus />

                              Hinzufügen

                            </button>





                            <button

                              onClick={() =>

                                handleSaveCategory(catKey)

                              }


                            >

                              <FaSave />

                              Speichern

                            </button>



                          </div>


                        </div>


                      )

                    }





                    {
                      isAdmin && !isEditing && (


                        <button

                          className="edit-button"

                          onClick={() =>

                            fetchOeffzeitenForEdit(catKey)

                          }


                        >


                          <FaEdit />

                          Bearbeiten


                        </button>


                      )

                    }





                  </div>


                )


              }

            )


          }


        </div>


      </section>






      {/* ==========================
            GALERIE
========================== */}



      <section

        className="galerie-section"

      >


        <div className="section-header">


          <h2>

            Galerie

          </h2>


        </div>




        <div className="gallery-grid">


          {

            bilder.map(
              (b, i) => (


                <div

                  key={b.id}

                  className="gallery-card"


                  onClick={() =>

                    setActiveIndex(i)

                  }


                >


                  <img

                    src={b.bild}

                    alt="Galerie"

                  />


                </div>


              )

            )

          }



        </div>





        {
          activeIndex !== null && (



            <div

              className="lightbox"

              onClick={closeFullscreen}


            >



              <div

                className="lightbox-content"

                onClick={(e) =>

                  e.stopPropagation()

                }


              >


                <button

                  className="close"

                  onClick={closeFullscreen}

                >

                  ×

                </button>



                <img

                  src={bilder[activeIndex].bild}

                  alt=""

                />



                <div className="lightbox-controls">


                  <button

                    onClick={prevBild}

                  >

                    ‹

                  </button>



                  <button

                    onClick={nextBild}

                  >

                    ›

                  </button>



                </div>



              </div>



            </div>



          )

        }





      </section>






    </div>


  );


};



export default Home;