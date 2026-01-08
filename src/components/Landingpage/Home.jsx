import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.scss";

const Home = () => {
  const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const [oeffnungszeiten, setOeffnungszeiten] = useState([]);
  const [showOeffForm, setShowOeffForm] = useState(false);
  const [oeffFormData, setOeffFormData] = useState({ id: null, wochentag: "", von: "", bis: "", kategorie: "" });
  const [editOeff, setEditOeff] = useState(null);
  const [homeContent, setHomeContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [willkommenText, setWillkommenText] = useState("");
  const [willkommenLink, setWillkommenLink] = useState("");
  const [blinkText, setBlinkText] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.userTypes?.includes("admin")) setIsAdmin(true);
    fetchHomeContent();
    fetchOeffnungszeiten(); // automatisch Öffnungszeiten laden
  }, []);

  const fetchHomeContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://restaurant-langhaus-backend.onrender.com/api/home");
      const data = res.data;
      setHomeContent(data);
      setWillkommenText(data?.willkommenText || "");
      setWillkommenLink(data?.willkommenLink || "");
      setBlinkText(data?.blinkText || "");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Fehler beim Laden des Home-Contents");
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

  // 🟢 NEU: handleOeffChange
  const handleOeffChange = (e) => {
    const { name, value } = e.target;
    setOeffFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOeffSubmit = async (e) => {
    e.preventDefault();
    if (!oeffFormData.wochentag) return alert("Bitte einen Wochentag auswählen");

    try {
      if (editOeff) {
        await axios.put(
          `https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/${editOeff.id}`,
          oeffFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditOeff(null);
      } else {
        await axios.post(
          "https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten",
          oeffFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowOeffForm(false);
      setOeffFormData({ id: null, wochentag: "", von: "", bis: "", kategorie: "" });
      fetchOeffzeiten();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Fehler beim Speichern");
    }
  };

  const handleOeffDelete = async (id) => {
    if (!window.confirm("Willst du diesen Eintrag wirklich löschen?")) return;
    try {
      await axios.delete(`https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOeffzeiten();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Fehler beim Löschen");
    }
  };

  const handleUpdateHome = async (e) => {
    e.preventDefault();
    if (!willkommenText || !willkommenLink) return alert("Bitte Text und Link angeben");

    try {
      const res = await axios.put(
        "https://restaurant-langhaus-backend.onrender.com/api/home",
        { willkommenText, willkommenLink, blinkText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(res.data.message);
      setShowForm(false);
      fetchHomeContent();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Fehler beim Speichern");
    }
  };

  if (loading) return <p>Lädt...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="home-content-container">
      {/* Home Display */}
      {homeContent ? (
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
      ) : (
        <p>Kein Home-Content vorhanden.</p>
      )}

      {/* Öffnungszeiten */}
      <div className="oeffnungszeiten-box">
        <h3>Öffnungszeiten</h3>
        {oeffnungszeiten.length === 0 && <p>Keine Öffnungszeiten hinterlegt.</p>}
        {oeffnungszeiten.map((item) => (
          <div key={item.id} className="oeff-item">
            {item.kategorie && <h4>{item.kategorie}</h4>}
            {item.wochentage.map((tag, i) => (
              <div key={i} className="oeff-range">
                <strong>{tag}:</strong>
                {item.geschlossen ? (
                  <div>geschlossen</div>
                ) : (
                  item.zeiten.map((z, j) => (
                    <div key={j}>
                      {z}
                      {isAdmin && (
                        <>
                          <button onClick={() => {
                            setEditOeff({ id: item.id });
                            setOeffFormData({
                              id: item.id,
                              wochentag: tag,
                              von: z.split(" – ")[0],
                              bis: z.split(" – ")[1],
                              kategorie: item.kategorie || "",
                            });
                            setShowOeffForm(true);
                          }}>Bearbeiten</button>
                          <button onClick={() => handleOeffDelete(item.id)}>Löschen</button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Öffnungszeiten Form */}
      {showOeffForm && (
        <div className="overlay">
          <form className="home-form" onSubmit={handleOeffSubmit}>
            <h3>{editOeff ? "Öffnungszeiten bearbeiten" : "Öffnungszeiten hinzufügen"}</h3>
            <label>
              Wochentag:
              <select name="wochentag" value={oeffFormData.wochentag} onChange={handleOeffChange} required>
                <option value="">– auswählen –</option>
                {WOCHENTAGE.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </label>
            <label>
              Von:
              <input type="time" name="von" value={oeffFormData.von} onChange={handleOeffChange} />
            </label>
            <label>
              Bis:
              <input type="time" name="bis" value={oeffFormData.bis} onChange={handleOeffChange} />
            </label>
            <label>
              Kategorie:
              <input type="text" name="kategorie" value={oeffFormData.kategorie} onChange={handleOeffChange} placeholder="z.B. Küche" />
            </label>
            <div className="form-buttons">
              <button type="submit">{editOeff ? "Aktualisieren" : "Speichern"}</button>
              <button type="button" onClick={() => {
                setShowOeffForm(false);
                setEditOeff(null);
                setOeffFormData({ id: null, wochentag: "", von: "", bis: "", kategorie: "" });
              }}>Abbrechen</button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && !showOeffForm && (
        <button className="add-button" onClick={() => {
          setShowOeffForm(true);
          setEditOeff(null);
          setOeffFormData({ id: null, wochentag: "", von: "", bis: "", kategorie: "" });
        }}>+ Öffnungszeit hinzufügen</button>
      )}

      {/* Admin Home Form */}
      {isAdmin && !showForm && (
        <button className="add-button" onClick={() => setShowForm(true)}>
          {homeContent ? "Home-Content bearbeiten" : "+ Home-Content erstellen"}
        </button>
      )}

      {showForm && (
        <div className="overlay">
          <form className="home-form" onSubmit={handleUpdateHome}>
            <h3>{homeContent ? "Home-Content bearbeiten" : "Home-Content erstellen"}</h3>
            <div className="form-group">
              <label>Willkommen Text:</label>
              <input type="text" value={willkommenText} onChange={(e) => setWillkommenText(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Willkommen Link:</label>
              <input type="text" value={willkommenLink} onChange={(e) => setWillkommenLink(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Link Text:</label>
              <input type="text" value={blinkText} onChange={(e) => setBlinkText(e.target.value)} />
            </div>
            <div className="form-buttons">
              <button type="submit">Speichern</button>
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Abbrechen</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Home;
