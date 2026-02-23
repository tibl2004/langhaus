import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { FaTrash, FaEdit, FaSave, FaPlus } from "react-icons/fa";
import "./Home.scss";

const API = "https://restaurant-langhaus-backend.onrender.com/api";
const GALERIE_API = `${API}/galerie`;
const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const Home = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.userTypes?.includes("admin");

  const [homeContent, setHomeContent] = useState(null);
  const [oeffnungszeiten, setOeffnungszeiten] = useState([]);
  const [editTimes, setEditTimes] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [bilder, setBilder] = useState([]);
  const [loading, setLoading] = useState(true);

  /* Galerie Lightbox */
  const [activeIndex, setActiveIndex] = useState(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchHomeContent();
    fetchOeffnungszeiten();
    fetchGalerie();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const res = await axios.get(`${API}/home`);
      setHomeContent(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOeffnungszeiten = async () => {
    try {
      const res = await axios.get(`${API}/oeffnungszeiten`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOeffnungszeiten(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOeffzeitenForEdit = async (catKey) => {
    try {
      const res = await axios.get(`${API}/oeffnungszeiten/edit`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditTimes({ [catKey]: res.data[catKey] || [] });
      setEditingCategory(catKey);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGalerie = async () => {
    try {
      const res = await axios.get(GALERIE_API);
      setBilder(res.data);
    } catch (err) {
      console.error("Galerie Fehler", err);
    }
  };

  /* ================= ÖFFNUNGSZEITEN EDIT ================= */

  const handleAddTime = (catKey) => {
    const newEntry = {
      id: `new-${Date.now()}`,
      wochentag: "Mo",
      von: "09:00",
      bis: "18:00",
      isNew: true,
    };

    setEditTimes((prev) => ({
      ...prev,
      [catKey]: [...(prev[catKey] || []), newEntry],
    }));
  };

  const handleEditTime = (catKey, id, field, value) => {
    setEditTimes((prev) => ({
      ...prev,
      [catKey]: prev[catKey].map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
  };

  const handleDelete = async (id) => {
    if (String(id).startsWith("new-")) {
      setEditTimes((prev) => ({
        ...prev,
        [editingCategory]: prev[editingCategory].filter((e) => e.id !== id),
      }));
      return;
    }

    if (!window.confirm("Eintrag wirklich löschen?")) return;

    await axios.delete(`${API}/oeffnungszeiten/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchOeffzeitenForEdit(editingCategory);
  };

  const handleSaveCategory = async (catKey) => {
    try {
      for (const item of editTimes[catKey]) {
        const payload = {
          wochentag: item.wochentag,
          von: item.von,
          bis: item.bis,
          kategorie: catKey === "__DEFAULT__" ? null : catKey,
        };

        if (item.isNew) {
          await axios.post(`${API}/oeffnungszeiten`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await axios.put(`${API}/oeffnungszeiten/${item.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      setEditingCategory(null);
      fetchOeffnungszeiten();
      alert("Gespeichert ✅");
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern");
    }
  };

  /* ================= GALERIE LIGHTBOX ================= */

  const closeFullscreen = () => setActiveIndex(null);
  const nextBild = useCallback(
    () => setActiveIndex((i) => (i + 1) % bilder.length),
    [bilder.length]
  );
  const prevBild = useCallback(
    () => setActiveIndex((i) => (i - 1 + bilder.length) % bilder.length),
    [bilder.length]
  );

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

  /* ================= RENDER ================= */

  if (loading) return <p>Lädt…</p>;

  return (
    <div className="home-container">
      {/* HEADER */}
      {homeContent && (
        <div
          className="home-header"
          style={{ backgroundImage: `url(${homeContent.bild || ""})` }}
        >
          <div className="overlay">
            <h1>{homeContent.willkommenText}</h1>
            {homeContent.willkommenLink && (
              <a href={homeContent.willkommenLink} target="_blank" rel="noreferrer">
                {homeContent.blinkText || "Mehr erfahren"}
              </a>
            )}
          </div>
        </div>
      )}

      {/* ÖFFNUNGSZEITEN */}
      <section className="oeffnungszeiten-section">
        <h2>Öffnungszeiten</h2>

        {oeffnungszeiten.map((cat, idx) => {
          const catKey = cat.kategorie ?? "__DEFAULT__";
          const isEditing = editingCategory === catKey;
          const entries = isEditing
            ? editTimes[catKey] || []
            : cat.eintraege || [];

          return (
            <div key={idx} className="category-block">
              <h3>{cat.kategorie ?? "Restaurant"}</h3>

              {!isEditing && (
                <div className="times-list">
                  {entries.map((e, i) =>
                    e.wochentage.map((day, j) => (
                      <div key={`${i}-${j}`} className="time-item">
                        <span className="day">{day}</span>
                        <span className="time">
                          {e.geschlossen ? "geschlossen" : e.zeiten.join(", ")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {isEditing && (
                <div className="edit-times">
                  {entries.map((e) => (
                    <div key={e.id} className="edit-row">
                      <select
                        value={e.wochentag}
                        onChange={(ev) =>
                          handleEditTime(catKey, e.id, "wochentag", ev.target.value)
                        }
                      >
                        {WOCHENTAGE.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>

                      <input
                        type="time"
                        value={e.von}
                        onChange={(ev) =>
                          handleEditTime(catKey, e.id, "von", ev.target.value)
                        }
                      />

                      <input
                        type="time"
                        value={e.bis}
                        onChange={(ev) =>
                          handleEditTime(catKey, e.id, "bis", ev.target.value)
                        }
                      />

                      <FaTrash
                        className="icon delete"
                        onClick={() => handleDelete(e.id)}
                      />
                    </div>
                  ))}

                  <div className="edit-actions">
                    <button onClick={() => handleAddTime(catKey)}>
                      <FaPlus /> Öffnungszeit
                    </button>
                    <button onClick={() => handleSaveCategory(catKey)}>
                      <FaSave /> Speichern
                    </button>
                  </div>
                </div>
              )}

              {isAdmin && !isEditing && (
                <button
                  className="edit-btn"
                  onClick={() => fetchOeffzeitenForEdit(catKey)}
                >
                  <FaEdit /> Bearbeiten
                </button>
              )}
            </div>
          );
        })}
      </section>

      {/* GALERIE */}
      <section className="galerie-section">
        <h2>Galerie</h2>
        <div className="grid">
          {bilder.map((bild, index) => (
            <div key={bild.id} className="item">
              <img
                src={bild.bild}
                alt=""
                onClick={() => setActiveIndex(index)}
              />
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
      </section>
    </div>
  );
};

export default Home;
