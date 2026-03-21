"use client";

import { useCallback, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import type { PointNettoyage, StatistiquesTrace } from "@/lib/types";
import { calculerStats } from "@/lib/geo/stats";
import { simplifierRDP } from "@/lib/geo/simplification";
import type { PointAnalyse } from "@/lib/types";
import NettoyageMapWrapper from "./NettoyageMapWrapper";
import GraphiqueNettoyage from "./GraphiqueNettoyage";
import PanneauControles from "./PanneauControles";
import StatsFlottantes from "./StatsFlottantes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PropsNettoyagePage {
  traceId: string;
  traceName: string;
  points: PointNettoyage[];
}

// === Reducer ===

type ActionNettoyage =
  | { type: "BASCULER_EXCLUSION"; pointIndex: number }
  | { type: "EXCLURE_SELECTION" }
  | { type: "INCLURE_SELECTION" }
  | { type: "TOUT_INCLURE" }
  | { type: "SELECTIONNER_PLAGE"; debut: number; fin: number }
  | { type: "EFFACER_SELECTION" }
  | { type: "MARQUER_SAUVEGARDE" }
  | { type: "SIMPLIFIER"; toleranceNm: number; pointsOriginaux: PointNettoyage[] };

interface EtatNettoyage {
  points: PointNettoyage[];
  selectionIndices: Set<number>;
  modifie: boolean;
}

function reducer(etat: EtatNettoyage, action: ActionNettoyage): EtatNettoyage {
  switch (action.type) {
    case "BASCULER_EXCLUSION": {
      const points = etat.points.map((p) =>
        p.pointIndex === action.pointIndex
          ? { ...p, isExcluded: !p.isExcluded }
          : p
      );
      return { ...etat, points, modifie: true };
    }

    case "EXCLURE_SELECTION": {
      const points = etat.points.map((p) =>
        etat.selectionIndices.has(p.pointIndex)
          ? { ...p, isExcluded: true }
          : p
      );
      return { ...etat, points, selectionIndices: new Set(), modifie: true };
    }

    case "INCLURE_SELECTION": {
      const points = etat.points.map((p) =>
        etat.selectionIndices.has(p.pointIndex)
          ? { ...p, isExcluded: false }
          : p
      );
      return { ...etat, points, selectionIndices: new Set(), modifie: true };
    }

    case "TOUT_INCLURE": {
      const points = etat.points.map((p) => ({ ...p, isExcluded: false }));
      return { ...etat, points, modifie: true };
    }

    case "SELECTIONNER_PLAGE": {
      const indices = new Set<number>();
      for (const p of etat.points) {
        if (p.pointIndex >= action.debut && p.pointIndex <= action.fin) {
          indices.add(p.pointIndex);
        }
      }
      return { ...etat, selectionIndices: indices };
    }

    case "EFFACER_SELECTION":
      return { ...etat, selectionIndices: new Set() };

    case "MARQUER_SAUVEGARDE":
      return { ...etat, modifie: false };

    case "SIMPLIFIER": {
      if (action.toleranceNm <= 0) {
        // Tolérance à 0 : restaurer l'état des points originaux
        // (les aberrants restent exclus, mais les points simplifiés sont ré-inclus)
        const points = etat.points.map((p, i) => ({
          ...p,
          isExcluded: action.pointsOriginaux[i].isExcluded,
        }));
        return { ...etat, points, modifie: true };
      }
      // Trouver les points qui survivent à RDP parmi les non-exclus-originaux
      const pointsNonExclusOriginaux = action.pointsOriginaux
        .map((p, i) => ({ ...p, _idx: i }))
        .filter((p) => !p.isExcluded);
      const survivants = simplifierRDP(pointsNonExclusOriginaux, action.toleranceNm);
      const indicesSurvivants = new Set(survivants.map((s) => s._idx));

      const points = etat.points.map((p, i) => {
        // Si le point était déjà exclu à l'origine (aberrant), il le reste
        if (action.pointsOriginaux[i].isExcluded) {
          return { ...p, isExcluded: true };
        }
        // Sinon, exclu si pas dans les survivants RDP
        return { ...p, isExcluded: !indicesSurvivants.has(i) };
      });
      return { ...etat, points, modifie: true };
    }

    default:
      return etat;
  }
}

