import type { PointAnalyse } from "../types";
import { haversineNm } from "./distance";

/** Type d'aberration détectée */
export type TypeAberrant = "pic_vitesse" | "saut_gps" | "timestamp_anormal";

/** Détail d'un point aberrant */
export interface DetailAberrant {
  pointIndex: number;
  type: TypeAberrant;
  valeur: number;
  seuil: number;
}

/** Résultat de la détection */
export interface ResultatDetection {
  indexAberrants: Set<number>;
  details: DetailAberrant[];
}

/** Configuration des seuils de détection */
export interface ConfigDetection {
  /** Facteur MAD pour les pics de vitesse (défaut 5) */
  facteurMadVitesse: number;
  /** Distance max entre 2 points consécutifs en NM pour détecter un saut GPS (défaut 0.5) */
  seuilDistanceSautNm: number;
  /** Vitesse absolue max en kn — tout point au-dessus est aberrant (défaut 50) */
  vitesseAbsolueMaxKn: number;
  /** Delta temps minimum entre 2 points en secondes (défaut 0.5) */
  deltaTempsMinSecondes: number;
}

const CONFIG_DEFAUT: ConfigDetection = {
  facteurMadVitesse: 5,
  seuilDistanceSautNm: 0.5,
  vitesseAbsolueMaxKn: 50,
  deltaTempsMinSecondes: 0.5,
};

/** Calcule la médiane d'un tableau de nombres triés */
function mediane(valeurs: number[]): number {
  if (valeurs.length === 0) return 0;
  const triees = [...valeurs].sort((a, b) => a - b);
  const milieu = Math.floor(triees.length / 2);
  if (triees.length % 2 === 0) {
    return (triees[milieu - 1] + triees[milieu]) / 2;
  }
  return triees[milieu];
}

/**
 * Détecte les timestamps anormaux :
 * - timestamps dupliqués ou quasi-dupliqués (delta < seuil)
 * - timestamps qui reculent dans le temps
 * Ces anomalies produisent des vitesses calculées aberrantes (division par ~0).
 */
function detecterTimestampsAnormaux(
  points: PointAnalyse[],
  deltaMinSecondes: number
): DetailAberrant[] {
  const aberrants: DetailAberrant[] = [];

  for (let i = 1; i < points.length; i++) {
    const tPrec = points[i - 1].timestamp;
    const tCour = points[i].timestamp;
    if (!tPrec || !tCour) continue;

    const deltaMs = tCour.getTime() - tPrec.getTime();
    const deltaSecondes = deltaMs / 1000;

    // Timestamp qui recule ou delta trop petit
    if (deltaSecondes < deltaMinSecondes) {
      aberrants.push({
        pointIndex: i,
        type: "timestamp_anormal",
        valeur: deltaSecondes,
        seuil: deltaMinSecondes,
      });
    }
  }

  return aberrants;
}

/**
 * Détecte les pics de vitesse via Median Absolute Deviation (MAD)
 * + seuil absolu comme filet de sécurité.
 */
function detecterPicsVitesse(
  points: PointAnalyse[],
  facteurMad: number,
  vitesseAbsolueMax: number
): DetailAberrant[] {
  const vitesses = points
    .map((p, i) => ({ vitesse: p.speedKn, index: i }))
    .filter((v) => v.vitesse !== null && v.vitesse > 0) as {
    vitesse: number;
    index: number;
  }[];

  if (vitesses.length < 5) return [];

  const valeursVitesse = vitesses.map((v) => v.vitesse);
  const med = mediane(valeursVitesse);

  // MAD = médiane des |xi - médiane|
  const deviations = valeursVitesse.map((v) => Math.abs(v - med));
  const mad = mediane(deviations);

  // Si MAD est trop petit (trace très régulière), utiliser un minimum
  const madEffectif = Math.max(mad, 0.5);
  const seuilMad = med + facteurMad * madEffectif;

  const aberrants: DetailAberrant[] = [];
  for (const { vitesse, index } of vitesses) {
    // Seuil absolu (filet de sécurité) OU seuil statistique MAD
    if (vitesse > vitesseAbsolueMax) {
      aberrants.push({
        pointIndex: index,
        type: "pic_vitesse",
        valeur: vitesse,
        seuil: vitesseAbsolueMax,
      });
    } else if (vitesse > seuilMad) {
      aberrants.push({
        pointIndex: index,
        type: "pic_vitesse",
        valeur: vitesse,
        seuil: seuilMad,
      });
    }
  }
  return aberrants;
}

