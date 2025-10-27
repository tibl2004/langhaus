import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // Korrektur
import "./Vorstand.scss";

const Vorstand = () => {
  const [vorstand, setVorstand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const roles = decoded?.userTypes || [];
        setIsAdmin(roles.includes("vorstand"));
      } catch {
        setIsAdmin(false);
      }
    }

    const fetchVorstandFotos = async () => {
      try {
        const response = await axios.get(
          "https://jugehoerig-backend.onrender.com/api/vorstand/fotos",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVorstand(response.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    };

    fetchVorstandFotos();
  }, []);

  if (loading) return <div className="loading">Lade...</div>;
  if (error) return <div className="error">Fehler: {error}</div>;

  const handleCreateNewClick = () => navigate("/vorstand-erstellen");

  return (
    <section className="vorstand-fotos">
      <h2>Vorstand Fotos</h2>
      {isAdmin && (
        <button className="create-button" onClick={handleCreateNewClick}>
          +
        </button>
      )}
      <ul>
        {vorstand.map(({ vorname, nachname, foto }, index) => (
          <li key={index}>
            {foto ? (
              <img
                src={`data:image/png;base64,${foto}`}
                alt={`Foto von ${vorname} ${nachname}`}
                loading="lazy"
              />
            ) : (
              <div className="placeholder">Kein Bild</div>
            )}
            <p>{vorname} {nachname}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Vorstand;

