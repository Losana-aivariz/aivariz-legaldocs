import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "../components/LoginPage.css"; // Make sure this path points to your CSS!

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) return alert("Please fill in all fields");
    if (password !== confirmPassword) return alert("Passwords do not match!");

    try {
      const res = await axios.post("http://localhost:5000/register", { name, email, password });
      alert(res.data.message); 
      navigate("/"); // Send to login
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="top-bar">
          <FaArrowLeft className="back-icon" onClick={() => navigate("/")} />
          <span className="top-title">Join us today</span>
        </div>

        <div className="form-content">
          <div className="input-group mt-4">
            <label>Full Name</label>
            <div className="input-wrapper">
              <FaUser className="input-icon left-icon" />
              <input type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon left-icon" />
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon left-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Create password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <div className="right-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon left-icon" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
              <div className="right-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button className="primary-btn mt-4" onClick={handleSignUp}>Create Account</button>
        </div>
      </div>
    </div>
  );
}