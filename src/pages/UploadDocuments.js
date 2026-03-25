import { useNavigate } from "react-router-dom";
import "./UserDashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h2>User Dashboard</h2>

      <div className="cards">
        <div className="card" onClick={() => navigate("/upload")}>
          Upload New Document
        </div>

        <div className="card" onClick={() => navigate("/sent")}>
          Documents Sent to Admin
        </div>

        <div className="card" onClick={() => navigate("/approved")}>
          Approved Documents
        </div>

        <div className="card" onClick={() => navigate("/rejected")}>
          Rejected Documents
        </div>
      </div>
    </div>
  );
}
