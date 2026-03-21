import { enRadians, enDegres } from "./math";

/** Cap (bearing) entre deux points en degrés [0, 360) */
export function capDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = enRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(enRadians(lat2));
  const x =
    Math.cos(enRadians(lat1)) * Math.sin(enRadians(lat2)) -
    Math.sin(enRadians(lat1)) * Math.cos(enRadians(lat2)) * Math.cos(dLon);
  const cap = enDegres(Math.atan2(y, x));
  return ((cap % 360) + 360) % 360;
}
