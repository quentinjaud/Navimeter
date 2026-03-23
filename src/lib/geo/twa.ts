/**
 * Interpolation circulaire entre deux angles (chemin le plus court sur 360°).
 * ratio = 0 → a, ratio = 1 → b.
 */
export function interpolerCirculaire(a: number, b: number, ratio: number): number {
  const diff = ((b - a + 540) % 360) - 180;
  const result = a + diff * ratio;
  return ((result % 360) + 360) % 360;
}

/**
 * Calcule le TWA signe.
 * ventDirectionDeg = direction d'ou vient le vent (convention meteo Open-Meteo).
 * Resultat dans [-180, +180]. Negatif = babord, positif = tribord.
 * 0° = face au vent, ±180° = vent arriere.
 */
export function calculerTWA(capDeg: number, ventDirectionDeg: number): number {
  return ((ventDirectionDeg - capDeg + 540) % 360) - 180;
}

/** Badge babord/tribord. */
export function bordTWA(twa: number): "B" | "T" {
  return twa < 0 ? "B" : "T";
}
