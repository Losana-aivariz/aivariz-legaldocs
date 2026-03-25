import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaKey, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "../components/LoginPage.css";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; // Gets the email from the previous page
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    if (!otp) return alert("Please enter the OTP");
    try {
      const res = await axios.post("http://localhost:5000/verify-otp", { email, otp });
      alert(res.data.message);
      // Success! Move to the final reset page, passing the email again
      navigate("/resets", { state: { email } });
    } catch (error) {
      alert(error.response?.data?.message || "Invalid or Expired OTP");
    }
  };

  if (!email) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h2>Error</h2>
          <p>No email provided. Please start the reset process over.</p>
          <button className="primary-btn mt-4" onClick={() => navigate("/forgot")}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="top-bar">
          <FaArrowLeft className="back-icon" onClick={() => navigate("/forgot")} />
          <span className="top-title">Verify OTP</span>
        </div>

        <div className="form-content mt-4">
          <p className="subtitle">Enter the 6-digit code sent to {email}</p>

          <div className="input-group mt-4">
            <label>Verification Code</label>
            <div className="input-wrapper">
              <FaKey className="input-icon left-icon" />
              <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
          </div>

          <button className="primary-btn mt-4" onClick={handleVerify}>Verify Code</button>
        </div>
      </div>
    </div>
  );
}