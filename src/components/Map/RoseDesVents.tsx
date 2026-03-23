"use client";

import { Wind, Navigation2 } from "lucide-react";
import type { CelluleMeteoClient, StatsVent } from "@/lib/types";

interface PropsRoseDesVents {
  celluleActive: CelluleMeteoClient | null;
  statsVent: StatsVent;
  ventDeploye?: boolean;
  donneeVentDeployee?: "vent" | "ventDirection";
  onClick: () => void;
}

export default function RoseDesVents({
  celluleActive,
  statsVent,
  ventDeploye,
  donneeVentDeployee,
  onClick,
}: PropsRoseDesVents) {
  const directionDeg =
    celluleActive?.ventDirectionDeg ?? statsVent.directionMoyenneDeg;
  const vitesseKn = celluleActive?.ventVitesseKn ?? statsVent.ventMoyenKn;

  // Mode replie : HUD complet (rose des vents SVG + vitesse)
  if (!ventDeploye) {
    return (
      <button
        className="rose-des-vents"
        onClick={onClick}
        title={`Vent ${Math.round(vitesseKn)} kn — ${Math.round(directionDeg)}° — cliquer pour deployer`}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="30" cy="30" r="26" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <line x1="30" y1="6" x2="30" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="30" y1="46" x2="30" y2="54" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="6" y1="30" x2="14" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="46" y1="30" x2="54" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
          <text x="30" y="8" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.7)" fontFamily="inherit">N</text>
          <text x="30" y="55" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.7)" fontFamily="inherit">S</text>
          <text x="55" y="30" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.7)" fontFamily="inherit">E</text>
          <text x="5" y="30" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="600" fill="rgba(255,255,255,0.7)" fontFamily="inherit">O</text>
          <g transform={`rotate(${directionDeg}, 30, 30)`}>
            <line x1="30" y1="16" x2="30" y2="38" stroke="#F6BC00" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="30,44 25,36 35,36" fill="#F6BC00" />
            <circle cx="30" cy="14" r="2.5" fill="#F6BC00" />
          </g>
          <circle cx="30" cy="30" r="2" fill="rgba(255,255,255,0.5)" />
        </svg>
        <div className="rose-des-vents-vitesse">
          {Math.round(vitesseKn)} <span className="rose-des-vents-unite">kn</span>
        </div>
      </button>
    );
  }

  // Mode deploye : mini-bouton de bascule
  return (
    <button
      className="rose-des-vents rose-des-vents--active"
      onClick={onClick}
      title={donneeVentDeployee === "vent" ? "Basculer vers direction" : "Fermer"}
    >
      {donneeVentDeployee === "vent" ? <Wind size={16} /> : <Navigation2 size={16} />}
    </button>
  );
}
