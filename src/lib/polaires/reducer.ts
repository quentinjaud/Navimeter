import type { EtatEditeur, ActionEditeur } from './types';
import { trierDonnees } from './parseur-pol';
import { DONNEES_SUNLIGHT30 } from './constantes';

export function creerEtatInitial(): EtatEditeur {
  const d = DONNEES_SUNLIGHT30;
  return {
    tws: [...d.tws],
    twa: [...d.twa],
    speeds: d.speeds.map(r => [...r]),
    nom: 'Sunlight 30',
    dirty: false,
    visibleTWS: new Set(d.tws.map((_, i) => i).filter(i => d.tws[i] > 0)),
    montrerApparent: false,
    ref: null,
    modeRef: 'absolu',
    avertissements: [],
  };
}

export function reducerEditeur(state: EtatEditeur, action: ActionEditeur): EtatEditeur {
  switch (action.type) {
    case 'CHARGER': {
      const visibleTWS = new Set(action.donnees.tws.map((_, i) => i).filter(i => action.donnees.tws[i] > 0));
      return {
        ...state,
        tws: action.donnees.tws,
        twa: action.donnees.twa,
        speeds: action.donnees.speeds,
        nom: action.nom,
        dirty: false,
        visibleTWS,
        avertissements: [],
      };
    }

    case 'MODIFIER_VITESSE': {
      const speeds = state.speeds.map(r => [...r]);
      speeds[action.ri][action.ci] = action.valeur;
      return { ...state, speeds, dirty: true };
    }

    case 'AJOUTER_TWA': {
      if (state.twa.includes(action.angle)) return state;
      const twa = [...state.twa, action.angle];
      const speeds = [...state.speeds.map(r => [...r]), new Array(state.tws.length).fill(0)];
      const tri = trierDonnees({ tws: [...state.tws], twa, speeds });
      return {
        ...state,
        twa: tri.twa,
        speeds: tri.speeds,
        dirty: true,
      };
    }

    case 'AJOUTER_TWS': {
      if (state.tws.includes(action.vitesse)) return state;
      const tws = [...state.tws, action.vitesse];
      const speeds = state.speeds.map(r => [...r, 0]);
      const tri = trierDonnees({ tws, twa: [...state.twa], speeds });
      const visibleTWS = new Set(tri.tws.map((_, i) => i).filter(i => tri.tws[i] > 0));
      return { ...state, tws: tri.tws, twa: tri.twa, speeds: tri.speeds, dirty: true, visibleTWS };
    }

    case 'SUPPRIMER_TWA': {
      if (state.twa[action.ri] === 0) return state;
      const twa = state.twa.filter((_, i) => i !== action.ri);
      const speeds = state.speeds.filter((_, i) => i !== action.ri);
      return { ...state, twa, speeds, dirty: true };
    }

    case 'SUPPRIMER_TWS': {
      if (state.tws[action.ci] === 0) return state;
      const tws = state.tws.filter((_, i) => i !== action.ci);
      const speeds = state.speeds.map(r => r.filter((_, i) => i !== action.ci));
      const visibleTWS = new Set<number>();
      state.visibleTWS.forEach(oldIdx => {
        if (oldIdx === action.ci) return;
        const newIdx = oldIdx > action.ci ? oldIdx - 1 : oldIdx;
        if (tws[newIdx] > 0) visibleTWS.add(newIdx);
      });
      return { ...state, tws, speeds, dirty: true, visibleTWS };
    }

    case 'TOGGLE_TWS': {
      const visibleTWS = new Set(state.visibleTWS);
      if (visibleTWS.has(action.ci)) visibleTWS.delete(action.ci);
      else visibleTWS.add(action.ci);
      return { ...state, visibleTWS };
    }

    case 'TOUT_TWS': {
      const visibleTWS = new Set(state.tws.map((_, i) => i).filter(i => state.tws[i] > 0));
      return { ...state, visibleTWS };
    }

    case 'AUCUN_TWS':
      return { ...state, visibleTWS: new Set() };

    case 'TOGGLE_APPARENT':
      return { ...state, montrerApparent: !state.montrerApparent };

    case 'CHARGER_REF':
      return { ...state, ref: action.ref };

    case 'EFFACER_REF':
      return { ...state, ref: null };

    case 'MODE_REF':
      return { ...state, modeRef: action.mode };

    case 'SET_AVERTISSEMENTS':
      return { ...state, avertissements: action.liste };

    default:
      return state;
  }
}
