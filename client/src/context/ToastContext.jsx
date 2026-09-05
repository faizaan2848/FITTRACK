// Global toast system. Call useToast().showToast("message", "success")
// from anywhere - no prop drilling needed, same idea as AuthContext.

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="fadeIn"
          style={{
            background: "var(--color-surface-raised)",
            border: `1px solid ${toast.type === "success" ? "var(--color-primary)" : toast.type === "error" ? "#f87171" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            padding: "12px 18px",
            fontSize: "0.875rem",
            color: "var(--color-text)",
            boxShadow: "var(--shadow-md)",
            minWidth: 220,
            maxWidth: 340,
          }}
        >
          {toast.type === "success" && "✅ "}
          {toast.type === "error" && "⚠️ "}
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
