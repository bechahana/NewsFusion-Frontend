import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faShieldAlt, faClock, faUsers, faNetworkWired, faLock } from "@fortawesome/free-solid-svg-icons";
import "./Security.css";
import { auth } from "../firebase/firebase"; // Adjust path if necessary

const Security = () => {
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expirationDays: 90,
    passwordHistory: 5,
  });

  const [mfaPolicy, setMfaPolicy] = useState({
    enabled: true,
    type: "otp", // Options: "otp", "sms", "email"
  });

  const [sessionPolicy, setSessionPolicy] = useState({
    timeout: 30,
    maxSessions: 3,
    idleTimeout: 10,
  });

  const [apiPolicy, setApiPolicy] = useState({
    rateLimit: 100,
    ipWhitelist: "",
    ipBlacklist: "",
  });

  const handlePasswordPolicyChange = (field, value) => {
    setPasswordPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const handleMfaPolicyChange = (field, value) => {
    setMfaPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const handleSessionPolicyChange = (field, value) => {
    setSessionPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const handleApiPolicyChange = (field, value) => {
    setApiPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const savePolicies = async () => {
    const token = await auth.currentUser.getIdToken(); // Ensure the user is authenticated
  
    try {
      const response = await fetch("http://localhost:5000/api/admin/security", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ passwordPolicy, mfaPolicy, sessionPolicy, apiPolicy }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save policies: ${errorText}`);
      }
  
      const result = await response.json();
      alert(result.message || "Policies saved successfully!");
    } catch (error) {
      console.error("Error saving policies:", error.message);
      alert(`Error saving policies: ${error.message}`);
    }
  };
  
  return (
    <div className="security">
      {/* Password Policy Card */}
      <div className="policy-card">
        <h2>
          <FontAwesomeIcon icon={faKey} /> Password Policy
        </h2>
        <div className="policy-item">
          <label>Minimum Password Length</label>
          <input
            type="number"
            value={passwordPolicy.minLength}
            onChange={(e) => handlePasswordPolicyChange("minLength", e.target.value)}
          />
        </div>
        <div className="policy-item">
          <label>History: Prevent reuse of last</label>
          <input
            type="number"
            value={passwordPolicy.passwordHistory}
            onChange={(e) => handlePasswordPolicyChange("passwordHistory", e.target.value)}
          />
        </div>
        <div className="policy-item">
          <label>
            <input
              type="checkbox"
              checked={passwordPolicy.requireUppercase}
              onChange={(e) => handlePasswordPolicyChange("requireUppercase", e.target.checked)}
            />
            Require Uppercase Letters
          </label>
        </div>
        <div className="policy-item">
          <label>
            <input
              type="checkbox"
              checked={passwordPolicy.requireNumbers}
              onChange={(e) => handlePasswordPolicyChange("requireNumbers", e.target.checked)}
            />
            Require Numbers
          </label>
        </div>
        <div className="policy-item">
          <label>
            <input
              type="checkbox"
              checked={passwordPolicy.requireSpecialChars}
              onChange={(e) => handlePasswordPolicyChange("requireSpecialChars", e.target.checked)}
            />
            Require Special Characters
          </label>
        </div>
        
      </div>

      {/* Multi-Factor Authentication Policy */}
      <div className="policy-card">
        <h2>
          <FontAwesomeIcon icon={faLock} /> Multi-Factor Authentication
        </h2>
        <div className="policy-item">
          <label>
            <input
              type="checkbox"
              checked={mfaPolicy.enabled}
              onChange={(e) => handleMfaPolicyChange("enabled", e.target.checked)}
            />
            Enforce Multi-Factor Authentication
          </label>
        </div>
        <div className="policy-item">
          <label>MFA Type:</label>
          <select
            value={mfaPolicy.type}
            onChange={(e) => handleMfaPolicyChange("type", e.target.value)}
          >
            <option value="otp">Time-based OTP</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>

      {/* Session Management Policy */}
      <div className="policy-card">
        <h2>
          <FontAwesomeIcon icon={faClock} /> Session Management
        </h2>
        <div className="policy-item">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            value={sessionPolicy.timeout}
            onChange={(e) => handleSessionPolicyChange("timeout", e.target.value)}
          />
        </div>
        <div className="policy-item">
          <label>Idle Timeout (minutes)</label>
          <input
            type="number"
            value={sessionPolicy.idleTimeout}
            onChange={(e) => handleSessionPolicyChange("idleTimeout", e.target.value)}
          />
        </div>
      
      </div>

      
      {/* Save Button */}
      <button className="save-button" onClick={savePolicies}>
        Save Policies
      </button>
    </div>
  );
};

export default Security;
