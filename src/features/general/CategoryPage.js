import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate to handle clicks
import "../styles.css"; // Ensure styles are added for banner functionality

const CategoryPage = () => {
  const { categoryTitle, userType, userId } = useParams(); // Get userType and userId from URL
  const navigate = useNavigate(); // For programmatic navigation
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current image index
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const url =
          categoryTitle === "home"
            ? `http://localhost:5000/api/articles`
            : `http://localhost:5000/api/articles?category=${encodeURIComponent(
                categoryTitle
              )}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch articles");

        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError("Error fetching articles.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [categoryTitle]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? articles.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === articles.length - 1 ? 0 : prevIndex + 1));
  };

  const handleArticleClick = (articleId) => {
    if (userType && userId) {
      navigate(`/${userType}/${userId}/articles/${articleId}`);
    } else {
      console.error("UserType or UserId is not defined");
    }
  };

  if (loading) return <p>Loading articles...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="category-page">
      {/* Image Banner with Arrows */}
      {articles.length > 0 && (
        <div className="image-banner">
          <button className="arrow left" onClick={handlePrev}>
            &#8249;
          </button>
          <div className="image-container">
            {articles[currentIndex] && (
              <>
                <img
                  src={articles[currentIndex].thumbnail_url || "https://via.placeholder.com/1200x300"}
                  alt={articles[currentIndex].title || "Featured Article"}
                  onClick={() => handleArticleClick(articles[currentIndex].id)}
                />
                <h2>{articles[currentIndex].title || "Featured Article"}</h2>
              </>
            )}
          </div>
          <button className="arrow right" onClick={handleNext}>
            &#8250;
          </button>
        </div>
      )}

      {/* Articles Listing */}
      <div className="article-list">
        {articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.id}
              className="article-item"
              onClick={() => handleArticleClick(article.id)}
            >
              <div className="image-wrapper">
                <img
                  src={article.thumbnail_url || "https://via.placeholder.com/300x180"}
                  alt={article.title || "Article Thumbnail"}
                />
              </div>
              <div className="article-content">
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
                <p className="date">
                  {new Date(article.date_published).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No articles found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
