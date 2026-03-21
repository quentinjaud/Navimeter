"use client";

import type { StatistiquesTrace } from "@/lib/types";
import { formaterDuree } from "@/lib/utilitaires";

interface PropsStatsFlottantes {
  stats: StatistiquesTrace;
}

export default function StatsFlottantes({ stats }: PropsStatsFlottantes) {
  return (
    <div className="nettoyage-stats">
      <div className="nettoyage-stat">
        <span className="nettoyage-stat-valeur">
          {stats.distanceNm.toFixed(2)}
        </span>
        <span className="nettoyage-stat-unite">NM</span>
      </div>
      <div className="nettoyage-stat">
        <span className="nettoyage-stat-valeur">
          {formaterDuree(stats.durationSeconds)}
        </span>
      </div>
      <div className="nettoyage-stat">
        <span className="nettoyage-stat-valeur">
          {stats.avgSpeedKn.toFixed(1)}
        </span>
        <span className="nettoyage-stat-unite">kn moy</span>
      </div>
      <div className="nettoyage-stat">
        <span className="nettoyage-stat-valeur">
          {stats.maxSpeedKn.toFixed(1)}
        </span>
        <span className="nettoyage-stat-unite">kn max</span>
      </div>
    </div>
  );
}
