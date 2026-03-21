import { enRadians } from "./math";

/** Rayon moyen de la Terre en milles nautiques */
const RAYON_TERRE_NM = 3440.065;

/** Distance entre deux points GPS en milles nautiques (formule de Haversine) */
export function haversineNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = enRadians(lat2 - lat1);
  const dLon = enRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(enRadians(lat1)) * Math.cos(enRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RAYON_TERRE_NM * c;
}

/** Distance totale d'une suite de points en milles nautiques */
export function distanceTotaleNm(
  points: { lat: number; lon: number }[]
): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineNm(
      points[i - 1].lat,
      points[i - 1].lon,
      points[i].lat,
      points[i].lon
    );
  }
  return total;
}
