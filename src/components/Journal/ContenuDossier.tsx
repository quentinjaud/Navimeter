"use client";

import type {
  ContenuDossier as ContenuDossierType,
  ResumeNavigation,
} from "@/lib/types";
import CarteNavigation from "./CarteNavigation";

interface PropsContenuDossier {
  contenu: ContenuDossierType;
  dossierId: string;
  onAjouterNavigation: () => void;
  onSurvolNavigation: (nav: ResumeNavigation | null) => void;
  onEditerNavigation: (nav: ResumeNavigation) => void;
  onSupprimerNavigation: (id: string) => void;
}

export default function ContenuDossier({
  contenu,
  dossierId,
  onAjouterNavigation,
  onSurvolNavigation,
  onEditerNavigation,
  onSupprimerNavigation,
}: PropsContenuDossier) {
  const { navigations } = contenu;
  const estVide = navigations.length === 0;

  return (
    <div className="contenu-dossier">
      <div className="contenu-dossier-actions">
        <button
          className="btn-secondaire"
          onClick={() => onAjouterNavigation()}
        >
          + Navigation
        </button>
      </div>

      {estVide ? (
        <div className="contenu-dossier-vide">
          Aucune navigation dans ce dossier
        </div>
      ) : (
        <>
          {navigations.map((nav) => (
            <CarteNavigation
              key={nav.id}
              navigation={nav}
              onSurvol={onSurvolNavigation}
              onEditer={onEditerNavigation}
              onSupprimer={onSupprimerNavigation}
            />
          ))}
        </>
      )}
    </div>
  );
}
