import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UeberUns.scss";

function UeberUns() {
  const [vorstand, setVorstand] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loadingVorstand, setLoadingVorstand] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    // Vorstand laden
    const fetchVorstand = async () => {
      try {
        const response = await axios.get("https://jugehoerig-backend.onrender.com/api/vorstand/public");
        setVorstand(response.data);
      } catch (error) {
        console.error("Fehler beim Laden des Vorstands:", error);
      } finally {
        setLoadingVorstand(false);
      }
    };

    // YouTube-Videos laden
    const fetchVideos = async () => {
      try {
        const response = await axios.get("https://jugehoerig-backend.onrender.com/api/youtubelink");
        setVideos(response.data);
      } catch (error) {
        console.error("Fehler beim Laden der Videos:", error);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVorstand();
    fetchVideos();
  }, []);

  // Hilfsfunktion: YouTube Video-ID aus Link extrahieren
  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loadingVorstand || loadingVideos) return <p>Lade Inhalte...</p>;

  return (
    <div className="ueberuns-container">
      <h1>Über uns</h1>
      {/* YouTube Video-Frame */}
      <div className="video-frame-container">
        {videos.length === 0 ? (
          <p>Keine Videos verfügbar.</p>
        ) : (
          videos.map((video) => {
            const videoId = extractVideoId(video.link);
            if (!videoId) return null;
            return (
              <iframe
                key={video.id}
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ marginBottom: "1rem" }}
              ></iframe>
            );
          })
        )}
      </div>

      {/* Vorstand */}
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
                      src={`data:image/png;base64,${mitglied.foto}`}
                      alt={`Foto von ${mitglied.vorname} ${mitglied.nachname}`}
                      className="vorstand-foto"
                    />
                  )}
                  <div className="vorstand-rolle-overlay">{mitglied.rolle}</div>
                </div>
                <div className="vorstand-info">
                  <h3 className="vorstand-name">
                    {mitglied.vorname} {mitglied.nachname}
                  </h3>
                  <p className="vorstand-beschreibung">{mitglied.beschreibung}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UeberUns;
