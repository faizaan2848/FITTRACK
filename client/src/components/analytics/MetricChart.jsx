// One reusable chart for all 7 analytics metrics - avoids writing near-
// identical LineChart/BarChart boilerplate 7 times over. `type` picks
// the chart shape, everything else (data, styling) is passed in.

import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import styles from "../../pages/analytics/analytics.module.css";

function MetricChart({ title, unit, data, dataKey, type = "line", color = "var(--color-primary)" }) {
  const hasData = data.some((d) => d[dataKey] != null && d[dataKey] !== 0);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartCardTitle}>
        {title} {unit && <span style={{ color: "var(--color-text-muted)", fontWeight: 500 }}>({unit})</span>}
      </div>
      {!hasData ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          No data logged for this period yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <Tooltip contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#grad-${dataKey})`} />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "var(--color-surface-raised)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
              <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 2 }} connectNulls />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default MetricChart;
