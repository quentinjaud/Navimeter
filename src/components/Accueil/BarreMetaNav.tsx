"use client";

import type { ResumeNavigation } from "@/lib/types";
import { formaterDistance, formaterDuree } from "@/lib/utilitaires";

interface PropsBarreMetaNav {
  navigation: ResumeNavigation;
  onOuvrir: () => void;
}

export default function BarreMetaNav({ navigation, onOuvrir }: PropsBarreMetaNav) {
  const date = navigation.date
    ? new Date(navigation.date).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const distance = navigation.trace?.distanceNm;
  const duree = navigation.trace?.durationSeconds;
  const bateau = navigation.trace?.bateau?.nom;

  return (
    <div className="barre-meta-nav">
      <span className="point-actif-pill point-actif-pill-donnee" data-label="NAV">
        {navigation.nom}
      </span>
      {date && (
        <span className="point-actif-pill point-actif-pill-donnee" data-label="DATE">
          {date}
        </span>
      )}
      {distance != null && (
        <span className="point-actif-pill point-actif-pill-donnee" data-label="DIST">
          {formaterDistance(distance)}
        </span>
      )}
      {duree != null && (
        <span className="point-actif-pill point-actif-pill-donnee" data-label="DUR">
          {formaterDuree(duree)}
        </span>
      )}
      {bateau && (
        <span className="point-actif-pill point-actif-pill-donnee" data-label="BAT">
          {bateau}
        </span>
      )}
      <button className="point-actif-pill barre-meta-nav-ouvrir" onClick={onOuvrir}>
        Ouvrir
      </button>
    </div>
  );
}
