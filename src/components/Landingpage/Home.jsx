import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaEdit, FaSave } from "react-icons/fa";
import "./Home.scss";

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const Home = () => {
  const [oeffnungszeiten, setOeffnungszeiten] = useState([]);
  const [editTimes, setEditTimes] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [homeContent, setHomeContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.userTypes?.includes("admin")) setIsAdmin(true);
    fetchHomeContent();
    fetchOeffnungszeiten();
  }, []);

  const fetchHomeContent = async () => {
    try {
      const res = await axios.get("https://restaurant-langhaus-backend.onrender.com/api/home");
      setHomeContent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOeffnungszeiten = async () => {
    try {
      const res = await axios.get("https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOeffnungszeiten(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOeffzeitenForEdit = async (catKey) => {
    try {
      const res = await axios.get("https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/edit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditTimes({ [catKey]: res.data[catKey] || [] });
      setEditingCategory(catKey);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditTime = (catKey, id, field, value) => {
    setEditTimes((prev) => {
      const updated = prev[catKey].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      );
      return { ...prev, [catKey]: updated };
    });
  };

  const handleSaveCategory = async (catKey) => {
    try {
      const updates = editTimes[catKey];
      for (const item of updates) {
        await axios.put(
          `https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/${item.id}`,
          {
            wochentag: item.wochentag,
            von: item.von,
            bis: item.bis,
            kategorie: catKey === "__DEFAULT__" ? null : catKey,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      alert(`Kategorie "${catKey === "__DEFAULT__" ? "Restaurant" : catKey}" gespeichert!`);
      setEditingCategory(null);
      fetchOeffnungszeiten();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Willst du diesen Eintrag wirklich löschen?")) return;
    try {
      await axios.delete(`https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingCategory) fetchOeffzeitenForEdit(editingCategory);
      else fetchOeffnungszeiten();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen");
    }
  };

  if (loading) return <p>Lädt...</p>;

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
                {homeContent.blinkText || "Zum Link"}
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
          const entries = cat.eintraege ?? [];

          return (
            <div key={idx} className="category-block">
              <h3>{cat.kategorie ?? "Restaurant"}</h3>

              {isEditing ? (
                <div className="edit-times">
                  {editTimes[catKey]?.map((entry) => (
                    <div key={entry.id} className="edit-row">
                      <span>{entry.wochentag}</span>
                      <input
                        type="time"
                        value={entry.von || ""}
                        onChange={(e) =>
                          handleEditTime(catKey, entry.id, "von", e.target.value)
                        }
                      />
                      <input
                        type="time"
                        value={entry.bis || ""}
                        onChange={(e) =>
                          handleEditTime(catKey, entry.id, "bis", e.target.value)
                        }
                      />
                      <FaTrash className="icon delete" onClick={() => handleDelete(entry.id)} />
                    </div>
                  ))}
                  <button className="save-btn" onClick={() => handleSaveCategory(catKey)}>
                    <FaSave /> Speichern
                  </button>
                </div>
              ) : (
                <div className="times-list">
                  {entries.map((entry, i) =>
                    (entry.wochentage ?? []).map((day, j) => (
                      <div
                        key={`${i}-${j}`}
                        className={`time-item ${entry.geschlossen ? "closed" : ""}`}
                      >
                        <span className="day">{day}</span>
                        <span className="time">
                          {entry.geschlossen ? "geschlossen" : (entry.zeiten ?? []).join(", ")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {isAdmin && !isEditing && (
                <button className="edit-btn" onClick={() => fetchOeffzeitenForEdit(catKey)}>
                  <FaEdit /> Bearbeiten
                </button>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default Home;