/**
 * Détecte les sauts GPS : points qui se téléportent puis reviennent.
 * Analyse les triplets de points consécutifs.
 */
function detecterSautsGps(
  points: PointAnalyse[],
  seuilDistanceNm: number
): DetailAberrant[] {
  if (points.length < 3) return [];

  // Pré-calculer les distances entre points consécutifs
  const distances: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    distances.push(
      haversineNm(
        points[i - 1].lat,
        points[i - 1].lon,
        points[i].lat,
        points[i].lon
      )
    );
  }

  // Calculer la distance moyenne locale (fenêtre glissante)
  const aberrants: DetailAberrant[] = [];
  const tailleFenetre = 10;

  for (let i = 1; i < points.length - 1; i++) {
    const distAvant = distances[i];
    const distApres = distances[i + 1];

    // Téléportation simple : distance trop grande en un seul intervalle
    if (distAvant > seuilDistanceNm) {
      // Vérifier si le point "revient" (saut aller-retour)
      const distDirecte = haversineNm(
        points[i - 1].lat,
        points[i - 1].lon,
        points[i + 1].lat,
        points[i + 1].lon
      );

      // Si la distance directe (i-1 → i+1) est bien plus petite
      // que le détour (i-1 → i → i+1), c'est un saut GPS
      if (distDirecte < (distAvant + distApres) * 0.5) {
        aberrants.push({
          pointIndex: i,
          type: "saut_gps",
          valeur: distAvant,
          seuil: seuilDistanceNm,
        });
        continue;
      }
    }

    // Détection par ratio avec la moyenne locale
    const debut = Math.max(1, i - tailleFenetre);
    const fin = Math.min(points.length - 1, i + tailleFenetre);
    let sommeLocale = 0;
    let compteurLocal = 0;
    for (let j = debut; j <= fin; j++) {
      if (j !== i) {
        sommeLocale += distances[j];
        compteurLocal++;
      }
    }
    const moyenneLocale = compteurLocal > 0 ? sommeLocale / compteurLocal : 0;

    if (moyenneLocale > 0 && distAvant > 5 * moyenneLocale) {
      const distDirecte = haversineNm(
        points[i - 1].lat,
        points[i - 1].lon,
        points[i + 1].lat,
        points[i + 1].lon
      );
      if (distDirecte < (distAvant + distApres) * 0.5) {
        aberrants.push({
          pointIndex: i,
          type: "saut_gps",
          valeur: distAvant,
          seuil: moyenneLocale * 5,
        });
      }
    }
  }

  return aberrants;
}

/**
 * Détecte tous les points aberrants d'une trace.
 * Combine : timestamps anormaux + pics de vitesse (MAD + absolu) + sauts GPS.
 * Complexité O(n), < 50ms pour 50 000 points.
 */
export function detecterAberrants(
  points: PointAnalyse[],
  config: Partial<ConfigDetection> = {}
): ResultatDetection {
  const cfg = { ...CONFIG_DEFAUT, ...config };

  const timestampsAnormaux = detecterTimestampsAnormaux(points, cfg.deltaTempsMinSecondes);
  const picsVitesse = detecterPicsVitesse(points, cfg.facteurMadVitesse, cfg.vitesseAbsolueMaxKn);
  const sautsGps = detecterSautsGps(points, cfg.seuilDistanceSautNm);

  const details = [...timestampsAnormaux, ...picsVitesse, ...sautsGps];
  const indexAberrants = new Set(details.map((d) => d.pointIndex));

  return { indexAberrants, details };
}
