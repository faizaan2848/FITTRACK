// The landing page's signature element: three concentric activity rings,
// echoing a fitness wearable's watch face (Fitbit/Apple Watch), that
// animate in and count up on mount. Grounds the hero in the actual
// subject - fitness tracking - rather than a generic stat-card hero.

import { useEffect, useState } from "react";
import styles from "./ActivityRings.module.css";

const RINGS = [
  { key: "steps", radius: 90, color: "var(--color-primary)", targetPct: 82, label: "Steps", value: "8,214", goal: "/ 10,000" },
  { key: "calories", radius: 68, color: "var(--color-secondary)", targetPct: 64, label: "Calories", value: "1,412", goal: "/ 2,200" },
  { key: "water", radius: 46, color: "#f59e0b", targetPct: 90, label: "Water", value: "2.3", goal: "/ 2.5 L" },
];

function Ring({ radius, color, targetPct, animate, delay }) {
  const circumference = 2 * Math.PI * radius;
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const timeout = setTimeout(() => setPct(targetPct), delay);
    return () => clearTimeout(timeout);
  }, [animate, targetPct, delay]);

  const offset = circumference - (pct / 100) * circumference;

  return (
    <circle
      r={radius}
      cx="110"
      cy="110"
      fill="none"
      stroke={color}
      strokeWidth="14"
      strokeLinecap="round"
      strokeDasharray={circumference}
      strokeDashoffset={offset}
      transform="rotate(-90 110 110)"
      className={styles.ring}
    />
  );
}

function ActivityRings() {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className={styles.wrapper}>
      <svg viewBox="0 0 220 220" className={styles.svg}>
        <circle r="90" cx="110" cy="110" fill="none" stroke="var(--color-surface)" strokeWidth="14" />
        <circle r="68" cx="110" cy="110" fill="none" stroke="var(--color-surface)" strokeWidth="14" />
        <circle r="46" cx="110" cy="110" fill="none" stroke="var(--color-surface)" strokeWidth="14" />
        {RINGS.map((ring, i) => (
          <Ring key={ring.key} radius={ring.radius} color={ring.color} targetPct={ring.targetPct} animate={animate} delay={i * 200} />
        ))}
      </svg>

      <div className={styles.readouts}>
        {RINGS.map((ring) => (
          <div key={ring.key} className={styles.readout}>
            <span className={styles.dot} style={{ background: ring.color }} />
            <span className={styles.readoutLabel}>{ring.label}</span>
            <span className={styles.readoutValue}>
              {ring.value} <span className={styles.readoutGoal}>{ring.goal}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityRings;
