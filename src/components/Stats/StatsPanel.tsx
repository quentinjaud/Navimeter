import { Anchor, Clock, Gauge, Navigation } from "lucide-react";
import { formaterDuree } from "@/lib/utilitaires";

interface PropsPanneauStats {
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
}

function StatCard({
  icon: Icone,
  etiquette,
  valeur,
  unite,
}: {
  icon: React.ElementType;
  etiquette: string;
  valeur: string;
  unite: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <Icone className="stat-card-icon" />
        <span className="stat-card-label">{etiquette}</span>
      </div>
      <p className="stat-card-value">
        {valeur}
        <span className="stat-card-unit">{unite}</span>
      </p>
    </div>
  );
}

export default function StatsPanel({
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
}: PropsPanneauStats) {
  return (
    <div className="stats-grid">
      <StatCard
        icon={Anchor}
        etiquette="Distance"
        valeur={distanceNm?.toFixed(2) ?? "—"}
        unite="NM"
      />
      <StatCard
        icon={Clock}
        etiquette="Durée"
        valeur={durationSeconds ? formaterDuree(durationSeconds) : "—"}
        unite=""
      />
      <StatCard
        icon={Gauge}
        etiquette="V. moy."
        valeur={avgSpeedKn?.toFixed(1) ?? "—"}
        unite="kn"
      />
      <StatCard
        icon={Navigation}
        etiquette="V. max"
        valeur={maxSpeedKn?.toFixed(1) ?? "—"}
        unite="kn"
      />
    </div>
  );
}
