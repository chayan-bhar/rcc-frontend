import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Login is handled entirely by Auth0 Universal Login.
 * This page immediately triggers the login redirect.
 */
export default function Login() {
  const { login } = useAuth();

  useEffect(() => {
    login();
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
      Redirecting to login…
    </div>
  );
}
