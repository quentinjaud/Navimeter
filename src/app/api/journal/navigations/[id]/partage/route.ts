import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenirSession, obtenirIdUtilisateurEffectif } from "@/lib/session";
import { randomBytes } from "crypto";

export async function POST(
  requete: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { id } = await params;
  const userId = await obtenirIdUtilisateurEffectif(session);

  const navigation = await prisma.navigation.findFirst({
    where: { id, userId },
    select: { id: true, shareToken: true },
  });

  if (!navigation) {
    return NextResponse.json({ error: "Navigation non trouvee" }, { status: 404 });
  }

  const corps = await requete.json().catch(() => ({}));

  // Desactiver le partage
  if (corps.actif === false) {
    await prisma.navigation.update({
      where: { id },
      data: { shareToken: null },
    });
    return NextResponse.json({ shareToken: null });
  }

  // Generer un token si pas encore fait
  if (navigation.shareToken) {
    return NextResponse.json({ shareToken: navigation.shareToken });
  }

  const token = randomBytes(16).toString("hex");
  await prisma.navigation.update({
    where: { id },
    data: { shareToken: token },
  });

  return NextResponse.json({ shareToken: token }, { status: 201 });
}
