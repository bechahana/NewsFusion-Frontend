import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './deleteAccount.css'; // Import the CSS file for styling
import { FaTrashAlt, FaArrowLeft } from 'react-icons/fa'; // Import icons

const DeleteAccount = () => {
  const { userType, userId } = useParams();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/api/${userType}/${userId}/delete-account`);
      alert("Your account has been deleted successfully.");
      navigate("/"); // Redirect to home or login page after deletion
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="delete-account-container">
      <h2 className="delete-account-title">Delete Account</h2>
      <p className="delete-account-message">
        Are you sure you want to delete your account? <br />
        <strong>This action cannot be undone.</strong>
      </p>
      <div className="delete-account-buttons">
        <button className="confirm-delete-button" onClick={handleDeleteAccount}>
          <FaTrashAlt className="button-icon" /> Confirm Delete
        </button>
        <button className="cancel-button" onClick={() => navigate(-1)}>
          <FaArrowLeft className="button-icon" /> Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteAccount;
