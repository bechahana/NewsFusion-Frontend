import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import "./EditorActivity.css";

const EditorActivity = () => {
  const [activities, setActivities] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!auth.currentUser) {
          throw new Error("No editor logged in.");
        }

        const token = await auth.currentUser.getIdTokenResult();
        const email = auth.currentUser.email.trim(); // Extract email from token
        console.log("[DEBUG] Fetching activities for:", email);

        const response = await fetch(
          `http://localhost:5000/api/editor/activity`,
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
        setActivities(data);
      } catch (error) {
        console.error("[ERROR] Error fetching activities:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <p>Loading activities...</p>;
  if (error) return <p className="error-message">Failed to load activities: {error}</p>;

  return (
    <div className="editor-activity">
      <h1>Activity Log</h1>
      {Array.isArray(activities) && activities.length > 0 ? (
        <ul>
        {activities.map((activity, index) => {
          // Assign a specific class based on the action type
          const activityClass =
            activity.action === "Published Article"
              ? "important"
              : activity.action === "view"
              ? "view"
              : "comment";
      
          return (
            <li key={index} className={activityClass}>
              <strong>Type:</strong> {activity.action} <br />
              <strong>Details:</strong>{" "}
              {typeof activity.details === "string"
                ? activity.details
                : JSON.stringify(activity.details, null, 2)}
              <br />
              <span className="timestamp">
                <strong>Timestamp:</strong>{" "}
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
      
      ) : (
        <p>No activities found.</p>
      )}
    </div>
  );
};

export default EditorActivity;
