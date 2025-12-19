import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Galerie.scss";

const API_URL = "https://restaurant-langhaus-backend.onrender.com/api/galerie";

export default function Galerie() {
  const [bilder, setBilder] = useState([]);
  const [files, setFiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* FULLSCREEN */
  const [activeIndex, setActiveIndex] = useState(null);

  const token = localStorage.getItem("token");

  /* =========================
     Rollen aus JWT
  ========================= */
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
     Galerie laden
  ========================= */
  const loadGalerie = async () => {
    try {
      const res = await axios.get(API_URL);
      setBilder(res.data);
    } catch {
      setError("Galerie konnte nicht geladen werden.");
    }
  };

  useEffect(() => {
    loadGalerie();
  }, []);

  /* =========================
     Upload
  ========================= */
  const handleUpload = async () => {
    if (!files.length || !token) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("bilder", f));

    try {
      setLoading(true);
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles([]);
      loadGalerie();
    } catch (err) {
      setError(err.response?.data?.error || "Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Delete
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Bild wirklich löschen?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadGalerie();
    } catch {
      setError("Löschen fehlgeschlagen");
    }
  };

  /* =========================
     FULLSCREEN LOGIC
  ========================= */
  const closeFullscreen = () => setActiveIndex(null);

  const nextBild = useCallback(() => {
    setActiveIndex((i) => (i + 1) % bilder.length);
  }, [bilder.length]);

  const prevBild = useCallback(() => {
    setActiveIndex((i) => (i - 1 + bilder.length) % bilder.length);
  }, [bilder.length]);

  /* Keyboard */
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
      <h1>Galerie</h1>
      {error && <div className="error">{error}</div>}

      {isAdmin && (
        <div className="upload">
          <input type="file" multiple onChange={(e) => setFiles([...e.target.files])} />
          <button onClick={handleUpload} disabled={loading}>
            {loading ? "Hochladen…" : "Bilder hochladen"}
          </button>
        </div>
      )}

      <div className="grid">
        {bilder.map((bild, index) => (
          <div key={bild.id} className="item">
            <img
              src={bild.bild}
              alt=""
              onClick={() => setActiveIndex(index)}
            />

            {(isAdmin || isVorstand) && (
              <button onClick={() => handleDelete(bild.id)}>✖</button>
            )}
          </div>
        ))}
      </div>

      {/* =========================
          FULLSCREEN OVERLAY
      ========================= */}
      {activeIndex !== null && (
        <div className="lightbox" onClick={closeFullscreen}>
          <button className="nav prev" onClick={(e) => { e.stopPropagation(); prevBild(); }}>
            ‹
          </button>

          <img
            src={bilder[activeIndex].bild}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />

          <button className="nav next" onClick={(e) => { e.stopPropagation(); nextBild(); }}>
            ›
          </button>

          <button className="close" onClick={closeFullscreen}>✕</button>
        </div>
      )}
    </div>
  );
}
