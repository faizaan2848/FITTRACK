import { useMembership } from "../../context/MembershipContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { upgradePlanRequest } from "../../services/membershipService";
import styles from "./membership.module.css";

const PLAN_DISPLAY = {
  FREE: {
    price: "₹0",
    features: ["Full workout & nutrition tracking", "Calculators & marketplace browsing", "Up to 3 marketplace listings"],
  },
  PRO: {
    price: "₹399",
    features: ["Everything in Free", "AI Meal Scanner (photo → calories)", "Progress Analytics dashboard", "Up to 20 marketplace listings"],
  },
  PREMIUM: {
    price: "₹799",
    features: ["Everything in Pro", "Unlimited marketplace listings", "Priority support"],
  },
};

function Membership() {
  const { plan, usage, allPlans, refreshMembership } = useMembership();
  const { refreshCurrentUser } = useAuth();
  const { showToast } = useToast();

  async function handleUpgrade(newPlan) {
    try {
      await upgradePlanRequest(newPlan);
      await refreshMembership();
      await refreshCurrentUser();
      showToast(`You're now on the ${newPlan} plan!`, "success");
    } catch (err) {
      showToast(err.response?.data?.error?.message || "Unable to change plan", "error");
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Membership</h1>
      <p className={styles.pageSubtitle}>
        Note: this is a demo upgrade flow — no real payment is charged yet. Real billing gets
        wired in later.
      </p>

      <div className={styles.grid}>
        {(allPlans || []).map(({ key }) => {
          const isCurrent = key === plan;
          const display = PLAN_DISPLAY[key];
          return (
            <div key={key} className={isCurrent ? `${styles.planCard} ${styles.planCardCurrent}` : styles.planCard}>
              {isCurrent && <span className={styles.currentBadge}>Current Plan</span>}
              <div className={styles.planName}>{key}</div>
              <div className={styles.planPrice}>
                {display.price}
                {key !== "FREE" && <span className={styles.planPriceUnit}> /mo</span>}
              </div>
              <ul className={styles.featureList}>
                {display.features.map((f) => (
                  <li key={f}>
                    <span className={styles.featureCheck}>✓</span> {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <button className={styles.currentBtn} disabled>Current Plan</button>
              ) : (
                <button className={styles.upgradeBtn} onClick={() => handleUpgrade(key)}>
                  Switch to {key}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {usage && (
        <div className={styles.usageNote}>
          You've used <strong style={{ color: "var(--color-text)" }}>{usage.listingCount}</strong> marketplace listing
          {usage.listingCount === 1 ? "" : "s"} on your current plan.
        </div>
      )}
    </div>
  );
}

export default Membership;
