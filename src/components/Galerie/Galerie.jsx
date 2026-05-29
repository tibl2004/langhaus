import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Galerie.scss";

const API = "https://restaurant-langhaus-backend.onrender.com/api";

export default function Galerie() {

  /* ================= STATES ================= */

  const [bilder, setBilder] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [error, setError] = useState("");

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  /* ================= GALERIE LADEN ================= */

  const loadGalerie = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/galerie`);

      const validImages = res.data.filter(
        (item) => item.bild && typeof item.bild === "string"
      );

      setBilder(validImages);

    } catch (err) {
      console.error(err);
      setError("Galerie konnte nicht geladen werden");
    }
  }, []);

  useEffect(() => {
    loadGalerie();
  }, [loadGalerie]);

  /* ================= UPLOAD ================= */

  const handleUpload = async () => {

    if (!files.length) return;

    const formData = new FormData();

    for (let file of files) {
      formData.append("bilder", file);
    }

    try {

      setUploading(true);

      await axios.post(
        `${API}/galerie`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setFiles([]);
      await loadGalerie();

    } catch (err) {
      console.error(err);
      alert("Upload fehlgeschlagen");
    } finally {
      setUploading(false);
    }
  };

  /* ================= LIGHTBOX ================= */

  const closeFullscreen = () => setActiveIndex(null);

  const nextBild = useCallback(() => {
    setActiveIndex((prev) =>
      prev === null
        ? 0
        : prev === bilder.length - 1
          ? 0
          : prev + 1
    );
  }, [bilder]);

  const prevBild = useCallback(() => {
    setActiveIndex((prev) =>
      prev === null
        ? 0
        : prev === 0
          ? bilder.length - 1
          : prev - 1
    );
  }, [bilder]);

  /* ================= KEYBOARD ================= */

  useEffect(() => {

    const handleKeyDown = (e) => {

      if (activeIndex === null) return;

      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowRight") nextBild();
      if (e.key === "ArrowLeft") prevBild();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);

  }, [activeIndex, nextBild, prevBild]);

  /* ================= RENDER ================= */

  return (
    <div className="galerie">

      <h1>Galerie</h1>

      {/* ERROR */}
      {error && <div className="error">{error}</div>}

      {/* ================= UPLOAD ================= */}

      <div className="upload-box">

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles([...e.target.files])}
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Upload..." : "Bilder hochladen"}
        </button>

      </div>

      {/* ================= GRID ================= */}

      <div className="grid">

        {bilder.map((bild, index) => (

          <div key={bild.id || index} className="item">

            <img
              src={bild.bild}
              alt={`Galerie ${index + 1}`}
              loading="lazy"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onClick={() => setActiveIndex(index)}
              onError={(e) => {
                e.target.src =
                  "https://dummyimage.com/600x400/000/fff&text=Bild";
              }}
            />

          </div>

        ))}

      </div>

      {/* ================= LIGHTBOX ================= */}

      {activeIndex !== null && bilder[activeIndex] && (

        <div className="lightbox" onClick={closeFullscreen}>

          <button
            className="nav prev"
            onClick={(e) => {
              e.stopPropagation();
              prevBild();
            }}
          >
            ❮
          </button>

          <img
            src={bilder[activeIndex].bild}
            alt="Fullscreen"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="nav next"
            onClick={(e) => {
              e.stopPropagation();
              nextBild();
            }}
          >
            ❯
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