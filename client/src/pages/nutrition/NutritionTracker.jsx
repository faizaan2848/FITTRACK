import { useEffect, useState, useCallback } from "react";
import {
  getDayNutritionRequest,
  addMealRequest,
  deleteMealRequest,
  addWaterRequest,
} from "../../services/nutritionService";
import MealSection from "../../components/nutrition/MealSection";
import styles from "./nutrition.module.css";

const WATER_GOAL_ML = 2500;
const QUICK_WATER_AMOUNTS = [250, 500, 750];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function NutritionTracker() {
  const [date, setDate] = useState(todayStr());
  const [day, setDay] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDay = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDayNutritionRequest(date);
      setDay(data);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Unable to load nutrition data");
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadDay();
  }, [loadDay]);

  async function handleAddMeal(mealType, form) {
    await addMealRequest({
      mealType,
      name: form.name,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      fiber: Number(form.fiber) || 0,
      loggedAt: date,
    });
    loadDay();
  }

  async function handleRemoveMeal(mealId) {
    await deleteMealRequest(mealId);
    loadDay();
  }

  async function handleAddWater(amountMl) {
    await addWaterRequest(amountMl);
    loadDay();
  }

  if (isLoading || !day) {
    return (
      <div className={styles.page}>
        {error ? <div className={styles.errorBanner}>{error}</div> : "Loading..."}
      </div>
    );
  }

  const waterPct = Math.min((day.waterMl / WATER_GOAL_ML) * 100, 100);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Nutrition</h1>
        <input
          type="date"
          className={styles.dateInput}
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Calories</div>
          <div className={styles.summaryValue}>{day.totals.calories}</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Protein</div>
          <div className={styles.summaryValue}>{day.totals.protein}<span className={styles.summaryUnit}>g</span></div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Carbs</div>
          <div className={styles.summaryValue}>{day.totals.carbs}<span className={styles.summaryUnit}>g</span></div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Fat</div>
          <div className={styles.summaryValue}>{day.totals.fat}<span className={styles.summaryUnit}>g</span></div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Fiber</div>
          <div className={styles.summaryValue}>{day.totals.fiber}<span className={styles.summaryUnit}>g</span></div>
        </div>
      </div>

      <div className={styles.waterCard}>
        <div className={styles.waterHeader}>
          <div className={styles.waterTitle}>Water Intake</div>
          <div className={styles.waterAmount}>{(day.waterMl / 1000).toFixed(2)} / {(WATER_GOAL_ML / 1000).toFixed(1)} L</div>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${waterPct}%` }} />
        </div>
        <div className={styles.waterButtons}>
          {QUICK_WATER_AMOUNTS.map((amt) => (
            <button key={amt} className={styles.waterBtn} onClick={() => handleAddWater(amt)}>
              + {amt} ml
            </button>
          ))}
        </div>
      </div>

      {["BREAKFAST", "LUNCH", "DINNER", "SNACK"].map((mealType) => (
        <MealSection
          key={mealType}
          mealType={mealType}
          meals={day.mealsByType[mealType]}
          onAdd={handleAddMeal}
          onRemove={handleRemoveMeal}
        />
      ))}
    </div>
  );
}

export default NutritionTracker;
