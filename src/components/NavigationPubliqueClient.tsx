"use client";

import { useMemo } from "react";
import TraceMapWrapper from "@/components/Map/TraceMapWrapper";
import TraceChart from "@/components/Stats/TraceChart";
import PanneauStats from "@/components/Stats/PanneauStats";
import PanneauPointActif from "@/components/Stats/PanneauPointActif";
import GraphiqueRedimensionnable from "@/components/Stats/GraphiqueRedimensionnable";
import type { PointCarte } from "@/lib/types";
import { useEtatVue, HAUTEUR_GRAPHIQUE_INITIALE } from "@/lib/hooks/useEtatVue";
import type { EntreeJournalClient } from "@/components/Journal/TimelineJournal";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MapPin } from "lucide-react";

const ACCENT_PAR_TYPE: Record<string, string> = {
  SOLO: "var(--accent)",
  AVENTURE: "var(--accent-aventure)",
  REGATE: "var(--accent-yellow)",
};

const LABEL_TYPE: Record<string, string> = {
  SOLO: "Solo",
  AVENTURE: "Aventure",
  REGATE: "Regate",
};

interface PropsNavigationPublique {
  nom: string;
  date: string;
  type: string;
  bateau: { id: string; nom: string } | null;
  points: PointCarte[];
  maxSpeed: number;
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
  entrees: EntreeJournalClient[];
}

export default function NavigationPubliqueClient({
  nom,
  date,
  type,
  bateau,
  points,
  maxSpeed,
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
  entrees,
}: PropsNavigationPublique) {
  const {
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
  } = useEtatVue(points);

  return (
    <div
      className="trace-vue-layout"
      style={{
        "--hauteur-graphique": `${paddingBas}px`,
        "--accent-nav": ACCENT_PAR_TYPE[type] ?? "var(--accent)",
      } as React.CSSProperties}
    >
      {/* Zone A — stats read-only */}
      <div className="trace-vue-stats-wrapper">
        <div className="trace-vue-stats">
          <div className="navigation-meta">
            <div className="navigation-nom-ligne">
              <h2 className="navigation-nom">{nom}</h2>
              <span className="navigation-badge-type">{LABEL_TYPE[type] ?? type}</span>
            </div>
            <div className="navigation-meta-details">
              <span>{date ? format(new Date(date), "dd/MM/yyyy", { locale: fr }) : "—"}</span>
              {bateau && <span style={{ color: "var(--accent-nav)" }}>{bateau.nom}</span>}
            </div>
          </div>
          <PanneauStats
            distanceNm={distanceNm}
            durationSeconds={durationSeconds}
            avgSpeedKn={avgSpeedKn}
            maxSpeedKn={maxSpeedKn}
          />
        </div>
      </div>

      {/* Zone B — point actif */}
      {pointActif && (
        <div className="trace-vue-point-actif">
          <PanneauPointActif
            pointActif={pointActif}
            donneeGraphee={donneeGraphee}
            onChangeDonneeGraphee={setDonneeGraphee}
            capDisponible={capDisponible}
            celluleActive={null}
          />
        </div>
      )}

      {/* Carte */}
      <div className="trace-vue-carte">
        <TraceMapWrapper
          points={points}
          maxSpeed={maxSpeed}
          paddingBottom={paddingBas}
          pointActifIndex={pointActifIndex}
          pointFixeIndex={pointFixeIndex}
          onHoverPoint={handleHoverPoint}
          onClickPoint={handleClickPoint}
        />
      </div>

      {/* Zone C — graphique read-only */}
      <div className="trace-vue-graphique">
        <GraphiqueRedimensionnable
          hauteurInitiale={HAUTEUR_GRAPHIQUE_INITIALE}
          hauteurMin={80}
          hauteurMax={450}
          onHauteurChange={handleHauteurChange}
        >
          <TraceChart
            points={points}
            donnee={donneeGraphee}
            pointActifIndex={pointActifIndex}
            pointFixeIndex={pointFixeIndex}
            onHoverPoint={handleHoverPoint}
            onClickPoint={handleClickPoint}
          />
        </GraphiqueRedimensionnable>
      </div>

      {/* Entrees journal en bas a droite si presentes */}
      {entrees.length > 0 && (
        <div className="partage-journal">
          <h4 className="partage-journal-titre">Journal de bord</h4>
          {entrees.map((e) => (
            <div key={e.id} className="partage-journal-entree">
              <span className="partage-journal-heure">
                {format(new Date(e.timestamp), "HH:mm", { locale: fr })}
              </span>
              <p className="partage-journal-texte">{e.texte}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer discret */}
      <div className="partage-footer">
        Navigue avec <a href="/" className="partage-footer-lien">Sillage</a>
      </div>
    </div>
  );
}
