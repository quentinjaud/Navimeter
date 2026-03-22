"use client";

import { useCallback, useMemo, useState } from "react";
import TraceMapWrapper from "@/components/Map/TraceMapWrapper";
import TraceChart from "@/components/Stats/TraceChart";
import Timeline from "@/components/Stats/Timeline";
import PanneauStats from "@/components/Stats/PanneauStats";
import GraphiqueRedimensionnable from "@/components/Stats/GraphiqueRedimensionnable";
import type { PointCarte, DonneeGraphee } from "@/lib/types";

interface PropsTraceVueClient {
  points: PointCarte[];
  maxSpeed: number;
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
}

const HAUTEUR_GRAPHIQUE_INITIALE = 200;
const MARGE_GRAPHIQUE = 56;

export default function TraceVueClient({
  points,
  maxSpeed,
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
}: PropsTraceVueClient) {
  const [paddingBas, setPaddingBas] = useState(
    HAUTEUR_GRAPHIQUE_INITIALE + MARGE_GRAPHIQUE
  );
  const [pointActifIndex, setPointActifIndex] = useState<number | null>(null);
  const [donneeGraphee, setDonneeGraphee] = useState<DonneeGraphee>("vitesse");

  const capDisponible = useMemo(
    () => points.some((p) => p.headingDeg != null),
    [points]
  );

  const pointActif = useMemo(() => {
    if (pointActifIndex == null) return null;
    return points.find((p) => p.pointIndex === pointActifIndex) ?? null;
  }, [points, pointActifIndex]);

  const handleHauteurChange = useCallback((hauteur: number) => {
    setPaddingBas(hauteur + MARGE_GRAPHIQUE);
  }, []);

  return (
    <div style={{ "--hauteur-graphique": `${paddingBas}px` } as React.CSSProperties}>
      {/* Panneau stats flottant a gauche */}
      <div className="trace-vue-stats">
        <PanneauStats
          distanceNm={distanceNm}
          durationSeconds={durationSeconds}
          avgSpeedKn={avgSpeedKn}
          maxSpeedKn={maxSpeedKn}
          pointActif={pointActif}
          donneeGraphee={donneeGraphee}
          onChangeDonneeGraphee={setDonneeGraphee}
          capDisponible={capDisponible}
        />
      </div>

      {/* Carte plein ecran */}
      <div className="trace-vue-carte">
        <TraceMapWrapper
          points={points}
          maxSpeed={maxSpeed}
          paddingBottom={paddingBas}
          pointActifIndex={pointActifIndex}
          onHoverPoint={setPointActifIndex}
        />
      </div>

      {/* Graphique + timeline */}
      <div className="trace-vue-graphique">
        <GraphiqueRedimensionnable
          hauteurInitiale={HAUTEUR_GRAPHIQUE_INITIALE}
          hauteurMin={80}
          hauteurMax={450}
          onHauteurChange={handleHauteurChange}
        >
          <TraceChart
            points={points}
            donnee={donneeGraphee}
            pointActifIndex={pointActifIndex}
            onHoverPoint={setPointActifIndex}
          />
          <Timeline
            points={points}
            pointActifIndex={pointActifIndex}
            onChangeIndex={setPointActifIndex}
          />
        </GraphiqueRedimensionnable>
      </div>
    </div>
  );
}
