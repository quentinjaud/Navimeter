"use client";

import dynamic from "next/dynamic";

const TraceMap = dynamic(() => import("./TraceMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-light animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-gray-medium">Chargement de la carte...</p>
    </div>
  ),
});

export default TraceMap;
