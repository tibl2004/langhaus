import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Galerie.scss";

const API_BASE = "https://restaurant-langhaus-backend.onrender.com";
const API = `${API_BASE}/api`;

export default function Galerie() {
  const [bilder, setBilder] = useState([]);
  const [logo, setLogo] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const [showUploadGalerie, setShowUploadGalerie] = useState(false);
  const [showUploadLogo, setShowUploadLogo] = useState(false);

  const [galerieFiles, setGalerieFiles] = useState([]);
  const [logoFile, setLogoFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  /* ================= FIX IMAGE URL ================= */
  const fixImage = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${API_BASE}${url}`;
  };

  /* ================= LOAD DATA ================= */
  const loadGalerie = async () => {
    try {
      const res = await axios.get(`${API}/galerie`);
      setBilder(res.data);
    } catch {
      setError("Galerie konnte nicht geladen werden.");
    }
  };

  const loadLogo = async () => {
    try {
      const res = await axios.get(`${API}/logo/current`);
      setLogo(res.data.logoUrl);
    } catch {
      setLogo(null);
    }
  };

  useEffect(() => {
    loadGalerie();
    loadLogo();
  }, []);

  /* ================= UPLOAD GALERIE ================= */
  const handleGalerieUpload = async () => {
    if (!galerieFiles.length) return;

    const formData = new FormData();
    galerieFiles.forEach((file) => formData.append("bilder", file));

    try {
      setLoading(true);
      setError("");

      await axios.post(`${API}/galerie/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGalerieFiles([]);
      setShowUploadGalerie(false);
      loadGalerie();
    } catch (err) {
      setError(err.response?.data?.error || "Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPLOAD LOGO ================= */
  const handleLogoUpload = async () => {
    if (!logoFile) return;

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      setLoading(true);

      await axios.post(`${API}/logo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogoFile(null);
      setShowUploadLogo(false);
      loadLogo();
    } catch {
      setError("Logo Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteBild = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;

    try {
      await axios.delete(`${API}/galerie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      loadGalerie();
    } catch {
      setError("Löschen fehlgeschlagen");
    }
  };

  /* ================= LIGHTBOX ================= */
  const closeFullscreen = () => setActiveIndex(null);

  const nextBild = useCallback(() => {
    setActiveIndex((i) => (i + 1) % bilder.length);
  }, [bilder.length]);

  const prevBild = useCallback(() => {
    setActiveIndex((i) => (i - 1 + bilder.length) % bilder.length);
  }, [bilder.length]);

  return (
    <div className="galerie">

      <h1>Galerie</h1>

      {error && <div className="error">{error}</div>}

      {/* BUTTONS */}
      {token && (
        <div className="upload-actions">
          <button onClick={() => setShowUploadGalerie(true)}>
            + Bilder hochladen
          </button>

          <button onClick={() => setShowUploadLogo(true)}>
            + Logo ändern
          </button>
        </div>
      )}

      {/* UPLOAD GALERIE */}
      {showUploadGalerie && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h2>Bilder hochladen</h2>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setGalerieFiles([...e.target.files])}
            />

            <div className="actions">
              <button onClick={handleGalerieUpload} disabled={loading}>
                {loading ? "Upload..." : "Upload"}
              </button>

              <button onClick={() => setShowUploadGalerie(false)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD LOGO */}
      {showUploadLogo && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h2>Logo ändern</h2>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files[0])}
            />

            <div className="actions">
              <button onClick={handleLogoUpload} disabled={loading}>
                {loading ? "Upload..." : "Upload"}
              </button>

              <button onClick={() => setShowUploadLogo(false)}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGO */}
      {logo && (
        <img src={fixImage(logo)} alt="Logo" className="logo-preview" />
      )}

      {/* GRID */}
      <div className="grid">
        {bilder.map((bild, index) => (
          <div key={bild.id} className="item">
          <img
  src={
    bild.bild.startsWith("http")
      ? bild.bild
      : `https://restaurant-langhaus-backend.onrender.com${bild.bild}`
  }
  alt=""
  onError={(e) => {
    e.target.src = "/fallback.png";
  }}
/>

            {token && (
              <button
                className="delete-btn"
                onClick={() => handleDeleteBild(bild.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* LIGHTBOX */}
      {activeIndex !== null && bilder[activeIndex] && (
        <div className="lightbox" onClick={closeFullscreen}>
          <button onClick={(e) => { e.stopPropagation(); prevBild(); }}>
            ‹
          </button>

          <img
  src={
    bilder[activeIndex].bild.startsWith("http")
      ? bilder[activeIndex].bild
      : `https://restaurant-langhaus-backend.onrender.com${bilder[activeIndex].bild}`
  }
/>
          <button onClick={(e) => { e.stopPropagation(); nextBild(); }}>
            ›
          </button>

          <button onClick={closeFullscreen}>✕</button>
        </div>
      )}
    </div>
  );
}