// Shared shell for every protected page: a left sidebar with nav links
// plus the current page's content via <Outlet />. Kept as a layout
// (rather than repeating a topbar in every page) now that there's more
// than one authenticated page to navigate between.

import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useMembership } from "../context/MembershipContext";
import NotificationBell from "../components/common/NotificationBell";
import styles from "./AppLayout.module.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/workouts", label: "Workouts", icon: "🏋️" },
  { to: "/exercises", label: "Exercise Library", icon: "📚" },
  { to: "/workouts/history", label: "History", icon: "🕓" },
  { to: "/nutrition", label: "Nutrition", icon: "🍽️" },
  { to: "/calculators", label: "Calculators", icon: "🧮" },
  { to: "/marketplace", label: "Marketplace", icon: "🛒" },
  { to: "/marketplace/sales", label: "My Sales", icon: "💰" },
  { to: "/wishlist", label: "Wishlist", icon: "❤️" },
  { to: "/nutrition-ai", label: "AI Meal Scanner", icon: "🤖" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
];

function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AppLayout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { plan } = useMembership();

  return (
    <div className={`${styles.shell} app-shell`}>
      <aside className={styles.sidebar}>
        <div className={styles.brandRow}>
          <div className={styles.brandGroup}>
            <img src="/logo.svg" alt="FitTrack logo" className={styles.brandMark} />
            <div className={styles.brand}>FitTrack</div>
          </div>
          <NotificationBell />
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            <span className={styles.navIcon}>🛍️</span>
            Cart
            {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
          </NavLink>
          <NavLink
            to="/membership"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
            }
          >
            <span className={styles.navIcon}>💎</span>
            Membership
          </NavLink>
        </nav>

        <div className={styles.footer}>
          <Link to="/profile" className={styles.userRow} style={{ textDecoration: "none" }}>
            <div className={styles.avatar}>{initials(user?.name)}</div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.planBadge}>{plan}</div>
            </div>
          </Link>
          <button className={styles.logoutBtn} onClick={logout}>
            Log out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
