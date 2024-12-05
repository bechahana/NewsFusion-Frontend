import React from 'react';
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faHeart, faCompass, faListAlt, faTrash, faKey } from '@fortawesome/free-solid-svg-icons';
import '../styles.css';

const UserDashboard = () => {
  const { userId, userType } = useParams(); // Dynamically get userId and userType from the route

  // Debugging logs to check userId and userType
  console.log("[DEBUG] userId:", userId);
  console.log("[DEBUG] userType:", userType);

  if (!userId || !userType) {
    console.error("[ERROR] Missing userId or userType.");
    return <p>Error: Missing user information.</p>;
  }

  // Function to dynamically generate profile link
  const getProfileLink = () => {
    console.log("[DEBUG] Generating profile link for userId:", userId, "userType:", userType);
    return `/${userType}/${userId}/profile`;
  };

  // Function to dynamically generate activity link
  const getActivityLink = () => {
    console.log("[DEBUG] Generating activity link for userId:", userId, "userType:", userType);
    return `/${userType}/${userId}/activity`;
  };

  const cardData = [
    { title: "Profile", link: getProfileLink(), description: "Manage your profile", icon: faUser },
    { title: "Personalized", link: `/${userType}/${userId}/personalized`, description: "View personalized content", icon: faHeart },
    { title: "Suggested Feed", link: `/${userType}/${userId}/suggested-feed`, description: "View your suggested feed", icon: faCompass },
    { title: "Activity", link: getActivityLink(), description: "View your activity", icon: faListAlt },
    { title: "Reset Password", link: `/${userType}/${userId}/reset-password`, description: "Reset your password", icon: faKey },
    { title: "Delete Account", link: `/${userType}/${userId}/delete-account`, description: "Delete your account", icon: faTrash }
  ];

  return (
    <div className="dashboard-grid">
      {cardData.map((card, index) => (
        <Link to={card.link} key={index} className="card-link">
          <FontAwesomeIcon icon={card.icon} className="card-icon" />
          <h3>{card.title}</h3>
          <p>{card.description}</p>
        </Link>
      ))}
    </div>
  );
};

export default UserDashboard;
