import { useEffect, useState } from "react";
import { getAnalyticsRequest } from "../../services/analyticsService";
import { useMembership } from "../../context/MembershipContext";
import UpgradeGate from "../../components/common/UpgradeGate";
import MetricChart from "../../components/analytics/MetricChart";
import styles from "./analytics.module.css";

const RANGES = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

function Analytics() {
  const { limits } = useMembership();
  const [range, setRange] = useState("week");
  const [series, setSeries] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!limits.analytics) return; // don't call an endpoint we know will be rejected
    setIsLoading(true);
    getAnalyticsRequest(range)
      .then((data) => setSeries(data.series))
      .finally(() => setIsLoading(false));
  }, [range, limits.analytics]);

  if (!limits.analytics) {
    return <UpgradeGate featureName="Progress Analytics" requiredPlan="PRO" />;
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Progress Analytics</h1>

      <div className={styles.tabs}>
        {RANGES.map((r) => (
          <button
            key={r.key}
            className={r.key === range ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {isLoading || !series ? (
        <div style={{ color: "var(--color-text-muted)", padding: "48px 0", textAlign: "center" }}>
          Loading analytics...
        </div>
      ) : (
        <div className={styles.grid}>
          <MetricChart title="Weight" unit="kg" data={series} dataKey="weight" type="line" color="var(--color-primary)" />
          <MetricChart title="Body Fat %" unit="%" data={series} dataKey="bodyFatPct" type="line" color="var(--color-secondary)" />
          <MetricChart title="BMI" data={series} dataKey="bmi" type="line" color="#f59e0b" />
          <MetricChart title="Calories Consumed" unit="kcal" data={series} dataKey="caloriesConsumed" type="bar" color="var(--color-primary)" />
          <MetricChart title="Protein Intake" unit="g" data={series} dataKey="proteinIntake" type="bar" color="#22c55e" />
          <MetricChart title="Workout Frequency" unit="sessions" data={series} dataKey="workoutFrequency" type="bar" color="var(--color-secondary)" />
          <MetricChart title="Exercise Completion" unit="%" data={series} dataKey="exerciseCompletionPct" type="area" color="#a855f7" />
        </div>
      )}
    </div>
  );
}

export default Analytics;
