import styles from "./GymLoader.module.css";

function GymLoader({ label = "Loading..." }) {
  return (
    <div className={styles.loader} role="status" aria-live="polite" aria-label={label}>
      <div className={styles.lifter} aria-hidden="true">
        🏋️
      </div>
      <div className={styles.bar} aria-hidden="true">
        <div className={styles.fill} />
      </div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export default GymLoader;