function calculerStatsDepuisPoints(points: PointNettoyage[]): StatistiquesTrace {
  const pointsActifs = points.filter((p) => !p.isExcluded);
  const pointsAnalyse: PointAnalyse[] = pointsActifs.map((p) => ({
    lat: p.lat,
    lon: p.lon,
    timestamp: p.timestamp ? new Date(p.timestamp) : null,
    speedKn: p.speedKn,
    headingDeg: p.headingDeg,
    elevationM: null,
  }));
  return calculerStats(pointsAnalyse);
}

export default function NettoyagePage({
  traceId,
  traceName,
  points: pointsInitiaux,
}: PropsNettoyagePage) {
  const router = useRouter();
  const [etat, dispatch] = useReducer(reducer, {
    points: pointsInitiaux,
    selectionIndices: new Set<number>(),
    modifie: false,
  });
  const [enSauvegarde, setEnSauvegarde] = useState(false);
  const [pointSurvole, setPointSurvole] = useState<number | null>(null);

  const stats = useMemo(
    () => calculerStatsDepuisPoints(etat.points),
    [etat.points]
  );

  const nbExclus = useMemo(
    () => etat.points.filter((p) => p.isExcluded).length,
    [etat.points]
  );

  const simplifier = useCallback(
    (toleranceNm: number) => {
      dispatch({
        type: "SIMPLIFIER",
        toleranceNm,
        pointsOriginaux: pointsInitiaux,
      });
    },
    [pointsInitiaux]
  );

  const sauvegarder = useCallback(async () => {
    setEnSauvegarde(true);
    try {
      // Comparer avec l'état initial pour envoyer uniquement les changements
      const modifications: { id: string; isExcluded: boolean }[] = [];
      for (let i = 0; i < etat.points.length; i++) {
        if (etat.points[i].isExcluded !== pointsInitiaux[i].isExcluded) {
          modifications.push({
            id: etat.points[i].id,
            isExcluded: etat.points[i].isExcluded,
          });
        }
      }

      if (modifications.length === 0) {
        dispatch({ type: "MARQUER_SAUVEGARDE" });
        return;
      }

      const reponse = await fetch(`/api/traces/${traceId}/points`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modifications }),
      });

      if (!reponse.ok) {
        throw new Error("Erreur de sauvegarde");
      }

      dispatch({ type: "MARQUER_SAUVEGARDE" });
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur de sauvegarde");
    } finally {
      setEnSauvegarde(false);
    }
  }, [etat.points, pointsInitiaux, traceId, router]);

  return (
    <div className="nettoyage-layout">
      {/* Carte plein écran en fond */}
      <div className="nettoyage-carte">
        <NettoyageMapWrapper
          points={etat.points}
          selectionIndices={etat.selectionIndices}
          pointSurvole={pointSurvole}
          onClickPoint={(pointIndex) =>
            dispatch({ type: "BASCULER_EXCLUSION", pointIndex })
          }
          onHoverPoint={setPointSurvole}
        />
      </div>

      {/* Header flottant */}
      <div className="nettoyage-header">
        <Link href={`/trace/${traceId}`} className="nettoyage-back">
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </Link>
        <h1 className="nettoyage-titre">{traceName}</h1>
        {etat.modifie && (
          <span className="nettoyage-badge-modifie">Non sauvegardé</span>
        )}
      </div>

      {/* Stats flottantes en haut à gauche */}
      <StatsFlottantes stats={stats} />

      {/* Panneau de contrôles à droite */}
      <PanneauControles
        nbExclus={nbExclus}
        nbTotal={etat.points.length}
        nbSelectionnes={etat.selectionIndices.size}
        modifie={etat.modifie}
        enSauvegarde={enSauvegarde}
        traceId={traceId}
        onExclureSelection={() => dispatch({ type: "EXCLURE_SELECTION" })}
        onInclureSelection={() => dispatch({ type: "INCLURE_SELECTION" })}
        onToutInclure={() => dispatch({ type: "TOUT_INCLURE" })}
        onEffacerSelection={() => dispatch({ type: "EFFACER_SELECTION" })}
        onSauvegarder={sauvegarder}
        onSimplifier={simplifier}
      />

      {/* Graphique docké en bas */}
      <div className="nettoyage-graphique">
        <GraphiqueNettoyage
          points={etat.points}
          pointSurvole={pointSurvole}
          onHoverPoint={setPointSurvole}
          onSelectRange={(debut, fin) =>
            dispatch({ type: "SELECTIONNER_PLAGE", debut, fin })
          }
        />
      </div>
    </div>
  );
}
