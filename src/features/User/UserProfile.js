import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase"; // Adjust path if necessary
import './profile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    profile_picture_url: "",
    contact_information: { linked_in: "", twitter: "" },
    member_since: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error("User not authenticated");
        }
  
        const token = await currentUser.getIdToken();
        const email = currentUser.email.trim(); // Ensure email is correctly formatted
        const role = "user"; // Explicitly specify the role
  
        const response = await fetch(
          `http://localhost:5000/api/user/profile?email=${encodeURIComponent(email)}&role=${role}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error fetching profile data: ${errorText}`);
        }
  
        const data = await response.json();
        console.log("Fetched profile data:", data);
        setProfile(data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError(error.message || "Error fetching profile data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
  }, []);
  

  const toggleEditMode = () => setIsEditing(!isEditing);

  const handleProfileUpdate = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
  
      // Ensure no undefined values in profile
      const updatedProfile = {
        ...profile,
        profile_picture_url: profile.profile_picture_url || "", // Default to an empty string
      };
  
      const email = auth.currentUser.email.trim();
      const role = "user";
  
      const response = await fetch(
        `http://localhost:5000/api/user/profile?email=${encodeURIComponent(email)}&role=${role}`,
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
        throw new Error(`Failed to update profile: ${errorText}`);
      }
  
      const updatedData = await response.json();
      setProfile(updatedData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Error updating profile: ${error.message}`);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown Date";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Unknown Date" : date.toLocaleDateString();
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
      <div className="user-profile">
        {profile ? (
          <>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Phone"
                />
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Bio"
                />
                <input
                  type="text"
                  value={profile.profile_picture_url}
                  onChange={(e) => setProfile({ ...profile, profile_picture_url: e.target.value })}
                  placeholder="Profile Picture URL"
                />
                <input
                  type="text"
                  value={profile.contact_information?.linked_in || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact_information: {
                        ...profile.contact_information,
                        linked_in: e.target.value,
                      },
                    })
                  }
                  placeholder="LinkedIn URL"
                />
                <input
                  type="text"
                  value={profile.contact_information?.twitter || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contact_information: {
                        ...profile.contact_information,
                        twitter: e.target.value,
                      },
                    })
                  }
                  placeholder="Twitter URL"
                />
                <button onClick={handleProfileUpdate}>Save</button>
                <button onClick={toggleEditMode}>Cancel</button>
              </>
            ) : (
              <>
                {profile.profile_picture_url && (
                  <img src={profile.profile_picture_url} alt="Profile" />
                )}
                <h2>{profile.name}</h2>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <p><strong>member Since:</strong> {formatDate(profile.member_since)}</p>
                <p>{profile.bio}</p>
                {profile.contact_information && (
                  <>
                    <p><a href={profile.contact_information.linked_in || "#"}>LinkedIn</a></p>
                    <p><a href={profile.contact_information.twitter || "#"}>Twitter</a></p>
                  </>
                )}
                <button onClick={toggleEditMode}>Edit Profile</button>
              </>
            )}
          </>
        ) : (
          <p>No profile data available</p>
        )}
      </div>
  );
};

export default UserProfile;
