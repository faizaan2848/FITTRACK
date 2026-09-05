import { useEffect, useState } from "react";
import { getWorkoutHistoryRequest } from "../../services/workoutService";
import styles from "./workouts.module.css";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function WorkoutHistory() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getWorkoutHistoryRequest()
      .then(setLogs)
      .catch((err) => setError(err.response?.data?.error?.message || "Unable to load history"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Workout History</h1>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {isLoading ? (
        <div className={styles.emptyState}>Loading history...</div>
      ) : logs.length === 0 ? (
        <div className={styles.emptyState}>No workouts logged yet.</div>
      ) : (
        <div>
          <div className={`${styles.historyRow} ${styles.historyHeaderRow}`}>
            <div>Date</div>
            <div>Workout</div>
            <div>Duration</div>
            <div>Calories Burned</div>
          </div>
          {logs.map((log) => (
            <div className={styles.historyRow} key={log.id}>
              <div>{formatDate(log.completedAt)}</div>
              <div>{log.workout?.name || "Freeform session"}</div>
              <div>{log.durationMinutes ? `${log.durationMinutes} min` : "—"}</div>
              <div>{log.caloriesBurned ? `${log.caloriesBurned} kcal` : "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkoutHistory;
