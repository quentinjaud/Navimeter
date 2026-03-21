import type { TraceAnalysee } from "../types";
import { analyserGpx } from "./gpx";
import { analyserKml } from "./kml";

/** Analyse un fichier trace (GPX ou KML) et retourne la trace parsée, sa source et son format */
export function analyserFichierTrace(
  nomFichier: string,
  contenu: string
): { trace: TraceAnalysee; source: string; format: string } {
  const extension = nomFichier.toLowerCase().split(".").pop();

  switch (extension) {
    case "gpx": {
      const resultat = analyserGpx(contenu, nomFichier);
      return { ...resultat, format: "gpx" };
    }
    case "kml": {
      const resultat = analyserKml(contenu, nomFichier);
      return { ...resultat, format: "kml" };
    }
    default:
      throw new Error(`Format non supporté : .${extension}. Utilisez .gpx ou .kml`);
  }
}
