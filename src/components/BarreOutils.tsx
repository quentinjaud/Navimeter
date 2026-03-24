"use client";

import type { ReactNode } from "react";

export interface ActionOutil {
  /** Cle unique */
  id: string;
  /** Icone (composant React, ex: Lucide) */
  icone: ReactNode;
  /** Label pour l'accessibilite et le title */
  label: string;
  /** Handler au clic */
  onClick: () => void;
  /** Etat actif (pour toggle) */
  actif?: boolean;
  /** Masquer cette action */
  masque?: boolean;
}

interface PropsBarreOutils {
  actions: ActionOutil[];
  /** Element toggle a gauche de la barre (ex: switch Journal/Perf) */
  toggle?: ReactNode;
}

export default function BarreOutils({ actions, toggle }: PropsBarreOutils) {
  const actionsVisibles = actions.filter((a) => !a.masque);

  if (!toggle && actionsVisibles.length === 0) return null;

  return (
    <div className="barre-outils">
      {toggle}
      {actionsVisibles.map((action) => (
        <button
          key={action.id}
          className={`barre-outils-btn${action.actif ? " actif" : ""}`}
          onClick={action.onClick}
          title={action.label}
          aria-label={action.label}
        >
          {action.icone}
        </button>
      ))}
    </div>
  );
}
