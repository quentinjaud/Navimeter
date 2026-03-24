export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { obtenirSession, obtenirIdUtilisateurEffectif } from "@/lib/session";
import { redirect } from "next/navigation";
import { journalErreur } from "@/lib/journal";
import PageAccueil from "@/components/Accueil/PageAccueil";
import type { ResumeDossier } from "@/lib/types";
import { prochainPointSnap } from "@/lib/pointsSnap";

export default async function PageJournalServeur() {
  const session = await obtenirSession();
  if (!session) {
    redirect("/connexion?retour=/journal");
  }

  const userId = await obtenirIdUtilisateurEffectif(session);

  let dossiers: ResumeDossier[] = [];
  let erreurBD = false;

  try {
    const resultDossiers = await prisma.dossier.findMany({
      where: { userId, parentId: null },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sousDossiers: true, navigations: true } },
      },
    });

    // Auto-assign des coordonnees pour les dossiers sans position
    const positionsUtilisees: { lat: number; lon: number }[] = [];
    for (const d of resultDossiers) {
      if (d.markerLat != null && d.markerLon != null) {
        positionsUtilisees.push({ lat: d.markerLat, lon: d.markerLon });
      }
    }
    for (const d of resultDossiers) {
      if (d.markerLat == null || d.markerLon == null) {
        const snap = prochainPointSnap(positionsUtilisees);
        positionsUtilisees.push(snap);
        // Persister en base pour ne pas recalculer a chaque fois
        await prisma.dossier.update({
          where: { id: d.id },
          data: { markerLat: snap.lat, markerLon: snap.lon },
        });
        d.markerLat = snap.lat;
        d.markerLon = snap.lon;
      }
    }

    dossiers = resultDossiers.map((d) => ({
      id: d.id,
      nom: d.nom,
      description: d.description,
      markerLat: d.markerLat,
      markerLon: d.markerLon,
      parentId: d.parentId,
      nbSousDossiers: d._count.sousDossiers,
      nbNavigations: d._count.navigations,
      createdAt: d.createdAt.toISOString(),
    }));
  } catch (erreur) {
    journalErreur("PageJournal", erreur);
    erreurBD = true;
  }

  return (
    <>
      {erreurBD && (
        <div className="error-banner" style={{ margin: "24px" }}>
          Impossible de charger les donnees. Veuillez rafraichir la page.
        </div>
      )}
      <PageAccueil dossiers={dossiers} />
    </>
  );
}
