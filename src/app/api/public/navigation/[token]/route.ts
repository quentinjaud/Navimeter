import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _requete: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const navigation = await prisma.navigation.findUnique({
    where: { shareToken: token },
    include: {
      trace: {
        include: {
          points: {
            where: { isExcluded: false },
            orderBy: { pointIndex: "asc" },
          },
          bateau: { select: { id: true, nom: true } },
        },
      },
      entreesJournal: {
        orderBy: { timestamp: "asc" },
      },
    },
  });

  if (!navigation) {
    return NextResponse.json({ error: "Navigation non trouvee" }, { status: 404 });
  }

  // Retourner les donnees publiques (pas de userId, pas d'infos sensibles)
  return NextResponse.json({
    nom: navigation.nom,
    date: navigation.date.toISOString(),
    type: navigation.type,
    trace: navigation.trace
      ? {
          distanceNm: navigation.trace.distanceNm,
          durationSeconds: navigation.trace.durationSeconds,
          avgSpeedKn: navigation.trace.avgSpeedKn,
          maxSpeedKn: navigation.trace.maxSpeedKn,
          maxSpeed: navigation.trace.maxSpeedKn ?? 10,
          bateau: navigation.trace.bateau,
          points: navigation.trace.points.map((p) => ({
            pointIndex: p.pointIndex,
            lat: p.lat,
            lon: p.lon,
            timestamp: p.timestamp?.toISOString() ?? null,
            speedKn: p.speedKn,
            headingDeg: p.headingDeg,
            isExcluded: false,
          })),
        }
      : null,
    entrees: navigation.entreesJournal.map((e) => ({
      id: e.id,
      timestamp: e.timestamp.toISOString(),
      lat: e.lat,
      lon: e.lon,
      texte: e.texte,
    })),
  });
}
