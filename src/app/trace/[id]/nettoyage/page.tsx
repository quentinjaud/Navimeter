export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { obtenirSession, estAdmin, obtenirIdUtilisateurEffectif } from "@/lib/session";
import { detecterAberrants } from "@/lib/geo/detection-aberrants";
import type { PointAnalyse, PointNettoyage } from "@/lib/types";
import NettoyagePage from "@/components/Nettoyage/NettoyagePage";

interface PropsPage {
  params: Promise<{ id: string }>;
}

export default async function NettoyageRoute({ params }: PropsPage) {
  const session = await obtenirSession();
  if (!session) notFound();

  const { id } = await params;

  const trace = await prisma.trace.findUnique({
    where: { id },
    include: {
      points: {
        orderBy: { pointIndex: "asc" },
      },
    },
  });

  if (!trace) notFound();

  const userId = await obtenirIdUtilisateurEffectif(session);
  if (trace.userId !== userId && !estAdmin(session)) {
    notFound();
  }

  // Convertir en PointAnalyse pour la détection
  const pointsAnalyse: PointAnalyse[] = trace.points.map((p) => ({
    lat: p.lat,
    lon: p.lon,
    timestamp: p.timestamp,
    speedKn: p.speedKn,
    headingDeg: p.headingDeg,
    elevationM: p.elevationM,
  }));

  // Détecter les aberrants — appliqué à l'état initial (exclu si détecté OU déjà exclu en base)
  const { indexAberrants, details } = detecterAberrants(pointsAnalyse);
  const detailsParIndex = new Map(details.map((d) => [d.pointIndex, d]));

  // Préparer les points pour le client
  const pointsNettoyage: PointNettoyage[] = trace.points.map((p, i) => ({
    id: p.id,
    pointIndex: p.pointIndex,
    lat: p.lat,
    lon: p.lon,
    timestamp: p.timestamp?.toISOString() ?? null,
    speedKn: p.speedKn,
    headingDeg: p.headingDeg,
    isExcluded: p.isExcluded || indexAberrants.has(i),
    typeAberrant: detailsParIndex.get(i)?.type ?? null,
  }));

  return (
    <NettoyagePage
      traceId={id}
      traceName={trace.name}
      points={pointsNettoyage}
    />
  );
}
