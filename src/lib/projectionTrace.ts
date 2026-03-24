/**
 * Projette une polyline reelle sur des coordonnees OGF fictives.
 * La trace est normalisee, mise a l'echelle, et ancree sur un point d'eau libre.
 */

interface PolylineProjetee {
  coordinates: [number, number][]; // [lon, lat] pour GeoJSON
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}

export function projeterSurOGF(
  polyline: [number, number][],
  ancre: { lat: number; lon: number },
  taillePx: number = 300,
  zoom: number = 8
): PolylineProjetee {
  if (polyline.length === 0) {
    return { coordinates: [], bbox: { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 } };
  }

  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  for (const [lat, lon] of polyline) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }

  const largeurReelle = maxLon - minLon || 0.001;
  const hauteurReelle = maxLat - minLat || 0.001;

  const pxParDeg = 256 * Math.pow(2, zoom) / 360;
  const tailleDeg = taillePx / pxParDeg;

  const scale = tailleDeg / Math.max(largeurReelle, hauteurReelle);

  const centreReelLat = (minLat + maxLat) / 2;
  const centreReelLon = (minLon + maxLon) / 2;

  const coordinates: [number, number][] = polyline.map(([lat, lon]) => [
    ancre.lon + (lon - centreReelLon) * scale,
    ancre.lat + (lat - centreReelLat) * scale,
  ]);

  const lons = coordinates.map(([lon]) => lon);
  const lats = coordinates.map(([, lat]) => lat);

  return {
    coordinates,
    bbox: {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    },
  };
}
