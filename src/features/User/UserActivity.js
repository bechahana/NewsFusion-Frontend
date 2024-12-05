import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase/firebase";
import "./UserActivity.css";

const UserActivity = () => {
  const { userType } = useParams(); // Retrieve userType dynamically from URL
  const [activities, setActivities] = useState([]); // Handle activities as an array
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!auth.currentUser) {
          throw new Error("No user logged in.");
        }

        const token = await auth.currentUser.getIdTokenResult();
        const email = auth.currentUser.email; // Use the full email without trimming

        console.log("[DEBUG] Fetching activities for:", email, userType);

        const response = await fetch(
          `http://localhost:5000/api/user/activity?email=${encodeURIComponent(
            email
          )}&role=${userType}`, // Use full email in the query
          {
            headers: { Authorization: `Bearer ${token.token}` },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[ERROR] Failed to fetch activities:", errorText);
          throw new Error(errorText);
        }

        const data = await response.json();

        console.log("[DEBUG] Activities fetched successfully:", data);

        // Sort activities by timestamp (most recent first)
        const sortedActivities = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setActivities(sortedActivities);
      } catch (error) {
        console.error("[ERROR] Error fetching activities:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userType]);

  if (loading) return <p>Loading activities...</p>;
  if (error) return <p className="error-message">Failed to load activities: {error}</p>;

  return (
    <div className="user-activity">
      <h1>Activity Log</h1>
      {activities.length > 0 ? (
        <ul className="activity-list">
          {activities.map((activity, index) => (
            <li key={index} className="activity-item">
              <strong>Action:</strong> {activity.action} <br />
              <strong>Details:</strong>{" "}
              {typeof activity.details === "string"
                ? activity.details
                : Object.entries(activity.details)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")}
              <br />
              <span className="timestamp">
                <strong>Timestamp:</strong>{" "}
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No activities found.</p>
      )}
    </div>
  );
};

export default UserActivity;
