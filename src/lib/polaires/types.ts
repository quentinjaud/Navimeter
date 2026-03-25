export interface DonneesPolaire {
  tws: number[];
  twa: number[];
  speeds: number[][]; // speeds[twaIdx][twsIdx]
}

export interface PolaireReference extends DonneesPolaire {
  nom: string;
}

export interface EtatEditeur {
  tws: number[];
  twa: number[];
  speeds: number[][];
  nom: string;
  dirty: boolean;
  visibleTWS: Set<number>;
  montrerApparent: boolean;
  ref: PolaireReference | null;
  modeRef: 'absolu' | 'delta';
  avertissements: string[];
}

export type ActionEditeur =
  | { type: 'CHARGER'; donnees: DonneesPolaire; nom: string }
  | { type: 'MODIFIER_VITESSE'; ri: number; ci: number; valeur: number }
  | { type: 'AJOUTER_TWA'; angle: number }
  | { type: 'AJOUTER_TWS'; vitesse: number }
  | { type: 'SUPPRIMER_TWA'; ri: number }
  | { type: 'SUPPRIMER_TWS'; ci: number }
  | { type: 'TOGGLE_TWS'; ci: number }
  | { type: 'TOUT_TWS' }
  | { type: 'AUCUN_TWS' }
  | { type: 'TOGGLE_APPARENT' }
  | { type: 'CHARGER_REF'; ref: PolaireReference }
  | { type: 'EFFACER_REF' }
  | { type: 'MODE_REF'; mode: 'absolu' | 'delta' }
  | { type: 'SET_AVERTISSEMENTS'; liste: string[] };

export interface PointCourbe {
  x: number;
  y: number;
  twa: number;
  bs: number;
  awa?: number;
  aws?: number;
}
