/** Calcule la vitesse en nœuds à partir d'une distance (NM) et d'un temps (secondes) */
export function vitesseNoeuds(distanceNm: number, dureeSecondes: number): number {
  if (dureeSecondes <= 0) return 0;
  return (distanceNm / dureeSecondes) * 3600;
}
