import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenirSession, estAdmin, obtenirIdUtilisateurEffectif } from "@/lib/session";
import { genererGpx } from "@/lib/export/gpx";
import { journalErreur } from "@/lib/journal";

/**
 * GET /api/traces/[id]/export
 * Exporte la trace nettoyée en fichier GPX 1.1 (points non-exclus uniquement).
 */
export async function GET(
  _requete: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { id } = await params;

  const trace = await prisma.trace.findUnique({
    where: { id },
    include: {
      points: {
        where: { isExcluded: false },
        orderBy: { pointIndex: "asc" },
      },
    },
  });

  if (!trace) {
    return NextResponse.json({ error: "Trace non trouvee" }, { status: 404 });
  }

  const userId = await obtenirIdUtilisateurEffectif(session);
  if (trace.userId !== userId && !estAdmin(session)) {
    return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
  }

  try {
    const gpx = genererGpx(trace.name, trace.points);
    const nomFichier = trace.filename.replace(/\.[^.]+$/, "") + "_nettoyee.gpx";

    return new NextResponse(gpx, {
      headers: {
        "Content-Type": "application/gpx+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${nomFichier}"`,
      },
    });
  } catch (erreur) {
    journalErreur("GET /api/traces/[id]/export", erreur);
    return NextResponse.json({ error: "Erreur d'export" }, { status: 500 });
  }
}
