import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase/firebase"; // Adjust path based on your structure
import { logoutUser } from "../firebase/auth"; // Ensure to import your logout function
import axios from 'axios'; // Import Axios for API calls
import logo from '../logo.png';

const categoryMap = {
    "Home": "home",
    "Politics": "Politics",
    "Business & Economy": "Business & Economy",
    "Technology": "Technology",
    "Science": "Science",
    "Health": "Health",
    "Entertainment": "Entertainment",
    "Sports": "Sports",
    "World News": "World News",
    "Environment": "Environment",
};

const Layout = ({ children, setUser }) => {
    const { userType, userId } = useParams(); // Get userType and userId from URL
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [loading, setLoading] = useState(true); // Loading state to manage UI
    const [error, setError] = useState(null); // Error state for user type or ID
    const navigate = useNavigate();

    // Toggle the sidebar open/close
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // Open the sidebar and focus on the search input
    const openSidebarWithSearch = () => {
        setSidebarOpen(true);
        setTimeout(() => {
            const searchInput = document.querySelector('.sidebar-search-bar');
            if (searchInput) searchInput.focus(); // Focus on the search input
        }, 100); // Delay to ensure the sidebar is open before focusing
    };

    // Handle user logout
    const handleLogout = async () => {
        try {
            await logoutUser(); // Call the logoutUser function
            setUser(null); // Clear user state
            navigate("/login"); // Redirect to login
            alert("Logout successful!"); // Alert on successful logout
        } catch (error) {
            console.error("Error during logout:", error);
            alert("Error during logout: " + error.message); // Alert on error
        }
    };

    // Handle changes to the search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value); // Update the search query state
    };

    // Handle search submission
    const handleSearchSubmit = async (e) => {
        e.preventDefault();
    
        if (!searchQuery.trim()) {
            alert("Search query cannot be empty.");
            return;
        }
    
        try {
            const response = await axios.get("http://localhost:3000/api/search", {
                params: { query: searchQuery },
            });
    
            console.log("[DEBUG] Search results:", response.data);
    
            navigate(`/${userType}/${userId}/search-results`, {
                state: { articles: response.data },
            });
        } catch (error) {
            console.error("[ERROR] Error during search:", error);
    
            if (error.response?.status === 404) {
                alert("No articles found.");
            } else {
                alert(`Error during search: ${error.message}`);
            }
        }
    };
    
    
    
    // Check for userType and userId in useEffect
    useEffect(() => {
        if (!userType || !userId) {
            setError("Missing user type or user ID");
            setLoading(false); // Stop loading
            return; // Exit early if there's an error
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            console.log("Auth state changed: ", user);
            setUser(user);
            setLoading(false);
        });
    
        return () => unsubscribe();
    }, [setUser, userType, userId]);

    // Show loading state if authenticating
    if (loading) {
        console.log("Loading state active..."); // Debug log while loading
        return <div>Loading...</div>; // You can customize the loading UI
    }

    // Show error if there's a problem with userType or userId
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="layout">
            {/* Top Navbar */}
<div className="top-navbar">
    <div className="icon-wrapper">
        <button className="menu-icon" onClick={toggleSidebar}>
            {isSidebarOpen ? "✕" : "☰"}
        </button>
        <button className="search-icon" onClick={openSidebarWithSearch}>
            <i className="fa fa-search"></i> {/* Search icon */}
        </button>
    </div>
    <div className="center-logo">
        <img src={logo} alt="Logo" className="navbar-logo" />
    </div>
    <div className="auth-buttons">
            <Link to={`/${userType}/${userId}/dashboard`} className="dashboard-button">
                <i className="fas fa-home"></i> Dashboard
            </Link>
            <button className="logout-button" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>

        </div>

            {/* Horizontal Navbar */}
            <nav className="navbar">
                <ul>
                    {Object.keys(categoryMap).map((displayName) => (
                        <li key={displayName}>
                            <Link to={`/${userType}/${userId}/category/${encodeURIComponent(categoryMap[displayName])}`}>
                                {displayName}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <button className="close-icon" onClick={toggleSidebar}>✕</button>
                {/* Compact Search Bar */}
                <form onSubmit={handleSearchSubmit} className="sidebar-search">
                    <input
                        type="text"
                        className="sidebar-search-bar"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    <button type="submit" className="sidebar-search-button">
                        <i className="fa fa-search"></i>
                    </button>
                </form>
                <div className="sidebar-content">
                    <ul className="category-list">
                        {Object.keys(categoryMap).map((displayName) => (
                            <li key={displayName}>
                                <Link to={`/${userType}/${userId}/category/${encodeURIComponent(categoryMap[displayName])}`}>
                                    {displayName}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Main content */}
            <main>{children}</main>

            {/* Footer */}
            <footer>
                <div className="social-media">
                    <span>Follow us on:</span>
                    <a href="#"><i className="fab fa-facebook-f"></i></a>
                    <a href="#"><i className="fab fa-instagram"></i></a>
                    <a href="#"><i className="fab fa-tiktok"></i></a>
                    <a href="#"><i className="fab fa-linkedin-in"></i></a>
                    <a href="#"><i className="fab fa-youtube"></i></a>
                </div>
                <div className="footer-links">
                    <a href="#">About Us</a>
                    <a href="#">Accessibility Help</a>
                    <a href="#">Contact Us</a>
                    <a href="#">Advertise with Us</a>
                    <a href="#">Contact Support</a>
                </div>
                <div className="copyright">
                    <p>© 2024 NewsFusion. All rights reserved.  </p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
