import React, { useState } from "react";
import "./PrepareDraft.css";

export default function PrepareDraft() {
  const [formData, setFormData] = useState({
    buyer: "",
    seller: "",
    buyerAadhar: "",
    sellerAadhar: "",
    district: "",
    surveyNumber: ""
  });

  const [showDraft, setShowDraft] = useState(false);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check if all fields are filled
  const allFilled = Object.values(formData).every(v => v.trim() !== "");

  const handleSubmit = () => {
    setShowDraft(true);
  };

  return (
    <div className="draft-container">

      <div className="form-card">
        <h2>Enter Sale Deed Details</h2>

        <label>Buyer Name</label>
        <input name="buyer" value={formData.buyer} onChange={handleInput} placeholder="Buyer Name" />

        <label>Seller Name</label>
        <input name="seller" value={formData.seller} onChange={handleInput} placeholder="Seller Name" />

        <label>Buyer Aadhar</label>
        <input name="buyerAadhar" value={formData.buyerAadhar} onChange={handleInput} placeholder="Buyer Aadhar" />

        <label>Seller Aadhar</label>
        <input name="sellerAadhar" value={formData.sellerAadhar} onChange={handleInput} placeholder="Seller Aadhar" />

        <label>District</label>
        <input name="district" value={formData.district} onChange={handleInput} placeholder="District" />

        <label>Survey Number</label>
        <input name="surveyNumber" value={formData.surveyNumber} onChange={handleInput} placeholder="Survey Number" />

        {allFilled && (
          <button className="submit-btn" onClick={handleSubmit}>
            Prepare Draft
          </button>
        )}
      </div>

      {showDraft && (
        <div className="preview-card">
          <h3>Generated Sale Deed Draft</h3>

          <div className="draft-preview">
            <p><b>Buyer:</b> {formData.buyer}</p>
            <p><b>Seller:</b> {formData.seller}</p>
            <p><b>Buyer Aadhar:</b> {formData.buyerAadhar}</p>
            <p><b>Seller Aadhar:</b> {formData.sellerAadhar}</p>
            <p><b>District:</b> {formData.district}</p>
            <p><b>Survey Number:</b> {formData.surveyNumber}</p>

            <hr />

            <p>
              This deed is executed between <b>{formData.seller}</b> (Seller) and 
              <b> {formData.buyer}</b> (Buyer) located in the district of 
              <b> {formData.district}</b> relating to property bearing Survey Number 
              <b> {formData.surveyNumber}</b>.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
