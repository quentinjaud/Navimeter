"use client";

import dynamic from "next/dynamic";

const TraceMap = dynamic(() => import("./TraceMap"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <p className="map-loading-text">Chargement de la carte...</p>
    </div>
  ),
});

export default TraceMap;
