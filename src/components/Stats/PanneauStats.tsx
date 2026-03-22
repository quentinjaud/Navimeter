"use client";

import { Anchor, Clock, Gauge, Navigation } from "lucide-react";
import { formaterDuree } from "@/lib/utilitaires";

interface PropsPanneauStats {
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
}

function LigneStat({
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
    <div className="stat-ligne">
      <div className="stat-ligne-label">
        <Icone className="stat-ligne-icon" />
        <span>{etiquette}</span>
      </div>
      <span className="stat-ligne-valeur">
        {valeur}
        <span className="stat-ligne-unite">{unite}</span>
      </span>
    </div>
  );
}

export default function PanneauStats({
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
}: PropsPanneauStats) {
  return (
    <div className="panneau-stats-compact">
      <LigneStat
        icon={Anchor}
        etiquette="Distance"
        valeur={distanceNm?.toFixed(2) ?? "—"}
        unite="NM"
      />
      <LigneStat
        icon={Clock}
        etiquette="Duree"
        valeur={durationSeconds ? formaterDuree(durationSeconds) : "—"}
        unite=""
      />
      <LigneStat
        icon={Gauge}
        etiquette="V. moy."
        valeur={avgSpeedKn?.toFixed(1) ?? "—"}
        unite="kn"
      />
      <LigneStat
        icon={Navigation}
        etiquette="V. max"
        valeur={maxSpeedKn?.toFixed(1) ?? "—"}
        unite="kn"
      />
    </div>
  );
}
