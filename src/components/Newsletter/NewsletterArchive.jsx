import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './NewsletterArchive.scss';

const NewsletterArchive = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://jugehoerig-backend.onrender.com/api/newsletter') // nur veröffentlichte Newsletter (is_sent=1)
      .then(res => setNewsletters(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="newsletter-archive" style={{ textAlign:'center', padding:20 }}>Lade Newsletter...</div>;

  return (
    <div className="newsletter-archive">
      <div className="archive-header">Newsletter Archiv</div>
      <ul className="newsletter-list">
        {newsletters.length === 0 && (
          <li className="empty-list">Keine veröffentlichten Newsletter vorhanden.</li>
        )}

        {newsletters.map(nl => (
          <li key={nl.id} className="newsletter-item">
            <Link to={`/newsletter/${nl.id}`} className="newsletter-link">
              <div className="newsletter-title">{nl.title}</div>
              <div className="newsletter-date">
                Gesendet am: {new Date(nl.send_date).toLocaleDateString()}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsletterArchive;
