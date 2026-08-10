import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from "../config/api";

export default function DonationModal({ campaign, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  
  const [amount, setAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState(currentUser ? currentUser.name : "");
  const [email, setEmail] = useState(currentUser ? currentUser.email : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(null); // stores donation details

  const presets = [500, 1000, 2500, 5000];

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Load Razorpay dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const donationAmount = customAmount ? parseFloat(customAmount) : amount;
    if (isNaN(donationAmount) || donationAmount <= 0) {
      setError("Please enter a valid donation amount.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order on Backend
      const headers = { "Content-Type": "application/json" };
      if (currentUser && currentUser.token) {
        headers["Authorization"] = `Bearer ${currentUser.token}`;
      }

      const orderResponse = await fetch(`${API_BASE_URL}/api/donations/order`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          campaignId: campaign.id,
          amount: donationAmount,
          donorName: name || "Anonymous",
          donorEmail: email || ""
        })
      });

      if (!orderResponse.ok) {
        const errText = await orderResponse.text();
        throw new Error(errText || "Failed to initialize payment order.");
      }

      const orderData = await orderResponse.json();
      console.log("Order generated:", orderData);

      // 2. Initialize Payment Gateway Checkout
      // Real Razorpay Checkout flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Razorpay SDK failed to load. Are you offline?");
        setLoading(false);
        return;
      }

        const options = {
          key: "rzp_test_placeholder_key", // Will be overwritten by backend or system config
          amount: orderData.amount * 100, // paise
          currency: orderData.currency,
          name: "Hope & Care",
          description: `Donation for ${campaign.title}`,
          image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=200",
          order_id: orderData.orderId,
          handler: async function (response) {
            setLoading(true);
            try {
              // 3. Verify Payment Signature on Backend
              const verifyResponse = await fetch(`${API_BASE_URL}/api/donations/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature
                })
              });

              if (!verifyResponse.ok) {
                throw new Error("Payment signature verification failed.");
              }

              const finalDonation = await verifyResponse.json();
              setPaymentSuccess(finalDonation);
              setLoading(false);
              if (onSuccess) onSuccess();
            } catch (err) {
              setError("Signature verification failed: " + err.message);
              setLoading(false);
            }
          },
          prefill: {
            name: name,
            email: email
          },
          theme: {
            color: "#0072ff"
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();

    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div className="glass-panel" style={modalStyle}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.4rem", color: "white", fontFamily: "var(--font-heading)" }}>
            {paymentSuccess ? "Donation Complete!" : `Support: ${campaign.title}`}
          </h2>
          {!loading && (
            <button onClick={onClose} style={closeBtnStyle}>&times;</button>
          )}
        </div>

        {error && (
          <div style={{ padding: "12px", background: "rgba(244,63,94,0.1)", border: "1px solid var(--accent-rose)", borderRadius: "8px", color: "var(--accent-rose)", fontSize: "0.85rem", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {paymentSuccess ? (
          /* Success Screen */
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <span style={{ fontSize: "3.5rem", color: "var(--accent-green)" }}>✓</span>
            <h3 style={{ margin: "16px 0 8px 0", color: "white" }}>Thank you, {paymentSuccess.donorName}!</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "24px" }}>
              Your donation of <b>₹{paymentSuccess.amount}</b> was processed successfully. A tax receipt has been generated.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <a 
                href={`${API_BASE_URL}/api/donations/${paymentSuccess.id}/receipt`}
                className="btn btn-success"
                style={{ padding: "10px 20px" }}
              >
                Download PDF Receipt
              </a>
              <button onClick={onClose} className="btn btn-secondary" style={{ padding: "10px 20px" }}>
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleCheckout}>
            
            {/* Amount Selection */}
            <div className="form-group">
              <label className="form-label">Select Amount (INR)</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px" }}>
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setAmount(p); setCustomAmount(""); }}
                    style={{
                      padding: "10px",
                      background: amount === p && !customAmount ? "var(--gradient-blue)" : "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor: amount === p && !customAmount ? "transparent" : "var(--border-color)",
                      borderRadius: "8px",
                      color: "white",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "var(--transition-fast)"
                    }}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Or enter custom amount"
                className="form-input"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
              />
            </div>

            {/* Donor Info */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: "100%", padding: "14px", marginTop: "10px" }}
            >
              {loading ? "Processing Payment..." : `Donate ₹${customAmount || amount}`}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}

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
  fontSize: "2rem",
  cursor: "pointer",
  lineHeight: "1",
  padding: 0
};
