import { useEffect, useState } from "react";
import { getExercisesRequest, toggleFavoriteRequest } from "../../services/exerciseService";
import styles from "./workouts.module.css";

const CATEGORIES = ["ALL", "CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "CORE", "CARDIO"];

function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [category, setCategory] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const data = await getExercisesRequest(category === "ALL" ? undefined : category);
        if (!cancelled) setExercises(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error?.message || "Unable to load exercises");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [category]);

  async function handleToggleFavorite(exerciseId) {
    // Optimistic update so the star responds instantly.
    setExercises((prev) =>
      prev.map((e) => (e.id === exerciseId ? { ...e, isFavorite: !e.isFavorite } : e))
    );
    try {
      await toggleFavoriteRequest(exerciseId);
    } catch {
      // Roll back on failure.
      setExercises((prev) =>
        prev.map((e) => (e.id === exerciseId ? { ...e, isFavorite: !e.isFavorite } : e))
      );
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Exercise Library</h1>
      </div>

      <div className={styles.tabs}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={c === category ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setCategory(c)}
          >
            {c === "ALL" ? "All" : c.charAt(0) + c.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {isLoading ? (
        <div className={styles.emptyState}>Loading exercises...</div>
      ) : exercises.length === 0 ? (
        <div className={styles.emptyState}>No exercises found in this category.</div>
      ) : (
        <div className={styles.grid}>
          {exercises.map((ex, i) => {
            const steps = Array.isArray(ex.steps) ? ex.steps : [];
            const formTips = Array.isArray(ex.formTips) ? ex.formTips : [];
            const hasGuide = steps.length > 0 || formTips.length > 0;
            const isExpanded = expandedId === ex.id;
            return (
            <div key={ex.id} className={`${styles.card} fadeIn`} style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.cardTitle}>{ex.name}</div>
                  <div className={styles.categoryBadge}>{ex.category}</div>
                </div>
                <button
                  className={styles.favBtn}
                  onClick={() => handleToggleFavorite(ex.id)}
                  aria-label={ex.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  title={ex.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {ex.isFavorite ? "⭐" : "☆"}
                </button>
              </div>
              {ex.description && <div className={styles.cardMeta}>{ex.description}</div>}
              {ex.targetMuscles && (
                <div className={styles.musclesLine}>
                  <span className={styles.musclesLabel}>Trains:</span> {ex.targetMuscles}
                </div>
              )}
              {hasGuide && (
                <>
                  <button
                    className={styles.guideToggle}
                    onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded ? "Hide guide ▲" : "View guide: steps + form ▼"}
                  </button>
                  {isExpanded && (
                    <div className={styles.guideBody}>
                      {steps.length > 0 && (
                        <div className={styles.guideSection}>
                          <div className={styles.guideHeading}>How to perform</div>
                          <ol className={styles.stepsList}>
                            {steps.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {formTips.length > 0 && (
                        <div className={styles.guideSection}>
                          <div className={styles.guideHeading}>Correct form / posture</div>
                          <ul className={styles.formList}>
                            {formTips.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ExerciseLibrary;
