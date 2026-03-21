"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { COULEURS } from "@/lib/theme";

interface PropsGraphiqueVitesse {
  points: {
    timestamp: string | null;
    speedKn: number | null;
  }[];
}

/** Réduit le nombre de points pour le rendu du graphique */
function sousechantillonner<T>(donnees: T[], pointsMax: number): T[] {
  if (donnees.length <= pointsMax) return donnees;
  const pas = donnees.length / pointsMax;
  const resultat: T[] = [];
  for (let i = 0; i < pointsMax; i++) {
    resultat.push(donnees[Math.round(i * pas)]);
  }
  // Toujours inclure le dernier point
  const dernierIndex = donnees.length - 1;
  if (Math.round((pointsMax - 1) * pas) !== dernierIndex) {
    resultat.push(donnees[dernierIndex]);
  }
  return resultat;
}

export default function SpeedChart({ points }: PropsGraphiqueVitesse) {
  const donneesGraphique = sousechantillonner(
    points
      .filter((p) => p.timestamp && p.speedKn !== null)
      .map((p) => ({
        heure: p.timestamp!,
        vitesse: p.speedKn!,
      })),
    500
  );

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
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={donneesGraphique}>
          <CartesianGrid strokeDasharray="3 3" stroke={COULEURS.grille} />
          <XAxis
            dataKey="heure"
            tickFormatter={(t) => format(new Date(t), "HH:mm")}
            tick={{ fontSize: 11 }}
            stroke={COULEURS.texteSecondaire}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke={COULEURS.texteSecondaire}
            label={{
              value: "kn",
              angle: -90,
              position: "insideLeft",
              style: { fontSize: 11 },
            }}
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
          <Line
            type="monotone"
            dataKey="vitesse"
            stroke={COULEURS.accent}
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
