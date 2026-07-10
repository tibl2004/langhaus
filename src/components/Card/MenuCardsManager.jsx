import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MenuCardsManager.scss";

const API = "https://restaurant-langhaus-backend.onrender.com/api/menu";

export default function MenuCardsManager() {
  const [cards, setCards] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDrinkCardForm, setShowDrinkCardForm] = useState(false);

const [editingDrinkCard, setEditingDrinkCard] = useState(null);

const [drinkCardForm, setDrinkCardForm] = useState({
  name: "",
  start_date: "",
  end_date: "",
  include_in_main_menu: false,
});
  const DRINK_API = "https://restaurant-langhaus-backend.onrender.com/api/drinks";  const [drinkCards, setDrinkCards] = useState([]);
    const [form, setForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    include_in_main_menu: false
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const loadCards = async () => {
    try {
      const res = await axios.get(`${API}/cards`);
      setCards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCards();
    loadDrinkCards();
  }, []);
  const loadDrinkCards = async () => {
    try {
      const res = await axios.get(`${DRINK_API}/cards`);
      setDrinkCards(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submit = async () => {
    if (!form.name || !token) return alert("Name erforderlich oder nicht angemeldet");

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (editingId) {
        await axios.put(`${API}/cards/${editingId}`, form, config);
      } else {
        await axios.post(`${API}/cards`, form, config);
      }
      setForm({ name: "", start_date: "", end_date: "", include_in_main_menu: false });
      setEditingId(null);
      setShowForm(false);
      loadCards();
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    if (!token) return alert("Bitte anmelden");
    if (!window.confirm("Karte wirklich löschen?")) return;

    try {
      await axios.delete(`${API}/cards/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadCards();
    } catch (err) {
      console.error(err);
    }
  };

  const editDrinkCard = (card) => {
    setEditingDrinkCard(card.id);
  
    setDrinkCardForm({
      name: card.name,
      start_date: card.start_date || "",
      end_date: card.end_date || "",
      include_in_main_menu: !!card.include_in_main_menu
    });
  
    setShowDrinkCardForm(true);
  };

  const removeDrinkCard = async (id) => {
    if (!token) return alert("Bitte anmelden");
  
    if (!window.confirm("Getränkekarte wirklich löschen?"))
      return;
  
    try {
      await axios.delete(
        `${DRINK_API}/cards/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      loadDrinkCards();
    } catch (err) {
      console.error(err);
      alert("Löschen fehlgeschlagen");
    }
  };

  const submitDrinkCard = async () => {
    if (!drinkCardForm.name) {
      return alert("Bitte Namen eingeben");
    }
  
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  
    try {
      if (editingDrinkCard) {
        await axios.put(
          `${DRINK_API}/cards/${editingDrinkCard}`,
          drinkCardForm,
          config
        );
      } else {
        await axios.post(
          `${DRINK_API}/cards`,
          drinkCardForm,
          config
        );
      }
  
      setDrinkCardForm({
        name: "",
        start_date: "",
        end_date: "",
        include_in_main_menu: false,
      });
  
      setEditingDrinkCard(null);
      setShowDrinkCardForm(false);
  
      loadDrinkCards();
    } catch (err) {
      console.error(err);
      alert("Speichern fehlgeschlagen");
    }
  };

  const edit = (card) => {
    if (!token) return alert("Bitte anmelden");
    setEditingId(card.id);
    setForm({
      name: card.name,
      start_date: card.start_date || "",
      end_date: card.end_date || "",
      include_in_main_menu: !!card.include_in_main_menu
    });
    setShowForm(true);
  };

  const goToCard = (card) => navigate(`/card/${card.id}`);

  return (
    <div className="cards-manager">
      <header className="cards-manager__header">
        <h1>Speisekarten</h1>
        {token && <button className="add-button" onClick={() => setShowForm(true)}>+ Neue Karte</button>}
      </header>

      {showForm && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h2>{editingId ? "Karte bearbeiten" : "Neue Karte erstellen"}</h2>

            <input
              type="text"
              placeholder="Name der Karte"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label>
              Startdatum:
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </label>

            <label>
              Enddatum:
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.include_in_main_menu}
                onChange={(e) => setForm({ ...form, include_in_main_menu: e.target.checked })}
              />
              In Hauptmenü anzeigen
            </label>

            <div className="actions">
              <button className="primary" onClick={submit}>{editingId ? "Speichern" : "Erstellen"}</button>
              <button className="ghost" onClick={() => { setShowForm(false); setEditingId(null); setForm({ name: "", start_date: "", end_date: "", include_in_main_menu: false }); }}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
{showDrinkCardForm && (
  <div className="popup-overlay">
    <div className="popup-form">

      <h2>
        {editingDrinkCard
          ? "Getränkekarte bearbeiten"
          : "Neue Getränkekarte"}
      </h2>

      <input
        type="text"
        placeholder="Name"
        value={drinkCardForm.name}
        onChange={(e) =>
          setDrinkCardForm({
            ...drinkCardForm,
            name: e.target.value,
          })
        }
      />

      <label>
        Startdatum
        <input
          type="date"
          value={drinkCardForm.start_date}
          onChange={(e) =>
            setDrinkCardForm({
              ...drinkCardForm,
              start_date: e.target.value,
            })
          }
        />
      </label>

      <label>
        Enddatum
        <input
          type="date"
          value={drinkCardForm.end_date}
          onChange={(e) =>
            setDrinkCardForm({
              ...drinkCardForm,
              end_date: e.target.value,
            })
          }
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={drinkCardForm.include_in_main_menu}
          onChange={(e) =>
            setDrinkCardForm({
              ...drinkCardForm,
              include_in_main_menu: e.target.checked,
            })
          }
        />

        Im Hauptmenü anzeigen
      </label>

      <div className="actions">

        <button
          className="primary"
          onClick={submitDrinkCard}
        >
          Speichern
        </button>

        <button
          className="ghost"
          onClick={() => {
            setShowDrinkCardForm(false);
            setEditingDrinkCard(null);
          }}
        >
          Abbrechen
        </button>

      </div>

    </div>
  </div>
)}
      <section className="cards-list">
        {cards.length > 0 ? (
          cards.map((card) => (
            <div key={card.id} className="card-row" onClick={() => goToCard(card)} style={{ cursor: "pointer" }}>
              <div className="info">
                <span className="title">{card.name}</span>

                {token && (
                  <span className="meta">
                    {card.start_date && <>Start: {card.start_date} </>}
                    {card.end_date && <>Ende: {card.end_date} </>}
                    {" | "}
                    {card.include_in_main_menu
                      ? "Im Hauptmenü sichtbar"
                      : "Nicht im Hauptmenü"}
                  </span>
                )}
              </div>
              {token && (
                <div className="buttons">
                  <button onClick={(e) => { e.stopPropagation(); edit(card); }}>Bearbeiten</button>
                  <button className="danger" onClick={(e) => { e.stopPropagation(); remove(card.id); }}>Löschen</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Keine Karten vorhanden.</p>
        )}
      </section>

      {/* ============================= */}
{/* 🍺 GETRÄNKEKARTE */}
{/* ============================= */}

<section className="cards-list">
  <h2>Getränkekarten</h2>
  {token && (
  <button
    className="add-button"
    onClick={() => {
      setEditingDrinkCard(null);

      setDrinkCardForm({
        name: "",
        start_date: "",
        end_date: "",
        include_in_main_menu: false,
      });

      setShowDrinkCardForm(true);
    }}
  >
    + Neue Getränkekarte
  </button>
)}
  {drinkCards?.length > 0 ? (
    drinkCards.map((card) => (
      <div
        key={card.id}
        className="card-row"
        onClick={() => navigate(`/drink-card/${card.id}`)}
        style={{ cursor: "pointer" }}
      >
        <div className="info">
          <span className="title">
            {card.name}
          </span>

          {token && (
            <span className="meta">
              {card.categories?.length || 0} Kategorien
            </span>
          )}
        </div>

        {token && (
          <div className="buttons">
            <button
              onClick={(e) => {
                e.stopPropagation();
                editDrinkCard(card);
              }}
            >
              Bearbeiten
            </button>

            <button
              className="danger"
              onClick={(e) => {
                e.stopPropagation();
                removeDrinkCard(card.id);
              }}
            >
              Löschen
            </button>
          </div>
        )}
      </div>
    ))
  ) : (
    <p>Keine Getränkekarten vorhanden.</p>
  )}
</section>
    </div>
  );
}