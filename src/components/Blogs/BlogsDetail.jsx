import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "./BlogsDetail.scss";

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`https://jugehoerig-backend.onrender.com/api/blogs/${id}`);
        setBlog(response.data);
      } catch (error) {
        console.error("Fehler beim Laden des Blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return <div className="blog-detail-loading">Wird geladen...</div>;
  }

  if (!blog) {
    return <div className="blog-detail-error">Blog nicht gefunden.</div>;
  }

  return (
    <div className="blog-detail">
      {blog.bilder && blog.bilder.length > 0 && (
        <img
          src={blog.bilder[0].bild}
          alt={blog.titel}
          className="blog-detail-main-image"
        />
      )}
      <h1 className="blog-detail-title">{blog.titel}</h1>
      <p className="blog-detail-meta">
        Von {blog.autor} – {new Date(blog.erstellt_am).toLocaleDateString()}
      </p>
      <div className="blog-detail-content">{blog.inhalt}</div>

      {blog.bilder && blog.bilder.length > 1 && (
        <div className="blog-detail-gallery">
          {blog.bilder.slice(1).map((img) => (
            <img
              key={img.id}
              src={img.bild}
              alt="Blog Bild"
              className="blog-detail-gallery-image"
            />
          ))}
        </div>
      )}

      <Link to="/blogs" className="blog-detail-back">
        ← Zurück zu den Blogs
      </Link>
    </div>
  );
};

export default BlogDetail;
