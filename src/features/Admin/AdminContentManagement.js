import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import "./content.css";

const predefinedCategories = [
  "Politics",
  "Business & Economy",
  "Technology",
  "Science",
  "Health",
  "Entertainment",
  "Sports",
  "World News",
  "Environment",
];

const AdminContentManagement = () => {
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState("Politics");
  const [newArticle, setNewArticle] = useState({
    title: "",
    body: "",
    summary: "",
    category: "Politics",
    tags: "",
    thumbnail_url: "",
    image_urls: "",
    video_url: "",
    source_url: "",
  });
  const [file, setFile] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userToken, setUserToken] = useState(null);

  // Fetch user token
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUserToken(token);
        setNewArticle((prevArticle) => ({
          ...prevArticle,
          author: user.email, // Set the author dynamically
          author_id: user.uid,
        }));
      } else {
        setUserToken(null);
        setError("User not authenticated. Please log in.");
      }
    });
    return unsubscribe;
  }, []);

  // Fetch articles by category
  const fetchArticlesByCategory = async () => {
    if (!userToken) {
      setError("User not authenticated.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/admin/articles?category=${category}`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error("Error during fetchArticlesByCategory:", error.message);
      setError("Error fetching articles: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken && category) {
      fetchArticlesByCategory();
    }
  }, [userToken, category]);

  // Handle file upload
  const handleFileUpload = async () => {
    if (!userToken) {
      throw new Error("User not authenticated.");
    }

    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: formData,
      });
      if (!response.ok) throw new Error("File upload failed.");
      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Error uploading file");
    }
  };

  // Open popup
  const openAddOrModifyArticlePopup = (article = null) => {
    console.log("[DEBUG] Opening popup with selected article:", article);
  
    setSelectedArticle(article);
    setNewArticle({
      title: article?.title || "",
      body: article?.body || "", // Ensure 'body' is always a string
      summary: article?.summary || "", // Ensure 'summary' is always a string
      category: article?.category || "Politics",
      tags: article?.tags ? article.tags.join(", ") : "",
      thumbnail_url: article?.thumbnail_url || "",
      image_urls: article?.image_urls ? article.image_urls.join(", ") : "",
      video_url: article?.video_url || "",
      source_url: article?.source_url || "",
      author: article?.author || auth.currentUser?.email || "",
    });
  
    console.log("[DEBUG] New article state set in popup:", {
      title: article?.title || "",
      body: article?.body || "",
      summary: article?.summary || "",
      category: article?.category || "Politics",
      tags: article?.tags ? article.tags.join(", ") : "",
      thumbnail_url: article?.thumbnail_url || "",
      image_urls: article?.image_urls ? article.image_urls.join(", ") : "",
      video_url: article?.video_url || "",
      source_url: article?.source_url || "",
      author: article?.author || auth.currentUser?.email || "",
    });
  
    setFile(null);
    setIsPopupOpen(true);
  };
  
  // Handle adding or modifying an article
  const handleAddOrModifyArticle = async () => {
    if (!userToken) {
        console.error("[DEBUG] User token missing.");
        setError("User not authenticated.");
        return;
    }

    try {
        setLoading(true);

        let thumbnailUrl = newArticle.thumbnail_url;

        // Handle file upload for media
        if (file) {
            console.log("[DEBUG] File detected, uploading...");
            const formData = new FormData();
            formData.append("file", file); // Include file for backend

            const uploadResponse = await fetch("http://localhost:5000/api/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${userToken}` },
                body: formData,
            });

            if (!uploadResponse.ok) {
                const error = await uploadResponse.text();
                console.error("[ERROR] Media upload failed:", error);
                throw new Error("Media upload failed.");
            }

            const uploadResult = await uploadResponse.json();
            console.log("[DEBUG] Media uploaded successfully. URL:", uploadResult.fileUrl);
            thumbnailUrl = uploadResult.fileUrl;
        }

        // Validate required fields
        if (!newArticle.title.trim() || !newArticle.body.trim() || !newArticle.category) {
            throw new Error("Missing required fields: Title, content, or category.");
        }

        // Automatically assign current user as author
        const currentUser = auth.currentUser; // Get current user from Firebase
        const author = currentUser ? currentUser.email : "Anonymous";
        const authorId = currentUser ? currentUser.uid : null;

        // Prepare article object
        const articleToSubmit = {
          title: (newArticle.title || "").trim(),
          body: (newArticle.body || "").trim(), // Fallback to an empty string
          category: newArticle.category || "Uncategorized", // Provide a default category
          summary: (newArticle.summary || "").trim(),
          tags: newArticle.tags
            ? newArticle.tags.split(",").map((tag) => tag.trim())
            : [], // Handle empty or undefined tags
          thumbnail_url: (newArticle.thumbnail_url || "").trim(),
          video_url: (newArticle.video_url || "").trim(),
          author: newArticle.author || "Unknown", // Provide a default author
          publishDate: selectedArticle?.publishDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        
        console.log("[DEBUG] Article data prepared for submission:", articleToSubmit);

        const url = selectedArticle
            ? `http://localhost:5000/api/admin/articles/${selectedArticle.id}`
            : "http://localhost:5000/api/admin/articles/add";
        const method = selectedArticle ? "PUT" : "POST";

        console.log(`[DEBUG] Submitting article via ${method} to ${url}...`);
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(articleToSubmit),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("[ERROR] API response error:", error);
            throw new Error(error.error);
        }

        console.log("[DEBUG] Article submitted successfully!");
        alert("Article submitted successfully!");
        fetchArticlesByCategory();
        closePopup();
    } catch (error) {
        console.error("[ERROR] Error in handleAddOrModifyArticle:", error.message);
        setError("Error submitting article: " + error.message);
    } finally {
        setLoading(false);
    }
};

  // Close popup
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedArticle(null);
    setNewArticle({
      title: "",
      body: "",
      summary: "",
      category: "Politics",
      tags: "",
      thumbnail_url: "",
      image_urls: "",
      video_url: "",
      source_url: "",
    });
    setFile(null);
  };

  // Handle delete article
  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/articles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error deleting article");
      }

      alert(data.message);
      fetchArticlesByCategory();
    } catch (error) {
      setError("Error deleting article");
      console.error("Error in handleDeleteArticle:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
<div className="admin-content-management">
  <div className="inline-container">
    {/* Category Selection Dropdown */}
    <div className="select-category">
      <label htmlFor="category-select" className="category-label">
        Filter by:
      </label>
      <select
        id="category-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="category-dropdown"
      >
        {predefinedCategories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>

    {/* Add Article Button */}
    <button onClick={() => openAddOrModifyArticlePopup()} className="add-article-button">
      <i className="fas fa-plus"></i> Add New Article
    </button>
  </div>


  {/* Articles Container */}
  <div className="articles-container">
    {articles.length > 0 ? (
      articles.map((article) => (
        <div className="article-card" key={article.id}>
          {/* Thumbnail */}
          <img
            src={article.thumbnail_url || "https://via.placeholder.com/300x150"}
            alt="Article Thumbnail"
          />
          {/* Details */}
          <div className="article-details">
            <h3>{article.title}</h3>
            <p className="article-meta">
              <strong>Author:</strong> {article.author}
            </p>
            <span className="article-category">{article.category}</span>
            <p className="article-summary">{article.summary || "No summary provided."}</p>
          </div>
          {/* Actions */}
          <div className="article-actions">
            <button className="edit" onClick={() => openAddOrModifyArticlePopup(article)}>
              <i className="fas fa-edit"></i> Edit
            </button>
            <button className="delete" onClick={() => handleDeleteArticle(article.id)}>
              <i className="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      ))
    ) : (
      <p>No articles found in the "{category}" category.</p>
    )}
  </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>{selectedArticle ? "Edit Article" : "Add New Article"}</h2>

            <label>Title:</label>
            <input
              type="text"
              value={newArticle.title}
              onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
              placeholder="Enter title"
            />

            <label>Body:</label>
            <textarea
              value={newArticle.body}
              onChange={(e) => setNewArticle({ ...newArticle, body: e.target.value })}
              placeholder="Enter content"
            ></textarea>

            <label>Summary:</label>
            <textarea
              value={newArticle.summary}
              onChange={(e) => setNewArticle({ ...newArticle, summary: e.target.value })}
              placeholder="Enter summary"
            ></textarea>

            <label>Category:</label>
            <select
              value={newArticle.category}
              onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
            >
              {predefinedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <label>Tags (comma-separated):</label>
            <input
              type="text"
              value={newArticle.tags}
              onChange={(e) => setNewArticle({ ...newArticle, tags: e.target.value })}
              placeholder="Enter tags (comma-separated)"
            />

            <label>Thumbnail URL:</label>
            <input
              type="text"
              value={newArticle.thumbnail_url}
              onChange={(e) => setNewArticle({ ...newArticle, thumbnail_url: e.target.value })}
              placeholder="Enter thumbnail URL"
            />

            <label>Image URLs (comma-separated):</label>
            <input
              type="text"
              value={newArticle.image_urls}
              onChange={(e) => setNewArticle({ ...newArticle, image_urls: e.target.value })}
              placeholder="Enter image URLs (comma-separated)"
            />

            <label>Video URL:</label>
            <input
              type="text"
              value={newArticle.video_url}
              onChange={(e) => setNewArticle({ ...newArticle, video_url: e.target.value })}
              placeholder="Enter video URL"
            />

            <label>Source URL:</label>
            <input
              type="text"
              value={newArticle.source_url}
              onChange={(e) => setNewArticle({ ...newArticle, source_url: e.target.value })}
              placeholder="Enter source URL"
            />

            <div className="button-group">
              <button onClick={handleAddOrModifyArticle} className="submit-button">
                Submit
              </button>
              <button onClick={closePopup} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentManagement;
