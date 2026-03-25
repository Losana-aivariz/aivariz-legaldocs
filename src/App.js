import { Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./pages/AdminDashboard"; // <-- Uncommented!
import UserDashboard from "./pages/UserDashboard";   // <-- Uncommented!
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetsPassword from "./pages/ResetsPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      
      {/* These now point directly to your real Dashboard files! */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/user" element={<UserDashboard />} />
      
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<ForgotPassword />} />
      <Route path="/verify" element={<VerifyOTP />} />
      <Route path="/resets" element={<ResetsPassword />} />
    </Routes>
  );
}

export default App;