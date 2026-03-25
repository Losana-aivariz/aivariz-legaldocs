import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import "../components/LoginPage.css";

export default function ResetsPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleReset = async () => {
    if (!password) return alert("Please enter a new password");
    if (password !== confirmPassword) return alert("Passwords do not match!");

    try {
      const res = await axios.post("http://localhost:5000/reset-password", { email, password });
      alert(res.data.message);
      navigate("/"); // Send them back to Login to use their new password!
    } catch (error) {
      alert(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Create New Password</h2>
        <div className="form-content mt-4">
          <p className="subtitle">Secure your account with a new password</p>

          <div className="input-group mt-4">
            <label>New Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon left-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter new password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <div className="right-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon left-icon" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
              <div className="right-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button className="primary-btn mt-4" onClick={handleReset}>Save Password</button>
        </div>
      </div>
    </div>
  );
}