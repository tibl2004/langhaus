import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import axios from "axios";

import "./Galerie.scss";

const API =
  "https://restaurant-langhaus-backend.onrender.com/api";

export default function Galerie() {

  /*
  ====================================
  STATES
  ====================================
  */

  const [bilder, setBilder] = useState([]);

  const [activeIndex, setActiveIndex] =
    useState(null);

  const [error, setError] = useState("");

  /*
  ====================================
  GALERIE LADEN
  ====================================
  */

  useEffect(() => {

    const loadGalerie = async () => {

      try {

        const res = await axios.get(
          `${API}/galerie`
        );

        console.log("API:", res.data);

        /*
        NUR GÜLTIGE BILDER
        */

        const validImages =
          res.data.filter(
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
  LIGHTBOX SCHLIESSEN
  ====================================
  */

  const closeFullscreen = () => {

    setActiveIndex(null);
  };

  /*
  ====================================
  NÄCHSTES BILD
  ====================================
  */

  const nextBild = useCallback(() => {

    setActiveIndex((prev) => {

      if (prev === null) return 0;

      return prev === bilder.length - 1
        ? 0
        : prev + 1;
    });

  }, [bilder]);

  /*
  ====================================
  VORHERIGES BILD
  ====================================
  */

  const prevBild = useCallback(() => {

    setActiveIndex((prev) => {

      if (prev === null) return 0;

      return prev === 0
        ? bilder.length - 1
        : prev - 1;
    });

  }, [bilder]);

  /*
  ====================================
  KEYBOARD SUPPORT
  ====================================
  */

  useEffect(() => {

    const handleKeyDown = (e) => {

      /*
      NUR WENN LIGHTBOX OFFEN
      */

      if (activeIndex === null) return;

      if (e.key === "Escape") {
        closeFullscreen();
      }

      if (e.key === "ArrowRight") {
        nextBild();
      }

      if (e.key === "ArrowLeft") {
        prevBild();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, [
    activeIndex,
    nextBild,
    prevBild,
  ]);

  /*
  ====================================
  JSX
  ====================================
  */

  return (

    <div className="galerie">

      <h1>Galerie</h1>

      {/* ERROR */}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {/* ================= GRID ================= */}

      <div className="grid">

        {bilder.map((bild, index) => (

          <div
            key={bild.id || index}
            className="item"
          >

            <img
              src={bild.bild}
              alt={`Galerie ${index + 1}`}

              loading="lazy"

              crossOrigin="anonymous"

              referrerPolicy="no-referrer"

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

          {/* PREV */}

          <button
            className="nav prev"
            onClick={(e) => {

              e.stopPropagation();

              prevBild();
            }}
          >
            ❮
          </button>

          {/* CONTENT */}

          <div
            className="lightbox-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              src={
                bilder[activeIndex].bild
              }

              alt={`Fullscreen ${
                activeIndex + 1
              }`}

              crossOrigin="anonymous"

              referrerPolicy="no-referrer"
            />

          </div>

          {/* NEXT */}

          <button
            className="nav next"
            onClick={(e) => {

              e.stopPropagation();

              nextBild();
            }}
          >
            ❯
          </button>

          {/* CLOSE */}

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