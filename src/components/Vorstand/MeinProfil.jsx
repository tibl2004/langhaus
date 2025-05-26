import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MeinProfil.scss";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaInfoCircle } from "react-icons/fa";

function MeinProfil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://jugehoerig-backend.onrender.com/api/vorstand/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfil(response.data);
      } catch (err) {
        console.error("Fehler beim Laden des Profils:", err);
        setError("Profil konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, []);

  if (loading) return <p>Profil wird geladen...</p>;
  if (error) return <p>{error}</p>;
  if (!profil) return <p>Kein Profil gefunden.</p>;

  return (
    <div className="mein-profil-container">
      <h2>Mein Profil</h2>
      <div className="profil-card">
        {profil.foto && (
          <img
            src={`data:image/png;base64,${profil.foto}`}
            alt={`Foto von ${profil.vorname} ${profil.nachname}`}
            className="vorstand-foto"
          />
        )}
        <div className="profil-details">
          <h3>{profil.vorname} {profil.nachname}</h3>
          <p><FaMapMarkerAlt /><strong>Adresse:</strong> {profil.adresse}, {profil.plz} {profil.ort}</p>
          <p><FaPhone /><strong>Telefon:</strong> {profil.telefon}</p>
          <p><FaEnvelope /><strong>E-Mail:</strong> {profil.email}</p>
          <p><FaInfoCircle /><strong>Beschreibung:</strong> {profil.beschreibung}</p>
          <p><FaUser /><strong>Benutzername:</strong> {profil.benutzername}</p>
        </div>
      </div>
    </div>
  );
}

export default MeinProfil;
