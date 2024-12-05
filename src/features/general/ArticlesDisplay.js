import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ArticlesDisplay.css";

const ArticlesDisplay = () => {
  const { categoryTitle } = useParams(); // Extract category from URL
  const [articles, setArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]); // For latest articles (moving banner)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch articles based on category, or all articles if 'home'
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/articles?category=${encodeURIComponent(categoryTitle || "All")}`
        );
        if (!response.ok) throw new Error("Failed to fetch articles");
        const data = await response.json();
        console.log("Fetched Articles:", data);  // Log the data
        setArticles(data);
  
        // Fetch the latest articles if the category is 'home'
        if (categoryTitle === "home") {
          const latestResponse = await fetch("http://localhost:5000/api/articles?category=All&limit=5");
          const latestData = await latestResponse.json();
          console.log("Latest Articles:", latestData);  // Log latest articles
          setLatestArticles(latestData);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError("Error fetching articles. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchArticles();
  }, [categoryTitle]);
  
  return (
    <div className="category-page">
      {/* Image Banner */}
      {categoryTitle === "home" && latestArticles.length > 0 && (
        <div className="image-banner">
          <img
            src="https://via.placeholder.com/300x180"
            alt="Article Thumbnail"
            className="article-image"
          />

        </div>
      )}

      {/* Moving Banner with Latest Articles */}
      {categoryTitle === "home" && latestArticles.length > 0 && (
        <div className="moving-banner">
          <h2>Latest Articles</h2>
          <div className="banner-content">
            {latestArticles.map((article) => (
              <div key={article.id} className="banner-item">
               <img
                    src={articles[currentIndex]?.thumbnail_url || "https://via.placeholder.com/1200x300"}
                    alt={articles[currentIndex]?.title || "Default Image"}
                    onClick={() => handleArticleClick(articles[currentIndex]?.id)}
                    className="carousel-image" // Add a class for styling
                />

                <p>{article.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles Listing */}
      {loading ? (
        <p className="loading">Loading articles...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : articles.length === 0 ? (
        <p className="no-articles">No articles found for this category.</p>
      ) : (
        <div className="article-list">
          {articles.map((article) => (
        <div className="article-item" key={article.id}>
        <div className="image-wrapper">
          <img
            src={article.thumbnail_url || "https://via.placeholder.com/300x180"}
            alt={article.title || "Article Thumbnail"}
          />
        </div>
        <div className="article-content">
          <h3>{article.title || "Untitled Article"}</h3>
          <p>{article.content ? `${article.content.slice(0, 100)}...` : "No content available."}</p>
          <p className="date">
            {article.date ? new Date(article.date).toLocaleDateString() : "Unknown Date"}
          </p>
        </div>
      </div>

))}
        </div>
      )}
    </div>
  );
};

export default ArticlesDisplay;
