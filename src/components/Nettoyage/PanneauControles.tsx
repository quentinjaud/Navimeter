"use client";

import { useState } from "react";
import { Save, Trash2, RotateCcw, X, Download, Minimize2 } from "lucide-react";

interface PropsPanneauControles {
  nbExclus: number;
  nbTotal: number;
  nbSelectionnes: number;
  modifie: boolean;
  enSauvegarde: boolean;
  traceId: string;
  onExclureSelection: () => void;
  onInclureSelection: () => void;
  onToutInclure: () => void;
  onEffacerSelection: () => void;
  onSauvegarder: () => void;
  onSimplifier: (toleranceNm: number) => void;
}

/**
 * Convertit la position du slider (0-100) en tolérance RDP en NM.
 * Échelle exponentielle : 0 = pas de simplification, 100 = très agressive.
 * Plage : 0 → 0.0001 NM (~0.2m) à 0.05 NM (~93m)
 */
function sliderVersToleranceNm(valeur: number): number {
  if (valeur === 0) return 0;
  const min = 0.0001; // ~0.2m
  const max = 0.05; // ~93m
  return min * Math.pow(max / min, valeur / 100);
}

function formaterTolerance(toleranceNm: number): string {
  const metres = toleranceNm * 1852;
  if (metres < 1) return `${(metres * 100).toFixed(0)} cm`;
  if (metres < 1000) return `${metres.toFixed(1)} m`;
  return `${(metres / 1000).toFixed(2)} km`;
}

export default function PanneauControles({
  nbExclus,
  nbTotal,
  nbSelectionnes,
  modifie,
  enSauvegarde,
  traceId,
  onExclureSelection,
  onInclureSelection,
  onToutInclure,
  onEffacerSelection,
  onSauvegarder,
  onSimplifier,
}: PropsPanneauControles) {
  const [sliderSimplification, setSliderSimplification] = useState(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valeur = Number(e.target.value);
    setSliderSimplification(valeur);
    onSimplifier(sliderVersToleranceNm(valeur));
  };

  const toleranceNm = sliderVersToleranceNm(sliderSimplification);
  const nbActifs = nbTotal - nbExclus;

  return (
    <div className="nettoyage-controles">
      <div className="nettoyage-controles-section">
        <div className="nettoyage-compteur">
          <span className="nettoyage-compteur-valeur">{nbActifs}</span>
          <span className="nettoyage-compteur-total">/ {nbTotal} pts</span>
        </div>
        <div className="nettoyage-compteur-detail">
          {nbExclus} exclu{nbExclus > 1 ? "s" : ""}
        </div>
      </div>

      {/* Simplification (Minify) */}
      <div className="nettoyage-controles-section">
        <div className="nettoyage-slider-header">
          <Minimize2 style={{ width: 13, height: 13 }} />
          <span className="nettoyage-slider-label">Simplifier</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sliderSimplification}
          onChange={handleSliderChange}
          className="nettoyage-slider"
        />
        {sliderSimplification > 0 && (
          <div className="nettoyage-slider-info">
            Tolérance {formaterTolerance(toleranceNm)}
          </div>
        )}
      </div>

      {nbSelectionnes > 0 && (
        <div className="nettoyage-controles-section">
          <p className="nettoyage-selection-label">
            {nbSelectionnes} sélectionné{nbSelectionnes > 1 ? "s" : ""}
          </p>
          <button
            className="nettoyage-btn nettoyage-btn-danger"
            onClick={onExclureSelection}
          >
            <Trash2 style={{ width: 14, height: 14 }} />
            Exclure
          </button>
          <button
            className="nettoyage-btn nettoyage-btn-secondary"
            onClick={onInclureSelection}
          >
            <RotateCcw style={{ width: 14, height: 14 }} />
            Inclure
          </button>
          <button
            className="nettoyage-btn nettoyage-btn-ghost"
            onClick={onEffacerSelection}
          >
            <X style={{ width: 14, height: 14 }} />
            Désélectionner
          </button>
        </div>
      )}

      <div className="nettoyage-controles-section">
        {nbExclus > 0 && (
          <button
            className="nettoyage-btn nettoyage-btn-secondary"
            onClick={() => {
              setSliderSimplification(0);
              onToutInclure();
            }}
          >
            <RotateCcw style={{ width: 14, height: 14 }} />
            Tout inclure
          </button>
        )}

        <a
          href={`/api/traces/${traceId}/export`}
          className="nettoyage-btn nettoyage-btn-secondary"
          download
        >
          <Download style={{ width: 14, height: 14 }} />
          Exporter GPX
        </a>
      </div>

      <div className="nettoyage-controles-section">
        <button
          className="nettoyage-btn nettoyage-btn-primary"
          onClick={onSauvegarder}
          disabled={!modifie || enSauvegarde}
        >
          <Save style={{ width: 14, height: 14 }} />
          {enSauvegarde ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
