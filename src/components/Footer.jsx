import React from "react";

export default function Footer() {
  return (
    <footer style={{
      marginTop: "80px",
      padding: "40px 24px",
      background: "var(--bg-secondary)",
      borderTop: "1px solid var(--border-color)",
      color: "var(--text-secondary)",
      fontSize: "0.9rem"
    }}>
      <div className="container" style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: "30px",
      }}>
        <div style={{ flex: "1 1 300px" }}>
          <h3 style={{ color: "white", marginBottom: "16px", fontFamily: "var(--font-heading)" }}>Hope & Care</h3>
          <p style={{ maxWidth: "320px", marginBottom: "16px" }}>
            A registered non-profit organization dedicated to fostering positive social impact through direct action, community support, and transparent charity campaign initiatives.
          </p>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Hope & Care Foundation. All rights reserved.
          </span>
        </div>

        <div style={{ flex: "1 1 200px" }}>
          <h4 style={{ color: "white", marginBottom: "16px", fontSize: "1rem" }}>Quick Links</h4>
          <ul style={{ listStyle: "none", display: "grid", gap: "10px" }}>
            <li><a href="/" style={linkStyle}>Active Campaigns</a></li>
            <li><a href="/dashboard" style={linkStyle}>My Dashboard</a></li>
            <li><a href="/login" style={linkStyle}>Login / Signup</a></li>
          </ul>
        </div>

        <div style={{ flex: "1 1 200px" }}>
          <h4 style={{ color: "white", marginBottom: "16px", fontSize: "1rem" }}>Tax & Compliance</h4>
          <p style={{ fontSize: "0.85rem", lineHeight: "1.6" }}>
            All donations are tax-deductible under Section 80G of the Income Tax Act. Double-check your profile details before checkout to ensure the receipt reflects your correct tax info.
          </p>
        </div>
      </div>
    </footer>
  );
}

const linkStyle = {
  transition: "var(--transition-fast)",
  color: "var(--text-secondary)",
};
