import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenirSession, obtenirIdUtilisateurEffectif } from "@/lib/session";
import { journalErreur } from "@/lib/journal";

export async function PUT(
  requete: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await obtenirSession();
    if (!session) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    const { id } = await params;
    const corps = await requete.json();
    const { bateauId } = corps;

    // Verifier ownership de la trace
    const userId = await obtenirIdUtilisateurEffectif(session);
    const trace = await prisma.trace.findUnique({ where: { id } });
    if (!trace || trace.userId !== userId) {
      return NextResponse.json({ error: "Trace non trouvee" }, { status: 404 });
    }

    // Si un bateau est specifie, verifier qu'il appartient au meme user
    if (bateauId) {
      const bateau = await prisma.bateau.findUnique({ where: { id: bateauId } });
      if (!bateau || bateau.userId !== userId) {
        return NextResponse.json({ error: "Bateau non trouve" }, { status: 404 });
      }
    }

    const traceMaj = await prisma.trace.update({
      where: { id },
      data: { bateauId: bateauId || null },
    });

    return NextResponse.json(traceMaj);
  } catch (erreur) {
    journalErreur("PUT /api/traces/[id]/bateau", erreur);
    return NextResponse.json(
      { error: "Erreur lors de l'association" },
      { status: 500 }
    );
  }
}
