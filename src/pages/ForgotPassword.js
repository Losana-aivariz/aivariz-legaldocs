import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "../components/LoginPage.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSendOtp = async () => {
    if (!email) return alert("Please enter your registered email");
    try {
      const res = await axios.post("http://localhost:5000/send-otp", { email });
      alert(res.data.message); 
      // Navigate to verify page and pass the email along so it remembers it
      navigate("/verify", { state: { email } }); 
    } catch (error) {
      alert(error.response?.data?.message || "Error sending OTP");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="top-bar">
          <FaArrowLeft className="back-icon" onClick={() => navigate("/")} />
          <span className="top-title">Reset Password</span>
        </div>

        <div className="form-content mt-4">
          <p className="subtitle">Enter your email to receive a 6-digit OTP</p>

          <div className="input-group mt-4">
            <label>Registered Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon left-icon" />
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <button className="primary-btn mt-4" onClick={handleSendOtp}>Send OTP</button>
        </div>
      </div>
    </div>
  );
}