export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  obtenirSession,
  estAdmin,
  obtenirIdUtilisateurEffectif,
} from "@/lib/session";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import NavigationVueClient from "@/components/NavigationVueClient";

interface PropsPage {
  params: Promise<{ id: string }>;
}

export default async function NavigationDetailPage({ params }: PropsPage) {
  const session = await obtenirSession();
  if (!session) notFound();

  const { id } = await params;
  const userId = await obtenirIdUtilisateurEffectif(session);

  const include = {
    dossier: { select: { id: true, nom: true } },
    aventure: { select: { id: true, nom: true } },
    trace: {
      include: {
        points: {
          where: { isExcluded: false },
          orderBy: { pointIndex: "asc" as const },
        },
        bateau: { select: { id: true, nom: true } },
      },
    },
  };

  let navigation = await prisma.navigation.findFirst({
    where: { id, userId },
    include,
  });

  if (!navigation && estAdmin(session)) {
    navigation = await prisma.navigation.findUnique({
      where: { id },
      include,
    });
  }

  if (!navigation) notFound();

  const trace = navigation.trace;
  const pointsSerialises = trace
    ? trace.points.map((p) => ({
        lat: p.lat,
        lon: p.lon,
        timestamp: p.timestamp?.toISOString() ?? null,
        speedKn: p.speedKn,
        headingDeg: p.headingDeg,
        elevationM: p.elevationM,
        pointIndex: p.pointIndex,
      }))
    : [];

  return (
    <div className="trace-vue-layout">
      {/* Header navigation */}
      <div className="trace-vue-header">
        <Link href="/journal" className="nettoyage-back">
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </Link>
        <div className="trace-vue-header-info">
          <span className="navigation-breadcrumb">
            {navigation.dossier.nom}
            {navigation.aventure && ` > ${navigation.aventure.nom}`}
          </span>
        </div>
      </div>

      {trace && trace.points.length > 0 ? (
        <NavigationVueClient
          navigationId={navigation.id}
          nom={navigation.nom}
          date={navigation.date.toISOString()}
          type={navigation.type}
          bateau={trace.bateau}
          points={pointsSerialises}
          maxSpeed={trace.maxSpeedKn ?? 10}
          distanceNm={trace.distanceNm}
          durationSeconds={trace.durationSeconds}
          avgSpeedKn={trace.avgSpeedKn}
          maxSpeedKn={trace.maxSpeedKn}
        />
      ) : (
        <div className="navigation-vide">
          <p>Aucune trace associee a cette navigation.</p>
          <Link href="/journal">Retour au journal</Link>
        </div>
      )}
    </div>
  );
}
