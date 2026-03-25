import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import axios from "axios";
import "./LoginPage.css"; 

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) return alert("Please enter email and system password");
    
    try {
      // CHANGED FROM 5000 TO 5000
      const res = await axios.post("http://localhost:5000/login", { email, password });
      const userRole = res.data.role.toLowerCase(); 
      
      console.log("Login Successful! Role:", userRole);

      if (userRole === "admin") {
        localStorage.setItem("currentAdmin", JSON.stringify({
          email: email,
          name: email.split('@')[0], 
          role: "Admin",
          profilePic: null 
        }));
        navigate("/admin");

      } else if (userRole === "user" || userRole === "staff") {
        localStorage.setItem("currentStaff", JSON.stringify({
          email: email,
          name: email.split('@')[0], 
          role: "Staff",
          profilePic: null
        }));
        navigate("/user");

      } else {
        alert(`Role '${res.data.role}' not recognized by system.`);
      }
    } catch (error) {
      alert(error.response?.data?.message || "Server connection failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="form-content">
          <div className="profile-icon-wrapper">
            <FaUserCircle className="profile-icon" />
          </div>
          <h2>System Access</h2>
          <p className="subtitle">Sign in to manage legal documents</p>

          <div className="input-group">
            <label>Registered Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon left-icon" />
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
          </div>

          <div className="input-group">
            <label>System Password</label>
            <div className="input-wrapper">
              <FaLock className="input-icon left-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <div className="right-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
          </div>

          <button className="primary-btn mt-4" onClick={handleSignIn}>Secure Login</button>
        </div>
      </div>
    </div>
  );
}