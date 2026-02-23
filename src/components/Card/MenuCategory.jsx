import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./MenuCategory.scss";

const API = "https://restaurant-langhaus-backend.onrender.com/api/menu";

export default function MenuCategory() {
  const { cardId } = useParams();
  const token = localStorage.getItem("token");

  const [cardData, setCardData] = useState({ card: {}, categories: [] });
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [itemForm, setItemForm] = useState({
    nummer: "",
    name: "",
    zutaten: "",
    preis: ""
  });

  const isMainMenuCard = cardId === "1"; // Karte 1 = Hauptspeisekarte

  // ---------------- LOAD CARD + CATEGORIES ----------------
  const loadCard = useCallback(async () => {
    try {
      if (isMainMenuCard) {
        const res = await axios.get(`${API}/main-menu`);
        const combinedCategories = [];
  
        res.data.forEach(({ card, categories }) => {
          categories.forEach((cat) => {
            combinedCategories.push({
              ...cat,
              cardName: card.name
            });
          });
        });
  
        setCardData({
          card: { id: "1", name: "Hauptspeisekarte" },
          categories: combinedCategories
        });
      } else {
        const res = await axios.get(`${API}/cards/${cardId}/categories`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
  
        setCardData({
          card: { id: cardId, name: res.data.card?.name || "Karte" },
          categories: res.data.categories || []
        });
      }
    } catch (err) {
      console.error("Fehler beim Laden der Karte:", err);
    }
  }, [cardId, token, isMainMenuCard]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  // ---------------- CREATE CATEGORY ----------------
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    if (!token) return alert("Bitte anmelden, um Kategorien zu erstellen.");

    try {
      await axios.post(
        `${API}/cards/${cardId}/categories`,
        { name: newCategoryName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCategoryName("");
      loadCard();
    } catch (err) {
      console.error("Fehler beim Erstellen der Kategorie:", err);
    }
  };

  // ---------------- OPEN POPUP ----------------
  const openItemPopup = (categoryId) => {
    setCurrentCategoryId(categoryId);
    setPopupOpen(true);
  };

  // ---------------- CREATE ITEM ----------------
  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!token) return alert("Bitte anmelden.");
    if (!currentCategoryId) return;

    try {
      await axios.post(
        `${API}/categories/${currentCategoryId}/items`,
        { ...itemForm },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItemForm({ nummer: "", name: "", zutaten: "", preis: "" });
      setPopupOpen(false);
      setCurrentCategoryId(null);
      loadCard();
    } catch (err) {
      console.error("Fehler beim Erstellen des Items:", err);
    }
  };

  return (
    <div className="menu-card-view">
      <h1>{cardData.card.name}</h1>

      {/* ================= NEUE KATEGORIE ================= */}
      {token && (
        <section className="new-category">
          <h2>Neue Kategorie erstellen</h2>
          <form onSubmit={handleCreateCategory}>
            <input
              placeholder="Name der Kategorie"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
            <button type="submit">Kategorie erstellen</button>
          </form>
        </section>
      )}

      {/* ================= KATEGORIEN ================= */}
      {cardData.categories.length === 0 && (
        <p>Keine Kategorien vorhanden.</p>
      )}

      {cardData.categories.map((category) => (
        <div key={category.id} className="category">
          <h2>
            {category.name} {category.cardName && `(von ${category.cardName})`}
          </h2>

          <ul className="category-items">
            {category.items && category.items.length > 0 ? (
              category.items.map((item) => (
                <li key={item.id} className="item">
                  <span className="nummer">{item.nummer}</span>
                  <span className="name">{item.name}</span>
                  {item.zutaten && <span className="zutaten">{item.zutaten}</span>}
                  <span className="preis">CHF {Number(item.preis).toFixed(2)}</span>
                </li>
              ))
            ) : (
              <li className="no-items">Noch keine Items vorhanden.</li>
            )}
          </ul>

          {token && (
            <button onClick={() => openItemPopup(category.id)}>
              + Neues Gericht
            </button>
          )}
        </div>
      ))}

      {/* ================= POPUP ================= */}
      {popupOpen && (
        <div className="popup-overlay" onClick={() => setPopupOpen(false)}>
          <div className="popup-form" onClick={(e) => e.stopPropagation()}>
            <h2>Neues Gericht erstellen</h2>
            <form onSubmit={handleCreateItem}>
              <input
                placeholder="Nummer (optional)"
                value={itemForm.nummer}
                onChange={(e) =>
                  setItemForm({ ...itemForm, nummer: e.target.value })
                }
              />
              <input
                placeholder="Name"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm({ ...itemForm, name: e.target.value })
                }
                required
              />
              <input
                placeholder="Zutaten"
                value={itemForm.zutaten}
                onChange={(e) =>
                  setItemForm({ ...itemForm, zutaten: e.target.value })
                }
              />
              <input
                placeholder="Preis"
                type="number"
                step="0.01"
                value={itemForm.preis}
                onChange={(e) =>
                  setItemForm({ ...itemForm, preis: e.target.value })
                }
                required
              />

              <div className="actions">
                <button type="submit" className="primary">Erstellen</button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => setPopupOpen(false)}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}