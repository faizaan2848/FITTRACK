// Global auth state: current user, loading/init status, and the
// login/register/logout actions every page needs. The access token
// itself lives in services/tokenStore.js, not here - this context only
// tracks the user object and status flags components render against.

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  refreshRequest,
  getMeRequest,
} from "../services/authService";
import { setAccessToken, clearAccessToken } from "../services/tokenStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // isInitializing: true while we attempt a silent refresh on first load,
  // so routes don't flash a "logged out" state before we actually know.
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function tryRestoreSession() {
      try {
        const { accessToken, user } = await refreshRequest();
        setAccessToken(accessToken);
        setUser(user);
      } catch {
        // No valid refresh cookie - user simply isn't logged in.
        clearAccessToken();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    }
    tryRestoreSession();
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const { accessToken, user } = await loginRequest({ email, password });
      setAccessToken(accessToken);
      setUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.error?.message || "Unable to log in";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setError(null);
    try {
      const { accessToken, user } = await registerRequest({ name, email, password });
      setAccessToken(accessToken);
      setUser(user);
      return user;
    } catch (err) {
      const message = err.response?.data?.error?.message || "Unable to create account";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const { user } = await getMeRequest();
    setUser(user);
    return user;
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    error,
    login,
    register,
    logout,
    refreshCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
