import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Campaign Form State (for both create & edit)
  const [formCampaign, setFormCampaign] = useState({ id: null, title: "", description: "", targetAmount: "", imageUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    if (!currentUser || currentUser.role !== "ADMIN") {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Fetch stats
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { "Authorization": `Bearer ${currentUser.token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        throw new Error("Failed to load admin stats.");
      }

      // Fetch campaigns
      const campRes = await fetch(`${API_BASE_URL}/api/campaigns`);
      if (campRes.ok) {
        const campData = await campRes.json();
        setCampaigns(campData);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to fetch admin stats. Ensure the backend server is running and you have admin rights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, navigate]);

  const handleCreateNewClick = () => {
    setFormCampaign({ id: null, title: "", description: "", targetAmount: "", imageUrl: "" });
    setIsEditing(false);
    setShowForm(true);
    setFormError("");
  };

  const handleEditClick = (campaign) => {
    setFormCampaign({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      targetAmount: campaign.targetAmount,
      imageUrl: campaign.imageUrl || ""
    });
    setIsEditing(true);
    setShowForm(true);
    setFormError("");
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${currentUser.token}`
        }
      });
      if (response.ok) {
        fetchData();
      } else {
        alert("Delete failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting campaign.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    const url = isEditing
      ? `${API_BASE_URL}/api/campaigns/${formCampaign.id}`
      : `${API_BASE_URL}/api/campaigns`;

    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          title: formCampaign.title,
          description: formCampaign.description,
          targetAmount: parseFloat(formCampaign.targetAmount),
          imageUrl: formCampaign.imageUrl || null
        })
      });

      if (response.ok) {
        setShowForm(false);
        fetchData();
      } else {
        const errText = await response.text();
        throw new Error(errText || "Error saving campaign details.");
      }
    } catch (err) {
      console.error(err);
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ textAlign: "center", padding: "60px 0" }}>Loading admin console...</div>;
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: "40px", textAlign: "center" }}>
        <div className="glass-panel" style={{ padding: "40px" }}>
          <h2 style={{ color: "var(--accent-rose)", marginBottom: "16px" }}>Admin Access Error</h2>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
          <button onClick={fetchData} className="btn btn-primary" style={{ marginTop: "20px" }}>Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: "40px", animation: "fadeInUp 0.6s ease" }}>
      
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: "white" }}>Admin Dashboard</h2>
          <p style={{ color: "var(--text-secondary)" }}>Analyze NGO donations and manage charity campaigns</p>
        </div>
        <button onClick={handleCreateNewClick} className="btn btn-primary">
          + Add New Campaign
        </button>
      </div>

      {/* Stats Counters */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
        marginBottom: "40px"
      }}>
        <div className="glass-panel" style={statCardStyle}>
          <span style={statLabelStyle}>Total Collections</span>
          <span style={{ ...statNumberStyle, color: "var(--accent-green)" }}>
            ₹{stats?.totalDonations ? stats.totalDonations.toLocaleString() : "0"}
          </span>
        </div>

        <div className="glass-panel" style={statCardStyle}>
          <span style={statLabelStyle}>Unique Donors</span>
          <span style={{ ...statNumberStyle, color: "var(--accent-blue)" }}>
            {stats?.donorCount || 0}
          </span>
        </div>

        <div className="glass-panel" style={statCardStyle}>
          <span style={statLabelStyle}>Active Campaigns</span>
          <span style={{ ...statNumberStyle, color: "var(--accent-purple)" }}>
            {stats?.campaignCount || 0}
          </span>
        </div>
      </div>

      {/* Campaign Form Modal */}
      {showForm && (
        <div style={overlayStyle}>
          <div className="glass-panel" style={modalStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.3rem", color: "white", fontFamily: "var(--font-heading)" }}>
                {isEditing ? "Edit Campaign details" : "Add New Campaign"}
              </h3>
              <button onClick={() => setShowForm(false)} style={closeBtnStyle}>&times;</button>
            </div>

            {formError && (
              <div style={{ padding: "12px", background: "rgba(244,63,94,0.1)", border: "1px solid var(--accent-rose)", borderRadius: "8px", color: "var(--accent-rose)", fontSize: "0.85rem", marginBottom: "16px" }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Campaign Title</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formCampaign.title}
                  onChange={(e) => setFormCampaign({ ...formCampaign, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Campaign Description</label>
                <textarea
                  required
                  rows="4"
                  className="form-input"
                  style={{ resize: "vertical" }}
                  value={formCampaign.description}
                  onChange={(e) => setFormCampaign({ ...formCampaign, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Target Amount (INR)</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  value={formCampaign.targetAmount}
                  onChange={(e) => setFormCampaign({ ...formCampaign, targetAmount: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image Cover URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (optional)"
                  className="form-input"
                  value={formCampaign.imageUrl}
                  onChange={(e) => setFormCampaign({ ...formCampaign, imageUrl: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "14px" }} disabled={formLoading}>
                {formLoading ? "Saving Campaign details..." : isEditing ? "Save Changes" : "Create Campaign"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Campaign Lists & Recent Donations */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "30px", marginBottom: "40px" }}>
        
        {/* Campaign Management list */}
        <section className="glass-panel" style={{ padding: "30px" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", color: "white", marginBottom: "20px" }}>Manage Campaigns</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {campaigns.map((c) => (
              <div key={c.id} style={campaignItemStyle}>
                <div>
                  <h4 style={{ color: "white", fontSize: "0.95rem" }}>{c.title}</h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    Target: ₹{c.targetAmount?.toLocaleString()} | Raised: ₹{c.raisedAmount?.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleEditClick(c)} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteCampaign(c.id)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "0.75rem" }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Transactions List */}
        <section className="glass-panel" style={{ padding: "30px", overflowX: "auto" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", color: "white", marginBottom: "20px" }}>Recent Transactions</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "400px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                <th style={thStyle}>Donor</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentTransactions?.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>{t.donorName}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{t.donorEmail}</div>
                  </td>
                  <td style={tdStyle}>₹{t.amount?.toLocaleString()}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      background: t.status === "SUCCESS" ? "rgba(16,185,129,0.1)" : t.status === "PENDING" ? "rgba(245,158,11,0.1)" : "rgba(244,63,94,0.1)",
                      border: "1px solid",
                      borderColor: t.status === "SUCCESS" ? "var(--accent-green)" : t.status === "PENDING" ? "#f59e0b" : "var(--accent-rose)",
                      color: t.status === "SUCCESS" ? "var(--accent-green)" : t.status === "PENDING" ? "#f59e0b" : "var(--accent-rose)",
                    }}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>
    </div>
  );
}

// Styling definitions
const statCardStyle = {
  padding: "24px 30px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start"
};

const statLabelStyle = {
  fontSize: "0.8rem",
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const statNumberStyle = {
  fontSize: "2.2rem",
  fontFamily: "var(--font-heading)",
  fontWeight: "800",
  marginTop: "6px"
};

const campaignItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px",
  background: "rgba(255,255,255,0.02)",
  borderRadius: "10px",
  border: "1px solid var(--border-color)"
};

const thStyle = {
  padding: "10px",
  color: "var(--text-secondary)",
  fontSize: "0.75rem",
  textTransform: "uppercase"
};

const tdStyle = {
  padding: "12px 10px",
  fontSize: "0.85rem",
  color: "var(--text-primary)"
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(3, 7, 18, 0.8)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px"
};

const modalStyle = {
  width: "100%",
  maxWidth: "500px",
  padding: "32px",
  background: "var(--bg-secondary)",
  borderRadius: "16px",
  border: "1px solid var(--border-color)",
  boxShadow: "var(--shadow-lg)"
};

const closeBtnStyle = {
  background: "none",
  border: "none",
  color: "var(--text-secondary)",
  fontSize: "1.8rem",
  cursor: "pointer",
  lineHeight: "1"
};
