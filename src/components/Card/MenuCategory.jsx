import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./MenuCategory.scss";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API = "https://restaurant-langhaus-backend.onrender.com/api/menu";

export default function MenuCategory() {
  const { cardId } = useParams();
  const token = localStorage.getItem("token");

  const [cardData, setCardData] = useState({ card: {}, categories: [] });
  const [popupOpen, setPopupOpen] = useState(false);
  const [editPopupOpen, setEditPopupOpen] = useState(false);

  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [gerichtForm, setGerichtForm] = useState({
    nummer: "",
    name: "",
    zutaten: "",
    preis: ""
  });

  const isMainMenuCard = cardId === "1";

  const loadCard = useCallback(async () => {
    try {
      if (isMainMenuCard) {
        const res = await axios.get(`${API}/main-menu`);
        const combinedCategories = [];
        res.data.forEach(({ card, categories }) => {
          categories.forEach((cat) => {
            combinedCategories.push({ ...cat, cardName: card.name });
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
      console.error("Fehler beim Laden:", err);
    }
  }, [cardId, token, isMainMenuCard]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  // Kategorie erstellen
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName || !token) return;

    await axios.post(
      `${API}/cards/${cardId}/categories`,
      { name: newCategoryName },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNewCategoryName("");
    loadCard();
  };

  // Popup öffnen (Create)
  const openGerichtPopup = (categoryId) => {
    setCurrentCategoryId(categoryId);
    setPopupOpen(true);
  };

  // Gericht erstellen
  const handleCreateGericht = async (e) => {
    e.preventDefault();
    if (!token || !currentCategoryId) return;

    await axios.post(
      `${API}/categories/${currentCategoryId}/items`,
      gerichtForm,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setGerichtForm({ nummer: "", name: "", zutaten: "", preis: "" });
    setPopupOpen(false);
    loadCard();
  };

  // Edit Popup öffnen
  const openEditPopup = (gericht) => {
    setCurrentItemId(gericht.id);
    setGerichtForm({
      nummer: gericht.nummer || "",
      name: gericht.name || "",
      zutaten: gericht.zutaten || "",
      preis: gericht.preis || ""
    });
    setEditPopupOpen(true);
  };

  // Gericht aktualisieren
  const handleUpdateGericht = async (e) => {
    e.preventDefault();
    if (!token || !currentItemId) return;

    await axios.put(
      `${API}/items/${currentItemId}`,
      gerichtForm,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setEditPopupOpen(false);
    setGerichtForm({ nummer: "", name: "", zutaten: "", preis: "" });
    setCurrentItemId(null);
    loadCard();
  };

  // Gericht löschen
  const handleDeleteGericht = async (itemId) => {
    if (!token) return;
    if (!window.confirm("Gericht wirklich löschen?")) return;

    await axios.delete(`${API}/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    loadCard();
  };

  const downloadPDF = () => {
    if (!cardData?.categories?.length) {
      console.warn("Keine Daten für PDF vorhanden");
      return;
    }
  
    const pdf = new jsPDF("p", "mm", "a4");
  
    const primary = [20, 20, 20];
    const gold = [180, 140, 40];
    const gray = [110, 110, 110];
  
    // =========================
    // HEADER
    // =========================
    pdf.setFillColor(...primary);
    pdf.rect(0, 0, 210, 35, "F");
  
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
  
    pdf.text(cardData.card?.name || "Speisekarte", 105, 18, {
      align: "center"
    });
  
    pdf.setFontSize(10);
    pdf.setTextColor(220, 220, 220);
  
    pdf.text("Restaurant Langhaus", 105, 27, {
      align: "center"
    });
  
    let currentY = 45;
  
    // =========================
    // KATEGORIEN
    // =========================
    cardData.categories.forEach((category) => {
      if (!category) return;
  
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }
  
      // Kategorie Titel
      pdf.setFillColor(...gold);
      pdf.roundedRect(14, currentY - 6, 182, 10, 2, 2, "F");
  
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
  
      pdf.text(category.name || "", 18, currentY);
  
      currentY += 12;
  
      // Items
      const rows = (category.items || []).map((item) => [
        item.nummer || "",
        item.name || "",
        item.zutaten || "",
        `CHF ${Number(item.preis || 0).toFixed(2)}`
      ]);
  
      autoTable(pdf, {
        startY: currentY,
  
        head: [["Nr.", "Gericht", "Beschreibung", "Preis"]],
  
        body: rows,
  
        theme: "grid",
  
        styles: {
          font: "helvetica",
          fontSize: 9,
          cellPadding: 3,
          textColor: primary,
          lineColor: [220, 220, 220],
          lineWidth: 0.2
        },
  
        headStyles: {
          fillColor: primary,
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
  
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
  
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 55 },
          2: { cellWidth: 85 },
          3: { cellWidth: 25, halign: "right" }
        },
  
        margin: { left: 14, right: 14 },
  
        didDrawPage: () => {
          const pageHeight = pdf.internal.pageSize.height;
  
          pdf.setDrawColor(...gold);
          pdf.line(14, pageHeight - 15, 196, pageHeight - 15);
  
          pdf.setFontSize(9);
          pdf.setTextColor(...gray);
  
          pdf.text("Alle Preise inkl. 8.1% MWST", 14, pageHeight - 8);
  
          pdf.text(
            `Seite ${pdf.internal.getNumberOfPages()}`,
            196,
            pageHeight - 8,
            { align: "right" }
          );
        }
      });
  
      currentY = pdf.lastAutoTable.finalY + 10;
    });
  
    // =========================
    // SAFE FILENAME
    // =========================
    const safeName = (cardData.card?.name || "speisekarte")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
  
    pdf.save(`${safeName}.pdf`);
  };
    return (
      <div className="menu-card-view">

{token && (
  <>
   

    <div className="pdf-actions">
      <button className="download-pdf" onClick={downloadPDF}>
        PDF herunterladen
      </button>
    </div>
  </>
)}
        <h1>{cardData.card.name}</h1>

        {/* Kategorie erstellen */}
        {token && (
          <section className="new-category">
            <h2>Neue Kategorie</h2>
            <form onSubmit={handleCreateCategory}>
              <input
                placeholder="Name der Kategorie"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
              <button type="submit" className="primary">
                Kategorie erstellen
              </button>
            </form>
          </section>
        )}

        {/* Kategorien */}
        {cardData.categories.map((category) => (
          <div key={category.id} className="category">
            <h2>{category.name}</h2>

            <ul className="category-gerichte">
              {category.items?.length > 0 ? (
                category.items.map((gericht) => (
                  <li key={gericht.id} className="gericht">
                    <div className="gericht-row">
                      <span className="name">{gericht.name}</span>
                      <span className="preis">
                        CHF {Number(gericht.preis).toFixed(2)}
                      </span>
                    </div>

                    {gericht.zutaten && (
                      <div className="zutaten">{gericht.zutaten}</div>
                    )}

                    {token && (
                      <div className="actions">
                        <button onClick={() => openEditPopup(gericht)}>
                          Bearbeiten
                        </button>
                        <button
                          className="danger"
                          onClick={() => handleDeleteGericht(gericht.id)}
                        >
                          Löschen
                        </button>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="no-gerichte">Noch keine Gerichte vorhanden</li>
              )}
            </ul>

            {token && (
              <button
                className="add-gericht"
                onClick={() => openGerichtPopup(category.id)}
              >
                + Neues Gericht
              </button>
            )}
          </div>
        ))}

        {/* CREATE POPUP */}
        {popupOpen && (
          <div className="popup-overlay" onClick={() => setPopupOpen(false)}>
            <div className="popup-form" onClick={(e) => e.stopPropagation()}>
              <h2>Neues Gericht</h2>
              <form onSubmit={handleCreateGericht}>
                <input
                  placeholder="Nummer"
                  value={gerichtForm.nummer}
                  onChange={(e) =>
                    setGerichtForm({ ...gerichtForm, nummer: e.target.value })
                  }
                />
                <input
                  placeholder="Name"
                  required
                  value={gerichtForm.name}
                  onChange={(e) =>
                    setGerichtForm({ ...gerichtForm, name: e.target.value })
                  }
                />
                <input
                  placeholder="Zutaten"
                  value={gerichtForm.zutaten}
                  onChange={(e) =>
                    setGerichtForm({ ...gerichtForm, zutaten: e.target.value })
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preis"
                  required
                  value={gerichtForm.preis}
                  onChange={(e) =>
                    setGerichtForm({ ...gerichtForm, preis: e.target.value })
                  }
                />

                <div className="actions">
                  <button className="primary">Erstellen</button>
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

        {/* EDIT POPUP */}
        {editPopupOpen && (
          <div className="popup-overlay" onClick={() => setEditPopupOpen(false)}>
            <div className="popup-form" onClick={(e) => e.stopPropagation()}>
              <h2>Gericht bearbeiten</h2>
              <form onSubmit={handleUpdateGericht}>
                <input
                  placeholder="Nummer"
                  value={gerichtForm.nummer}
                  onChange={(e) =>
                    setGerichtForm({ ...gerichtForm, nummer: e.target.value })
                  }
                />
                <input
                  placeholder="Name"
                  required
                  value={gerichtForm.name}
                  onChange={(e) =>
                    setGerichtForm({ ...gerichtForm, name: e.target.value })
                  }
                />
                <input
                  placeholder="Zutaten"
                  value={gerichtForm.zutaten}
                  onChange={(e) =>
                    setGerichtForm({ ...gerichtForm, zutaten: e.target.value })
                  }
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preis"
                  required
                  value={gerichtForm.preis}
                  onChange={(e) =>
                    setGerichtForm({ ...gerichtForm, preis: e.target.value })
                  }
                />

                <div className="actions">
                  <button className="primary">Speichern</button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => setEditPopupOpen(false)}
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