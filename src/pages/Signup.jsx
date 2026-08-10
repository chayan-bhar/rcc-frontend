import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Signup is handled entirely by Auth0 Universal Login.
 * This page immediately triggers the signup redirect.
 */
export default function Signup() {
  const { signup } = useAuth();

  useEffect(() => {
    signup();
  }, []);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "70vh",
      color: "var(--text-secondary)",
      fontSize: "0.95rem"
    }}>
      Redirecting to sign up…
    </div>
  );
}
