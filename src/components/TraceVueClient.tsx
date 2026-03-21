"use client";

import { useCallback, useState } from "react";
import TraceMapWrapper from "@/components/Map/TraceMapWrapper";
import SpeedChart from "@/components/Stats/SpeedChart";
import GraphiqueRedimensionnable from "@/components/Stats/GraphiqueRedimensionnable";

interface PointCarte {
  lat: number;
  lon: number;
  timestamp: string | null;
  speedKn: number | null;
  headingDeg: number | null;
  pointIndex: number;
}

interface PropsTraceVueClient {
  points: PointCarte[];
  maxSpeed: number;
}

/** Hauteur initiale du graphique en px */
const HAUTEUR_GRAPHIQUE_INITIALE = 200;
/** Marge du conteneur graphique (padding + bottom) */
const MARGE_GRAPHIQUE = 56;

export default function TraceVueClient({
  points,
  maxSpeed,
}: PropsTraceVueClient) {
  const [paddingBas, setPaddingBas] = useState(
    HAUTEUR_GRAPHIQUE_INITIALE + MARGE_GRAPHIQUE
  );
  const [pointSurvole, setPointSurvole] = useState<number | null>(null);

  const handleHauteurChange = useCallback((hauteur: number) => {
    setPaddingBas(hauteur + MARGE_GRAPHIQUE);
  }, []);

  return (
    <div style={{ "--hauteur-graphique": `${paddingBas}px` } as React.CSSProperties}>
      {/* Carte plein écran — padding bottom pour ne pas cacher la trace sous le graphique */}
      <div className="trace-vue-carte">
        <TraceMapWrapper
          points={points}
          maxSpeed={maxSpeed}
          paddingBottom={paddingBas}
          pointSurvole={pointSurvole}
          onHoverPoint={setPointSurvole}
        />
      </div>

      {/* Graphique redimensionnable docké en bas */}
      <div className="trace-vue-graphique">
        <GraphiqueRedimensionnable
          hauteurInitiale={HAUTEUR_GRAPHIQUE_INITIALE}
          hauteurMin={80}
          hauteurMax={450}
          onHauteurChange={handleHauteurChange}
        >
          <SpeedChart
            points={points}
            pointSurvole={pointSurvole}
            onHoverPoint={setPointSurvole}
          />
        </GraphiqueRedimensionnable>
      </div>
    </div>
  );
}
