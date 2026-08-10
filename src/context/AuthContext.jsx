import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const {
    isLoading,
    isAuthenticated,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  // Build currentUser directly from Auth0 user object — no backend call for identity
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !auth0User) {
      setCurrentUser(null);
      setToken(null);
      return;
    }

    // Attempt to get an access token (used for authenticated backend API calls)
    getAccessTokenSilently()
      .then((t) => {
        setToken(t);
        setCurrentUser({
          uid: auth0User.sub,
          email: auth0User.email,
          name: auth0User.name || auth0User.nickname || auth0User.email,
          picture: auth0User.picture,
          // Role is resolved by the backend using the token; default to USER here
          role: "USER",
          token: t,
        });
      })
      .catch(() => {
        // No API audience configured — still set user without a bearer token
        setCurrentUser({
          uid: auth0User.sub,
          email: auth0User.email,
          name: auth0User.name || auth0User.nickname || auth0User.email,
          picture: auth0User.picture,
          role: "USER",
          token: null,
        });
      });
  }, [isLoading, isAuthenticated, auth0User]);

  /** Redirects to Auth0 Universal Login */
  const login = () => loginWithRedirect();

  /** Redirects to Auth0 Universal Login with signup screen hint */
  const signup = () =>
    loginWithRedirect({ authorizationParams: { screen_hint: "signup" } });

  /** Logs out and returns to app origin */
  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  const value = {
    currentUser,
    token,
    loading: isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
