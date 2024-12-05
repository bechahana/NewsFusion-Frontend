import React from 'react';
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBolt, faCompass, faListAlt, faTrash, faKey, faFileAlt, faPlus } from '@fortawesome/free-solid-svg-icons'; // Added faPlus
import '../styles.css'; // Import global styles

const EditorDashboard = () => {
  const { userId, userType } = useParams(); // Dynamically get userId and userType from the route

  // Debugging logs to check userId and userType
  if (!userId || !userType) {
    console.error("[ERROR] Missing userId or userType.");
    return <p>Error: Missing user information.</p>;
  }

  console.log("[DEBUG] Editor Dashboard - userId:", userId, "userType:", userType);

  // Generate dynamic links
  const getProfileLink = () => `/${userType}/${userId}/profile`;
  const getActivityLink = () => `/${userType}/${userId}/activity`;

  // Card data for dashboard items
  const cardData = [
    { title: "Profile", link: getProfileLink(), description: "Manage your profile", icon: faUser },
    { title: "Add Article", link: `/${userType}/${userId}/add-article`, description: "Add a new article", icon: faPlus }, // New Add Article option
    { title: "Add Live Update", link: `/${userType}/${userId}/add-live`, description: "Post a breaking news update", icon: faBolt }, // New Add Live Update option
    { title: "Published Articles", link: `/${userType}/${userId}/published`, description: "Manage your published articles", icon: faFileAlt },
    { title: "Activity", link: getActivityLink(), description: "View your activity", icon: faListAlt },
    { title: "Reset Password", link: `/${userType}/${userId}/reset-password`, description: "Reset your password", icon: faKey },
    { title: "Delete Account", link: `/${userType}/${userId}/delete-account`, description: "Delete your account", icon: faTrash }
  ];

  return (
    <div className="editor-dashboard">
      <div className="dashboard-grid">
        {cardData.map((card, index) => (
          <Link to={card.link} key={index} className="card-link">
            <div className="card-content">
              <FontAwesomeIcon icon={card.icon} className="card-icon" />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EditorDashboard;
