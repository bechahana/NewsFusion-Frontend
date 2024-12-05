import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";
import "./editor.css";

const PublishedArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editArticle, setEditArticle] = useState(null); // For storing the article being edited
  const [showEditModal, setShowEditModal] = useState(false); // Toggle for the edit popup

  // Fetch articles authored by the editor
  useEffect(() => {
    const fetchOwnArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch("http://localhost:5000/api/editor/articles/own", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error("Error fetching own articles:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnArticles();
  }, []);

  // Handle deleting an article
  const handleDelete = (articleId) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    const deletePublishedArticle = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`http://localhost:5000/api/editor/articles/${articleId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        alert("Article deleted successfully.");
        setArticles((prevArticles) => prevArticles.filter((article) => article.id !== articleId));
      } catch (error) {
        alert(`Failed to delete article: ${error.message}`);
      }
    };

    deletePublishedArticle();
  };

  // Open the edit modal with the selected article
  const handleEdit = (article) => {
    setEditArticle({ ...article }); // Clone the article to allow editing
    setShowEditModal(true);
  };

  // Close the edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditArticle(null);
  };

  // Handle saving the edited article
  const handleSaveEdit = () => {
    if (!editArticle.title || !editArticle.category || !editArticle.body) {
      alert("Please fill in all required fields.");
      return;
    }

    const savePublishedArticle = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(
          `http://localhost:5000/api/editor/articles/${editArticle.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: editArticle.title,
              category: editArticle.category,
              body: editArticle.body,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        alert("Article updated successfully.");
        setArticles((prevArticles) =>
          prevArticles.map((article) =>
            article.id === editArticle.id ? { ...article, ...editArticle } : article
          )
        );
      } catch (error) {
        alert(`Failed to update article: ${error.message}`);
      }
    };

    savePublishedArticle();
    handleCloseEditModal();
  };

  if (loading) return <p>Loading articles...</p>;
  if (error) return <p className="error-message">Failed to fetch articles: {error}</p>;

  return (
    <div className="published-articles">
      <h1>
        <FontAwesomeIcon icon={faNewspaper} /> Your Published Articles
      </h1>

      {articles.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <div key={article.id} className="article-card">
              <img
                src={article.thumbnail_url || "https://via.placeholder.com/300x200"}
                alt={article.title}
                className="article-thumbnail"
              />
              <h3>{article.title}</h3>
              <p>
                <strong>Category:</strong> {article.category}
              </p>
              <p>
                <strong>Published:</strong>{" "}
                {new Date(article.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
              <button className="edit-button green-button" onClick={() => handleEdit(article)}>
                <FontAwesomeIcon icon={faEdit} /> Edit
              </button>
              <button className="delete-button" onClick={() => handleDelete(article.id)}>
                <FontAwesomeIcon icon={faTrash} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Article Modal */}
      {showEditModal && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h2>Edit Article</h2>
            <label>
              Title:
              <input
                type="text"
                value={editArticle.title}
                onChange={(e) =>
                  setEditArticle((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </label>
            <label>
              Category:
              <input
                type="text"
                value={editArticle.category}
                onChange={(e) =>
                  setEditArticle((prev) => ({ ...prev, category: e.target.value }))
                }
              />
            </label>
            <label>
              Body:
              <textarea
                value={editArticle.body}
                onChange={(e) =>
                  setEditArticle((prev) => ({ ...prev, body: e.target.value }))
                }
              ></textarea>
            </label>
            <div className="popup-buttons">
              <button onClick={handleSaveEdit}>
                <FontAwesomeIcon icon={faSave} /> Save
              </button>
              <button className="cancel-button" onClick={handleCloseEditModal}>
                <FontAwesomeIcon icon={faTimes} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishedArticles;
