import type { PointAnalyse, StatistiquesTrace } from "../types";
import { distanceTotaleNm } from "./distance";

/**
 * Calcule les statistiques d'une trace à partir de ses points.
 *
 * Conventions d'arrondi :
 * - Distance : 2 décimales (précision ~18m, suffisant pour la navigation)
 * - Vitesses : 1 décimale (standard nautique, précision au dixième de nœud)
 */
export function calculerStats(points: PointAnalyse[]): StatistiquesTrace {
  if (points.length < 2) {
    return { distanceNm: 0, durationSeconds: 0, avgSpeedKn: 0, maxSpeedKn: 0 };
  }

  const distanceNm = distanceTotaleNm(points);

  // Durée entre le premier et le dernier horodatage disponible
  const horodatages = points
    .map((p) => p.timestamp)
    .filter((t): t is Date => t !== null);

  let dureeSecondes = 0;
  if (horodatages.length >= 2) {
    const premier = horodatages[0].getTime();
    const dernier = horodatages[horodatages.length - 1].getTime();
    dureeSecondes = Math.round((dernier - premier) / 1000);
  }

  // Vitesse max : calculée par enrichirPoints() lors du parsing
  let vitesseMaxKn = 0;
  for (const point of points) {
    if (point.speedKn !== null && point.speedKn > vitesseMaxKn) {
      vitesseMaxKn = point.speedKn;
    }
  }

  const vitesseMoyKn =
    dureeSecondes > 0 ? (distanceNm / dureeSecondes) * 3600 : 0;

  return {
    distanceNm: Math.round(distanceNm * 100) / 100,
    durationSeconds: dureeSecondes,
    avgSpeedKn: Math.round(vitesseMoyKn * 10) / 10,
    maxSpeedKn: Math.round(vitesseMaxKn * 10) / 10,
  };
}
