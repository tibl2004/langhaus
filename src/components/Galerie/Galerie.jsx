import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./Galerie.scss";

const API = "https://restaurant-langhaus-backend.onrender.com/api";
const GALERIE_API = `${API}/galerie`;
const LOGO_API = `${API}/logo`;

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

  /* ================= LOAD ================= */
  const loadGalerie = async () => {
    try {
      const res = await axios.get(GALERIE_API);
      setBilder(res.data);
    } catch (err) {
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

  /* ================= UPLOAD GALERIE ================= */
  const handleGalerieUpload = async () => {
    if (!galerieFiles.length) {
      setError("Keine Dateien ausgewählt");
      return;
    }

    const formData = new FormData();

    // 🔥 WICHTIG: MUSS "bilder" heißen (Multer)
    galerieFiles.forEach((file) => {
      formData.append("bilder", file);
    });

    try {
      setLoading(true);
      setError("");

      await axios.post(`${GALERIE_API}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ KEIN Content-Type!
        },
      });

      setGalerieFiles([]);
      setShowUploadGalerie(false);
      loadGalerie();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      setLoading(true);
      setError("");

      await axios.post(`${LOGO_API}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLogoFile(null);
      setShowUploadLogo(false);
      loadLogo();

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Logo Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteBild = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;

    try {
      await axios.delete(`${GALERIE_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      loadGalerie();
    } catch (err) {
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

      {/* UPLOAD BUTTONS */}
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

      {/* GALERIE UPLOAD */}
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

      {/* LOGO UPLOAD */}
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
      {logo && <img src={logo} alt="Logo" className="logo-preview" />}

      {/* GRID */}
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

      {/* LIGHTBOX */}
      {activeIndex !== null && bilder[activeIndex] && (
        <div className="lightbox" onClick={closeFullscreen}>
          <button onClick={(e) => { e.stopPropagation(); prevBild(); }}>‹</button>

          <img src={bilder[activeIndex].bild} alt="" />

          <button onClick={(e) => { e.stopPropagation(); nextBild(); }}>›</button>

          <button onClick={closeFullscreen}>✕</button>
        </div>
      )}
    </div>
  );
}