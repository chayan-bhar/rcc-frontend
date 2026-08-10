import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import CampaignCard from "../components/CampaignCard";
import DonationModal from "../components/DonationModal";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/campaigns`);
      if (!response.ok) throw new Error("Failed to load campaigns.");
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to backend server. Make sure the Spring Boot service is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDonateClick = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleAdminEdit = () => {
    navigate("/admin");
  };

  const handleAdminDelete = async (id) => {
    if (!currentUser || currentUser.role !== "ADMIN") return;
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${currentUser.token}`
        }
      });
      if (response.ok) {
        fetchCampaigns();
      } else {
        alert("Delete failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting campaign.");
    }
  };

  return (
    <div className="container" style={{ marginTop: "40px", animation: "fadeInUp 0.6s ease" }}>
      
      {/* Hero Section */}
      <header className="glass-panel" style={{
        padding: "60px 40px",
        textAlign: "center",
        marginBottom: "60px",
        background: "var(--gradient-card-glow)",
        border: "1px solid var(--border-color)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-20%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "var(--accent-blue)",
          filter: "blur(120px)",
          opacity: 0.15,
          zIndex: 0
        }}></div>

        <h1 style={{ 
          fontFamily: "var(--font-heading)", 
          fontSize: "3.2rem", 
          marginBottom: "16px", 
          lineHeight: "1.1",
          fontWeight: "800",
          zIndex: 1,
          position: "relative"
        }}>
          Small Acts, <span style={{
            background: "var(--gradient-blue)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Big Impacts</span>
        </h1>
        
        <p style={{ 
          fontSize: "1.2rem", 
          color: "var(--text-secondary)", 
          maxWidth: "600px", 
          margin: "0 auto 30px auto",
          zIndex: 1,
          position: "relative"
        }}>
          Every donation counts. Help us provide education, clean water, medical aid, and nutrition to underprivileged communities globally.
        </p>

        {/* Stats counter */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
          marginTop: "40px",
          zIndex: 1,
          position: "relative"
        }}>
          <div style={statBoxStyle}>
            <div style={statValStyle}>₹4.5M+</div>
            <div style={statLblStyle}>Funds Raised</div>
          </div>
          <div style={statBoxStyle}>
            <div style={statValStyle}>8,200+</div>
            <div style={statLblStyle}>Global Donors</div>
          </div>
          <div style={statBoxStyle}>
            <div style={statValStyle}>100%</div>
            <div style={statLblStyle}>Transparent Checkout</div>
          </div>
        </div>
      </header>

      {/* Campaigns Listing */}
      <main>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: "white" }}>Active Campaigns</h2>
            <p style={{ color: "var(--text-secondary)" }}>Choose a cause that speaks to your heart</p>
          </div>
          {currentUser && currentUser.role === "ADMIN" && (
            <button onClick={handleAdminEdit} className="btn btn-primary">
              + Manage Campaigns
            </button>
          )}
        </div>

        {error && (
          <div style={{
            padding: "20px",
            background: "rgba(244,63,94,0.05)",
            border: "1px solid var(--accent-rose)",
            borderRadius: "12px",
            color: "var(--text-primary)",
            textAlign: "center",
            marginBottom: "30px"
          }}>
            <h4 style={{ color: "var(--accent-rose)", marginBottom: "8px" }}>Network connection issues</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{error}</p>
            <button onClick={fetchCampaigns} className="btn btn-secondary" style={{ marginTop: "16px" }}>
              Retry Connection
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(255,255,255,0.1)",
              borderTopColor: "var(--accent-blue)",
              borderRadius: "50%",
              margin: "0 auto 16px auto",
              animation: "spin 1s linear infinite"
            }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
            No campaigns are active right now. Check back later!
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "30px"
          }}>
            {campaigns.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onDonate={handleDonateClick}
                onEdit={handleAdminEdit}
                onDelete={handleAdminDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Donation Checkout Modal */}
      {selectedCampaign && (
        <DonationModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onSuccess={fetchCampaigns}
        />
      )}
    </div>
  );
}

const statBoxStyle = {
  background: "rgba(255, 255, 255, 0.02)",
  padding: "16px 28px",
  borderRadius: "12px",
  border: "1px solid var(--border-color)",
  minWidth: "150px"
};

const statValStyle = {
  fontFamily: "var(--font-heading)",
  fontSize: "1.8rem",
  fontWeight: "800",
  color: "white"
};

const statLblStyle = {
  fontSize: "0.8rem",
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginTop: "4px"
};
