import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import "./AdminActivity.css";

const AdminActivity = () => {
  const [activities, setActivities] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        if (!auth.currentUser) {
          throw new Error("No admin logged in.");
        }

        const token = await auth.currentUser.getIdToken();
        const email = auth.currentUser.email.trim();
        const role = "admin";

        console.log("[DEBUG] Fetching activities for:", { email, role });

        const response = await fetch(
          `http://localhost:5000/api/admin/activity?email=${encodeURIComponent(
            email
          )}&role=${role}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
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
    <div className="admin-activity">
      <h1>Admin Activity Log</h1>
      {Array.isArray(activities) && activities.length > 0 ? (
        <ul>
          {activities.map((activity, index) => {
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

export default AdminActivity;
