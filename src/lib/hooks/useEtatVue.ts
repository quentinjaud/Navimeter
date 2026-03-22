import { useCallback, useMemo, useState } from "react";
import type { PointCarte, DonneeGraphee } from "@/lib/types";

export const HAUTEUR_GRAPHIQUE_INITIALE = 200;
export const MARGE_GRAPHIQUE = 56;

/** Hook partage entre TraceVueClient et NavigationVueClient */
export function useEtatVue(points: PointCarte[]) {
  const [paddingBas, setPaddingBas] = useState(
    HAUTEUR_GRAPHIQUE_INITIALE + MARGE_GRAPHIQUE
  );
  const [pointFixeIndex, setPointFixeIndex] = useState<number | null>(null);
  const [pointSurvoleIndex, setPointSurvoleIndex] = useState<number | null>(null);
  const [donneeGraphee, setDonneeGraphee] = useState<DonneeGraphee>("vitesse");

  // Le point affiche = survole (temporaire) sinon fixe (persistant)
  const pointActifIndex = pointSurvoleIndex ?? pointFixeIndex;

  const capDisponible = useMemo(
    () => points.some((p) => p.headingDeg != null),
    [points]
  );

  const pointActif = useMemo(() => {
    if (pointActifIndex == null) return null;
    return points.find((p) => p.pointIndex === pointActifIndex) ?? null;
  }, [points, pointActifIndex]);

  const handleHauteurChange = useCallback((hauteur: number) => {
    setPaddingBas(hauteur + MARGE_GRAPHIQUE);
  }, []);

  // Hover : position temporaire, null au mouseLeave → retour au point fixe
  const handleHoverPoint = useCallback((index: number | null) => {
    setPointSurvoleIndex(index);
  }, []);

  // Clic : fixe le point, reste apres la sortie du hover
  const handleClickPoint = useCallback((index: number | null) => {
    setPointFixeIndex(index);
  }, []);

  return {
    paddingBas,
    pointActifIndex,
    pointFixeIndex,
    handleHoverPoint,
    handleClickPoint,
    donneeGraphee,
    setDonneeGraphee,
    capDisponible,
    pointActif,
    handleHauteurChange,
  };
}
