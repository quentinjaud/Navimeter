"use client";

import { Anchor, ArrowUpDown, Clock, Gauge, Loader2, Navigation, Wind } from "lucide-react";
import { useState } from "react";
import { formaterDuree } from "@/lib/utilitaires";
import type { CelluleMeteoClient, StatsVent } from "@/lib/types";

interface PropsPanneauStats {
  distanceNm: number | null;
  durationSeconds: number | null;
  avgSpeedKn: number | null;
  maxSpeedKn: number | null;
  traceId?: string;
  statsVent?: StatsVent | null;
  traceTimestamps?: boolean;
  traceTropRecente?: boolean;
  onMeteoChargee?: (data: { statsVent: StatsVent; cellules: CelluleMeteoClient[] }) => void;
  onMeteoSupprimee?: () => void;
}

function LigneStat({
  icon: Icone,
  etiquette,
  valeur,
  unite,
}: {
  icon: React.ElementType;
  etiquette: string;
  valeur: string;
  unite: string;
}) {
  return (
    <div className="stat-ligne">
      <div className="stat-ligne-label">
        <Icone className="stat-ligne-icon" />
        <span>{etiquette}</span>
      </div>
      <span className="stat-ligne-valeur">
        {valeur}
        <span className="stat-ligne-unite">{unite}</span>
      </span>
    </div>
  );
}

function directionCardinale(deg: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

export default function PanneauStats({
  distanceNm,
  durationSeconds,
  avgSpeedKn,
  maxSpeedKn,
  traceId,
  statsVent,
  traceTimestamps,
  traceTropRecente,
  onMeteoChargee,
  onMeteoSupprimee,
}: PropsPanneauStats) {
  const [etat, setEtat] = useState<"idle" | "chargement" | "erreur">("idle");
  const [messageErreur, setMessageErreur] = useState<string | null>(null);

  async function enrichirMeteo() {
    if (!traceId) return;
    setEtat("chargement");
    setMessageErreur(null);
    try {
      const reponse = await fetch(`/api/traces/${traceId}/meteo`, {
        method: "POST",
      });
      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => ({}));
        throw new Error(corps?.error ?? `Erreur ${reponse.status}`);
      }
      const donnees = await reponse.json();
      setEtat("idle");
      onMeteoChargee?.(donnees);
    } catch (err) {
      setEtat("erreur");
      setMessageErreur(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  async function supprimerMeteo() {
    if (!traceId) return;
    try {
      const reponse = await fetch(`/api/traces/${traceId}/meteo`, {
        method: "DELETE",
      });
      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => ({}));
        throw new Error(corps?.error ?? `Erreur ${reponse.status}`);
      }
      onMeteoSupprimee?.();
    } catch {
      // suppression silencieuse
    }
  }

  return (
    <div className="panneau-stats-compact">
      <LigneStat
        icon={Anchor}
        etiquette="Distance"
        valeur={distanceNm?.toFixed(2) ?? "—"}
        unite="NM"
      />
      <LigneStat
        icon={Clock}
        etiquette="Duree"
        valeur={durationSeconds ? formaterDuree(durationSeconds) : "—"}
        unite=""
      />
      <LigneStat
        icon={Gauge}
        etiquette="V. moy."
        valeur={avgSpeedKn?.toFixed(1) ?? "—"}
        unite="kn"
      />
      <LigneStat
        icon={Navigation}
        etiquette="V. max"
        valeur={maxSpeedKn?.toFixed(1) ?? "—"}
        unite="kn"
      />

      {statsVent ? (
        <div className="stats-vent-bloc">
          <div className="stats-vent-separateur" />
          <LigneStat
            icon={Wind}
            etiquette="Vent moy."
            valeur={statsVent.ventMoyenKn.toFixed(1)}
            unite="kn"
          />
          <LigneStat
            icon={Wind}
            etiquette="Rafales"
            valeur={statsVent.rafalesMaxKn.toFixed(1)}
            unite="kn"
          />
          <LigneStat
            icon={Navigation}
            etiquette="Direction"
            valeur={`${statsVent.directionMoyenneDeg}° ${directionCardinale(statsVent.directionMoyenneDeg)}`}
            unite=""
          />
          <LigneStat
            icon={ArrowUpDown}
            etiquette="Var. dir."
            valeur={`±${statsVent.variationDirectionDeg.toFixed(0)}`}
            unite="°"
          />
          <div className="stats-vent-source">
            <span>Open-Meteo archive · 25km/1h</span>
            <button
              className="stats-vent-supprimer"
              onClick={supprimerMeteo}
              type="button"
            >
              Supprimer meteo
            </button>
          </div>
        </div>
      ) : (
        <div className="stats-meteo-enrichir">
          {traceTimestamps === false ? (
            <button
              className="stats-enrichir-btn stats-enrichir-btn--desactive"
              disabled
              type="button"
            >
              <Wind size={13} />
              Timestamps requis
            </button>
          ) : traceTropRecente === true ? (
            <button
              className="stats-enrichir-btn stats-enrichir-btn--desactive"
              disabled
              type="button"
            >
              <Wind size={13} />
              Disponible apres 7 jours
            </button>
          ) : etat === "chargement" ? (
            <button
              className="stats-enrichir-btn stats-enrichir-btn--chargement"
              disabled
              type="button"
            >
              <Loader2 size={13} className="stats-enrichir-spinner" />
              Chargement…
            </button>
          ) : (
            <>
              <button
                className="stats-enrichir-btn"
                onClick={enrichirMeteo}
                type="button"
              >
                <Wind size={13} />
                Enrichir meteo
              </button>
              {etat === "erreur" && messageErreur && (
                <span className="stats-enrichir-erreur">{messageErreur}</span>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
