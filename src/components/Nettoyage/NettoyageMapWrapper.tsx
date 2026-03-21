"use client";

import dynamic from "next/dynamic";

const CarteNettoyage = dynamic(() => import("./CarteNettoyage"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <p className="map-loading-text">Chargement de la carte...</p>
    </div>
  ),
});

export default CarteNettoyage;
