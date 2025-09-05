import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./BlogsList.scss";

const BlogsList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("https://jugehoerig-backend.onrender.com/api/blogs");
        setBlogs(response.data);
      } catch (error) {
        console.error("Fehler beim Laden der Blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Professionelle Vorschau-Funktion: 1–2 Sätze
  const getPreview = (text) => {
    if (!text) return "";
    
    // Zeilenumbrüche entfernen, doppelten Leerraum reduzieren
    const cleanText = text.replace(/\s+/g, " ").trim();
    
    // Satz-Trennung über Punkt, Ausrufezeichen, Fragezeichen
    const sentences = cleanText.match(/[^.!?]+[.!?]/g);
    
    if (!sentences) {
      // Kein Satzende gefunden -> einfach die ersten 100 Zeichen
      return cleanText.length > 100 ? cleanText.slice(0, 100) + "..." : cleanText;
    }
    
    // Nimm die ersten zwei Sätze
    return sentences.slice(0, 2).join(" ");
  };

  if (loading) {
    return <div className="blogs-loading">Blogs werden geladen...</div>;
  }

  return (
    <div className="blog-list">
      {blogs.map((blog) => (
        <Link key={blog.id} to={`/blog/${blog.id}`} className="blog-card">
          {blog.bild && (
            <img src={blog.bild} alt={blog.titel} className="blog-card-image" />
          )}
          <div className="blog-card-content">
            <h2 className="blog-card-title">{blog.titel}</h2>
            <p className="blog-card-preview">
              {getPreview(blog.inhalt) || "Keine Vorschau verfügbar..."}
            </p>
            <div className="blog-card-footer">
              <span className="blog-date">
                {new Date(blog.erstellt_am).toLocaleDateString()}
              </span>
              <span className="blog-readmore">Mehr lesen →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BlogsList;
