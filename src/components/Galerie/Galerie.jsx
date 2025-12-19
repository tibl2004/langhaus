import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Galerie.scss";

const Galerie = () => {
  const [bilder, setBilder] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(null);

  const API_URL = "https://restaurant-langhaus-backend.onrender.com/api/galerie";

  // 🔹 Token aus localStorage
  const token = localStorage.getItem("token");

  // 🔹 UserType aus JWT
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserType(decoded.userTypes?.[0] || null);
      } catch (err) {
        console.error("Fehler beim Decodieren des Tokens:", err);
      }
    }
  }, [token]);

  // 🔹 Galerie laden
  const fetchGalerie = async () => {
    if (!token) return;
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBilder(res.data);
    } catch (err) {
      console.error("Fehler beim Laden der Galerie:", err);
    }
  };

  useEffect(() => {
    fetchGalerie();
  }, [token]);

  // 🔹 Dateien auswählen
  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  // 🔹 Hochladen
  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !token) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("bilder", file));

    try {
      setLoading(true);
      await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setSelectedFiles([]);
      fetchGalerie();
    } catch (err) {
      console.error("Fehler beim Upload:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Bild löschen
  const handleDelete = async (id) => {
    if (!window.confirm("Dieses Bild wirklich löschen?") || !token) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGalerie();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
    }
  };

  return (
    <div className="galerie-container">
      <h2>Galerie</h2>

      {userType === "admin" && (
        <div className="upload-section">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*"
          />
          <button
            onClick={handleUpload}
            disabled={loading || selectedFiles.length === 0}
          >
            {loading ? "Hochladen..." : "Bilder hochladen"}
          </button>

          <div className="preview">
            {selectedFiles.map((file, idx) => (
              <img
                key={idx}
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="preview-image"
              />
            ))}
          </div>
        </div>
      )}

      <div className="gallery-grid">
        {bilder.map((bild) => (
          <div key={bild.id} className="gallery-item">
            <img src={bild.bild} alt="Galerie" />
            {userType === "admin" && (
              <button
                className="delete-btn"
                onClick={() => handleDelete(bild.id)}
              >
                Löschen
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Galerie;
