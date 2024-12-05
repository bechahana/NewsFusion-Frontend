import React, { useState } from "react";
import { auth } from "../firebase/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSave, faExclamationCircle, faPlus } from "@fortawesome/free-solid-svg-icons";
import "./editor.css";

const AddLiveUpdate = () => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    content: "",
    summary: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("http://localhost:5000/api/editor/live-updates/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      alert("Live update added successfully!");
      setFormData({ title: "", category: "", content: "", summary: "", tags: "" });
    } catch (err) {
      console.error("Error adding live update:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-article">
      <h1>
        <FontAwesomeIcon icon={faPlus} /> Add Live Update
      </h1>
      {error && (
        <p className="error-message">
          <FontAwesomeIcon icon={faExclamationCircle} /> Error: {error}
        </p>
      )}
      <form onSubmit={handleSubmit} className="add-article-form">
        <label>
          <strong>Title:</strong>
          <input
            type="text"
            name="title"
            placeholder="Enter the title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <strong>Category:</strong>
          <input
            type="text"
            name="category"
            placeholder="Enter the category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <strong>Content:</strong>
          <textarea
            name="content"
            placeholder="Enter the live update content"
            value={formData.content}
            onChange={handleChange}
            required
          ></textarea>
        </label>
        <label>
          <strong>Summary:</strong>
          <textarea
            name="summary"
            placeholder="Provide a brief summary of the update"
            value={formData.summary}
            onChange={handleChange}
            required
          ></textarea>
        </label>
        <label>
          <strong>Tags:</strong> <small>(Comma-separated)</small>
          <input
            type="text"
            name="tags"
            placeholder="e.g., breaking news, update"
            value={formData.tags}
            onChange={handleChange}
          />
        </label>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin /> Submitting...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} /> Submit Update
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddLiveUpdate;
