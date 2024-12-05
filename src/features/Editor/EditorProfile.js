import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase/firebase"; // Adjust your Firebase config import
import'./editor.css';
const EditorProfile = () => {
  const { userType } = useParams(); // Extract userType from URL
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // For popup visibility
  const [updatedProfile, setUpdatedProfile] = useState({}); // Store updated data

  useEffect(() => {
    const fetchEditorDetails = async () => {
      try {
        if (!auth.currentUser) {
          throw new Error("No editor logged in.");
        }

        const token = await auth.currentUser.getIdTokenResult();
        const email = auth.currentUser.email.trim().toLowerCase();

        const response = await fetch(
          `http://localhost:5000/api/editor/profile?email=${encodeURIComponent(
            email
          )}&role=${userType}`,
          {
            headers: { Authorization: `Bearer ${token.token}` },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const data = await response.json();
        setProfile(data);
        setUpdatedProfile(data); // Pre-fill the form with fetched data
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEditorDetails();
  }, [userType]);

  const handleUpdateProfile = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/editor/profile?email=${encodeURIComponent(
          profile.email
        )}&role=${userType}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const updatedData = await response.json();
      setProfile(updatedData);
      setIsPopupVisible(false);
      alert("Profile updated successfully!");

      // Reload the page to reflect the updated data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      alert(`Failed to update profile: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested fields dynamically
    if (name.includes(".")) {
      const [mainField, subField] = name.split(".");
      setUpdatedProfile((prev) => ({
        ...prev,
        [mainField]: {
          ...prev[mainField],
          [subField]: value,
        },
      }));
    } else {
      setUpdatedProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error-message">Failed to fetch profile. {error}</p>;

  return (
    <div className="editor-profile">
      {profile ? (
        <div>
          {profile.profilePictureURL && (
            <img
              src={profile.profilePictureURL}
              alt="Profile"
              className="profile-picture"
            />
          )}
          <h1 className="profile-name">{profile.name || "No Name Provided"}</h1>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Phone:</strong> {profile.phone || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {userType}
          </p>
          <p>
            <strong>Bio:</strong> {profile.bio || "N/A"}
          </p>
          <button
            className="edit-profile-button"
            onClick={() => setIsPopupVisible(true)}
          >
            Edit Profile
          </button>

          {/* Popup for editing */}
          {isPopupVisible && (
            <div className="popup-overlay">
              <div className="popup-form">
                <h2>Edit Profile</h2>
                <label>
                  Full Name:
                  <input
                    type="text"
                    name="name"
                    value={updatedProfile.name || ""}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Phone:
                  <input
                    type="text"
                    name="phone"
                    value={updatedProfile.phone || ""}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Bio:
                  <textarea
                    name="bio"
                    value={updatedProfile.bio || ""}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  Profile Picture URL:
                  <input
                    type="text"
                    name="profilePictureURL"
                    value={updatedProfile.profilePictureURL || ""}
                    onChange={handleChange}
                  />
                </label>
                <div className="popup-buttons">
                  <button
                    className="edit-profile-button"
                    onClick={handleUpdateProfile}
                  >
                    Save
                  </button>
                  <button
                    className="edit-profile-button cancel-button"
                    onClick={() => setIsPopupVisible(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default EditorProfile;
