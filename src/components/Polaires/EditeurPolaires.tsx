'use client';

import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { reducerEditeur, creerEtatInitial } from '@/lib/polaires/reducer';
import BarreOutilsPolaires from './BarreOutilsPolaires';
import DiagrammePolaire from './DiagrammePolaire';
import LegendePolaire from './LegendePolaire';
import TableauPolaire from './TableauPolaire';

export default function EditeurPolaires() {
  const [state, dispatch] = useReducer(reducerEditeur, undefined, creerEtatInitial);

  // Avertissement avant fermeture si modifications non sauvegardees
  useEffect(() => {
    if (!state.dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.dirty]);

  // Donnees pour la barre d'outils (export, etc.)
  const donnees = useMemo(
    () => ({ tws: state.tws, twa: state.twa, speeds: state.speeds }),
    [state.tws, state.twa, state.speeds],
  );

  const handleAjouterTWA = useCallback(() => {
    const saisie = prompt('Angle TWA (0–180) :');
    if (saisie === null) return;
    const angle = Number(saisie);
    if (Number.isNaN(angle) || angle < 0 || angle > 180) {
      alert('Angle invalide (0–180)');
      return;
    }
    dispatch({ type: 'AJOUTER_TWA', angle });
  }, []);

  const handleAjouterTWS = useCallback(() => {
    const saisie = prompt('Vitesse TWS (≥ 0) :');
    if (saisie === null) return;
    const vitesse = Number(saisie);
    if (Number.isNaN(vitesse) || vitesse < 0) {
      alert('Vitesse invalide (≥ 0)');
      return;
    }
    dispatch({ type: 'AJOUTER_TWS', vitesse });
  }, []);

  return (
    <>
      <BarreOutilsPolaires
        nom={state.nom}
        refPolaire={state.ref}
        modeRef={state.modeRef}
        avertissements={state.avertissements}
        donnees={donnees}
        dispatch={dispatch}
      />
      <main className="polaires-editeur">
        <section className="polaires-editeur__chart">
          <DiagrammePolaire
            tws={state.tws}
            twa={state.twa}
            speeds={state.speeds}
            visibleTWS={state.visibleTWS}
            montrerApparent={state.montrerApparent}
            ref={state.ref}
          />
          <LegendePolaire
            tws={state.tws}
            visibleTWS={state.visibleTWS}
            montrerApparent={state.montrerApparent}
            refPolaire={state.ref}
            dispatch={dispatch}
          />
        </section>
        <section className="polaires-editeur__table">
          <TableauPolaire
            tws={state.tws}
            twa={state.twa}
            speeds={state.speeds}
            visibleTWS={state.visibleTWS}
            ref_polaire={state.ref}
            modeRef={state.modeRef}
            dispatch={dispatch}
          />
          <div className="polaires-table-actions">
            <button
              className="polaires-btn polaires-btn--small"
              onClick={handleAjouterTWA}
            >
              + Ligne TWA
            </button>
            <button
              className="polaires-btn polaires-btn--small"
              onClick={handleAjouterTWS}
            >
              + Colonne TWS
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
