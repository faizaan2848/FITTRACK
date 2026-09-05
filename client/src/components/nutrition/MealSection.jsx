import { useState } from "react";
import styles from "../../pages/nutrition/nutrition.module.css";

const MEAL_LABELS = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};

function emptyForm() {
  return { name: "", calories: "", protein: "", carbs: "", fat: "", fiber: "" };
}

function MealSection({ mealType, meals, onAdd, onRemove }) {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const sectionCalories = meals.reduce((sum, m) => sum + m.calories, 0);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.calories) return;
    await onAdd(mealType, form);
    setForm(emptyForm());
    setIsAdding(false);
  }

  return (
    <div className={styles.mealSection}>
      <div className={styles.mealSectionHeader}>
        <div className={styles.mealSectionTitle}>{MEAL_LABELS[mealType]}</div>
        <div className={styles.mealSectionCalories}>{Math.round(sectionCalories)} kcal</div>
      </div>

      {meals.length === 0 && !isAdding && (
        <div className={styles.emptyMeal}>Nothing logged yet.</div>
      )}

      {meals.map((meal) => (
        <div key={meal.id} className={styles.mealCard}>
          <div className={styles.mealInfo}>
            <div className={styles.mealName}>{meal.name}</div>
            <div className={styles.mealMacros}>
              P {Math.round(meal.protein)}g · C {Math.round(meal.carbs)}g · F {Math.round(meal.fat)}g
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className={styles.mealCalories}>{Math.round(meal.calories)} kcal</div>
            <button className={styles.removeBtn} onClick={() => onRemove(meal.id)} aria-label="Remove meal">
              ✕
            </button>
          </div>
        </div>
      ))}

      {isAdding ? (
        <form className={styles.mealForm} onSubmit={handleSubmit}>
          <input
            className={styles.formInput}
            placeholder="Meal name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            autoFocus
          />
          <input className={styles.formInput} type="number" placeholder="kcal" value={form.calories} onChange={(e) => updateField("calories", e.target.value)} />
          <input className={styles.formInput} type="number" placeholder="Protein" value={form.protein} onChange={(e) => updateField("protein", e.target.value)} />
          <input className={styles.formInput} type="number" placeholder="Carbs" value={form.carbs} onChange={(e) => updateField("carbs", e.target.value)} />
          <input className={styles.formInput} type="number" placeholder="Fat" value={form.fat} onChange={(e) => updateField("fat", e.target.value)} />
          <input className={styles.formInput} type="number" placeholder="Fiber" value={form.fiber} onChange={(e) => updateField("fiber", e.target.value)} />
          <button type="submit" className={styles.removeBtn} style={{ color: "var(--color-primary)", fontSize: "1.25rem" }} aria-label="Save meal">
            ✓
          </button>
        </form>
      ) : (
        <button className={styles.addMealBtn} onClick={() => setIsAdding(true)}>
          + Add {MEAL_LABELS[mealType].toLowerCase()} item
        </button>
      )}
    </div>
  );
}

export default MealSection;
