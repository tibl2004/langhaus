import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Galerie.scss";

const API = "https://restaurant-langhaus-backend.onrender.com/api";

export default function Galerie() {

  const [bilder, setBilder] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [error, setError] = useState("");

  /*
  ====================================
  GALERIE LADEN
  ====================================
  */

  useEffect(() => {

    const loadGalerie = async () => {

      try {

        const res = await axios.get(`${API}/galerie`);

        console.log("API:", res.data);

        /*
        WICHTIG:
        Nur gültige Bilder übernehmen
        */

        const validImages = res.data.filter(
          (item) =>
            item.bild &&
            typeof item.bild === "string"
        );

        setBilder(validImages);

      } catch (err) {

        console.error(err);

        setError(
          "Galerie konnte nicht geladen werden"
        );
      }
    };

    loadGalerie();

  }, []);

  /*
  ====================================
  LIGHTBOX
  ====================================
  */

  const closeFullscreen = () => {
    setActiveIndex(null);
  };

  const nextBild = useCallback(() => {

    setActiveIndex((prev) =>
      prev === bilder.length - 1
        ? 0
        : prev + 1
    );

  }, [bilder]);

  const prevBild = useCallback(() => {

    setActiveIndex((prev) =>
      prev === 0
        ? bilder.length - 1
        : prev - 1
    );

  }, [bilder]);

  /*
  ====================================
  JSX
  ====================================
  */

  return (

    <div className="galerie">

      <h1>Galerie</h1>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* ================= GRID ================= */}

      <div className="grid">

        {bilder.map((bild, index) => (

          <div
            key={bild.id}
            className="item"
          >

            <img
              src={bild.bild}
              alt={`Galerie ${index + 1}`}
              loading="lazy"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                display: "block",
                cursor: "pointer",
              }}
              onClick={() =>
                setActiveIndex(index)
              }
              onLoad={() => {

                console.log(
                  "BILD GELADEN:",
                  bild.bild
                );

              }}
              onError={(e) => {

                console.log(
                  "FEHLER:",
                  bild.bild
                );

                /*
                FALLBACK BILD
                */

                e.target.src =
                  "https://dummyimage.com/600x400/000/fff&text=Bild";

              }}
            />

          </div>

        ))}

      </div>

      {/* ================= LIGHTBOX ================= */}

      {activeIndex !== null &&
        bilder[activeIndex] && (

        <div
          className="lightbox"
          onClick={closeFullscreen}
        >

          <button
            className="nav prev"
            onClick={(e) => {
              e.stopPropagation();
              prevBild();
            }}
          >
            ‹
          </button>

          <img
            src={bilder[activeIndex].bild}
            alt="Fullscreen"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
          />

          <button
            className="nav next"
            onClick={(e) => {
              e.stopPropagation();
              nextBild();
            }}
          >
            ›
          </button>

          <button
            className="close"
            onClick={(e) => {
              e.stopPropagation();
              closeFullscreen();
            }}
          >
            ✕
          </button>

        </div>
      )}

    </div>
  );
}