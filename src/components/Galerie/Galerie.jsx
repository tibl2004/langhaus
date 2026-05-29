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

  const loadGalerie = async () => {

    try {

      const res = await axios.get(`${API}/galerie`);

      console.log("API DATA:", res.data);

      const cleanData = res.data.map((item) => {

        let imageUrl = item.bild;

        /*
        Falls Backend nur /galerie/... liefert
        */

        if (
          imageUrl &&
          imageUrl.startsWith("/galerie")
        ) {
          imageUrl =
            `https://restaurant-langhaus-backend.onrender.com/uploads${imageUrl}`;
        }

        return {
          ...item,
          bild: imageUrl,
        };
      });

      console.log("CLEAN DATA:", cleanData);

      setBilder(cleanData);

    } catch (err) {

      console.error(err);

      setError("Galerie konnte nicht geladen werden.");
    }
  };

  /*
  ====================================
  INITIAL LOAD
  ====================================
  */

  useEffect(() => {

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

    setActiveIndex((i) =>
      (i + 1) % bilder.length
    );

  }, [bilder.length]);

  const prevBild = useCallback(() => {

    setActiveIndex((i) =>
      (i - 1 + bilder.length) % bilder.length
    );

  }, [bilder.length]);

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

            {/* DEBUG URL */}
            <p
              style={{
                fontSize: "12px",
                wordBreak: "break-all",
              }}
            >
              {bild.bild}
            </p>

            <img
              src={bild.bild}
              alt={`Bild ${index + 1}`}
              loading="lazy"
              style={{
                width: "100%",
                maxWidth: "400px",
                display: "block",
              }}
              onClick={() =>
                setActiveIndex(index)
              }
              onError={(e) => {

                console.log(
                  "BILD FEHLER:",
                  bild.bild
                );

                e.target.src =
                  "https://via.placeholder.com/400x300?text=Bild+fehlt";
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
            alt="Galeriebild"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
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
            onClick={closeFullscreen}
          >
            ✕
          </button>

        </div>
      )}

    </div>
  );
}