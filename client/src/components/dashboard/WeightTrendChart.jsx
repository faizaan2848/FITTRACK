import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import styles from "./dashboard.module.css";

function formatDay(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
}

function WeightTrendChart({ days }) {
  const data = days
    .filter((d) => d.weight != null)
    .map((d) => ({ day: formatDay(d.date), weight: d.weight }));

  if (data.length === 0) {
    return (
      <div className={styles.chartCard}>
        <div className={styles.chartCardTitle}>Weight Trend (7 days)</div>
        <div className={styles.emptyState}>No weigh-ins logged this week yet.</div>
      </div>
    );
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardTitle}>Weight Trend (7 days)</div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3452e0" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3452e0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" domain={["auto", "auto"]} />
          <Tooltip />
          <Area type="monotone" dataKey="weight" stroke="#3452e0" strokeWidth={2} fill="url(#weightGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeightTrendChart;
