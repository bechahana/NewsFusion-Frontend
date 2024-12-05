import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'; // Import Axios for API calls
import logo from '../logo.png';
import { FaHome, FaSignOutAlt, FaSearch, FaBars, FaTimes, FaSignInAlt, FaUserPlus } from "react-icons/fa";

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

const GuestLayout = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
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

            navigate(`/search-results`, {
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

    return (
        <div className="layout">
            {/* Top Navbar */}
            <div className="top-navbar">
                <div className="icon-wrapper">
                    <button className="menu-icon" onClick={toggleSidebar}>
                        {isSidebarOpen ? <FaTimes /> : <FaBars />}
                    </button>
                    <button className="search-icon" onClick={openSidebarWithSearch}>
                        <FaSearch />
                    </button>
                </div>
                <div className="center-logo">
                    <img src={logo} alt="Logo" className="navbar-logo" />
                </div>
                <div className="auth-buttons">
                    <Link to="/login" className="login-button">
                        <FaSignInAlt /> Login
                    </Link>
                    <Link to="/register" className="register-button">
                        <FaUserPlus /> Register
                    </Link>
                </div>

            </div>

            {/* Horizontal Navbar */}
            <nav className="navbar">
                <ul>
                    {Object.keys(categoryMap).map((displayName) => (
                        <li key={displayName}>
                            <Link to={`/category/${encodeURIComponent(categoryMap[displayName])}`}>
                                {displayName}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                <button className="close-icon" onClick={toggleSidebar}>
                    <FaTimes />
                </button>
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
                        <FaSearch />
                    </button>
                </form>
                <div className="sidebar-content">
                    <ul className="category-list">
                        {Object.keys(categoryMap).map((displayName) => (
                            <li key={displayName}>
                                <Link to={`/category/${encodeURIComponent(categoryMap[displayName])}`}>
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
                    <a href="#"><i className="fab fa-twitter"></i></a>
                    <a href="#"><i className="fab fa-facebook-f"></i></a>
                    <a href="#"><i className="fab fa-instagram"></i></a>
                    <a href="#"><i className="fab fa-tiktok"></i></a>
                    <a href="#"><i className="fab fa-linkedin-in"></i></a>
                    <a href="#"><i className="fab fa-youtube"></i></a>
                </div>
                <div className="footer-links">
                    <a href="#">Terms of Use</a>
                    <a href="#">About Us</a>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Cookies</a>
                    <a href="#">Accessibility Help</a>
                    <a href="#">Contact Us</a>
                    <a href="#">Advertise with Us</a>
                    <a href="#">Do not share or sell my info</a>
                    <a href="#">Contact Support</a>
                </div>
                <div className="copyright">
                    <p>© 2024 NewsFusion. All rights reserved. We are not responsible for the content of external sites. 
                        <a href="#">Read about our approach to external linking</a>.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default GuestLayout;
