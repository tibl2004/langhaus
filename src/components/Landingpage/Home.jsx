import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.scss";

const WOCHENTAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const Home = () => {
  const [homeContent, setHomeContent] = useState(null);
  const [oeffnungszeiten, setOeffnungszeiten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Home form
  const [bildFile, setBildFile] = useState(null);
  const [bildPreview, setBildPreview] = useState(null);
  const [willkommenText, setWillkommenText] = useState("");
  const [willkommenLink, setWillkommenLink] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Öffnungszeiten form
  const [showOeffForm, setShowOeffForm] = useState(false);
  const [oeffFormData, setOeffFormData] = useState({
    id: null,
    wochentag: "",
    von: "",
    bis: "",
    kategorie: "",
  });
  const [editOeff, setEditOeff] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.userTypes?.includes("admin")) setIsAdmin(true);
    fetchHomeContent();
    fetchOeffnungszeiten();
  }, []);

  const fetchHomeContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://restaurant-langhaus-backend.onrender.com/api/home");
      const data = res.data && Object.keys(res.data).length ? res.data : null;
      setHomeContent(data);
      setWillkommenText(data?.willkommenText || "");
      setWillkommenLink(data?.willkommenLink || "");
      setBildPreview(data?.bild || null);
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

  const handleBildChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBildFile(file);
      setBildPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateOrUpdateHome = async (e) => {
    e.preventDefault();
    if (!willkommenText || !willkommenLink || (!bildFile && !homeContent)) return alert("Bitte Text, Link und Bild angeben");

    try {
      const formData = new FormData();
      if (bildFile) formData.append("bild", bildFile);
      formData.append("willkommenText", willkommenText);
      formData.append("willkommenLink", willkommenLink);

      const method = homeContent ? "put" : "post";

      const res = await axios({
        method,
        url: "https://restaurant-langhaus-backend.onrender.com/api/home",
        data: formData,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      alert(res.data.message);
      setHomeContent({
        ...homeContent,
        willkommenText: res.data.willkommenText,
        willkommenLink: res.data.willkommenLink,
        bild: res.data.bild,
      });
      setBildFile(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Fehler beim Speichern");
    }
  };

  const handleDeleteHome = async () => {
    if (!homeContent) return;
    if (!window.confirm("Willst du wirklich löschen?")) return;

    try {
      const res = await axios.delete("https://restaurant-langhaus-backend.onrender.com/api/home", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(res.data.message);
      setHomeContent(null);
      setBildFile(null);
      setBildPreview(null);
      setWillkommenText("");
      setWillkommenLink("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Fehler beim Löschen");
    }
  };

  // Öffnungszeiten Form
  const handleOeffChange = (e) => {
    setOeffFormData({ ...oeffFormData, [e.target.name]: e.target.value });
  };

  const handleOeffSubmit = async (e) => {
    e.preventDefault();
    if (!oeffFormData.wochentag) return alert("Bitte einen Wochentag auswählen");

    try {
      if (editOeff) {
        // Bearbeiten
        await axios.put(
          `https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten/${editOeff.id}`,
          oeffFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditOeff(null);
      } else {
        // Neu hinzufügen
        await axios.post(
          "https://restaurant-langhaus-backend.onrender.com/api/oeffnungszeiten",
          oeffFormData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowOeffForm(false);
      setOeffFormData({ id: null, wochentag: "", von: "", bis: "", kategorie: "" });
      fetchOeffnungszeiten();
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
      fetchOeffnungszeiten();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Fehler beim Löschen");
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
          style={{ backgroundImage: `url(${bildPreview})` }}
        >
          <h2>{willkommenText}</h2>
          <a href={willkommenLink} target="_blank" rel="noreferrer">Zum Link</a>
        </div>
      ) : (
        <p>Kein Home-Content vorhanden.</p>
      )}

      {isAdmin && !showForm && (
        <button className="add-button" onClick={() => setShowForm(true)}>
          {homeContent ? "Home-Content bearbeiten" : "+ Home-Content erstellen"}
        </button>
      )}

      {showForm && (
        <div className="overlay">
          <form className="home-form" onSubmit={handleCreateOrUpdateHome}>
            <h3>{homeContent ? "Home-Content bearbeiten" : "Home-Content erstellen"}</h3>
            <div className="form-group">
              <label>Bild hochladen:</label>
              <input type="file" accept="image/*" onChange={handleBildChange} />
            </div>
            <div className="form-group">
              <label>Willkommen Text:</label>
              <input type="text" value={willkommenText} onChange={(e) => setWillkommenText(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Willkommen Link:</label>
              <input type="text" value={willkommenLink} onChange={(e) => setWillkommenLink(e.target.value)} required />
            </div>
            <div className="form-buttons">
              <button type="submit">{homeContent ? "Aktualisieren" : "Erstellen"}</button>
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Abbrechen</button>
              {homeContent && (
                <button type="button" className="delete-btn" onClick={handleDeleteHome}>Löschen</button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Öffnungszeiten Box */}
      <div className="oeffnungszeiten-box">
        <h3>Öffnungszeiten</h3>

        {oeffnungszeiten.length === 0 && <p>Keine Öffnungszeiten hinterlegt.</p>}

        {oeffnungszeiten.map((item, index) => (
          <div key={index} className="oeff-item">
            {item.kategorie && <h4>{item.kategorie}</h4>}

            {item.wochentage.map((range, i) => (
              <div key={i} className="oeff-range">
                <strong>{range}:</strong>
                {item.geschlossen ? (
                  <div>geschlossen</div>
                ) : (
                  item.zeiten.map((z, j) => (
                    <div key={j}>
                      {z}
                      {isAdmin && (
                        <>
                          <button onClick={() => {
                            setEditOeff({ id: item.id || null });
                            setOeffFormData({
                              id: item.id || null,
                              wochentag: range.split(" – ")[0],
                              von: z.split(" – ")[0],
                              bis: z.split(" – ")[1],
                              kategorie: item.kategorie || ""
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
              Von (leer = geschlossen):
              <input type="time" name="von" value={oeffFormData.von} onChange={handleOeffChange} />
            </label>
            <label>
              Bis (leer = geschlossen):
              <input type="time" name="bis" value={oeffFormData.bis} onChange={handleOeffChange} />
            </label>
            <label>
              Kategorie (optional):
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
        }}>
          + Öffnungszeit hinzufügen
        </button>
      )}

    </div>
  );
};

export default Home;
