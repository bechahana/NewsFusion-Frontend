import React from 'react';
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faClipboardList, faUsers, faCog, faShieldAlt, faChartLine, faTrash, faKey } from '@fortawesome/free-solid-svg-icons'; // Add relevant icons
import './admin.css';

const AdminDashboard = () => {
  const { userId } = useParams();

  const cardData = [
    { title: "Profile", link: `/admin/${userId}/profile`, description: "Manage your profile settings", icon: faUser },
    { title: "Activity", link: `/admin/${userId}/activity`, description: "View your recent activity", icon: faClipboardList },
    { title: "User Management", link: `/admin/${userId}/users`, description: "Manage users in the system", icon: faUsers },
    { title: "Content Management", link: `/admin/${userId}/content`, description: "Manage site content", icon: faCog },
    { title: "Security", link: `/admin/${userId}/security`, description: "Configure security settings", icon: faShieldAlt },
    { title: "Analytics", link: `/admin/${userId}/analytics`, description: "View site analytics", icon: faChartLine },
    { title: "Reset Password", link: `/admin/${userId}/reset-password`, description: "Reset your account password", icon: faKey }, // Reset password card
    { title: "Delete Account", link: `/admin/${userId}/delete-account`, description: "Permanently delete your account", icon: faTrash }
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

export default AdminDashboard;
