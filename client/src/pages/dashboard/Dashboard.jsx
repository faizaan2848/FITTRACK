import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardSummaryRequest } from "../../services/dashboardService";
import StatCard from "../../components/dashboard/StatCard";
import WeeklyCaloriesChart from "../../components/dashboard/WeeklyCaloriesChart";
import WeightTrendChart from "../../components/dashboard/WeightTrendChart";
import NutritionSummaryChart from "../../components/dashboard/NutritionSummaryChart";
import AchievementsWidget from "../../components/dashboard/AchievementsWidget";
import styles from "../../components/dashboard/dashboard.module.css";

function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getDashboardSummaryRequest();
        if (!cancelled) setSummary(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error?.message || "Unable to load dashboard data");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingState}>{error}</div>
      </div>
    );
  }

  const { today, weekly } = summary;

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.greeting}>Welcome back, {user?.name}</div>
      </header>

      <main className={styles.content}>
        <h2 className={styles.sectionTitle}>Today</h2>
        <div className={styles.statGrid}>
          <StatCard
            icon="🔥"
            label="Daily Calories"
            value={today.calories.consumed.toLocaleString()}
            sublabel={`Goal: ${today.calories.goal.toLocaleString()} kcal`}
            progressPct={(today.calories.consumed / today.calories.goal) * 100}
            ringColor="var(--color-primary)"
            delay={0}
          />
          <StatCard
            icon="💧"
            label="Water Intake"
            value={(today.water.ml / 1000).toFixed(1)}
            unit="L"
            sublabel={`Goal: ${(today.water.goalMl / 1000).toFixed(1)} L`}
            progressPct={(today.water.ml / today.water.goalMl) * 100}
            ringColor="var(--color-secondary)"
            delay={80}
          />
          <StatCard
            icon="👣"
            label="Step Count"
            value={today.steps.count.toLocaleString()}
            sublabel={`Goal: ${today.steps.goal.toLocaleString()}`}
            progressPct={(today.steps.count / today.steps.goal) * 100}
            ringColor="#f59e0b"
            delay={160}
          />
          <StatCard
            icon="🏋️"
            label="Today's Workout"
            value={today.workout ? today.workout.name : "Rest day"}
            sublabel={
              today.workout
                ? `${today.workout.durationMinutes ?? "-"} min · ${today.workout.caloriesBurned ?? "-"} kcal`
                : "No workout logged yet"
            }
            delay={240}
          />
        </div>

        <h2 className={styles.sectionTitle}>Body Metrics</h2>
        <div className={styles.statGrid}>
          <StatCard icon="⚖️" label="Weight" value={today.weight ?? "-"} unit="kg" delay={0} />
          <StatCard icon="📏" label="BMI" value={today.bmi ?? "-"} delay={80} />
          <StatCard icon="📊" label="Body Fat %" value={today.bodyFatPct != null ? `${today.bodyFatPct}` : "-"} unit="%" delay={160} />
          <StatCard
            icon="✅"
            label="Exercise Completion"
            value={`${weekly.exerciseCompletionPct}%`}
            sublabel="Last 7 days"
            progressPct={weekly.exerciseCompletionPct}
            delay={240}
          />
        </div>

        <h2 className={styles.sectionTitle}>Achievements</h2>
        <AchievementsWidget />

        <h2 className={styles.sectionTitle}>Weekly Progress</h2>
        <div className={styles.chartGrid}>
          <WeeklyCaloriesChart days={weekly.days} />
          <WeightTrendChart days={weekly.days} />
          <NutritionSummaryChart
            protein={today.nutritionSummary.protein}
            carbs={today.nutritionSummary.carbs}
            fat={today.nutritionSummary.fat}
            fiber={today.nutritionSummary.fiber}
          />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
