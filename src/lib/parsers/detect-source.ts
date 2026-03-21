/**
 * Détecte automatiquement la source d'un fichier GPX/KML
 * en analysant les métadonnees XML (creator, namespace, extensions).
 */
export function detecterSource(contenuXml: string): string {
  // Attribut creator="..." sur la balise racine
  const correspondance = contenuXml.match(/creator\s*=\s*"([^"]+)"/i);
  const createur = correspondance?.[1]?.toLowerCase() ?? "";

  // Entête XML pour les recherches complémentaires (une seule fois)
  const entete = contenuXml.slice(0, 2000).toLowerCase();

  if (createur.includes("navionics") || entete.includes("navionics")) {
    return "navionics";
  }

  if (createur.includes("sailgrib") || entete.includes("sailgrib")) {
    return "sailgrib";
  }

  if (
    createur.includes("weather4d") ||
    createur.includes("app4nav") ||
    entete.includes("weather4d") ||
    entete.includes("app4nav")
  ) {
    return "weather4d";
  }

  if (
    createur.includes("navimetrix") ||
    entete.includes("navimetrix") ||
    entete.includes("gserv.navimetrix")
  ) {
    return "navimetrix";
  }

  if (createur.includes("opencpn")) {
    return "opencpn";
  }

  if (createur.includes("garmin") || /xmlns[^"]*garmin/.test(entete)) {
    return "garmin";
  }

  if (/google earth|xmlns[^"]*google/.test(entete)) {
    return "google-earth";
  }

  if (createur.includes("strava")) {
    return "strava";
  }

  return "unknown";
}
