"use client";

import { useRef, useCallback, type ReactNode } from "react";
import Map, { type MapRef } from "react-map-gl/maplibre";
import { VUE_INITIALE_OGF } from "@/lib/pointsSnap";
import "maplibre-gl/dist/maplibre-gl.css";

interface PropsCarteOGF {
  children?: ReactNode;
  onClicCarte?: () => void;
}

const STYLE_OGF = {
  version: 8 as const,
  sources: {
    ogf: {
      type: "raster" as const,
      tiles: ["https://tile.opengeofiction.net/ogf-carto/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenGeoFiction contributors",
    },
  },
  layers: [
    {
      id: "ogf-tiles",
      type: "raster" as const,
      source: "ogf",
      paint: {
        "raster-saturation": -0.6,
        "raster-brightness-min": 0.15,
        "raster-contrast": -0.1,
      },
    },
  ],
};

export default function CarteOGF({ children, onClicCarte }: PropsCarteOGF) {
  const mapRef = useRef<MapRef>(null);

  const recentrer = useCallback(() => {
    mapRef.current?.flyTo({
      center: [VUE_INITIALE_OGF.longitude, VUE_INITIALE_OGF.latitude],
      zoom: VUE_INITIALE_OGF.zoom,
      duration: 1500,
    });
  }, []);

  return (
    <div className="carte-ogf-container">
      <Map
        ref={mapRef}
        initialViewState={VUE_INITIALE_OGF}
        mapStyle={STYLE_OGF}
        onClick={onClicCarte}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {children}
      </Map>
      <button
        className="carte-ogf-recentrer"
        onClick={recentrer}
        title="Recentrer la carte"
      >
        ⌖
      </button>
    </div>
  );
}
