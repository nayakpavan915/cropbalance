import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Horizontal bars read best on a phone: crop names run down the left side.
export default function SupplyChart({ data }) {
  const height = data.length * 70 + 90;

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 14, fill: "#111111" }}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={90}
            tick={{ fontSize: 14, fill: "#111111" }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="acres" name="Planned (acres)" fill="#14532d" />
          <Bar
            dataKey="safe"
            name="Safe level (acres)"
            fill="#ffd60a"
            stroke="#111111"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}