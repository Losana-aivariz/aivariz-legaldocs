import React, { useState } from "react";

export default function FormPage() {

  const [form, setForm] = useState({
    buyerName: "",
    buyerAadhar: "",
    sellerName: "",
    district: "",
    surveyNo: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="form-wrapper">

      <h2>Enter Document Details</h2>

      <input name="buyerName" placeholder="Buyer Name"
        value={form.buyerName} onChange={handleChange} />

      <input name="buyerAadhar" placeholder="Buyer Aadhar"
        value={form.buyerAadhar} onChange={handleChange} />

      <input name="sellerName" placeholder="Seller Name"
        value={form.sellerName} onChange={handleChange} />

      <input name="district" placeholder="District"
        value={form.district} onChange={handleChange} />

      <input name="surveyNo" placeholder="Survey Number"
        value={form.surveyNo} onChange={handleChange} />

      <button>Generate Draft</button>
    </div>
  );
}
