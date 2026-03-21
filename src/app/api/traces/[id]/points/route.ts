import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenirSession, estAdmin, obtenirIdUtilisateurEffectif } from "@/lib/session";
import { recalculerStatsTrace } from "@/lib/services/recalculer-stats";
import { journalErreur } from "@/lib/journal";

interface ModificationPoint {
  id: string;
  isExcluded: boolean;
}

/**
 * PATCH /api/traces/[id]/points
 * Met à jour le statut isExcluded de plusieurs points en une seule requête,
 * puis recalcule les stats de la trace.
 */
export async function PATCH(
  requete: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { id } = await params;

  const trace = await prisma.trace.findUnique({ where: { id } });
  if (!trace) {
    return NextResponse.json({ error: "Trace non trouvee" }, { status: 404 });
  }

  const userId = await obtenirIdUtilisateurEffectif(session);
  if (trace.userId !== userId && !estAdmin(session)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  try {
    const { modifications } = (await requete.json()) as {
      modifications: ModificationPoint[];
    };

    if (!Array.isArray(modifications) || modifications.length === 0) {
      return NextResponse.json(
        { error: "modifications requises (tableau non vide)" },
        { status: 400 }
      );
    }

    // Séparer les points à exclure et à inclure
    const aExclure = modifications
      .filter((m) => m.isExcluded)
      .map((m) => m.id);
    const aInclure = modifications
      .filter((m) => !m.isExcluded)
      .map((m) => m.id);

    // Mise à jour en batch
    const operations = [];
    if (aExclure.length > 0) {
      operations.push(
        prisma.trackPoint.updateMany({
          where: { id: { in: aExclure }, traceId: id },
          data: { isExcluded: true },
        })
      );
    }
    if (aInclure.length > 0) {
      operations.push(
        prisma.trackPoint.updateMany({
          where: { id: { in: aInclure }, traceId: id },
          data: { isExcluded: false },
        })
      );
    }

    await prisma.$transaction(operations);

    // Recalculer les stats
    const stats = await recalculerStatsTrace(id);

    return NextResponse.json({ stats });
  } catch (erreur) {
    journalErreur("PATCH /api/traces/[id]/points", erreur);
    return NextResponse.json(
      { error: "Erreur de mise a jour" },
      { status: 500 }
    );
  }
}
