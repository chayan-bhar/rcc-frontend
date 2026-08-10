import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <nav className="glass-panel" style={{
      margin: "16px 24px",
      padding: "12px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: "16px",
      zIndex: 100,
      border: "1px solid var(--border-color)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            background: "var(--gradient-blue)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.2rem",
            boxShadow: "var(--shadow-glow)"
          }}>H</span>
          <span style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.3rem",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            background: "linear-gradient(90deg, #fff 0%, var(--text-secondary) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>HOPE & CARE</span>
        </Link>

        {/* Navigation links */}
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/" className="nav-link" style={linkStyle}>Campaigns</Link>
          {currentUser && (
            <Link to="/dashboard" className="nav-link" style={linkStyle}>My Profile</Link>
          )}
          {currentUser && currentUser.role === "ADMIN" && (
            <Link to="/admin" className="nav-link" style={{ ...linkStyle, color: "var(--accent-blue)" }}>Admin Panel</Link>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

        {currentUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "600" }}>{currentUser.name}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>
                {currentUser.role === "ADMIN" ? "Administrator" : "Donor"}
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  fontSize: "0.9rem",
  fontWeight: "500",
  color: "var(--text-secondary)",
  transition: "var(--transition-fast)",
  padding: "4px 8px",
};
