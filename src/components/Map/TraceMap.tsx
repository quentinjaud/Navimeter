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

interface Point {
  lat: number;
  lon: number;
  timestamp: string | null;
  speedKn: number | null;
  headingDeg: number | null;
  pointIndex: number;
}

interface TraceMapProps {
  points: Point[];
  maxSpeed: number;
}

function speedToColor(speed: number, maxSpeed: number): string {
  if (maxSpeed <= 0) return "hsl(240, 100%, 50%)";
  const ratio = Math.min(speed / maxSpeed, 1);
  const hue = 240 - ratio * 240;
  return `hsl(${hue}, 100%, 50%)`;
}

function FitBounds({ bounds }: { bounds: LatLngBounds }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [map, bounds]);
  return null;
}

export default function TraceMap({ points, maxSpeed }: TraceMapProps) {
  const bounds = useMemo(() => {
    const lats = points.map((p) => p.lat);
    const lons = points.map((p) => p.lon);
    return L.latLngBounds(
      [Math.min(...lats), Math.min(...lons)],
      [Math.max(...lats), Math.max(...lons)]
    );
  }, [points]);

  const segments = useMemo(() => {
    const segs: {
      positions: [number, number][];
      color: string;
      speed: number;
      heading: number | null;
      time: string | null;
      index: number;
    }[] = [];

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const speed = curr.speedKn ?? 0;

      segs.push({
        positions: [
          [prev.lat, prev.lon],
          [curr.lat, curr.lon],
        ],
        color: speedToColor(speed, maxSpeed),
        speed,
        heading: curr.headingDeg,
        time: curr.timestamp,
        index: i,
      });
    }
    return segs;
  }, [points, maxSpeed]);

  return (
    <MapContainer
      center={[bounds.getCenter().lat, bounds.getCenter().lng]}
      zoom={13}
      preferCanvas={true}
      className="h-full w-full rounded-lg"
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

      <FitBounds bounds={bounds} />

      {segments.map((seg) => (
        <Polyline
          key={seg.index}
          positions={seg.positions}
          pathOptions={{ color: seg.color, weight: 3, opacity: 0.9 }}
        >
          <Popup>
            <div className="text-sm space-y-1">
              {seg.time && (
                <p>
                  <strong>Heure :</strong>{" "}
                  {format(new Date(seg.time), "HH:mm:ss", { locale: fr })}
                </p>
              )}
              <p>
                <strong>Vitesse :</strong> {seg.speed.toFixed(1)} kn
              </p>
              {seg.heading !== null && (
                <p>
                  <strong>Cap :</strong> {seg.heading}°
                </p>
              )}
              <p className="text-xs text-gray-500">
                {seg.positions[1][0].toFixed(5)}, {seg.positions[1][1].toFixed(5)}
              </p>
            </div>
          </Popup>
        </Polyline>
      ))}
    </MapContainer>
  );
}
