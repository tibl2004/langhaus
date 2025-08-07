import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EventList.scss";
import { Link, useNavigate } from "react-router-dom";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTypes, setUserTypes] = useState([]); // Array mit Rollen
  const navigate = useNavigate();

  useEffect(() => {
    // Events laden
    axios
      .get("https://jugehoerig-backend.onrender.com/api/event")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Fehler beim Laden der Events");
        setLoading(false);
      });

    // User-Rollen aus localStorage holen
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.userTypes) {
      setUserTypes(storedUser.userTypes);
    }
  }, []);

  const handleCreateNewClick = () => {
    navigate("/event/create");
  };

  // Prüfe, ob Rolle admin oder vorstand ist
  const canCreateEvent = userTypes.includes("admin") || userTypes.includes("vorstand");

  if (loading) return <p className="loading">Lade Events...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="event-list">
      <h1>Events Übersicht</h1>

      {canCreateEvent && (
        <button
          className="create-button"
          onClick={handleCreateNewClick}
          aria-label="Neues Event erstellen"
          title="Neues Event erstellen"
        >
          +
        </button>
      )}

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">Keine Events vorhanden</p>
        ) : (
          events.map((event) => (
            <Link key={event.id} to={`/event/${event.id}`} className="event-card">
              {event.bild && (
                <div className="event-image">
                  <img src={event.bild} alt={event.titel} loading="lazy" />
                </div>
              )}
              <div className="event-content">
                <h2>{event.titel}</h2>
                <p>{event.beschreibung.substring(0, 100)}{event.beschreibung.length > 100 ? "..." : ""}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
