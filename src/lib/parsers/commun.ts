import type { PointAnalyse, TraceAnalysee } from "../types";
import { haversineNm } from "../geo/distance";
import { capDeg } from "../geo/heading";
import { vitesseNoeuds } from "../geo/speed";
import { detecterSource } from "./detect-source";
import { decodeHtmlEntities } from "./utils";

/**
 * Extrait les points GPS depuis un GeoJSON produit par @tmcw/togeojson.
 * Gère LineString, MultiLineString et Point.
 */
export function extrairePointsGeoJson(
  geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry | null>
): PointAnalyse[] {
  const points: PointAnalyse[] = [];

  for (const feature of geojson.features) {
    const geometrie = feature.geometry;
    if (!geometrie) continue;

    const tableauxCoord: number[][][] = [];
    if (geometrie.type === "LineString") {
      tableauxCoord.push(geometrie.coordinates as number[][]);
    } else if (geometrie.type === "MultiLineString") {
      for (const ligne of geometrie.coordinates as number[][][]) {
        tableauxCoord.push(ligne);
      }
    } else if (geometrie.type === "Point") {
      tableauxCoord.push([geometrie.coordinates as number[]]);
    }

    const horodatages: string[] | undefined =
      feature.properties?.coordTimes ??
      feature.properties?.coordinateProperties?.times;

    let indexHoraire = 0;
    for (const coords of tableauxCoord) {
      for (const coord of coords) {
        const [lon, lat, altitude] = coord;
        const chaineHoraire =
          horodatages && indexHoraire < horodatages.length
            ? horodatages[indexHoraire]
            : null;

        points.push({
          lat,
          lon,
          timestamp: chaineHoraire ? new Date(chaineHoraire) : null,
          speedKn: null,
          headingDeg: null,
          elevationM: altitude !== undefined ? altitude : null,
        });
        indexHoraire++;
      }
    }
  }

  return points;
}

/**
 * Enrichit les points avec vitesse et cap calculés à partir des coordonnees.
 * Le premier point hérite des valeurs du second (pas de point precedent).
 */
export function enrichirPoints(points: PointAnalyse[]): void {
  for (let i = 1; i < points.length; i++) {
    const precedent = points[i - 1];
    const courant = points[i];

    const dist = haversineNm(precedent.lat, precedent.lon, courant.lat, courant.lon);
    courant.headingDeg = Math.round(capDeg(precedent.lat, precedent.lon, courant.lat, courant.lon));

    if (precedent.timestamp && courant.timestamp) {
      const dt = (courant.timestamp.getTime() - precedent.timestamp.getTime()) / 1000;
      courant.speedKn = Math.round(vitesseNoeuds(dist, dt) * 10) / 10;
    }
  }

  // Le premier point hérite du second
  if (points.length > 1 && points[0].headingDeg === null) {
    points[0].headingDeg = points[1].headingDeg;
    points[0].speedKn = points[1].speedKn;
  }
}

/**
 * Construit le resultat de parsing : extraction des points, enrichissement,
 * détection du nom et de la source.
 */
export function construireResultatParsing(
  geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry | null>,
  contenu: string,
  nomFichier: string
): { trace: TraceAnalysee; source: string } {
  const points = extrairePointsGeoJson(geojson);
  enrichirPoints(points);

  const source = detecterSource(contenu);

  const nomBrut =
    geojson.features[0]?.properties?.name ||
    nomFichier.replace(/\.(gpx|kml)$/i, "");
  const name = decodeHtmlEntities(nomBrut);

  return { trace: { name, points }, source };
}
