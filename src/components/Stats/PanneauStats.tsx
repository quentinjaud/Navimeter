"use client";

import { Anchor, Clock, Gauge, Navigation, Compass } from "lucide-react";
import { formaterDuree } from "@/lib/utilitaires";
import type { PointCarte, DonneeGraphee } from "@/lib/types";

interface PropsPanneauStats {
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
  pointActif: PointCarte | null;
  donneeGraphee: DonneeGraphee;
  onChangeDonneeGraphee: (d: DonneeGraphee) => void;
  capDisponible: boolean;
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

export default function PanneauStats({
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
  pointActif,
  donneeGraphee,
  onChangeDonneeGraphee,
  capDisponible,
}: PropsPanneauStats) {
  return (
    <div className="panneau-stats">
      {/* Zone haute — stats globales */}
      <div className="stats-grid">
        <StatCard
          icon={Anchor}
          etiquette="Distance"
          valeur={distanceNm?.toFixed(2) ?? "—"}
          unite="NM"
        />
        <StatCard
          icon={Clock}
          etiquette="Duree"
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

      {/* Zone basse — point actif */}
      {pointActif && (
        <div className="panneau-stats-point-actif">
          <div className="panneau-stats-separateur" />
          <button
            className={`panneau-stats-donnee ${donneeGraphee === "vitesse" ? "panneau-stats-donnee-active" : ""}`}
            onClick={() => onChangeDonneeGraphee("vitesse")}
            disabled={donneeGraphee === "vitesse"}
          >
            <Gauge className="panneau-stats-donnee-icon" />
            <span className="panneau-stats-donnee-valeur">
              {pointActif.speedKn != null
                ? pointActif.speedKn.toFixed(1)
                : "—"}
            </span>
            <span className="panneau-stats-donnee-unite">kn</span>
          </button>
          <button
            className={`panneau-stats-donnee ${donneeGraphee === "cap" ? "panneau-stats-donnee-active" : ""}`}
            onClick={() => onChangeDonneeGraphee("cap")}
            disabled={donneeGraphee === "cap" || !capDisponible}
            title={!capDisponible ? "Pas de donnees de cap" : undefined}
          >
            <Compass className="panneau-stats-donnee-icon" />
            <span className="panneau-stats-donnee-valeur">
              {pointActif.headingDeg != null
                ? `${Math.round(pointActif.headingDeg)}`
                : "—"}
            </span>
            <span className="panneau-stats-donnee-unite">°</span>
          </button>
        </div>
      )}
    </div>
  );
}
