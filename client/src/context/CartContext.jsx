// Small global store for just the cart item count, so the sidebar badge
// updates live from anywhere (Marketplace, ProductDetail, Cart page)
// without every page needing to know about every other page.

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getCartRequest } from "../services/cartService";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [itemCount, setItemCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setItemCount(0);
      return;
    }
    try {
      const { items } = await getCartRequest();
      setItemCount(items.reduce((sum, i) => sum + i.quantity, 0));
    } catch {
      // Silently ignore - the badge just won't update this cycle.
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
