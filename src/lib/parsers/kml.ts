import { DOMParser } from "@xmldom/xmldom";
import { kml } from "@tmcw/togeojson";
import type { TraceAnalysee } from "../types";
import { construireResultatParsing } from "./commun";

/** Analyse un fichier KML et retourne la trace avec sa source détectée */
export function analyserKml(
  contenu: string,
  nomFichier: string
): { trace: TraceAnalysee; source: string } {
  const doc = new DOMParser().parseFromString(contenu, "text/xml");
  const geojson = kml(doc);
  return construireResultatParsing(geojson, contenu, nomFichier);
}
