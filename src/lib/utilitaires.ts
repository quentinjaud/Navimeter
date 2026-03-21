/**
 * Formate une durée en secondes en chaîne lisible.
 * Ex : 7320 → "2h 02m"
 */
export function formaterDuree(secondes: number): string {
  const h = Math.floor(secondes / 3600);
  const m = Math.floor((secondes % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}
