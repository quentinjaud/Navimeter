"use client";

import { Gauge, Compass } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { PointCarte, DonneeGraphee, CelluleMeteoClient } from "@/lib/types";
import { calculerTWA, bordTWA } from "@/lib/geo/twa";

interface PropsPanneauPointActif {
  pointActif: PointCarte;
  donneeGraphee: DonneeGraphee;
  onChangeDonneeGraphee: (d: DonneeGraphee) => void;
  capDisponible: boolean;
  celluleActive: CelluleMeteoClient | null;
}

/** Convertit des degres decimaux en degres, minutes, milliemes */
function formaterCoordonnee(decimal: number, positif: string, negatif: string): string {
  const signe = decimal >= 0 ? positif : negatif;
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minDecimal = (abs - deg) * 60;
  const min = Math.floor(minDecimal);
  const milliemes = Math.round((minDecimal - min) * 1000);
  return `${deg}°${String(min).padStart(2, "0")}'${String(milliemes).padStart(3, "0")}${signe}`;
}

export default function PanneauPointActif({
  pointActif,
  donneeGraphee,
  onChangeDonneeGraphee,
  capDisponible,
  celluleActive,
}: PropsPanneauPointActif) {
  const lat = formaterCoordonnee(pointActif.lat, "N", "S");
  const lon = formaterCoordonnee(pointActif.lon, "E", "W");

  const dateHeure = pointActif.timestamp
    ? format(new Date(pointActif.timestamp), "dd MMM yyyy  HH:mm:ss", { locale: fr })
    : null;

  return (
    <div className="point-actif-pills">
      {/* Position GPS */}
      <span className="point-actif-pill">{lat} {lon}</span>

      {/* Date/heure */}
      {dateHeure && <span className="point-actif-pill">{dateHeure}</span>}

      {/* Vitesse — cliquable pour switch */}
      <button
        className={`point-actif-pill point-actif-pill-donnee ${donneeGraphee === "vitesse" ? "point-actif-pill-active" : ""}`}
        onClick={() => onChangeDonneeGraphee("vitesse")}
        disabled={donneeGraphee === "vitesse"}
      >
        <Gauge className="point-actif-pill-icon" />
        {pointActif.speedKn != null ? pointActif.speedKn.toFixed(1) : "—"} kn
      </button>

      {/* Cap — cliquable pour switch */}
      <button
        className={`point-actif-pill point-actif-pill-donnee ${donneeGraphee === "cap" ? "point-actif-pill-active" : ""}`}
        onClick={() => onChangeDonneeGraphee("cap")}
        disabled={donneeGraphee === "cap" || !capDisponible}
        title={!capDisponible ? "Pas de donnees de cap" : undefined}
      >
        <Compass className="point-actif-pill-icon" />
        {pointActif.headingDeg != null ? `${Math.round(pointActif.headingDeg)}°` : "—"}
      </button>

      {/* TWA — visible seulement si cap + vent dispo */}
      {capDisponible && celluleActive && (
        <button
          className={`point-actif-pill point-actif-pill-donnee ${donneeGraphee === "twa" ? "point-actif-pill-active" : ""}`}
          onClick={() => onChangeDonneeGraphee("twa")}
          disabled={donneeGraphee === "twa"}
        >
          <svg className="point-actif-pill-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <mask id="twa-a" maskUnits="userSpaceOnUse" x="0" y="7" width="24" height="14" fill="#000"><path fill="#fff" d="M0 7h24v14H0z"/><path d="M21 19c.552 0 1.005-.449.95-.998a10 10 0 0 0-19.9 0c-.055.55.398.998.95.998.552 0 .994-.45 1.062-.997a8 8 0 0 1 15.876 0c.069.547.51.997 1.062.997Z"/></mask>
            <mask id="twa-b"><path fill="#fff" d="M0 0h24v24H0z"/><path d="M11.62 16.557 6.566 10.66A.4.4 0 0 1 6.87 10h10.26a.4.4 0 0 1 .304.66l-5.054 5.897a.5.5 0 0 1-.76 0Z" fill="#000"/><path d="M21 19c.552 0 1.005-.449.95-.998a10 10 0 0 0-19.9 0c-.055.55.398.998.95.998.552 0 .994-.45 1.062-.997a8 8 0 0 1 15.876 0c.069.547.51.997 1.062.997Z" stroke="#000" strokeWidth="4" mask="url(#twa-a)"/></mask>
            <g mask="url(#twa-b)"><path fillRule="evenodd" clipRule="evenodd" d="M11.49 1.809a.5.5 0 0 1 .879-.008l1.517 2.726a19.999 19.999 0 0 1 2.358 7.151l.295 2.278c.305 2.346.19 4.729-.337 7.035l-.098.43a2 2 0 0 1-1.941 1.553l-4.31.019a2 2 0 0 1-1.959-1.556l-.104-.458a20 20 0 0 1-.331-7.01l.32-2.469a20 20 0 0 1 2.193-6.847L11.49 1.81Z" fill="currentColor"/></g>
            <path d="M21 19c.552 0 1.005-.449.95-.998a10 10 0 0 0-19.9 0c-.055.55.398.998.95.998.552 0 .994-.45 1.062-.997a8 8 0 0 1 15.876 0c.069.547.51.997 1.062.997Z" fill="currentColor"/>
            <path d="m11.52 13.36-2.04-2.72A.4.4 0 0 1 9.8 10h4.4a.4.4 0 0 1 .32.64l-2.04 2.72a.6.6 0 0 1-.96 0Z" fill="currentColor"/>
          </svg>
          {(() => {
            if (pointActif.headingDeg == null) return "—";
            const twa = calculerTWA(pointActif.headingDeg, celluleActive.ventDirectionDeg);
            return `${Math.abs(Math.round(twa))}° ${bordTWA(twa)}`;
          })()}
        </button>
      )}
    </div>
  );
}
