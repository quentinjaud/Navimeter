"use client";

import type { ResumeNavigation, ResumeDossier } from "@/lib/types";
import { formaterDistance, formaterDuree } from "@/lib/utilitaires";

type PropsLigneItem =
  | { type: "navigation"; item: ResumeNavigation; onClick: () => void }
  | { type: "sousDossier"; item: ResumeDossier; onClick: () => void };

const COULEURS_TYPE = {
  SOLO: "var(--accent)",
  AVENTURE: "var(--accent-aventure)",
  REGATE: "var(--accent-yellow)",
} as const;

export default function LigneItem(props: PropsLigneItem) {
  if (props.type === "sousDossier") {
    const { item, onClick } = props;
    const total = item.nbSousDossiers + item.nbNavigations;
    return (
      <button className="ligne-item" onClick={onClick}>
        <span className="ligne-item-accent" style={{ background: "var(--border)" }} />
        <span className="ligne-item-nom">{item.nom}</span>
        <span className="ligne-item-pills">
          <span className="ligne-item-pill">{total} items</span>
        </span>
        <span className="ligne-item-chevron">›</span>
      </button>
    );
  }

  const { item, onClick } = props;
  const couleur = COULEURS_TYPE[item.type];
  const distance = item.trace?.distanceNm;
  const duree = item.trace?.durationSeconds;

  return (
    <button className="ligne-item" onClick={onClick}>
      <span className="ligne-item-accent" style={{ background: couleur }} />
      <span className="ligne-item-nom">{item.nom}</span>
      <span className="ligne-item-pills">
        {item.date && (
          <span className="ligne-item-pill">
            {new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        )}
        {distance != null && (
          <span className="ligne-item-pill">{formaterDistance(distance)}</span>
        )}
        {duree != null && (
          <span className="ligne-item-pill">{formaterDuree(duree)}</span>
        )}
        {item.type === "AVENTURE" && item.nbSousNavs > 0 && (
          <span className="ligne-item-pill">{item.nbSousNavs} navs</span>
        )}
      </span>
    </button>
  );
}
