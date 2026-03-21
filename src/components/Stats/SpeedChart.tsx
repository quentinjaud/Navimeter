"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

interface SpeedChartProps {
  points: {
    timestamp: string | null;
    speedKn: number | null;
  }[];
}

function downsample<T>(data: T[], maxPoints: number): T[] {
  if (data.length <= maxPoints) return data;
  const step = data.length / maxPoints;
  const result: T[] = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(data[Math.round(i * step)]);
  }
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }
  return result;
}

export default function SpeedChart({ points }: SpeedChartProps) {
  const chartData = downsample(
    points
      .filter((p) => p.timestamp && p.speedKn !== null)
      .map((p) => ({
        time: p.timestamp!,
        speed: p.speedKn!,
      })),
    500
  );

  if (chartData.length < 2) {
    return (
      <div className="chart-empty">
        Pas assez de données pour afficher le graphique
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Vitesse dans le temps</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9e9e7" />
          <XAxis
            dataKey="time"
            tickFormatter={(t) => format(new Date(t), "HH:mm")}
            tick={{ fontSize: 11 }}
            stroke="#787774"
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#787774"
            label={{
              value: "kn",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11 },
            }}
          />
          <Tooltip
            labelFormatter={(t) => format(new Date(t as string), "HH:mm:ss")}
            formatter={(value) => [`${Number(value).toFixed(1)} kn`, "Vitesse"]}
            contentStyle={{
              backgroundColor: "#FFFDF9",
              border: "1px solid #e9e9e7",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke="#43728B"
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
