// Donut chart of macro percentages - same technique as the dashboard's
// ActivityRings (stroke-dasharray trick on an SVG circle), just multiple
// segments around one ring instead of concentric rings.

import styles from "./MacroPlate.module.css";

const MACRO_COLORS = {
  carbs_pct: "var(--color-primary)",
  protein_pct: "var(--color-secondary)",
  fat_pct: "#f59e0b",
  fiber_pct: "#22c55e",
  sugar_pct: "#a855f7",
};

const MACRO_LABELS = {
  carbs_pct: "Carbs",
  protein_pct: "Protein",
  fat_pct: "Fat",
  fiber_pct: "Fiber",
  sugar_pct: "Sugar",
};

function MacroPlate({ macros }) {
  const entries = Object.entries(macros).filter(([, v]) => v > 0);
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 180 180" className={styles.svg}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--color-surface)" strokeWidth="20" />
        {entries.map(([key, value]) => {
          const fraction = value / total;
          const dash = fraction * circumference;
          const gap = circumference - dash;
          const circle = (
            <circle
              key={key}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={MACRO_COLORS[key]}
              strokeWidth="20"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offsetAcc}
              transform="rotate(-90 90 90)"
            />
          );
          offsetAcc += dash;
          return circle;
        })}
      </svg>
      <ul className={styles.legend}>
        {entries.map(([key, value]) => (
          <li key={key}>
            <span className={styles.swatch} style={{ background: MACRO_COLORS[key] }} />
            {MACRO_LABELS[key]} — {Math.round(value)}%
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MacroPlate;
