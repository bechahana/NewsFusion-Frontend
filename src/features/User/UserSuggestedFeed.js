import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";

const SuggestedFeed = () => {
  const [suggestedArticles, setSuggestedArticles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestedArticles = async () => {
      try {
        const token = await auth.currentUser.getIdTokenResult();

        // Fetch suggested articles directly
        const response = await fetch("http://localhost:5000/api/user/articles/suggested", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.json();
          throw new Error(errorText.error);
        }

        const data = await response.json();
        setSuggestedArticles(data);
      } catch (error) {
        console.error("[ERROR] Failed to fetch suggested articles:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestedArticles();
  }, []);

  if (loading) return <p>Loading suggested articles...</p>;
  if (error) return <p className="error-message">Failed to load suggestions: {error}</p>;

  return (
    <div className="suggested-feed">
      <h1>Suggested Articles</h1>
      {suggestedArticles.length > 0 ? (
        <ul className="suggested-list">
          {suggestedArticles.map((article, index) => (
            <li key={index} className="suggested-item">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <span className="category">Category: {article.category}</span>
              <span className="tags">Tags: {article.tags.join(", ")}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No suggested articles available at the moment.</p>
      )}
    </div>
  );
};

export default SuggestedFeed;
