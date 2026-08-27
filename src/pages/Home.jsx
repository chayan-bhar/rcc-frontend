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

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="container" style={{ marginTop: "40px", animation: "fadeInUp 0.6s ease" }}>
      
      {/* Hero Banner (Static Content) */}
      <header className="glass-panel" style={{
        padding: "60px 40px",
        textAlign: "center",
        marginBottom: "50px",
        background: "var(--gradient-card-glow)",
        border: "1px solid var(--border-color)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow Effects */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "-20%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "var(--accent-blue)",
          filter: "blur(140px)",
          opacity: 0.18,
          pointerEvents: "none"
        }}></div>

        <div style={{
          position: "absolute",
          bottom: "-50%",
          right: "-20%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "var(--accent-purple)",
          filter: "blur(140px)",
          opacity: 0.15,
          pointerEvents: "none"
        }}></div>

        {/* Verification Badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 16px",
          background: "rgba(0, 198, 255, 0.1)",
          border: "1px solid rgba(0, 198, 255, 0.3)",
          borderRadius: "20px",
          fontSize: "0.85rem",
          fontWeight: "600",
          color: "var(--accent-blue)",
          marginBottom: "20px"
        }}>
          <span>✨</span> 100% Tax Exempted & Verified NGO (Section 80G Certified)
        </div>

        <h1 style={{ 
          fontFamily: "var(--font-heading)", 
          fontSize: "3.4rem", 
          marginBottom: "18px", 
          lineHeight: "1.15",
          fontWeight: "800",
          color: "white"
        }}>
          Empower Hope. <span style={{
            background: "var(--gradient-blue)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>Transform Communities.</span>
        </h1>
        
        <p style={{ 
          fontSize: "1.15rem", 
          color: "var(--text-secondary)", 
          maxWidth: "680px", 
          margin: "0 auto 32px auto",
          lineHeight: "1.6"
        }}>
          Join thousands of compassionate donors providing warm meals, clean drinking water, quality education, and life-saving healthcare to underprivileged communities across India.
        </p>

        {/* Action CTA Buttons */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
          <button 
            onClick={() => scrollToSection("causes")} 
            className="btn btn-primary"
            style={{ padding: "14px 32px", fontSize: "1rem" }}
          >
            Explore Active Causes ↓
          </button>
          <button 
            onClick={() => scrollToSection("mission")} 
            className="btn btn-secondary"
            style={{ padding: "14px 28px", fontSize: "1rem" }}
          >
            Our Mission & Impact
          </button>
        </div>

        {/* Quick Impact Metrics Counters */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}>
          <div style={statBoxStyle}>
            <div style={statValStyle}>₹5.2M+</div>
            <div style={statLblStyle}>Funds Raised</div>
          </div>
          <div style={statBoxStyle}>
            <div style={statValStyle}>14,500+</div>
            <div style={statLblStyle}>Lives Impacted</div>
          </div>
          <div style={statBoxStyle}>
            <div style={statValStyle}>100%</div>
            <div style={statLblStyle}>80G Tax Deductible</div>
          </div>
          <div style={statBoxStyle}>
            <div style={statValStyle}>5,200+</div>
            <div style={statLblStyle}>Verified Donors</div>
          </div>
        </div>
      </header>

      {/* Static Section: Our Pillars of Impact */}
      <section id="mission" style={{ marginBottom: "60px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", color: "white", marginBottom: "8px" }}>
            Our Pillars of Impact
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
            Four core initiatives creating sustainable change in underserved communities
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "24px"
        }}>
          {pillarsData.map((pillar, idx) => (
            <div key={idx} className="glass-panel" style={{
              padding: "28px",
              transition: "var(--transition-normal)",
              borderRadius: "16px",
              border: "1px solid var(--border-color)"
            }}>
              <div style={{
                fontSize: "2.5rem",
                marginBottom: "16px",
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--border-color)"
              }}>
                {pillar.icon}
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "white", marginBottom: "10px" }}>
                {pillar.title}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: "1.5" }}>
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Transparency Guarantee Bar */}
      <section style={{
        marginBottom: "60px",
        padding: "30px 40px",
        borderRadius: "16px",
        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.02) 100%)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "2rem" }}>🔒</span>
          <div>
            <h4 style={{ color: "white", fontSize: "1rem" }}>100% Direct Impact</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>0% hidden fees — funds reach verified causes directly</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "2rem" }}>📄</span>
          <div>
            <h4 style={{ color: "white", fontSize: "1rem" }}>Instant PDF Tax Receipts</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Section 80G compliant tax exemption certificate</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "2rem" }}>🛡️</span>
          <div>
            <h4 style={{ color: "white", fontSize: "1rem" }}>Razorpay Secure Checkout</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>256-Bit SSL encrypted payments via UPI & Cards</p>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <main id="causes" style={{ scrollMarginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2.2rem", color: "white" }}>Active Campaigns</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>Choose a cause that speaks to your heart and donate</p>
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
            <h4 style={{ color: "var(--accent-rose)", marginBottom: "8px" }}>Network connection issue</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{error}</p>
            <button onClick={fetchCampaigns} className="btn btn-secondary" style={{ marginTop: "16px" }}>
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Skeleton State */}
        {loading ? (
          <div>
            <div style={{ textAlign: "center", marginBottom: "20px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Loading active campaigns from backend...
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "30px"
            }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-panel" style={{ padding: "20px", height: "420px", borderRadius: "16px" }}>
                  <div className="skeleton" style={{ height: "200px", width: "100%", borderRadius: "12px", marginBottom: "16px" }}></div>
                  <div className="skeleton" style={{ height: "24px", width: "70%", marginBottom: "12px" }}></div>
                  <div className="skeleton" style={{ height: "16px", width: "95%", marginBottom: "8px" }}></div>
                  <div className="skeleton" style={{ height: "16px", width: "80%", marginBottom: "24px" }}></div>
                  <div className="skeleton" style={{ height: "12px", width: "100%", marginBottom: "12px" }}></div>
                  <div className="skeleton" style={{ height: "42px", width: "100%", borderRadius: "10px" }}></div>
                </div>
              ))}
            </div>
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

const pillarsData = [
  {
    icon: "🍲",
    title: "Zero Hunger Initiative",
    description: "Distributing warm, nutritious meals and monthly grocery ration kits to underprivileged children and families."
  },
  {
    icon: "💧",
    title: "Clean Water Access",
    description: "Drilling community tube-wells and setting up water purification plants in dryland villages to end waterborne diseases."
  },
  {
    icon: "📚",
    title: "Quality Education",
    description: "Funding school tuition fees, textbooks, uniforms, and computer literacy labs for orphan children and rural girls."
  },
  {
    icon: "🏥",
    title: "Emergency Healthcare",
    description: "Deploying mobile medical checkup vans, organizing blood donation drives, and funding critical surgery support."
  }
];

const statBoxStyle = {
  background: "rgba(255, 255, 255, 0.02)",
  padding: "18px 24px",
  borderRadius: "12px",
  border: "1px solid var(--border-color)",
  textAlign: "center"
};

const statValStyle = {
  fontFamily: "var(--font-heading)",
  fontSize: "1.9rem",
  fontWeight: "800",
  color: "white"
};

const statLblStyle = {
  fontSize: "0.78rem",
  color: "var(--text-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginTop: "4px"
};
