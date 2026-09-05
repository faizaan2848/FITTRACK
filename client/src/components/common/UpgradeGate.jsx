// Shown instead of a page's real content when the user's plan doesn't
// unlock it. This is UX only - the actual security check already
// happened server-side (requirePlan middleware rejects the API call
// regardless of what the client shows). This just avoids letting a
// FREE user click into a feature and get a confusing error.

import { Link } from "react-router-dom";

function UpgradeGate({ featureName, requiredPlan = "PRO" }) {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: "80px auto",
        textAlign: "center",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-6)",
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>🔒</div>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", marginBottom: "var(--space-2)" }}>
        {featureName} is a {requiredPlan} feature
      </h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem", marginBottom: "var(--space-4)" }}>
        Upgrade your plan to unlock {featureName.toLowerCase()} and more.
      </p>
      <Link
        to="/membership"
        style={{
          display: "inline-block",
          background: "var(--color-primary)",
          color: "#061021",
          borderRadius: "var(--radius-sm)",
          padding: "11px 24px",
          fontWeight: 700,
          textDecoration: "none",
          fontSize: "0.9375rem",
        }}
      >
        View Plans
      </Link>
    </div>
  );
}

export default UpgradeGate;
