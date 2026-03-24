"use client";

import { Marker } from "react-map-gl/maplibre";
import type { ResumeNavigation } from "@/lib/types";
import { formaterDistance, formaterDuree } from "@/lib/utilitaires";

interface PropsTooltipStats {
  navigation: ResumeNavigation;
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}

export default function TooltipStats({ navigation, bbox }: PropsTooltipStats) {
  const centreLon = (bbox.minLon + bbox.maxLon) / 2;
  const distance = navigation.trace?.distanceNm;
  const duree = navigation.trace?.durationSeconds;

  return (
    <>
      <Marker latitude={bbox.maxLat} longitude={centreLon} anchor="bottom">
        <div className="tooltip-stats tooltip-stats-haut">
          <span>{navigation.nom}</span>
          {navigation.date && (
            <span className="tooltip-stats-sep">
              {new Date(navigation.date).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          )}
        </div>
      </Marker>

      {(distance != null || duree != null) && (
        <Marker latitude={bbox.minLat} longitude={centreLon} anchor="top">
          <div className="tooltip-stats tooltip-stats-bas">
            {distance != null && <span>{formaterDistance(distance)}</span>}
            {duree != null && <span>{formaterDuree(duree)}</span>}
          </div>
        </Marker>
      )}
    </>
  );
}
