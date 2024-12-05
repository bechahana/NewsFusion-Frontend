import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { Filter } from "bad-words";
import "./ArticleDetail.css";

const ArticleDetail = () => {
  const { articleId, userType } = useParams(); // Extract userType from URL params
  const [article, setArticle] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const filter = new Filter();

  const logAdminActivity = async (action, details) => {
    try {
      if (!user) {
        console.warn("[WARN] No user found. Admin activity logging skipped.");
        return;
      }
  
      // Get user details and token
      const token = await auth.currentUser.getIdTokenResult();
      const email = user.email; // Admin's email
      const role = "admin"; // Explicit role for admin
  
      // Log activity for admin
      const url = `http://localhost:5000/api/admin/activity`;
  
      console.log(`[DEBUG] Logging admin activity to: ${url}`);
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.token}`,
        },
        body: JSON.stringify({
          action, // Action being logged
          email,  // Admin's email
          role,   // Role is explicitly "admin"
          details: { ...details, timestamp: new Date().toISOString() },
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DEBUG] Response error: ${errorText}`);
        throw new Error(errorText);
      }
  
      console.log("[DEBUG] Admin activity logged successfully.");
    } catch (error) {
      console.error(`[ERROR] Logging admin activity (${action}):`, error.message);
    }
  };
  const logEditorActivity = async (action, details) => {
    try {
      if (!user) {
        console.warn("[WARN] No user found. Editor activity logging skipped.");
        return;
      }
  
      // Get user details and token
      const token = await auth.currentUser.getIdTokenResult();
      const email = user.email; // Editor's email
      const role = "editor"; // Explicit role for editor
  
      // Log activity for editor
      const url = `http://localhost:5000/api/editor/activity`;
  
      console.log(`[DEBUG] Logging editor activity to: ${url}`);
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.token}`,
        },
        body: JSON.stringify({
          action, // Action being logged
          email,  // Editor's email
          role,   // Role is explicitly "editor"
          details: { ...details, timestamp: new Date().toISOString() },
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DEBUG] Response error: ${errorText}`);
        throw new Error(errorText);
      }
  
      console.log("[DEBUG] Editor activity logged successfully.");
    } catch (error) {
      console.error(`[ERROR] Logging editor activity (${action}):`, error.message);
    }
  };
  const logUserActivity = async (action, details) => {
    try {
      if (!user) {
        console.warn("[WARN] No user found. User activity logging skipped.");
        return;
      }
  
      // Get user details and token
      const token = await auth.currentUser.getIdTokenResult();
      const email = user.email; // User's email
      const role = "user"; // Explicit role for user
  
      // Log activity for user
      const url = `http://localhost:5000/api/user/activity`;
  
      console.log(`[DEBUG] Logging user activity to: ${url}`);
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.token}`,
        },
        body: JSON.stringify({
          action, // Action being logged
          email,  // User's email
          role,   // Role is explicitly "user"
          details: { ...details, timestamp: new Date().toISOString() },
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DEBUG] Response error: ${errorText}`);
        throw new Error(errorText);
      }
  
      console.log("[DEBUG] User activity logged successfully.");
    } catch (error) {
      console.error(`[ERROR] Logging user activity (${action}):`, error.message);
    }
  };
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        console.log(`[DEBUG] Fetching article with ID: ${articleId}`);
        const response = await fetch(`http://localhost:5000/api/articles/${articleId}`);
        if (!response.ok) throw new Error("Failed to fetch article");
  
        const data = await response.json();
        setArticle(data);
  
        if (user && data.likedBy?.includes(user.uid)) setHasLiked(true);
  
        // Log activity based on user type
        if (userType === "admin") {
          logAdminActivity("view", { articleId, title: data.title });
        } else if (userType === "editor") {
          logEditorActivity("view", { articleId, title: data.title });
        } else if (userType === "user") {
          logUserActivity("view", { articleId, title: data.title });
        }
      } catch (error) {
        console.error("[ERROR] Error fetching article:", error.message);
        setError("Error fetching article");
      }
    };
  
    auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchArticle();
      }
    });
  }, [articleId, userType, user]);
  
  const handleLike = async () => {
    if (hasLiked) return;
    try {
      const response = await fetch(`http://localhost:5000/api/articles/${articleId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid }),
      });
  
      if (response.ok) {
        const result = await response.json();
        setArticle((prev) => ({
          ...prev,
          likes: result.likes ?? prev.likes,
          likedBy: [...(prev.likedBy || []), user.uid],
        }));
        setHasLiked(true);
  
        // Log "like" activity based on user type
        if (userType === "admin") {
          logAdminActivity("like", { articleId, title: article.title });
        } else if (userType === "editor") {
          logEditorActivity("like", { articleId, title: article.title });
        } else if (userType === "user") {
          logUserActivity("like", { articleId, title: article.title });
        }
      }
    } catch (error) {
      console.error("Error liking article:", error);
    }
  };
  
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    const cleanedComment = filter.clean(newComment);
  
    try {
      const displayName = user.displayName || user.email || "Anonymous";
      const response = await fetch(`http://localhost:5000/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: cleanedComment, username: displayName, userId: user.uid }),
      });
  
      if (!response.ok) throw new Error("Failed to post comment");
  
      setArticle((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), { content: cleanedComment, username: displayName, timestamp: new Date().toLocaleString(), userId: user.uid }],
      }));
      setNewComment("");
  
      // Log "comment" activity based on user type
      if (userType === "admin") {
        logAdminActivity("comment", { articleId, comment: cleanedComment });
      } else if (userType === "editor") {
        logEditorActivity("comment", { articleId, comment: cleanedComment });
      } else if (userType === "user") {
        logUserActivity("comment", { articleId, comment: cleanedComment });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };
  

  if (error) return <p className="error">{error}</p>;
  if (!article) return <p className="loading">Loading...</p>;

  return (
    <div className="article-detail">
      <h1>{article.title}</h1>
      <div className="article-content">
        <p>{article.content}</p>
        {article.thumbnail_url && <img src={article.thumbnail_url} alt="Thumbnail" className="article-thumbnail" />}
        <div className="article-images">
          {article.image_urls?.map((url, index) => (
            <img key={index} src={url} alt={`Image ${index + 1}`} />
          ))}
        </div>
      </div>

      <div className="article-meta-container">
        <button onClick={handleLike} disabled={hasLiked} className={`like-button ${hasLiked ? "disabled" : ""}`}>
          ❤️ {article.likes}
        </button>
        <span>⏱️ {article.reading_time} minutes</span>
        <span>📅 Published on {new Date(article.date_published).toLocaleDateString()}</span>
        <span>✍️ By <strong>{article.author}</strong></span>
        <div className="tags">
          {article.tags?.map((tag, index) => (
            <a key={index} href={`/tags/${tag}`}>
              {tag}
            </a>
          ))}
        </div>
      </div>

      {/* Add Comment Section */}
      {user && (
        <div className="comment-input">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment here..."
          />
          <button onClick={handleCommentSubmit}>Submit</button>
        </div>
      )}

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments</h3>
        <ul>
          {(article.comments || []).map((comment, index) => (
            <li key={index} className="comment-item">
              <strong>{comment.username}</strong> at {comment.timestamp}:
              <p>{comment.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ArticleDetail;
