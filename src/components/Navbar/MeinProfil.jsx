import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MeinProfil.scss";

function MeinProfil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Kein Token gefunden, bitte einloggen.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          "https://restaurant-langhaus-backend.onrender.com/api/admin/profil",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfil(response.data);
        setFormData({
          username: response.data.username || "",
          email: response.data.email || "",
          password: "",
        });
      } catch (err) {
        console.error("Fehler beim Laden des Profils:", err);
        setError("Profil konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:3000/api/admin/me",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Profil erfolgreich aktualisiert.");
      setEditMode(false);
      setProfil((prev) => ({
        ...prev,
        username: formData.username,
        email: formData.email,
      }));
    } catch (err) {
      console.error("Fehler beim Aktualisieren:", err);
      alert("Profil konnte nicht aktualisiert werden.");
    }
  };

  if (loading) return <p>Profil wird geladen...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!profil) return <p>Kein Profil gefunden.</p>;

  return (
    <div className="mein-profil-container">
      <h2>Mein Profil</h2>

      {!editMode ? (
        <div className="profil-card">
          <div className="profil-details">
            <p>
              <b>Benutzername:</b> {profil.username}
            </p>
            <p>
              <b>E-Mail:</b> {profil.email || "-"}
            </p>
          </div>
          <button onClick={() => setEditMode(true)}>Profil bearbeiten</button>
        </div>
      ) : (
        <form className="profil-form" onSubmit={handleSubmit}>
          <label>
            Benutzername:
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            E-Mail:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </label>
          <label>
            Neues Passwort (optional):
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Neues Passwort eingeben"
            />
          </label>
          <div style={{ marginTop: "15px" }}>
            <button type="submit">Speichern</button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              style={{ marginLeft: "10px" }}
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default MeinProfil;
