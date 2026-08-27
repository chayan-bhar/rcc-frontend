import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function UserDashboard() {
  const { currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      // Fetch profile from backend
      const profRes = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: { "Authorization": `Bearer ${currentUser.token}` }
      });
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        setName(profData.name || currentUser.name || "");
      } else {
        // Backend unavailable — fallback to Auth0 identity
        setProfile({ email: currentUser.email, name: currentUser.name });
        setName(currentUser.name || "");
      }

      // Fetch donations — send email as query param
      const donRes = await fetch(
        `${API_BASE_URL}/api/donations/my-donations?email=${encodeURIComponent(currentUser.email)}`,
        { headers: { "Authorization": `Bearer ${currentUser.token}` } }
      );
      if (donRes.ok) {
        const donData = await donRes.json();
        setDonations(donData);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setMsg({ text: "Could not synchronize dashboard with backend service.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  // Re-fetch whenever a donation is completed (even from Home page modal)
  useEffect(() => {
    const handleDonationSuccess = () => fetchData();
    window.addEventListener("donation:success", handleDonationSuccess);
    return () => window.removeEventListener("donation:success", handleDonationSuccess);
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });
    setUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ name })
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setName(updated.name || "");
        if (updateUserProfile) {
          updateUserProfile({ name: updated.name });
        }
        setMsg({ text: "Profile details updated successfully.", type: "success" });
      } else {
        throw new Error("Update rejected.");
      }
    } catch (e) {
      console.error(e);
      setMsg({ text: "Failed to update profile details.", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const totalDonated = donations
    .filter(d => d.status === "SUCCESS")
    .reduce((sum, d) => sum + d.amount, 0);

  const campaignsSupported = new Set(
    donations
      .filter(d => d.status === "SUCCESS")
      .map(d => d.campaign ? d.campaign.id : null)
      .filter(id => id !== null)
  ).size;

  if (loading) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: "40px", animation: "fadeInUp 0.6s ease" }}>
      
      {/* Welcome & Stats Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginBottom: "40px"
      }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: "30px" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", color: "white", marginBottom: "16px" }}>Donor Profile</h2>
          {msg.text && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              marginBottom: "16px",
              background: msg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
              border: `1px solid ${msg.type === "success" ? "var(--accent-green)" : "var(--accent-rose)"}`,
              color: msg.type === "success" ? "var(--accent-green)" : "var(--accent-rose)"
            }}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="text" className="form-input" disabled value={profile?.email || currentUser?.email || ""} style={{ opacity: 0.6, cursor: "not-allowed" }} />
            </div>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={updating} style={{ width: "100%" }}>
              {updating ? "Saving..." : "Update Name"}
            </button>
          </form>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Donated</span>
            <span style={{ fontSize: "2.4rem", fontFamily: "var(--font-heading)", fontWeight: "800", color: "var(--accent-green)", margin: "8px 0" }}>
              ₹{totalDonated.toLocaleString()}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tax deductible contributions</span>
          </div>

          <div className="glass-panel" style={{ padding: "30px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Causes Supported</span>
            <span style={{ fontSize: "2.4rem", fontFamily: "var(--font-heading)", fontWeight: "800", color: "var(--accent-blue)", margin: "8px 0" }}>
              {campaignsSupported}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Individual NGO campaigns</span>
          </div>
        </div>
      </div>

      {/* Donation History Section */}
      <section className="glass-panel" style={{ padding: "30px", overflowX: "auto" }}>
        <h3 style={{ fontFamily: "var(--font-heading)", color: "white", marginBottom: "20px" }}>Donation History</h3>
        
        {donations.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px 0" }}>
            You haven't made any donations yet. Visit the home page to contribute!
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Campaign</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "var(--transition-fast)" }}>
                  <td style={tdStyle}>{new Date(d.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td style={tdStyle}>{d.campaign ? d.campaign.title : "General Fund"}</td>
                  <td style={tdStyle}>₹{d.amount.toLocaleString()}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      background: d.status === "SUCCESS" ? "rgba(16,185,129,0.1)" : d.status === "PENDING" ? "rgba(245,158,11,0.1)" : "rgba(244,63,94,0.1)",
                      border: "1px solid",
                      borderColor: d.status === "SUCCESS" ? "var(--accent-green)" : d.status === "PENDING" ? "#f59e0b" : "var(--accent-rose)",
                      color: d.status === "SUCCESS" ? "var(--accent-green)" : d.status === "PENDING" ? "#f59e0b" : "var(--accent-rose)",
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {d.status === "SUCCESS" ? (
                      <a 
                        href={`${API_BASE_URL}/api/donations/${d.id}/receipt`}
                        className="btn btn-success"
                        style={{ padding: "6px 12px", fontSize: "0.8rem", textDecoration: "none" }}
                      >
                        Download PDF
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Unavailable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const thStyle = {
  padding: "14px 10px",
  color: "var(--text-secondary)",
  fontWeight: "600",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tdStyle = {
  padding: "16px 10px",
  fontSize: "0.95rem",
  color: "var(--text-primary)"
};
