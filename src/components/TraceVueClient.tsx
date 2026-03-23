"use client";

import { useCallback, useState } from "react";
import TraceMapWrapper from "@/components/Map/TraceMapWrapper";
import TraceChart from "@/components/Stats/TraceChart";
import PanneauStats from "@/components/Stats/PanneauStats";
import PanneauPointActif from "@/components/Stats/PanneauPointActif";
import GraphiqueRedimensionnable from "@/components/Stats/GraphiqueRedimensionnable";
import type { PointCarte, CelluleMeteoClient, StatsVent } from "@/lib/types";
import { useEtatVue, HAUTEUR_GRAPHIQUE_INITIALE } from "@/lib/hooks/useEtatVue";

interface PropsTraceVueClient {
  traceId: string;
  points: PointCarte[];
  maxSpeed: number;
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
  cellulesMeteo?: CelluleMeteoClient[];
  statsVent?: StatsVent | null;
  traceTimestamps?: boolean;
  traceTropRecente?: boolean;
}

export default function TraceVueClient({
  traceId,
  points,
  maxSpeed,
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
  cellulesMeteo,
  statsVent,
  traceTimestamps,
  traceTropRecente,
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

  const [cellulesMeteoState, setCellulesMeteoState] = useState(cellulesMeteo ?? []);
  const [statsVentState, setStatsVentState] = useState(statsVent ?? null);

  const handleMeteoChargee = useCallback(
    (data: { statsVent: StatsVent; cellules: CelluleMeteoClient[] }) => {
      setStatsVentState(data.statsVent);
      setCellulesMeteoState(data.cellules);
    },
    []
  );

  const handleMeteoSupprimee = useCallback(() => {
    setStatsVentState(null);
    setCellulesMeteoState([]);
    if (donneeGraphee === "vent") setDonneeGraphee("vitesse");
  }, [donneeGraphee, setDonneeGraphee]);

  const handleClickRoseDesVents = useCallback(() => {
    setDonneeGraphee(donneeGraphee === "vent" ? "vitesse" : "vent");
  }, [donneeGraphee, setDonneeGraphee]);

  return (
    <div style={{ "--hauteur-graphique": `${paddingBas}px` } as React.CSSProperties}>
      <div className="trace-vue-stats">
        <PanneauStats
          distanceNm={distanceNm}
          durationSeconds={durationSeconds}
          avgSpeedKn={avgSpeedKn}
          maxSpeedKn={maxSpeedKn}
          traceId={traceId}
          statsVent={statsVentState}
          traceTimestamps={traceTimestamps}
          traceTropRecente={traceTropRecente}
          onMeteoChargee={handleMeteoChargee}
          onMeteoSupprimee={handleMeteoSupprimee}
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
          cellulesMeteo={cellulesMeteoState}
          statsVent={statsVentState}
          donneeGraphee={donneeGraphee}
          onClickRoseDesVents={handleClickRoseDesVents}
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
            cellulesMeteo={cellulesMeteoState}
          />
        </GraphiqueRedimensionnable>
      </div>
    </div>
  );
}
