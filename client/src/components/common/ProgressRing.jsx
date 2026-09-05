// A single animated circular progress ring - the same stroke-dasharray
// technique as the landing page's ActivityRings, extracted so any stat
// card can use one ring instead of a flat progress bar. This ties the
// dashboard's visual language back to the landing page on purpose.

import { useEffect, useState } from "react";
import styles from "./ProgressRing.module.css";

function ProgressRing({ percent = 0, size = 64, strokeWidth = 7, color = "var(--color-primary)" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedPct, setAnimatedPct] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedPct(Math.min(percent, 100)), 100);
    return () => clearTimeout(timeout);
  }, [percent]);

  const offset = circumference - (animatedPct / 100) * circumference;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={styles.ring}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className={styles.animatedStroke}
      />
    </svg>
  );
}

export default ProgressRing;
