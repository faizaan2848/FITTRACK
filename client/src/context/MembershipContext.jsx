// Same shape as CartContext: one shared piece of state (current plan +
// limits + usage) that any page can read, refreshed on login and after
// an upgrade, instead of every gated page fetching it independently.

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getMembershipRequest } from "../services/membershipService";

const MembershipContext = createContext(null);

export function MembershipProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [membership, setMembership] = useState(null);

  const refreshMembership = useCallback(async () => {
    if (!isAuthenticated) {
      setMembership(null);
      return;
    }
    try {
      const data = await getMembershipRequest();
      setMembership(data);
    } catch {
      // Silently ignore - gated pages fall back to "assume FREE" below.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshMembership();
  }, [refreshMembership]);

  const plan = membership?.plan || "FREE";
  const limits = membership?.limits || { maxListings: 3, aiScanner: false, analytics: false };

  return (
    <MembershipContext.Provider
      value={{ plan, limits, usage: membership?.usage, allPlans: membership?.allPlans, refreshMembership }}
    >
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  return context;
}
