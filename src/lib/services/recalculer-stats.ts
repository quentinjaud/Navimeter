import { prisma } from "@/lib/db";
import { calculerStats } from "@/lib/geo/stats";
import type { PointAnalyse, StatistiquesTrace } from "@/lib/types";

/**
 * Recalcule les statistiques d'une trace à partir de ses points non-exclus
 * et met à jour l'enregistrement Trace en base.
 */
export async function recalculerStatsTrace(
  traceId: string
): Promise<StatistiquesTrace> {
  const pointsBruts = await prisma.trackPoint.findMany({
    where: { traceId, isExcluded: false },
    orderBy: { pointIndex: "asc" },
    select: {
      lat: true,
      lon: true,
      timestamp: true,
      speedKn: true,
      headingDeg: true,
      elevationM: true,
    },
  });

  const points: PointAnalyse[] = pointsBruts.map((p) => ({
    lat: p.lat,
    lon: p.lon,
    timestamp: p.timestamp,
    speedKn: p.speedKn,
    headingDeg: p.headingDeg,
    elevationM: p.elevationM,
  }));

  const stats = calculerStats(points);

  await prisma.trace.update({
    where: { id: traceId },
    data: {
      distanceNm: stats.distanceNm,
      durationSeconds: stats.durationSeconds,
      avgSpeedKn: stats.avgSpeedKn,
      maxSpeedKn: stats.maxSpeedKn,
    },
  });

  return stats;
}
