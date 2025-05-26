import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UeberUns.scss";

function UeberUns() {
  const [vorstand, setVorstand] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVorstand = async () => {
      try {
        const response = await axios.get("https://jugehoerig-backend.onrender.com/api/vorstand/public");
        setVorstand(response.data);
      } catch (error) {
        console.error("Fehler beim Laden des Vorstands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVorstand();
  }, []);

  if (loading) return <p className="vorstand-loading">Lade Vorstandsmitglieder...</p>;

  return (
    <div className="vorstand-container">
      <h2 className="vorstand-title">Unser Vorstand</h2>

      {vorstand.length === 0 ? (
        <p className="vorstand-empty">Keine Daten gefunden.</p>
      ) : (
        <div className="vorstand-grid">
          {vorstand.map((mitglied, index) => (
            <div className="vorstand-card" key={index}>
              <div className="vorstand-image-wrapper">
                {mitglied.foto && (
                  <img
                    src={mitglied.foto}
                    alt={`Foto von ${mitglied.vorname} ${mitglied.nachname}`}
                    className="vorstand-foto"
                  />
                )}
                <div className="vorstand-rolle-overlay">
                  {mitglied.rolle}
                </div>
              </div>
              <div className="vorstand-info">
                <h3 className="vorstand-name">{mitglied.vorname} {mitglied.nachname}</h3>
                <p className="vorstand-beschreibung">{mitglied.beschreibung}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UeberUns;
