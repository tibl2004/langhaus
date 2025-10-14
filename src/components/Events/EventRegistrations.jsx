import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import './EventRegistrations.scss';

const EventRegistrations = () => {
  const { eventId } = useParams(); // Event-ID aus URL
  const token = localStorage.getItem("token"); // JWT aus localStorage

  const [registrations, setRegistrations] = useState([]);
  const [felder, setFelder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await axios.get(`https://jugehoerig-backend.onrender.com/api/event/${eventId}/anmeldungen`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFelder(res.data.felder);
        setRegistrations(res.data.registrations);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Fehler beim Laden der Anmeldungen.");
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [eventId, token]);

  const exportPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Titel
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.setFont("helvetica", "bold");
    doc.text("Event-Anmeldungen", 105, 25, { align: "center" });

    // Event-ID als Untertitel
    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    doc.text(`Event ID: ${eventId}`, 105, 32, { align: "center" });

    // Tabelle vorbereiten
    const tableColumn = ["#", ...felder.map(f => f.feldname), "Anmeldedatum"];
    const tableRows = registrations.map((r, index) => [
      index + 1,
      ...felder.map(f => r.daten[f.feldname] || "-"),
      new Date(r.created_at).toLocaleString()
    ]);

    // Tabelle mit Alternierende Zeilenfarben und Styling
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 5, font: "helvetica" },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      theme: "grid",
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Seite ${data.pageNumber} von ${pageCount}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10,
          { align: "right" }
        );
      }
    });

    doc.save(`Event_Anmeldungen_${eventId}.pdf`);
  };

  if (loading) return <p>Lade Anmeldungen…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="registrations-container">
      <div className="header">
        <h2>Anmeldungen für das Event</h2>
        <button className="export-btn" onClick={exportPDF}>PDF Export</button>
      </div>

      {registrations.length === 0 ? (
        <div className="no-registrations">Bis jetzt gibt es noch keine Anmeldungen.</div>
      ) : (
        <div className="table-wrapper">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>#</th>
                {felder.map(f => <th key={f.feldname}>{f.feldname}</th>)}
                <th>Anmeldedatum</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r, index) => (
                <tr key={r.id}>
                  <td>{index + 1}</td>
                  {felder.map(f => <td key={f.feldname}>{r.daten[f.feldname] || "-"}</td>)}
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;
