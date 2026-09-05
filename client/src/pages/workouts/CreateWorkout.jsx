import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getExercisesRequest } from "../../services/exerciseService";
import { createWorkoutRequest } from "../../services/workoutService";
import styles from "./workouts.module.css";

function emptyRow() {
  return { exerciseId: "", sets: 3, reps: 10, weight: "", restSeconds: 60 };
}

function CreateWorkout() {
  const navigate = useNavigate();
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState([emptyRow()]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getExercisesRequest().then(setExerciseOptions).catch(() => {});
  }, []);

  function updateRow(index, field, value) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Workout name is required");
      return;
    }
    const validRows = rows.filter((r) => r.exerciseId);
    if (validRows.length === 0) {
      setError("Add at least one exercise");
      return;
    }

    setIsSubmitting(true);
    try {
      await createWorkoutRequest({
        name,
        description,
        isTemplate: true,
        exercises: validRows.map((r) => ({
          exerciseId: r.exerciseId,
          sets: Number(r.sets),
          reps: Number(r.reps),
          weight: r.weight ? Number(r.weight) : null,
          restSeconds: r.restSeconds ? Number(r.restSeconds) : null,
        })),
      });
      navigate("/workouts");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Unable to create workout");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>New Workout</h1>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <label className={styles.label} htmlFor="name">Workout name</label>
          <input
            id="name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Push Day"
          />
        </div>

        <div className={styles.formRow}>
          <label className={styles.label} htmlFor="description">Description (optional)</label>
          <input
            id="description"
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Chest, shoulders, triceps"
          />
        </div>

        <label className={styles.label}>Exercises</label>
        {rows.map((row, i) => (
          <div className={styles.exerciseRow} key={i}>
            <select
              className={styles.select}
              value={row.exerciseId}
              onChange={(e) => updateRow(i, "exerciseId", e.target.value)}
            >
              <option value="">Select exercise...</option>
              {exerciseOptions.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.category})
                </option>
              ))}
            </select>
            <input
              className={styles.smallInput}
              type="number"
              min="1"
              placeholder="Sets"
              value={row.sets}
              onChange={(e) => updateRow(i, "sets", e.target.value)}
            />
            <input
              className={styles.smallInput}
              type="number"
              min="1"
              placeholder="Reps"
              value={row.reps}
              onChange={(e) => updateRow(i, "reps", e.target.value)}
            />
            <input
              className={styles.smallInput}
              type="number"
              min="0"
              placeholder="Weight (kg)"
              value={row.weight}
              onChange={(e) => updateRow(i, "weight", e.target.value)}
            />
            <button type="button" className={styles.removeRowBtn} onClick={() => removeRow(i)} aria-label="Remove exercise">
              ✕
            </button>
          </div>
        ))}

        <div className={styles.addExerciseBar}>
          <button type="button" className={styles.secondaryBtn} onClick={addRow}>
            + Add exercise
          </button>
        </div>

        <button className={styles.primaryBtn} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Workout"}
        </button>
      </form>
    </div>
  );
}

export default CreateWorkout;
