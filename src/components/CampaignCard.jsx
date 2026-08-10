import React from "react";
import { useAuth } from "../context/AuthContext";

export default function CampaignCard({ campaign, onDonate, onEdit, onDelete }) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser && currentUser.role === "ADMIN";

  const target = campaign.targetAmount || 0;
  const raised = campaign.raisedAmount || 0;
  const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;

  // Placeholder image fallback
  const handleImageError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop";
  };

  return (
    <div className="glass-panel" style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      transition: "var(--transition-normal)",
      position: "relative"
    }}>
      {/* Campaign Cover */}
      <div style={{ position: "relative", width: "100%", height: "200px", overflow: "hidden" }}>
        <img 
          src={campaign.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop"} 
          alt={campaign.title}
          onError={handleImageError}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "var(--transition-normal)" }}
        />
        {isAdmin && (
          <div style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            display: "flex",
            gap: "8px"
          }}>
            <button 
              onClick={() => onEdit(campaign)} 
              className="btn" 
              style={{ padding: "6px 12px", fontSize: "0.8rem", background: "rgba(0,0,0,0.6)", color: "white", backdropFilter: "blur(4px)" }}
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(campaign.id)} 
              className="btn btn-danger" 
              style={{ padding: "6px 12px", fontSize: "0.8rem" }}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Campaign Details */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "white", fontFamily: "var(--font-heading)" }}>
          {campaign.title}
        </h3>
        <p style={{ 
          fontSize: "0.9rem", 
          color: "var(--text-secondary)", 
          marginBottom: "20px",
          display: "-webkit-box",
          WebkitLineClamp: "3",
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          flexGrow: 1
        }}>
          {campaign.description}
        </p>

        {/* Progress Tracker */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px" }}>
            <span style={{ color: "var(--text-secondary)" }}>Raised: <b>₹{raised.toLocaleString()}</b></span>
            <span style={{ color: "var(--accent-blue)", fontWeight: "600" }}>{percent}%</span>
          </div>
          
          {/* Progress bar container */}
          <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ 
              width: `${percent}%`, 
              height: "100%", 
              background: "var(--gradient-blue)", 
              borderRadius: "10px",
              boxShadow: "var(--shadow-glow)",
              transition: "width 0.6s ease" 
            }}></div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginTop: "6px", color: "var(--text-muted)" }}>
            <span>Target: ₹{target.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onDonate(campaign)} 
          className="btn btn-primary" 
          style={{ width: "100%" }}
        >
          Donate Now
        </button>
      </div>
    </div>
  );
}
