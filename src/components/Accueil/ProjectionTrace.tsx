"use client";

import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import { projeterSurOGF } from "@/lib/projectionTrace";
import { ZONE_PROJECTION_TRACE } from "@/lib/pointsSnap";
import type { ResumeNavigation } from "@/lib/types";
import TooltipStats from "./TooltipStats";

interface PropsProjectionTrace {
  navigation: ResumeNavigation;
}

const COULEURS_TRACE: Record<string, string> = {
  SOLO: "#43728B",
  AVENTURE: "#C45B3E",
  REGATE: "#F6BC00",
};

export default function ProjectionTrace({ navigation }: PropsProjectionTrace) {
  const { current: map } = useMap();
  const zoom = map?.getZoom() ?? 8;

  const polylineSource =
    navigation.polylineCache ?? navigation.trace?.polylineSimplifiee;

  const projection = useMemo(() => {
    if (!polylineSource || !Array.isArray(polylineSource)) return null;
    return projeterSurOGF(
      polylineSource as [number, number][],
      ZONE_PROJECTION_TRACE,
      300,
      zoom
    );
  }, [polylineSource, zoom]);

  if (!projection || projection.coordinates.length === 0) return null;

  const geojson = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: projection.coordinates,
    },
  };

  const couleur = COULEURS_TRACE[navigation.type] ?? "#43728B";

  return (
    <>
      <Source id="trace-preview" type="geojson" data={geojson}>
        <Layer
          id="trace-preview-line"
          type="line"
          paint={{
            "line-color": couleur,
            "line-width": 3,
            "line-opacity": 0.8,
          }}
        />
      </Source>
      <TooltipStats navigation={navigation} bbox={projection.bbox} />
    </>
  );
}
