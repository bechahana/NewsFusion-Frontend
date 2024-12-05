import React, { useState } from "react";
import {
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import "./resetPassword.css";

const ResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetByEmail, setResetByEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Handle Reset by Current Password
  const handlePasswordResetByCurrentPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User is not authenticated. Please log in again.");
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);
      setSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => navigate(`/user/${user.uid}/dashboard`), 2000);
    } catch (error) {
      setError(error?.message || "Failed to reset password. Please try again.");
    }
  };

  // Handle Reset by Email
  const handlePasswordResetByEmail = async () => {
    setError(null);
    setSuccess(null);

    try {
      const user = auth.currentUser;
      if (!user?.email) {
        setError("User email not found. Please re-authenticate.");
        return;
      }

      await sendPasswordResetEmail(auth, user.email);
      setEmailSent(true);
      setSuccess("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setError(error?.message || "Failed to send password reset email. Please try again.");
    }
  };

  return (
    <>
      
      <div className="reset-container">
      <h1 className="reset-title">
        <i className="fas fa-key"></i> Reset Password
      </h1>
        {/* Toggle Methods */}
        <div className="reset-method-toggle">
          <button
            className={!resetByEmail ? "active" : ""}
            onClick={() => setResetByEmail(false)}
          >
            <i className="fas fa-lock"></i> By Current Password
          </button>
          <button
            className={resetByEmail ? "active" : ""}
            onClick={() => setResetByEmail(true)}
          >
            <i className="fas fa-envelope"></i> By Email
          </button>
        </div>
  
        {/* By Current Password */}
        {!resetByEmail && (
          <form onSubmit={handlePasswordResetByCurrentPassword} className="reset-form">
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-key"></i>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-check-circle"></i>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="reset-button">
              <i className="fas fa-sync-alt"></i> Update Password
            </button>
          </form>
        )}
  
        {/* By Email */}
        {resetByEmail && (
          <div className="reset-by-email">
            {!emailSent ? (
              <>
                <p>We’ll send a reset link to your registered email.</p>
                <button onClick={handlePasswordResetByEmail} className="reset-button">
                  <i className="fas fa-paper-plane"></i> Send Email
                </button>
              </>
            ) : (
              <p className="reset-success">
                <i className="fas fa-check-circle"></i> Email sent! Check your inbox.
              </p>
            )}
          </div>
        )}
  
        {/* Error or Success Messages */}
        {error && (
          <p className="reset-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </p>
        )}
        {success && (
          <p className="reset-success">
            <i className="fas fa-check-circle"></i> {success}
          </p>
        )}
  
        {/* Back Button */}
        <button
          onClick={() => navigate(`/user/${auth.currentUser?.uid}/dashboard`)}
          className="back-button"
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
      </div>
    </>
  );
  
};

export default ResetPassword;
