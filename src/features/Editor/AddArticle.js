import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase/firebase"; // Import Firebase for authentication
import "../styles.css";
import "./editor.css";

const AddArticle = () => {
  const { userId, userType } = useParams(); // Get userId and userType from the route
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    body: "", // Use "body" instead of "content" to match the backend
    summary: "",
    tags: "",
    media: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      setFormData((prev) => ({
        ...prev,
        media: files[0], // Handle file input
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser.getIdToken();

      // Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("body", formData.body); // Use "body" instead of "content"
      formDataToSend.append("summary", formData.summary);
      formDataToSend.append("tags", formData.tags);
      if (formData.media) formDataToSend.append("media", formData.media);
      formDataToSend.append("authorId", userId);
      formDataToSend.append("authorType", userType);

      // Debug FormData (for development purposes)
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`[DEBUG] ${key}:`, value);
      }

      const response = await fetch(
        "http://localhost:5000/api/editor/articles/add",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert("Article added successfully!");
      setFormData({
        title: "",
        category: "",
        body: "",
        summary: "",
        tags: "",
        media: null,
      });
    } catch (error) {
      console.error("Error submitting article:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-article">
      <h1>Add New Article</h1>
      {error && <p className="error-message">Error: {error}</p>}
      <form onSubmit={handleSubmit} className="add-article-form">
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter the article title"
          />
        </label>
        <label>
          Category:
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="Enter the category (e.g., Science, Technology)"
          />
        </label>
        <label>
          Content:
          <textarea
            name="body" // Use "body" to match the backend
            value={formData.body}
            onChange={handleChange}
            required
            placeholder="Write the full article content here"
          ></textarea>
        </label>
        <label>
          Summary:
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            placeholder="Provide a short summary of the article"
          ></textarea>
        </label>
        <label>
          Tags (comma-separated):
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="e.g., technology, science"
          />
        </label>
        <label>
          Media (optional):
          <input
            type="file"
            name="media"
            accept="image/*,video/*"
            onChange={handleChange}
          />
        </label>
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Submitting..." : "Submit Article"}
        </button>
      </form>
    </div>
  );
};

export default AddArticle;
