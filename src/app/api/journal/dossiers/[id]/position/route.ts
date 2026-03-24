import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenirSession, obtenirIdUtilisateurEffectif } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;
  const userId = await obtenirIdUtilisateurEffectif(session);
  const { markerLat, markerLon } = await request.json();

  const dossier = await prisma.dossier.updateMany({
    where: { id, userId },
    data: { markerLat, markerLon },
  });

  if (dossier.count === 0) {
    return NextResponse.json({ error: "Dossier non trouve" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
