export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import NavigationPubliqueClient from "@/components/NavigationPubliqueClient";
import type { PointCarte } from "@/lib/types";

interface PropsPage {
  params: Promise<{ token: string }>;
}

export default async function PagePartage({ params }: PropsPage) {
  const { token } = await params;

  const navigation = await prisma.navigation.findUnique({
    where: { shareToken: token },
    include: {
      trace: {
        include: {
          points: {
            where: { isExcluded: false },
            orderBy: { pointIndex: "asc" as const },
          },
          bateau: { select: { id: true, nom: true } },
        },
      },
      entreesJournal: {
        orderBy: { timestamp: "asc" },
      },
    },
  });

  if (!navigation) notFound();

  const trace = navigation.trace;
  const points: PointCarte[] = (trace?.points ?? []).map((p) => ({
    pointIndex: p.pointIndex,
    lat: p.lat,
    lon: p.lon,
    timestamp: p.timestamp?.toISOString() ?? null,
    speedKn: p.speedKn,
    headingDeg: p.headingDeg,
    elevationM: p.elevationM,
    isExcluded: false,
  }));

  const entrees = navigation.entreesJournal.map((e) => ({
    id: e.id,
    timestamp: e.timestamp.toISOString(),
    lat: e.lat,
    lon: e.lon,
    texte: e.texte,
  }));

  return (
    <NavigationPubliqueClient
      nom={navigation.nom}
      date={navigation.date.toISOString()}
      type={navigation.type}
      bateau={trace?.bateau ?? null}
      points={points}
      maxSpeed={trace?.maxSpeedKn ?? 10}
      distanceNm={trace?.distanceNm ?? null}
      durationSeconds={trace?.durationSeconds ?? null}
      avgSpeedKn={trace?.avgSpeedKn ?? null}
      maxSpeedKn={trace?.maxSpeedKn ?? null}
      entrees={entrees}
    />
  );
}
