import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import styles from "./dashboard.module.css";

const COLORS = ["#3452e0", "#00c2d1", "#f59e0b", "#a855f7"];

function NutritionSummaryChart({ protein, carbs, fat, fiber }) {
  const data = [
    { name: "Protein", value: protein },
    { name: "Carbs", value: carbs },
    { name: "Fat", value: fat },
    { name: "Fiber", value: fiber },
  ];

  const total = protein + carbs + fat + fiber;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardTitle}>Today's Nutrition Summary</div>
      {total === 0 ? (
        <div className={styles.emptyState}>No meals logged today yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} g`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default NutritionSummaryChart;
