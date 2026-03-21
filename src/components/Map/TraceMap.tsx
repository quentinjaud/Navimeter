"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PointCarte {
  lat: number;
  lon: number;
  timestamp: string | null;
  speedKn: number | null;
  headingDeg: number | null;
  pointIndex: number;
}

interface PropsCarteTrace {
  points: PointCarte[];
  maxSpeed: number;
}

/** Convertit une vitesse en couleur (bleu=lent → rouge=rapide) */
function vitesseVersCouleur(vitesse: number, vitesseMax: number): string {
  if (vitesseMax <= 0) return "hsl(240, 100%, 50%)";
  const ratio = Math.min(vitesse / vitesseMax, 1);
  const teinte = 240 - ratio * 240;
  return `hsl(${teinte}, 100%, 50%)`;
}

/** Ajuste la vue de la carte pour afficher tous les points */
function FitBounds({ limites }: { limites: LatLngBounds }) {
  const carte = useMap();
  useEffect(() => {
    carte.fitBounds(limites, { padding: [20, 20] });
  }, [carte, limites]);
  return null;
}

export default function TraceMap({ points, maxSpeed }: PropsCarteTrace) {
  // Guard : pas de points → message au lieu d'un crash
  if (points.length === 0) {
    return (
      <div className="map-loading">
        <p className="map-loading-text">Aucun point à afficher</p>
      </div>
    );
  }

  const limites = useMemo(() => {
    const latitudes = points.map((p) => p.lat);
    const longitudes = points.map((p) => p.lon);
    return L.latLngBounds(
      [Math.min(...latitudes), Math.min(...longitudes)],
      [Math.max(...latitudes), Math.max(...longitudes)]
    );
  }, [points]);

  const segments = useMemo(() => {
    const resultat: {
      positions: [number, number][];
      couleur: string;
      vitesse: number;
      cap: number | null;
      heure: string | null;
      index: number;
    }[] = [];

    for (let i = 1; i < points.length; i++) {
      const precedent = points[i - 1];
      const courant = points[i];
      const vitesse = courant.speedKn ?? 0;

      resultat.push({
        positions: [
          [precedent.lat, precedent.lon],
          [courant.lat, courant.lon],
        ],
        couleur: vitesseVersCouleur(vitesse, maxSpeed),
        vitesse,
        cap: courant.headingDeg,
        heure: courant.timestamp,
        index: i,
      });
    }
    return resultat;
  }, [points, maxSpeed]);

  return (
    <MapContainer
      center={[limites.getCenter().lat, limites.getCenter().lng]}
      zoom={13}
      preferCanvas={true}
      className="map-wrapper"
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            attribution="&copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay checked name="OpenSeaMap">
          <TileLayer
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            opacity={0.8}
          />
        </LayersControl.Overlay>
      </LayersControl>

      <FitBounds limites={limites} />

      {segments.map((seg) => (
        <Polyline
          key={seg.index}
          positions={seg.positions}
          pathOptions={{ color: seg.couleur, weight: 3, opacity: 0.9 }}
        >
          <Popup>
            <div className="map-popup">
              {seg.heure && (
                <p>
                  <strong>Heure :</strong>{" "}
                  {format(new Date(seg.heure), "HH:mm:ss", { locale: fr })}
                </p>
              )}
              <p>
                <strong>Vitesse :</strong> {seg.vitesse.toFixed(1)} kn
              </p>
              {seg.cap !== null && (
                <p>
                  <strong>Cap :</strong> {seg.cap}°
                </p>
              )}
              <p className="map-popup-coords">
                {seg.positions[1][0].toFixed(5)},{" "}
                {seg.positions[1][1].toFixed(5)}
              </p>
            </div>
          </Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
}
