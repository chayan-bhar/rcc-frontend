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
    getIdTokenClaims,
  } = useAuth0();

  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !auth0User) {
      setCurrentUser(null);
      setToken(null);
      return;
    }

    const fetchToken = async () => {
      try {
        const claims = await getIdTokenClaims();
        if (claims && claims.__raw) {
          return claims.__raw;
        }
      } catch (e) {
        console.warn("getIdTokenClaims error:", e);
      }

      try {
        return await getAccessTokenSilently();
      } catch (e) {
        console.warn("getAccessTokenSilently error:", e);
        return null;
      }
    };

    fetchToken().then((t) => {
      setToken(t);
      setCurrentUser({
        uid: auth0User.sub,
        email: auth0User.email,
        name: auth0User.name || auth0User.nickname || auth0User.email,
        picture: auth0User.picture,
        role: "USER",
        token: t,
      });
    });
  }, [isLoading, isAuthenticated, auth0User, getIdTokenClaims, getAccessTokenSilently]);

  /** Updates local currentUser profile state */
  const updateUserProfile = (updatedData) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updatedData } : prev));
  };

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
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
