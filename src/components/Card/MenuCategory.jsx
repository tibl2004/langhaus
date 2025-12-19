import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MenuCategory.scss";
import axios from "axios";

const MenuCategory = () => {
  const { id } = useParams();

  const [category, setCategory] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const [name, setName] = useState("");
  const [nummer, setNummer] = useState("");
  const [zutaten, setZutaten] = useState("");
  const [preis, setPreis] = useState("");

  const loadCategory = async () => {
    try {
      const res = await axios.get(
        `https://restaurant-langhaus-backend.onrender.com/api/menu/category/${id}`
      );
      setCategory(res.data);
    } catch (err) {
      console.error("Fehler beim Laden der Kategorie:", err);
    }
  };
  
  useEffect(() => {
    loadCategory();
  }, [id]);

  // 🔹 Item erstellen
  const handleCreateItem = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://restaurant-langhaus-backend.onrender.com/api/menu/item",
        {
          nummer,
          category_id: id,
          name,
          zutaten,
          preis
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      setPopupOpen(false);
      setName("");
      setNummer("");
      setZutaten("");
      setPreis("");
      loadCategory();
    } catch (err) {
      console.error("Fehler beim Erstellen des Items:", err);
    }
  };

  if (!category) {
    return <div className="category__loading">Lade...</div>;
  }

  return (
    <div className="category">
      <div className="category__header">
        <h1 className="category__title">{category.name}</h1>

        <button
          className="category__add-button"
          onClick={() => setPopupOpen(true)}
        >
          + Neues Gericht
        </button>
      </div>

      <ul className="category__items">
        {category.items.map(item => (
          <li className="category__item" key={item.id}>
            <div className="category__item-left">
              <span className="category__number">{item.nummer}.</span>
              <div>
                <h3 className="category__name">{item.name}</h3>
                {item.zutaten && (
                  <p className="category__ingredients">{item.zutaten}</p>
                )}
              </div>
            </div>

            <span className="category__price">
              CHF {Number(item.preis).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>

      {/* 🔥 POPUP */}
      {popupOpen && (
        <div className="popup">
          <div
            className="popup__overlay"
            onClick={() => setPopupOpen(false)}
          />

          <div className="popup__content">
            <div className="popup__header">
              <h2>Gericht erstellen</h2>
              <button
                className="popup__close"
                onClick={() => setPopupOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="popup__form" onSubmit={handleCreateItem}>
              <input
                className="popup__input"
                placeholder="Nummer"
                value={nummer}
                onChange={(e) => setNummer(e.target.value)}
                required
              />

              <input
                className="popup__input"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                className="popup__input"
                placeholder="Zutaten"
                value={zutaten}
                onChange={(e) => setZutaten(e.target.value)}
              />

              <input
                className="popup__input"
                placeholder="Preis"
                value={preis}
                onChange={(e) => setPreis(e.target.value)}
                required
              />

              <button className="popup__submit">
                Erstellen
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuCategory;
