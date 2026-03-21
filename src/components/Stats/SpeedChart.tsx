"use client";

import { useCallback, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { COULEURS } from "@/lib/theme";
import {
  calculerStatsVitesse,
  vitesseVersCouleur,
} from "@/lib/geo/couleur-vitesse";

interface PointGraphique {
  timestamp: string | null;
  speedKn: number | null;
  pointIndex?: number;
}

interface PropsGraphiqueVitesse {
  points: PointGraphique[];
  pointSurvole?: number | null;
  onHoverPoint?: (pointIndex: number | null) => void;
}

/** Réduit le nombre de points pour le rendu du graphique */
function sousechantillonner<T>(donnees: T[], pointsMax: number): T[] {
  if (donnees.length <= pointsMax) return donnees;
  const pas = donnees.length / pointsMax;
  const resultat: T[] = [];
  for (let i = 0; i < pointsMax; i++) {
    resultat.push(donnees[Math.round(i * pas)]);
  }
  const dernierIndex = donnees.length - 1;
  if (Math.round((pointsMax - 1) * pas) !== dernierIndex) {
    resultat.push(donnees[dernierIndex]);
  }
  return resultat;
}

interface DonneeGraphique {
  heure: string;
  vitesse: number;
  pointIndex: number;
}

export default function SpeedChart({
  points,
  pointSurvole,
  onHoverPoint,
}: PropsGraphiqueVitesse) {
  const donneesGraphique = useMemo(
    () =>
      sousechantillonner(
        points
          .filter((p) => p.timestamp && p.speedKn !== null)
          .map((p, i) => ({
            heure: p.timestamp!,
            vitesse: p.speedKn!,
            pointIndex: p.pointIndex ?? i,
          })),
        500
      ),
    [points]
  );

  // Gradient de couleur par vitesse (même échelle que la carte)
  const gradientStops = useMemo(() => {
    const stats = calculerStatsVitesse(
      donneesGraphique.map((d) => d.vitesse)
    );
    return donneesGraphique.map((d, i) => ({
      offset: `${(i / Math.max(donneesGraphique.length - 1, 1)) * 100}%`,
      color: vitesseVersCouleur(d.vitesse, stats),
    }));
  }, [donneesGraphique]);

  const heureSurvole = useMemo(() => {
    if (pointSurvole == null) return null;
    const d = donneesGraphique.find((d) => d.pointIndex === pointSurvole);
    return d?.heure ?? null;
  }, [pointSurvole, donneesGraphique]);

  const handleMouseMove = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (...args: any[]) => {
      if (!onHoverPoint) return;
      const state = args[0];
      if (state?.activePayload?.[0]?.payload?.pointIndex !== undefined) {
        onHoverPoint(state.activePayload[0].payload.pointIndex);
      } else if (state?.activeLabel) {
        const point = donneesGraphique.find(
          (d) => d.heure === state.activeLabel
        );
        if (point) onHoverPoint(point.pointIndex);
      }
    },
    [onHoverPoint, donneesGraphique]
  );

  const handleMouseLeave = useCallback(() => {
    onHoverPoint?.(null);
  }, [onHoverPoint]);

  if (donneesGraphique.length < 2) {
    return (
      <div className="chart-empty">
        Pas assez de données pour afficher le graphique
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">Vitesse dans le temps</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={donneesGraphique}
          onMouseMove={onHoverPoint ? handleMouseMove : undefined}
          onMouseLeave={onHoverPoint ? handleMouseLeave : undefined}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={COULEURS.grille} />
          <XAxis
            dataKey="heure"
            tickFormatter={(t) => format(new Date(t), "HH:mm")}
            tick={{ fontSize: 11 }}
            stroke={COULEURS.texteSecondaire}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke={COULEURS.texteSecondaire}
            width={25}
          />
          <Tooltip
            labelFormatter={(t) => format(new Date(t as string), "HH:mm:ss")}
            formatter={(value) => [`${Number(value).toFixed(1)} kn`, "Vitesse"]}
            contentStyle={{
              backgroundColor: COULEURS.fond,
              border: `1px solid ${COULEURS.bordure}`,
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <defs>
            <linearGradient id="gradientVitesse" x1="0" y1="0" x2="1" y2="0">
              {gradientStops.map((stop, i) => (
                <stop
                  key={i}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="vitesse"
            stroke="url(#gradientVitesse)"
            dot={false}
            strokeWidth={1.5}
          />
          {heureSurvole && (
            <ReferenceLine
              x={heureSurvole}
              stroke={COULEURS.jaune}
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
