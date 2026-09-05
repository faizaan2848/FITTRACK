import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import styles from "./dashboard.module.css";

function formatDay(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: "short" });
}

function WeeklyCaloriesChart({ days }) {
  const data = days.map((d) => ({
    day: formatDay(d.date),
    Consumed: d.caloriesConsumed,
    Burned: d.caloriesBurned,
  }));

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardTitle}>Calories: Consumed vs Burned (7 days)</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="Consumed" stroke="#3452e0" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Burned" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeeklyCaloriesChart;
