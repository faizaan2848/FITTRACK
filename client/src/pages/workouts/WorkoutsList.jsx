import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getWorkoutsRequest,
  deleteWorkoutRequest,
  logWorkoutRequest,
} from "../../services/workoutService";
import styles from "./workouts.module.css";

function WorkoutsList() {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  async function loadWorkouts() {
    setIsLoading(true);
    try {
      const data = await getWorkoutsRequest();
      setWorkouts(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Unable to load workouts");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this workout? This can't be undone.")) return;
    await deleteWorkoutRequest(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }

  async function handleLogCompleted(workout) {
    setActionMessage(null);
    try {
      await logWorkoutRequest(workout.id, { durationMinutes: null, caloriesBurned: null });
      setActionMessage(`Logged "${workout.name}" as completed today.`);
    } catch (err) {
      setActionMessage(err.response?.data?.error?.message || "Unable to log workout");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Your Workouts</h1>
        <Link to="/workouts/new" className={styles.primaryBtn}>
          + New Workout
        </Link>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {actionMessage && <div className={styles.errorBanner} style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#15803d" }}>{actionMessage}</div>}

      {isLoading ? (
        <div className={styles.emptyState}>Loading workouts...</div>
      ) : workouts.length === 0 ? (
        <div className={styles.emptyState}>
          You haven't created a workout yet. <Link to="/workouts/new">Create your first one</Link>.
        </div>
      ) : (
        <div className={styles.grid}>
          {workouts.map((w, i) => (
            <div key={w.id} className={`${styles.card} fadeIn`} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <div className={styles.cardTitle}>{w.name}</div>
              {w.description && <div className={styles.cardMeta}>{w.description}</div>}
              <div className={styles.cardMeta}>{w.exercises.length} exercise{w.exercises.length !== 1 ? "s" : ""}</div>
              <div className={styles.cardActions}>
                <button className={styles.primaryBtn} onClick={() => handleLogCompleted(w)}>
                  Log as done
                </button>
                <button className={styles.dangerBtn} onClick={() => handleDelete(w.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WorkoutsList;
