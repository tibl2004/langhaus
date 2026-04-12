import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Galerie.scss";

const API = "https://restaurant-langhaus-backend.onrender.com/api";
const GALERIE_API = `${API}/galerie`;
const LOGO_API = `${API}/logo`;

export default function Galerie() {
  const [bilder, setBilder] = useState([]);
  const [logo, setLogo] = useState(null);

  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");

  const [activeIndex, setActiveIndex] = useState(null);

  // POPUPS (WIE MENUCARDS)
  const [showUploadGalerie, setShowUploadGalerie] = useState(false);
  const [showUploadLogo, setShowUploadLogo] = useState(false);

  const [galerieFiles, setGalerieFiles] = useState([]);
  const [logoFile, setLogoFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");


  /* =========================
     LOAD
  ========================= */
  const loadGalerie = async () => {
    try {
      const res = await axios.get(GALERIE_API);
      setBilder(res.data);
    } catch {
      setError("Galerie konnte nicht geladen werden.");
    }
  };

  const loadLogo = async () => {
    try {
      const res = await axios.get(`${LOGO_API}/current`);
      setLogo(res.data.logoUrl);
    } catch {
      setLogo(null);
    }
  };

  useEffect(() => {
    loadGalerie();
    loadLogo();
  }, []);

  /* =========================
     UPLOAD GALERIE
  ========================= */
  const handleGalerieUpload = async () => {
    if (!galerieFiles.length) return;

    const formData = new FormData();
    galerieFiles.forEach((f) => formData.append("bilder", f));

    try {
      setLoading(true);

      await axios.post(`${GALERIE_API}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGalerieFiles([]);
      setShowUploadGalerie(false); // CLOSE POPUP
      loadGalerie();
    } catch (err) {
      setError(err.response?.data?.error || "Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UPLOAD LOGO
  ========================= */
  const handleLogoUpload = async () => {
    if (!logoFile) return;

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      setLoading(true);

      await axios.post(`${LOGO_API}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLogoFile(null);
      setShowUploadLogo(false); // CLOSE POPUP
      loadLogo();
    } catch {
      setError("Logo-Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDeleteBild = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;

    await axios.delete(`${GALERIE_API}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    loadGalerie();
  };

  /* =========================
     LIGHTBOX
  ========================= */
  const closeFullscreen = () => setActiveIndex(null);

  const nextBild = useCallback(
    () => setActiveIndex((i) => (i + 1) % bilder.length),
    [bilder.length]
  );

  const prevBild = useCallback(
    () => setActiveIndex((i) => (i - 1 + bilder.length) % bilder.length),
    [bilder.length]
  );

  return (
    <div className="galerie">

      <h1>Galerie</h1>

      {error && <div className="error">{error}</div>}

      {/* =========================
          ADMIN BUTTONS (WIE MENU)
      ========================= */}
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

      {/* =========================
          POPUP GALERIE UPLOAD
      ========================= */}
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
              <button onClick={handleGalerieUpload}>
                {loading ? "..." : "Upload"}
              </button>

              <button
                className="ghost"
                onClick={() => setShowUploadGalerie(false)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          POPUP LOGO UPLOAD
      ========================= */}
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
              <button onClick={handleLogoUpload}>
                {loading ? "..." : "Upload"}
              </button>

              <button
                className="ghost"
                onClick={() => setShowUploadLogo(false)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          LOGO
      ========================= */}
      {logo && <img src={logo} alt="Logo" className="logo-preview" />}

      {/* =========================
          GRID
      ========================= */}
      <div className="grid">
        {bilder.map((bild, index) => (
          <div key={bild.id} className="item">
            <img
              src={bild.bild}
              alt=""
              onClick={() => setActiveIndex(index)}
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

      {/* =========================
          LIGHTBOX
      ========================= */}
      {activeIndex !== null && bilder[activeIndex] && (
        <div className="lightbox" onClick={closeFullscreen}>
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
            alt=""
            onClick={(e) => e.stopPropagation()}
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

          <button className="close" onClick={closeFullscreen}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}