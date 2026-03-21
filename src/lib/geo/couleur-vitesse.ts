/**
 * Utilitaires de couleur basée sur la vitesse.
 * Échelle relative : bleu (lent) → rouge (rapide),
 * centrée sur la moyenne ± 2 écarts-types.
 */

export interface StatsVitesse {
  moyenne: number;
  ecartType: number;
}

/** Calcule la moyenne et l'écart-type des vitesses non-null */
export function calculerStatsVitesse(
  vitesses: (number | null)[]
): StatsVitesse {
  const vals = vitesses.filter(
    (v): v is number => v !== null && v > 0
  );
  if (vals.length === 0) return { moyenne: 0, ecartType: 1 };

  const moyenne = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (!isFinite(moyenne)) return { moyenne: 0, ecartType: 1 };
  const variance =
    vals.reduce((s, v) => s + (v - moyenne) ** 2, 0) / vals.length;
  const ecartType = Math.sqrt(variance) || 1;

  return { moyenne, ecartType };
}

/**
 * Convertit une vitesse en couleur HSL (bleu=lent → rouge=rapide).
 * Échelle relative centrée sur moyenne ± 2 écarts-types.
 */
export function vitesseVersCouleur(
  vitesse: number,
  stats: StatsVitesse
): string {
  const min = Math.max(0, stats.moyenne - 2 * stats.ecartType);
  const max = stats.moyenne + 2 * stats.ecartType;
  const plage = max - min;
  if (!plage || !isFinite(plage) || !isFinite(vitesse)) {
    return "hsl(240, 75%, 50%)";
  }
  const ratio = Math.max(0, Math.min((vitesse - min) / plage, 1));
  const teinte = Math.round(240 - ratio * 240);
  return `hsl(${teinte}, 80%, 50%)`;
}
