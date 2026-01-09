import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.scss";

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const Home = () => {
  const [oeffnungszeiten, setoeffnungszeiten] = useState([]); // komprimierte Ansicht
  const [editoeffnungszeiten, setEditoeffnungszeiten] = useState({}); // Bearbeiten pro Kategorie
  const [editingCategory, setEditingCategory] = useState(null); // Kategorie aktuell bearbeiten
  const [homeContent, setHomeContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem("token");

  // Home Content
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.userTypes?.includes("admin")) setIsAdmin(true);
    fetchHomeContent();
    fetchoeffnungszeiten();
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

  // Komprimierte Ansicht
  const fetchoeffnungszeiten = async () => {
    try {
      const res = await axios.get("https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setoeffnungszeiten(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Unkomprimierte Öffnungszeiten für Bearbeiten
  const fetchoeffnungszeitenForEdit = async (catKey) => {
    try {
      const res = await axios.get("https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/edit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditoeffnungszeiten({ [catKey]: res.data[catKey] || [] });
      setEditingCategory(catKey);
    } catch (err) {
      console.error(err);
    }
  };

  // Änderungen pro Zeitblock
  const handleEditTime = (catKey, id, field, value) => {
    setEditoeffnungszeiten((prev) => {
      const catData = prev[catKey].map((eintrag) =>
        eintrag.id === id ? { ...eintrag, [field]: value } : eintrag
      );
      return { ...prev, [catKey]: catData };
    });
  };

  // Speichern pro Kategorie
  const handleSaveKategorie = async (catKey) => {
    try {
      const updates = editoeffnungszeiten[catKey];
      for (const eintrag of updates) {
        await axios.put(`https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/${eintrag.id}`, {
          wochentag: eintrag.wochentag,
          von: eintrag.von,
          bis: eintrag.bis,
          kategorie: catKey === "__DEFAULT__" ? null : catKey,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      alert(`Kategorie "${catKey === "__DEFAULT__" ? "Restaurant" : catKey}" gespeichert!`);
      setEditingCategory(null);
      fetchoeffnungszeiten();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern");
    }
  };

  // Löschen eines Zeitblocks
  const handleOeffDelete = async (id) => {
    if (!window.confirm("Willst du diesen Eintrag wirklich löschen?")) return;
    try {
      await axios.delete(`https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (editingCategory) fetchoeffnungszeitenForEdit(editingCategory);
      else fetchoeffnungszeiten();
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen");
    }
  };

  if (loading) return <p>Lädt...</p>;

  return (
    <div className="home-content-container">
      {/* Home Display */}
      {homeContent && (
        <div
          className="home-display"
          style={{
            backgroundImage: `url(${homeContent.bild || ""})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h2>{homeContent.willkommenText}</h2>
          {homeContent.willkommenLink && (
            <a href={homeContent.willkommenLink} target="_blank" rel="noreferrer">
              {homeContent.blinkText || "Zum Link"}
            </a>
          )}
        </div>
      )}

      {/* Öffnungszeiten */}
      <div className="oeffnungszeiten-box">
        <h3>Öffnungszeiten</h3>

        {oeffnungszeiten.map((item, index) => {
          const title = item.kategorie ?? "Restaurant";
          const eintraege = item.eintraege ?? [];
          const catKey = item.kategorie ?? "__DEFAULT__";
          const isEditing = editingCategory === catKey;

          return (
            <div key={index} className="oeff-kategorie-block">
              <h4>{title}</h4>

              {isEditing ? (
                // Bearbeiten-Ansicht pro Kategorie
                editoeffnungszeiten[catKey]?.map((eintrag) => (
                  <div key={eintrag.id} className="oeff-item">
                    <label>
                      {eintrag.wochentag}:
                      <input
                        type="time"
                        value={eintrag.von || ""}
                        onChange={(e) =>
                          handleEditTime(catKey, eintrag.id, "von", e.target.value)
                        }
                      />
                      <input
                        type="time"
                        value={eintrag.bis || ""}
                        onChange={(e) =>
                          handleEditTime(catKey, eintrag.id, "bis", e.target.value)
                        }
                      />
                    </label>
                    <button onClick={() => handleOeffDelete(eintrag.id)}>Löschen</button>
                  </div>
                ))
              ) : (
                // Komprimierte Ansicht
                eintraege.map((eintrag, i) =>
                  (eintrag.wochentage ?? []).map((tage, j) => (
                    <div key={`${i}-${j}`} className="oeff-item">
                      <strong>{tage}:</strong>
                      {eintrag.geschlossen ? (
                        <span> geschlossen</span>
                      ) : (
                        <span>{(eintrag.zeiten ?? []).join(", ")}</span>
                      )}
                    </div>
                  ))
                )
              )}

              {/* Admin Buttons */}
              {isAdmin && !isEditing && (
                <button onClick={() => fetchoeffnungszeitenForEdit(catKey)}>
                  Bearbeiten
                </button>
              )}
              {isAdmin && isEditing && (
                <button onClick={() => handleSaveKategorie(catKey)}>
                  Speichern
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
