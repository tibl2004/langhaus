import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Galerie.scss";

const GALERIE_API = "https://restaurant-langhaus-backend.onrender.com/api/galerie";
const LOGO_API = "https://restaurant-langhaus-backend.onrender.com/api/logo";

export default function Galerie() {
  const [bilder, setBilder] = useState([]);
  const [galerieFiles, setGalerieFiles] = useState([]);
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* FULLSCREEN */
  const [activeIndex, setActiveIndex] = useState(null);

  const token = localStorage.getItem("token");

  // Rollen aus JWT
  useEffect(() => {
    if (!token) return setRoles([]);
    try {
      const decoded = jwtDecode(token);
      setRoles(decoded.userTypes || []);
    } catch {
      setRoles([]);
    }
  }, [token]);

  const isAdmin = roles.includes("admin");
  const isVorstand = roles.includes("vorstand");

  /* =========================
     Galerie & Logo laden
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
     Upload Galerie-Bilder
  ========================= */
  const handleGalerieUpload = async () => {
    if (!galerieFiles.length || !token) return;

    const formData = new FormData();
    galerieFiles.forEach((f) => formData.append("bilder", f));

    try {
      setLoading(true);
      await axios.post(`${GALERIE_API}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGalerieFiles([]);
      loadGalerie();
    } catch (err) {
      setError(err.response?.data?.error || "Galerie-Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Upload Logo
  ========================= */
  const handleLogoUpload = async () => {
    if (!logoFile || !token) return;

    const formData = new FormData();
    formData.append("logo", logoFile);

    try {
      setLoading(true);
      await axios.post(`${LOGO_API}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogoFile(null);
      loadLogo();
    } catch (err) {
      setError(err.response?.data?.error || "Logo-Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Delete Bild
  ========================= */
  const handleDeleteBild = async (id, isLogo = false) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      const api = isLogo ? LOGO_API : GALERIE_API;
      await axios.delete(`${api}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isLogo) loadLogo();
      else loadGalerie();
    } catch {
      setError("Löschen fehlgeschlagen");
    }
  };

  /* =========================
     FULLSCREEN LOGIC
  ========================= */
  const closeFullscreen = () => setActiveIndex(null);
  const nextBild = useCallback(() => setActiveIndex((i) => (i + 1) % bilder.length), [bilder.length]);
  const prevBild = useCallback(() => setActiveIndex((i) => (i - 1 + bilder.length) % bilder.length), [bilder.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeFullscreen();
      if (e.key === "ArrowRight") nextBild();
      if (e.key === "ArrowLeft") prevBild();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, nextBild, prevBild]);

  /* =========================
     Render
  ========================= */
  return (
    <div className="galerie">
      <h1>Logo Upload</h1>
      {logo && <img src={logo} alt="Logo" className="logo-preview" />}
      {isAdmin && (
        <div className="upload">
          <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
          <button onClick={handleLogoUpload} disabled={loading}>
            {loading ? "Hochladen…" : "Logo hochladen"}
          </button>
        </div>
      )}

      <h1>Galerie</h1>
      {error && <div className="error">{error}</div>}

      {isAdmin && (
        <div className="upload">
          <input type="file" multiple accept="image/*" onChange={(e) => setGalerieFiles([...e.target.files])} />
          <button onClick={handleGalerieUpload} disabled={loading}>
            {loading ? "Hochladen…" : "Bilder hochladen"}
          </button>
        </div>
      )}

      <div className="grid">
        {bilder.map((bild, index) => (
          <div key={bild.id} className="item">
            <img src={bild.bild} alt="" onClick={() => setActiveIndex(index)} />
            {(isAdmin || isVorstand) && (
              <button className="delete-btn" onClick={() => handleDeleteBild(bild.id)}>✖</button>
            )}
          </div>
        ))}
      </div>

      {activeIndex !== null && (
        <div className="lightbox" onClick={closeFullscreen}>
          <button className="nav prev" onClick={(e) => { e.stopPropagation(); prevBild(); }}>‹</button>
          <img src={bilder[activeIndex].bild} alt="" onClick={(e) => e.stopPropagation()} />
          <button className="nav next" onClick={(e) => { e.stopPropagation(); nextBild(); }}>›</button>
          <button className="close" onClick={closeFullscreen}>✕</button>
        </div>
      )}
    </div>
  );
}
