"use client";

import type { ResumeNavigation, ResumeDossier } from "@/lib/types";

type PropsLigneItem =
  | { type: "navigation"; item: ResumeNavigation; actif?: boolean; onClick: () => void }
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

  const { item, actif, onClick } = props;
  const couleur = COULEURS_TYPE[item.type];

  return (
    <button className={`ligne-item ${actif ? "ligne-item-actif" : ""}`} onClick={onClick}>
      <span className="ligne-item-accent" style={{ background: couleur }} />
      <span className="ligne-item-nom">{item.nom}</span>
      {item.type === "AVENTURE" && item.nbSousNavs > 0 && (
        <span className="ligne-item-chevron">›</span>
      )}
    </button>
  );
}
