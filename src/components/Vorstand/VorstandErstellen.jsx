import React, { useState } from 'react';
import './VorstandForm.scss';
import axios from 'axios';

export default function VorstandForm() {
  const [formData, setFormData] = useState({
    geschlecht: '',
    vorname: '',
    nachname: '',
    adresse: '',
    plz: '',
    ort: '',
    benutzername: '',
    passwort: '',
    telefon: '',
    email: '',
    foto: '',
    beschreibung: '',
    rolle: ''
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Pflichtfelder checken
    const requiredFields = ['geschlecht','vorname','nachname','adresse','plz','ort','benutzername','passwort','telefon','email','rolle'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError('Bitte alle Pflichtfelder ausfüllen.');
        return;
      }
    }

    try {
      const response = await axios.post('/api/vorstand', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
      // Erfolgreiche Antwort
      setSuccessMsg('Vorstand erfolgreich erstellt!');
      setFormData({
        geschlecht: '',
        vorname: '',
        nachname: '',
        adresse: '',
        plz: '',
        ort: '',
        benutzername: '',
        passwort: '',
        telefon: '',
        email: '',
        foto: '',
        beschreibung: '',
        rolle: ''
      });
      setFotoPreview(null);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Fehler beim Erstellen des Vorstands oder Netzwerkfehler.');
      }
    }
  };

  const handleFotoChange = e => {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result }));
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    } else {
      setError('Bitte nur PNG-Bilder hochladen.');
      setFotoPreview(null);
      setFormData(prev => ({ ...prev, foto: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vorstand-form">
      {fotoPreview && (
        <img src={fotoPreview} alt="Foto Vorschau" className="foto-preview" />
      )}
      <div className="form-content">
        {error && <p className="error-message">{error}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}

        <div className="form-row">
          <label htmlFor="geschlecht">Geschlecht*</label>
          <select
            id="geschlecht"
            name="geschlecht"
            value={formData.geschlecht}
            onChange={handleChange}
            required
          >
            <option value="">Bitte wählen</option>
            <option value="m">Männlich</option>
            <option value="w">Weiblich</option>
            <option value="d">Divers</option>
          </select>
        </div>

        <div className="form-row two-columns">
          <div>
            <label htmlFor="vorname">Vorname*</label>
            <input
              id="vorname"
              type="text"
              name="vorname"
              value={formData.vorname}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="nachname">Nachname*</label>
            <input
              id="nachname"
              type="text"
              name="nachname"
              value={formData.nachname}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label htmlFor="adresse">Adresse*</label>
        <input
          id="adresse"
          type="text"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          required
        />

        <div className="form-row two-columns">
          <div>
            <label htmlFor="plz">PLZ*</label>
            <input
              id="plz"
              type="text"
              name="plz"
              value={formData.plz}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="ort">Ort*</label>
            <input
              id="ort"
              type="text"
              name="ort"
              value={formData.ort}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label htmlFor="benutzername">Benutzername*</label>
        <input
          id="benutzername"
          type="text"
          name="benutzername"
          value={formData.benutzername}
          onChange={handleChange}
          required
        />

        <label htmlFor="passwort">Passwort*</label>
        <input
          id="passwort"
          type="password"
          name="passwort"
          value={formData.passwort}
          onChange={handleChange}
          required
        />

        <label htmlFor="telefon">Telefon*</label>
        <input
          id="telefon"
          type="tel"
          name="telefon"
          value={formData.telefon}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Email*</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="foto">Foto (PNG)</label>
        <input
          id="foto"
          type="file"
          accept="image/png"
          onChange={handleFotoChange}
        />

        <label htmlFor="beschreibung">Beschreibung</label>
        <textarea
          id="beschreibung"
          name="beschreibung"
          value={formData.beschreibung}
          onChange={handleChange}
          rows={4}
        />

        <label htmlFor="rolle">Rolle*</label>
        <select
          id="rolle"
          name="rolle"
          value={formData.rolle}
          onChange={handleChange}
          required
        >
          <option value="">Bitte wählen</option>
          <option value="vorstand">Vorstand</option>
          <option value="mitglied">Mitglied</option>
        </select>

        <button type="submit">Vorstand erstellen</button>
      </div>
    </form>
  );
}
