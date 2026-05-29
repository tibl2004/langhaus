import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import axios from "axios";

import {
  FaTrash,
  FaUpload,
} from "react-icons/fa";

import "./Galerie.scss";

const API =
  "https://restaurant-langhaus-backend.onrender.com/api";

const GALERIE_API =
  `${API}/galerie`;

const Galerie = () => {

  /*
  ====================================
  AUTH
  ====================================
  */

  const token =
    localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") ||
      "{}"
  );

  const isAdmin =
    user?.userTypes?.includes(
      "admin"
    );

  /*
  ====================================
  STATES
  ====================================
  */

  const [bilder,
    setBilder] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  const [activeIndex,
    setActiveIndex] =
    useState(null);

  const [uploadFiles,
    setUploadFiles] =
    useState([]);

  const [uploading,
    setUploading] =
    useState(false);

  /*
  ====================================
  FETCH
  ====================================
  */

  const fetchGalerie =
    useCallback(async () => {

      try {

        const res =
          await axios.get(
            GALERIE_API
          );

        setBilder(
          res.data || []
        );

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }

    }, []);

  useEffect(() => {

    fetchGalerie();

  }, [fetchGalerie]);

  /*
  ====================================
  UPLOAD
  ====================================
  */

  const handleUpload =
    async () => {

      if (!token) {

        alert(
          "Nicht eingeloggt"
        );

        return;
      }

      if (
        uploadFiles.length === 0
      ) {

        alert(
          "Bitte Bilder auswählen"
        );

        return;
      }

      try {

        setUploading(true);

        const formData =
          new FormData();

        uploadFiles.forEach(
          (file) => {

            formData.append(
              "bilder",
              file
            );
          }
        );

        await axios.post(
          `${GALERIE_API}/upload`,
          formData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "multipart/form-data",
            },
          }
        );

        setUploadFiles([]);

        await fetchGalerie();

        alert(
          "Upload erfolgreich ✅"
        );

      } catch (err) {

        console.error(err);

        alert(
          err.response?.data
            ?.error ||
            "Upload fehlgeschlagen"
        );

      } finally {

        setUploading(false);
      }
    };

  /*
  ====================================
  DELETE
  ====================================
  */

  const handleDelete =
    async (id) => {

      const ok =
        window.confirm(
          "Bild wirklich löschen?"
        );

      if (!ok) return;

      try {

        await axios.delete(
          `${GALERIE_API}/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setBilder((prev) =>
          prev.filter(
            (b) =>
              b.id !== id
          )
        );

        alert(
          "Bild gelöscht ✅"
        );

      } catch (err) {

        console.error(err);

        alert(
          err.response?.data
            ?.error ||
            "Löschen fehlgeschlagen"
        );
      }
    };

  /*
  ====================================
  LIGHTBOX
  ====================================
  */

  const closeFullscreen =
    () =>
      setActiveIndex(
        null
      );

  const nextBild =
    useCallback(
      () =>
        setActiveIndex(
          (i) =>
            (i + 1) %
            bilder.length
        ),
      [bilder.length]
    );

  const prevBild =
    useCallback(
      () =>
        setActiveIndex(
          (i) =>
            (i - 1 + bilder.length) %
            bilder.length
        ),
      [bilder.length]
    );

  useEffect(() => {

    if (
      activeIndex === null
    )
      return;

    const handleKey =
      (e) => {

        if (
          e.key ===
          "Escape"
        ) {
          closeFullscreen();
        }

        if (
          e.key ===
          "ArrowRight"
        ) {
          nextBild();
        }

        if (
          e.key ===
          "ArrowLeft"
        ) {
          prevBild();
        }
      };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );

  }, [
    activeIndex,
    nextBild,
    prevBild,
  ]);

  /*
  ====================================
  LOADING
  ====================================
  */

  if (loading)
    return <p>Lädt...</p>;

  /*
  ====================================
  RENDER
  ====================================
  */

  return (

    <div className="galerie-container">

      {/* HEADER */}

      <div className="galerie-header">

        <h1>
          Galerie
        </h1>

      </div>

      {/* ADMIN */}

      {isAdmin && (

        <div className="upload-box">

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) =>
              setUploadFiles(
                Array.from(
                  e.target.files ||
                    []
                )
              )
            }
          />

          <button
            onClick={
              handleUpload
            }
            disabled={
              uploading
            }
          >

            <FaUpload />

            {" "}

            {uploading
              ? "Upload läuft..."
              : "Bilder hochladen"}

          </button>

        </div>
      )}

      {/* GRID */}

      <section className="galerie-section">

        <div className="grid">

          {bilder.map(
            (b, i) => (

              <div
                key={b.id}
                className="galerie-item"
              >

<img
  src={String(b.bild).trim()}
  alt="Galerie Bild"
  loading="lazy"
  onClick={() =>
    setActiveIndex(i)
  }
  onError={(e) => {

    console.log(
      "KAPUTT:",
      b
    );

    console.log(
      "SRC:",
      String(b.bild).trim()
    );

    e.target.onerror = null;

    e.target.src =
      "https://dummyimage.com/600x400/000/fff&text=Fehler";
  }}
/>
                {isAdmin && (

                  <button
                    className="delete-btn"
                    onClick={() =>
                      handleDelete(
                        b.id
                      )
                    }
                  >

                    <FaTrash />

                  </button>
                )}

              </div>
            )
          )}

        </div>

      </section>

      {/* LIGHTBOX */}

      {activeIndex !==
        null && (

        <div
          className="lightbox"
          onClick={
            closeFullscreen
          }
        >

          <button
            className="nav prev"
            onClick={(e) => {

              e.stopPropagation();

              prevBild();
            }}
          >
            ❮
          </button>
          <img
  src={
    bilder[activeIndex]
      .bild
  }
  alt=""
/>
          <button
            className="nav next"
            onClick={(e) => {

              e.stopPropagation();

              nextBild();
            }}
          >
            ❯
          </button>

          <button
            className="close"
            onClick={(e) => {

              e.stopPropagation();

              closeFullscreen();
            }}
          >
            ✕
          </button>

        </div>
      )}

    </div>
  );
};

export default Galerie;