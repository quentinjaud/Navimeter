import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenirSession, obtenirIdUtilisateurEffectif } from "@/lib/session";

export async function GET() {
  const session = await obtenirSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const userId = await obtenirIdUtilisateurEffectif(session);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      portAttacheLat: true,
      portAttacheLon: true,
      portAttacheNom: true,
    },
  });

  return NextResponse.json(user ?? {});
}

export async function PATCH(requete: NextRequest) {
  const session = await obtenirSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const userId = await obtenirIdUtilisateurEffectif(session);
  const corps = await requete.json();

  const miseAJour: Record<string, unknown> = {};

  if (corps.portAttacheLat !== undefined) miseAJour.portAttacheLat = corps.portAttacheLat;
  if (corps.portAttacheLon !== undefined) miseAJour.portAttacheLon = corps.portAttacheLon;
  if (corps.portAttacheNom !== undefined) miseAJour.portAttacheNom = corps.portAttacheNom;

  const user = await prisma.user.update({
    where: { id: userId },
    data: miseAJour,
    select: {
      portAttacheLat: true,
      portAttacheLon: true,
      portAttacheNom: true,
    },
  });

  return NextResponse.json(user);
}
