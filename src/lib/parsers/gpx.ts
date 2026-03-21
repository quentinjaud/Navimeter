import { DOMParser } from "@xmldom/xmldom";
import { gpx } from "@tmcw/togeojson";
import type { TraceAnalysee } from "../types";
import { construireResultatParsing } from "./commun";

/** Analyse un fichier GPX et retourne la trace avec sa source détectée */
export function analyserGpx(
  contenu: string,
  nomFichier: string
): { trace: TraceAnalysee; source: string } {
  const doc = new DOMParser().parseFromString(contenu, "text/xml");
  const geojson = gpx(doc);
  return construireResultatParsing(geojson, contenu, nomFichier);
}
