"use client";

import TraceMapWrapper from "@/components/Map/TraceMapWrapper";
import TraceChart from "@/components/Stats/TraceChart";
import PanneauStats from "@/components/Stats/PanneauStats";
import PanneauPointActif from "@/components/Stats/PanneauPointActif";
import GraphiqueRedimensionnable from "@/components/Stats/GraphiqueRedimensionnable";
import type { PointCarte } from "@/lib/types";
import { useEtatVue, HAUTEUR_GRAPHIQUE_INITIALE } from "@/lib/hooks/useEtatVue";

interface PropsTraceVueClient {
  points: PointCarte[];
  maxSpeed: number;
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
}

export default function TraceVueClient({
  points,
  maxSpeed,
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
}: PropsTraceVueClient) {
  const {
    paddingBas,
    pointActifIndex,
    pointFixeIndex,
    handleHoverPoint,
    handleClickPoint,
    donneeGraphee,
    setDonneeGraphee,
    capDisponible,
    pointActif,
    handleHauteurChange,
  } = useEtatVue(points);

  return (
    <div style={{ "--hauteur-graphique": `${paddingBas}px` } as React.CSSProperties}>
      <div className="trace-vue-stats">
        <PanneauStats
          distanceNm={distanceNm}
          durationSeconds={durationSeconds}
          avgSpeedKn={avgSpeedKn}
          maxSpeedKn={maxSpeedKn}
        />
      </div>

      {pointActif && (
        <div className="trace-vue-point-actif">
          <PanneauPointActif
            pointActif={pointActif}
            donneeGraphee={donneeGraphee}
            onChangeDonneeGraphee={setDonneeGraphee}
            capDisponible={capDisponible}
          />
        </div>
      )}

      <div className="trace-vue-carte">
        <TraceMapWrapper
          points={points}
          maxSpeed={maxSpeed}
          paddingBottom={paddingBas}
          pointActifIndex={pointActifIndex}
          onHoverPoint={handleHoverPoint}
          onClickPoint={handleClickPoint}
        />
      </div>

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
            pointFixeIndex={pointFixeIndex}
            onHoverPoint={handleHoverPoint}
            onClickPoint={handleClickPoint}
          />
        </GraphiqueRedimensionnable>
      </div>
    </div>
  );
}
