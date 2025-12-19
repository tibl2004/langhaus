import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MenuCards.scss";

const MenuCards = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [mwst, setMwst] = useState("8.1");

  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "https://restaurant-langhaus-backend.onrender.com/api/menu"
      );
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    try {
      await axios.post(
        "https://restaurant-langhaus-backend.onrender.com/api/menu/category",
        { name, mwst },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );

      setShowModal(false);
      setName("");
      setMwst("8.1");
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="menu-cards">
        <div
          className="menu-card add-card"
          onClick={() => setShowModal(true)}
        >
          <h2>+ Kategorie</h2>
        </div>

        {categories.map(cat => (
          <div
            key={cat.id}
            className="menu-card"
            onClick={() => navigate(`/cards/${cat.id}`)}
          >
            <h2 className="menu-card__title">{cat.name}</h2>
            <p className="menu-card__count">
              {cat.items.length} Gerichte
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Kategorie erstellen</h2>

            <input
              type="text"
              placeholder="Kategorie Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <input
              type="number"
              step="0.1"
              placeholder="MwSt %"
              value={mwst}
              onChange={e => setMwst(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={handleCreateCategory}>
                Speichern
              </button>
              <button
                className="cancel"
                onClick={() => setShowModal(false)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuCards;
