import React, { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { useNavigate, useParams } from "react-router-dom";
import './user.css';
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("User");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { userId } = useParams(); // Get UID from the URL

  useEffect(() => {
    // Verify admin's UID in the URL matches the logged-in user
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        if (user.uid !== userId) {
          setError("Access denied: UID mismatch.");
          navigate("/login");
        } else {
          setError(null);
          await fetchUsers(token); // Load users if UID matches
        }
      } else {
        setError("User not authenticated.");
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate, userId]);

  // Fetch all users
  const fetchUsers = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.error || "Failed to fetch users.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new user
  const handleAddUser = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("http://localhost:5000/api/admin/users/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });

      if (!response.ok) throw new Error("Error adding user");

      const result = await response.json();
      setUsers((prevUsers) => [...prevUsers, result.user]);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("User");
    } catch (error) {
      alert(`Error adding user: ${error.message}`);
    }
  };

  // Update user role
  const updateRole = async (uid, role) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/admin/users/${uid}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) throw new Error("Error updating role");

      alert("Role updated successfully!");
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, role } : user
        )
      );
    } catch (error) {
      alert("Error updating role");
    }
  };

  // Ban or unban a user
  const banUser = async (uid, disabled) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/admin/users/${uid}/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ disabled }),
      });

      if (!response.ok) throw new Error("Error banning/unbanning user");

      alert(`User ${disabled ? "banned" : "unbanned"} successfully!`);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.uid === uid ? { ...user, disabled } : user
        )
      );
    } catch (error) {
      alert("Error banning/unbanning user");
    }
  };

  // Delete a user
  const deleteUser = async (uid) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const deleteFromFirestore = fetch(`http://localhost:5000/api/admin/users/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const deleteFromAuth = fetch(`http://localhost:5000/api/auth/delete/${uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await Promise.all([deleteFromFirestore, deleteFromAuth]);

      alert("User deleted successfully!");
      setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== uid));
    } catch (error) {
      alert("Error deleting user");
    }
  };

  if (loading) return <div>Loading...</div>;

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <div className="form-container">
  <h3>Add New User</h3>
  <input
    type="email"
    value={newUserEmail}
    onChange={(e) => setNewUserEmail(e.target.value)}
    placeholder="Enter user email"
  />
  <input
    type="password"
    value={newUserPassword}
    onChange={(e) => setNewUserPassword(e.target.value)}
    placeholder="Enter user password"
  />
  <select
    value={newUserRole}
    onChange={(e) => setNewUserRole(e.target.value)}
  >
    <option value="User">User</option>
    <option value="Editor">Editor</option>
    <option value="Admin">Admin</option>
  </select>
  <button onClick={handleAddUser}>Add User</button>
</div>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>UID</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.uid}>
              <td>{user.email}</td>
              <td>{user.uid}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user.uid, e.target.value)}
                >
                  <option value="User">User</option>
                  <option value="Editor">Editor</option>
                  <option value="Admin">Admin</option>
                </select>
              </td>
              <td className={`status ${user.disabled ? 'banned' : 'active'}`}>
                {user.disabled ? "Banned" : "Active"}
              </td>
              <td className="action-buttons">
                <button onClick={() => banUser(user.uid, !user.disabled)}>
                  {user.disabled ? "Unban" : "Ban"}
                </button>
                <button onClick={() => deleteUser(user.uid)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  
};

export default AdminUserManagement;
