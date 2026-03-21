import { Anchor, Clock, Gauge, Navigation } from "lucide-react";

interface StatsPanelProps {
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-light shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-accent-blue" />
        <span className="text-xs text-gray-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold">
        {value}
        <span className="text-sm font-normal text-gray-medium ml-1">
          {unit}
        </span>
      </p>
    </div>
  );
}

export default function StatsPanel({
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
}: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={Anchor}
        label="Distance"
        value={distanceNm?.toFixed(2) ?? "—"}
        unit="NM"
      />
      <StatCard
        icon={Clock}
        label="Durée"
        value={durationSeconds ? formatDuration(durationSeconds) : "—"}
        unit=""
      />
      <StatCard
        icon={Gauge}
        label="Vitesse moy."
        value={avgSpeedKn?.toFixed(1) ?? "—"}
        unit="kn"
      />
      <StatCard
        icon={Navigation}
        label="Vitesse max"
        value={maxSpeedKn?.toFixed(1) ?? "—"}
        unit="kn"
      />
    </div>
  );
}
