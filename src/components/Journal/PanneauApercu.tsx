"use client";

import { useMemo } from "react";
import ApercuTrace from "./ApercuTrace";
import { formaterDuree } from "@/lib/utilitaires";
import type { ResumeNavigation } from "@/lib/types";

interface PropsPanneauNavigation {
  type: "navigation";
  element: ResumeNavigation;
}

type PropsPanneauApercu = PropsPanneauNavigation | { type: null };

export default function PanneauApercu(props: PropsPanneauApercu) {
  if (props.type === null) {
    return <aside className="panneau-apercu panneau-apercu-vide" />;
  }
  return <ApercuNavigation navigation={props.element} />;
}

function ApercuNavigation({ navigation }: { navigation: ResumeNavigation }) {
  const polylines = useMemo(() => {
    if (!navigation.trace?.polylineSimplifiee) return [];
    return [navigation.trace.polylineSimplifiee];
  }, [navigation.trace?.polylineSimplifiee]);

  const dateFormatee = new Date(navigation.date).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });

  const typeLabel = {
    SOLO: "Solo",
    AVENTURE: "Aventure",
    REGATE: "Regate",
  }[navigation.type] ?? navigation.type;

  return (
    <aside className="panneau-apercu">
      {polylines.length > 0 ? (
        <ApercuTrace polylines={polylines} largeur={260} hauteur={180} />
      ) : (
        <div className="panneau-apercu-no-trace">Aucune trace</div>
      )}
      <div className="panneau-apercu-infos">
        <h3 className="panneau-apercu-titre">{navigation.nom}</h3>
        <dl className="panneau-apercu-stats">
          <div className="panneau-apercu-stat">
            <dt>Depart</dt>
            <dd>{dateFormatee}</dd>
          </div>
          {navigation.trace?.distanceNm != null && (
            <div className="panneau-apercu-stat">
              <dt>Distance</dt>
              <dd>{navigation.trace.distanceNm.toFixed(1)} NM</dd>
            </div>
          )}
          {navigation.trace?.durationSeconds != null && (
            <div className="panneau-apercu-stat">
              <dt>Temps sur l&apos;eau</dt>
              <dd>{formaterDuree(navigation.trace.durationSeconds)}</dd>
            </div>
          )}
          {navigation.trace?.bateau && (
            <div className="panneau-apercu-stat">
              <dt>Bateau</dt>
              <dd>{navigation.trace.bateau.nom}</dd>
            </div>
          )}
          <div className="panneau-apercu-stat">
            <dt>Type</dt>
            <dd>{typeLabel}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
