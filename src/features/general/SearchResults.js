import React from "react";
import { useLocation } from "react-router-dom";
import '../styles.css';
const SearchResults = () => {
  const location = useLocation();
  const { articles } = location.state || {}; // Get articles from route state

  if (!articles || articles.length === 0) {
    return (
      <div className="search-results">
        <h2>No Articles Found</h2>
        <p>Try searching for something else.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <h2>Search Results</h2>
      <ul className="article-list">
        {articles.map((article) => (
          <li key={article.id} className="article-item">
            <h3>{article.title}</h3>
            <p>{article.content}</p>
            <p>
              <strong>Tags:</strong> {article.tags.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
