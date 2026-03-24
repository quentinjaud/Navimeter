"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResumeDossier, ResumeNavigation, ContenuDossier } from "@/lib/types";
import LigneItem from "./LigneItem";

interface PropsPanneauContenu {
  dossierId: string;
  nomDossier: string;
  onFermer: () => void;
  onClicNavigation: (nav: ResumeNavigation) => void;
  onOuvrir: (navId: string) => void;
  onCreerNav: (dossierId: string) => void;
  onCreerSousDossier: (parentId: string) => void;
}

interface NiveauBreadcrumb {
  id: string;
  nom: string;
}

export default function PanneauContenu({
  dossierId, nomDossier, onFermer, onClicNavigation, onOuvrir,
  onCreerNav, onCreerSousDossier,
}: PropsPanneauContenu) {
  const [pile, setPile] = useState<NiveauBreadcrumb[]>([{ id: dossierId, nom: nomDossier }]);
  const [contenu, setContenu] = useState<ContenuDossier | null>(null);
  const [chargement, setChargement] = useState(true);
  const [navActive, setNavActive] = useState<string | null>(null);

  const niveauActuel = pile[pile.length - 1];

  const charger = useCallback(async (id: string) => {
    setChargement(true);
    try {
      const res = await fetch(`/api/journal/dossiers/${id}/contenu`);
      if (res.ok) setContenu(await res.json());
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(niveauActuel.id); }, [niveauActuel.id, charger]);

  useEffect(() => {
    setPile([{ id: dossierId, nom: nomDossier }]);
    setNavActive(null);
  }, [dossierId, nomDossier]);

  const descendreDans = (sousDossier: ResumeDossier) => {
    setPile((prev) => [...prev, { id: sousDossier.id, nom: sousDossier.nom }]);
    setNavActive(null);
  };

  const remonterA = (index: number) => {
    if (index === -1) { onFermer(); return; }
    setPile((prev) => prev.slice(0, index + 1));
    setNavActive(null);
  };

  const gererClicNav = (nav: ResumeNavigation) => {
    setNavActive(nav.id);
    onClicNavigation(nav);
  };

  return (
    <div className="panneau-contenu">
      <div className="panneau-contenu-header">
        <div className="panneau-contenu-breadcrumb">
          <button className="panneau-contenu-breadcrumb-item" onClick={() => remonterA(-1)}>Accueil</button>
          {pile.map((niveau, i) => (
            <span key={niveau.id}>
              <span className="panneau-contenu-breadcrumb-sep"> › </span>
              {i < pile.length - 1 ? (
                <button className="panneau-contenu-breadcrumb-item" onClick={() => remonterA(i)}>{niveau.nom}</button>
              ) : (
                <span className="panneau-contenu-breadcrumb-actuel">{niveau.nom}</span>
              )}
            </span>
          ))}
        </div>
        <button className="panneau-contenu-fermer" onClick={onFermer}>✕</button>
      </div>

      <div className="panneau-contenu-liste">
        {chargement ? (
          <div className="panneau-contenu-chargement">Chargement...</div>
        ) : contenu ? (
          <>
            {contenu.sousDossiers.map((sd) => (
              <LigneItem key={sd.id} type="sousDossier" item={sd} onClick={() => descendreDans(sd)} />
            ))}
            {contenu.navigations.map((nav) => (
              <LigneItem key={nav.id} type="navigation" item={nav} onClick={() => gererClicNav(nav)} />
            ))}
            {contenu.sousDossiers.length === 0 && contenu.navigations.length === 0 && (
              <div className="panneau-contenu-vide">Aucun contenu</div>
            )}
          </>
        ) : null}
      </div>

      <div className="panneau-contenu-footer">
        {navActive && (
          <button className="btn-principal" onClick={() => onOuvrir(navActive)}>Ouvrir</button>
        )}
        <button className="btn-secondaire" onClick={() => onCreerNav(niveauActuel.id)}>+ Nav</button>
        <button className="btn-secondaire" onClick={() => onCreerSousDossier(niveauActuel.id)}>+ Sous-dossier</button>
      </div>
    </div>
  );
}
