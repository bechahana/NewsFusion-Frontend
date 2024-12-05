import React, { useState } from "react";
import { loginUser } from "../firebase/auth";
import { auth } from "../firebase/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  FacebookAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { user, role } = await loginUser(email, password);
      if (role === "Admin") {
        navigate(`/admin/${user.uid}/dashboard`);
      } else if (role === "Editor") {
        navigate(`/editor/${user.uid}/dashboard`);
      } else {
        navigate(`/user/${user.uid}/dashboard`);
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google user:", user);
      navigate(`/user/${user.uid}/dashboard`);
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Google login failed");
    }
  };

  const handleFacebookSignIn = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Facebook user:", user);
      navigate(`/user/${user.uid}/dashboard`);
    } catch (error) {
      console.error("Facebook login failed:", error);
      alert("Facebook login failed");
    }
  };

  const sendOtp = () => {
    const recaptchaVerifier = new RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
      },
      auth
    );

    signInWithPhoneNumber(auth, phone, recaptchaVerifier)
      .then((confirmationResult) => {
        setVerificationId(confirmationResult.verificationId);
        alert("OTP sent!");
      })
      .catch((error) => {
        console.error("Failed to send OTP:", error);
      });
  };

  const verifyOtp = async () => {
    try {
      const credential = await auth.PhoneAuthProvider.credential(
        verificationId,
        otp
      );
      const userCredential = await auth.signInWithCredential(credential);
      console.log("Phone user:", userCredential.user);
      navigate(`/user/${userCredential.user.uid}/dashboard`);
    } catch (error) {
      console.error("Failed to verify OTP:", error);
    }
  };

  return (
    <div className="auth-container">
      <div className="login-section">
        <h2>Login to Your Account</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        <div className="divider">OR</div>
        <div className="social-login">
          <p>Sign in with</p>
          <div className="social-icons">
            <button
              className="social-button google"
              onClick={handleGoogleSignIn}
            >
              <i className="fab fa-google"></i>
            </button>
            <button
              className="social-button facebook"
              onClick={handleFacebookSignIn}
            >
              <i className="fab fa-facebook-f"></i>
            </button>
            <button className="social-button linkedin">
              <i className="fab fa-linkedin-in"></i>
            </button>
            <button className="social-button phone" onClick={sendOtp}>
              <i className="fas fa-phone-alt"></i>
            </button>
          </div>
        </div>

      </div>
      <div className="signup-section">
        <h3>New Here?</h3>
        <p>Sign up and discover a great amount of new opportunities!</p>
        <button onClick={() => navigate("/register")}>Sign Up</button>
      </div>
    </div>
  );  
    
};

export default Login;
