import React, { useState } from "react";
import { registerUserWithRole } from "../firebase/auth"; // Import from auth.js
import { useNavigate } from "react-router-dom"; // Use useNavigate instead of useHistory
import "./register.css";

const Register = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
  
    // Validation checks
    if (!name || !username || !email || !phone || !password || !confirmPassword) {
      alert("All fields are required!");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      await registerUserWithRole(email, password); // No need to pass the role
      alert("User registered successfully!");
      navigate("/login"); // Redirect after registration
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registration failed. Please try again.");
    }
  };
  

  return (
    <div className="auth-container">
      <div className="register-section">
        <h2>Create Your Account</h2>
        <form onSubmit={handleRegister} className="register-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
      <div className="info-section">
        <h3>Welcome Back!</h3>
        <p>
          Sign in to your account and explore the platform's features.
        </p>
        <button onClick={() => navigate("/login")} className="info-button">
          Login
        </button>
      </div>
    </div>
  );
};

export default Register;
