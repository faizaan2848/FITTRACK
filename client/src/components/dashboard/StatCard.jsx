// A single metric tile (e.g. "Daily Calories: 1,840 / 2,200").
// Used across the dashboard grid for every simple numeric stat.
// Can render its progress as a linear bar (default) or a circular ring
// (ringColor set) - the ring variant echoes the landing page's activity
// rings, so key daily stats feel visually connected to the brand moment.

import CountUp from "../common/CountUp";
import ProgressRing from "../common/ProgressRing";
import styles from "./dashboard.module.css";

function StatCard({ icon, label, value, unit, sublabel, progressPct, decimals = 0, ringColor, delay = 0 }) {
  const numericValue = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  const isNumeric = Number.isFinite(numericValue) && value !== "" && value !== "-";

  return (
    <div className={`${styles.statCard} fadeIn`} style={{ animationDelay: `${delay}ms` }}>
      <div className={styles.statCardTop}>
        <div>
          <div className={styles.statLabel}>
            {icon && <span className={styles.statIcon}>{icon}</span>}
            {label}
          </div>
          <div className={styles.statValue}>
            {isNumeric ? <CountUp value={numericValue} decimals={decimals} /> : value}
            {unit && <span className={styles.statUnit}>{unit}</span>}
          </div>
        </div>
        {ringColor && typeof progressPct === "number" && (
          <ProgressRing percent={progressPct} size={52} strokeWidth={6} color={ringColor} />
        )}
      </div>
      {sublabel && <div className={styles.statSublabel}>{sublabel}</div>}
      {!ringColor && typeof progressPct === "number" && (
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.min(progressPct, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default StatCard;
