/**
 * Points de snap predefinies sur la cote bretonne sud (zoom 9).
 * Chaque point represente un port ou un dossier peut se placer.
 */
export interface PointSnap {
  lat: number;
  lon: number;
  nom: string;
}

export const POINTS_SNAP: PointSnap[] = [
  { lat: 47.87, lon: -3.92, nom: "Concarneau" },
  { lat: 47.72, lon: -3.44, nom: "Lorient" },
  { lat: 47.66, lon: -2.76, nom: "Vannes" },
  { lat: 47.35, lon: -3.15, nom: "Belle-Ile" },
  { lat: 47.84, lon: -4.34, nom: "Douarnenez" },
  { lat: 48.38, lon: -4.49, nom: "Brest" },
  { lat: 47.50, lon: -2.75, nom: "Le Crouesty" },
  { lat: 47.73, lon: -3.98, nom: "Glenan" },
  { lat: 47.63, lon: -3.35, nom: "Groix" },
  { lat: 47.28, lon: -2.35, nom: "Le Croisic" },
  { lat: 48.73, lon: -3.99, nom: "Roscoff" },
  { lat: 48.65, lon: -2.76, nom: "Saint-Malo" },
];

/** Centre de la vue initiale — Bretagne sud */
export const VUE_INITIALE_OGF = {
  latitude: 47.65,
  longitude: -3.40,
  zoom: 9,
} as const;

/** Zone d'eau libre pour projeter les traces (au large, sud-ouest) */
export const ZONE_PROJECTION_TRACE = {
  lat: 47.20,
  lon: -4.00,
} as const;

/**
 * Trouve le point de snap le plus proche non encore utilise.
 * @param positionsUtilisees - coordonnees deja prises par d'autres dossiers
 */
export function prochainPointSnap(
  positionsUtilisees: { lat: number; lon: number }[]
): PointSnap {
  const utilises = new Set(
    positionsUtilisees.map((p) => `${p.lat},${p.lon}`)
  );
  const libre = POINTS_SNAP.find(
    (p) => !utilises.has(`${p.lat},${p.lon}`)
  );
  return libre ?? POINTS_SNAP[0];
}

/**
 * Trouve le point de snap le plus proche d'une position donnee.
 * Utilise pour le drag-and-drop des marqueurs.
 */
export function snapperVersPointProche(lat: number, lon: number): PointSnap {
  let meilleur = POINTS_SNAP[0];
  let minDist = Infinity;
  for (const p of POINTS_SNAP) {
    const d = (p.lat - lat) ** 2 + (p.lon - lon) ** 2;
    if (d < minDist) {
      minDist = d;
      meilleur = p;
    }
  }
  return meilleur;
}

/** Nom du dossier par defaut auto-cree */
export const NOM_DOSSIER_DEFAUT = "Non classes";

/** Position fixe du marqueur "Non classes" */
export const POSITION_DOSSIER_DEFAUT = {
  lat: 47.50,
  lon: -3.10,
} as const;
