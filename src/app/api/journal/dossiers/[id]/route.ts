import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { obtenirSession, obtenirIdUtilisateurEffectif } from "@/lib/session";
import { journalErreur } from "@/lib/journal";
import { NOM_DOSSIER_DEFAUT } from "@/lib/pointsSnap";

export async function PATCH(
  requete: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { id } = await params;
  const userId = await obtenirIdUtilisateurEffectif(session);

  const dossier = await prisma.dossier.findFirst({
    where: { id, userId },
  });

  if (!dossier) {
    return NextResponse.json({ error: "Dossier non trouve" }, { status: 404 });
  }

  try {
    const { nom, description, markerLat, markerLon, parentId } = await requete.json();

    const data: {
      nom?: string;
      description?: string | null;
      markerLat?: number | null;
      markerLon?: number | null;
      parentId?: string | null;
    } = {};

    if (nom !== undefined) {
      if (typeof nom !== "string" || nom.trim().length === 0) {
        return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
      }
      data.nom = nom.trim();
    }

    if (description !== undefined) {
      data.description = description?.trim() || null;
    }

    if (markerLat !== undefined) {
      data.markerLat = markerLat;
    }

    if (markerLon !== undefined) {
      data.markerLon = markerLon;
    }

    if (parentId !== undefined) {
      data.parentId = parentId;
    }

    const miseAJour = await prisma.dossier.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      id: miseAJour.id,
      nom: miseAJour.nom,
      description: miseAJour.description,
      markerLat: miseAJour.markerLat,
      markerLon: miseAJour.markerLon,
      parentId: miseAJour.parentId,
      createdAt: miseAJour.createdAt.toISOString(),
    });
  } catch (erreur) {
    journalErreur("PATCH /api/journal/dossiers/[id]", erreur);
    return NextResponse.json(
      { error: "Erreur de mise a jour" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _requete: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { id } = await params;
  const userId = await obtenirIdUtilisateurEffectif(session);

  const dossier = await prisma.dossier.findFirst({
    where: { id, userId },
  });

  if (!dossier) {
    return NextResponse.json({ error: "Dossier non trouve" }, { status: 404 });
  }

  if (dossier.nom === NOM_DOSSIER_DEFAUT) {
    return NextResponse.json(
      { error: "Impossible de supprimer le dossier par defaut" },
      { status: 403 }
    );
  }

  try {
    await prisma.dossier.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (erreur) {
    journalErreur("DELETE /api/journal/dossiers/[id]", erreur);
    return NextResponse.json(
      { error: "Erreur de suppression" },
      { status: 500 }
    );
  }
}
