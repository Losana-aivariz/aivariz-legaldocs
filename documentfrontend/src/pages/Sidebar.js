import React from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";


const Sidebar = ({ active }) => {
  return (
    <div className="sidebar">
      <div className="logo">Admin Page</div>
      <ul>
        <li className={active === "templates" ? "active" : ""}>
          <Link to="/templates">
            <span className="icon">📄</span>
            <span className="text">Deed Templates</span>
          </Link>
        </li>
        <li className={active === "verification" ? "active" : ""}>
          <Link to="/">
            <span className="icon">✅</span>
            <span className="text">Document Verification</span>
          </Link>
        </li>
        <li className={active === "search" ? "active" : ""}>
          <Link to="/search">
            <span className="icon">🔍</span>
            <span className="text">Search Clients</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
