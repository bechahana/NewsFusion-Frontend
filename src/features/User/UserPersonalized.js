import React, { useState, useEffect } from "react";
import "./UserPersonalized.css"; // Add a CSS file for styling

const apiOptions = [
  { name: "News API", url: "https://newsapi.org/v2", key: "1ef3fa579abc47bc8c50c07caa66d37b" },
  { name: "The New York Times", url: "https://api.nytimes.com/svc/topstories/v2", key: "EvuTBSv1d8B1l0KAeAJcwp7deGCGxOoG" },
  { name: "Currents API", url: "https://api.currentsapi.services/v1", key: "QlXj2im1SRnWVlfpk4aYadIcZcfPODIWu8pSX731VO-EJcEi" }
];

const categories = ["All", "Politics", "Science", "Technology", "Health", "Sports"];

const UserPersonalized = () => {
  const [selectedAPIs, setSelectedAPIs] = useState([]);
  const [category, setCategory] = useState("All");
  const [articles, setArticles] = useState([]);

  const handleAPIChange = (api) => {
    setSelectedAPIs((prev) =>
      prev.includes(api) ? prev.filter((a) => a !== api) : [...prev, api].slice(0, 5)
    );
  };

  const fetchArticles = async () => {
    const fetchedArticles = [];
    for (const api of selectedAPIs) {
      try {
        let endpoint = "";

        // Adjusting endpoints for each API
        if (api.name === "News API") {
          endpoint = `${api.url}/everything?q=${category.toLowerCase()}&apiKey=${api.key}`;
        } else if (api.name === "The New York Times") {
          endpoint = `${api.url}/${category.toLowerCase()}.json?api-key=${api.key}`;
        } else if (api.name === "Currents API") {
          endpoint = `${api.url}/latest-news?category=${category.toLowerCase()}&apiKey=${api.key}`;
        }

        const response = await fetch(endpoint);
        const data = await response.json();
        fetchedArticles.push(...data.articles || []);
      } catch (error) {
        console.error(`Error fetching from ${api.name}:`, error);
      }
    }
    setArticles(fetchedArticles);
  };

  useEffect(() => {
    if (selectedAPIs.length > 0) fetchArticles();
  }, [selectedAPIs, category]);

  return (
    <div>
      <div className="filters-container">
  <h3>Select APIs </h3>
  {apiOptions.map((api) => (
    <label key={api.name}>
      <input
        type="checkbox"
        checked={selectedAPIs.includes(api)}
        onChange={() => handleAPIChange(api)}
      />
      {api.name}
    </label>
  ))}

        <div>
          <label>Filter by category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="articles-container">
        {articles.map((article, index) => (
          <div className="card" key={index}>
            <img
              src={article.urlToImage || "https://via.placeholder.com/150"}
              alt={article.title}
              className="card-img"
            />
            <div className="card-content">
              <h4>{article.title}</h4>
              <p>{article.description || article.snippet}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="card-link">
                Read more
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserPersonalized;
