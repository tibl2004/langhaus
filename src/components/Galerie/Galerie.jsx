import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import axios from "axios";
import "./Galerie.scss";

const API =
  "https://restaurant-langhaus-backend.onrender.com/api";

export default function Galerie() {

  const [bilder, setBilder] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [error, setError] = useState("");

  /* 🔥 FULLSCREEN REF */
  const lightboxRef = useRef(null);

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
  FULLSCREEN ÖFFNEN
  ====================================
  */

  useEffect(() => {

    if (
      activeIndex !== null &&
      lightboxRef.current
    ) {

      const elem = lightboxRef.current;

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }

  }, [activeIndex]);

  /*
  ====================================
  FULLSCREEN SCHLIESSEN
  ====================================
  */

  const closeFullscreen = async () => {

    setActiveIndex(null);

    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  /*
  ====================================
  NAVIGATION
  ====================================
  */

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
  ESC KEY SUPPORT
  ====================================
  */

  useEffect(() => {

    const handleKey = (e) => {

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
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );

  }, [nextBild, prevBild]);

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

      {/* GRID */}

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
              onClick={() =>
                setActiveIndex(index)
              }
            />

          </div>

        ))}

      </div>

      {/* LIGHTBOX */}

      {activeIndex !== null &&
        bilder[activeIndex] && (

        <div
          className="lightbox"
          ref={lightboxRef}
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