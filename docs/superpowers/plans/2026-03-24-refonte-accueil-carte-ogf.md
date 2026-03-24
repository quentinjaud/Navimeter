# Refonte Accueil — Carte OGF + Panneaux Flottants

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la page journal hierarchique par une carte OGF immersive avec marqueurs-dossiers, panneaux flottants et apercu de traces projete en mer.

**Architecture:** Carte MapLibre plein ecran avec tuiles OGF raster en fond. Marqueurs custom React pour les dossiers, panneaux flottants (creme + blur) pour naviguer dans le contenu. Projection de traces en GeoJSON overlay. Migration Prisma pour simplifier le modele (Aventure → type de Navigation).

**Tech Stack:** Next.js 16, React 19, MapLibre GL JS via react-map-gl, Prisma 7, CSS vanilla

**Spec:** `docs/superpowers/specs/2026-03-24-refonte-accueil-carte-ogf.md`

---

## File Structure

### Nouveaux fichiers
| Fichier | Responsabilite |
|---------|---------------|
| `src/components/Accueil/CarteOGF.tsx` | Composant MapLibre avec tuiles OGF, gestion zoom/pan |
| `src/components/Accueil/MarqueurDossier.tsx` | Marqueur custom React pour un dossier sur la carte |
| `src/components/Accueil/PanneauContenu.tsx` | Panneau flottant : breadcrumb + liste items du dossier |
| `src/components/Accueil/LigneItem.tsx` | Ligne compacte pour un item (nav, aventure, sous-dossier) |
| `src/components/Accueil/ProjectionTrace.tsx` | Logique de projection de polyline sur carte OGF |
| `src/components/Accueil/TooltipStats.tsx` | Pills mini-stats autour de la trace projetee |
| `src/components/Accueil/PageAccueil.tsx` | Client component principal qui orchestre tout |
| `src/components/PanneauSettings.tsx` | Panneau settings flottant (bateaux, import, dossiers tableau) |
| `src/lib/pointsSnap.ts` | Coordonnees des points de snap cotiers sur la zone OGF |
| `src/lib/projectionTrace.ts` | Fonctions pures : normalisation, echelle, ancrage de polyline |
| `src/app/api/journal/dossiers/[id]/position/route.ts` | PATCH position marqueur |
| `prisma/migrations/xxx_refonte_accueil/migration.sql` | Migration schema |

### Fichiers modifies
| Fichier | Modifications |
|---------|-------------|
| `prisma/schema.prisma` | + champs Dossier, + AVENTURE enum, + parentNavId, - modele Aventure |
| `src/lib/types.ts` | Mise a jour ResumeDossier, ContenuDossier, suppression ResumeAventure |
| `src/lib/theme.ts` | + couleurs aventure (rouge brique), trace edition (gris) |
| `src/app/journal/page.tsx` | Refonte : charge dossiers avec positions, passe a PageAccueil |
| `src/app/api/journal/dossiers/route.ts` | + champs position dans create/list |
| `src/app/api/journal/dossiers/[id]/route.ts` | + champs position dans update |
| `src/app/api/journal/dossiers/[id]/contenu/route.ts` | Retourne sous-dossiers + navs (plus aventures) |
| `src/app/api/journal/navigations/route.ts` | + type AVENTURE, + parentNavId |
| `src/app/api/journal/navigations/[id]/route.ts` | + sous-navigations pour AVENTURE |
| `src/app/globals.css` | + styles panneaux accueil, marqueurs, tooltips |
| `src/components/Journal/ModaleElement.tsx` | Adapter au nouveau modele (pas d'aventure separee) |

### Fichiers supprimes
| Fichier | Raison |
|---------|--------|
| `src/components/Journal/PageJournal.tsx` | Remplace par PageAccueil |
| `src/components/Journal/CarteDossier.tsx` | Remplace par MarqueurDossier + PanneauContenu |
| `src/components/Journal/CarteAventure.tsx` | L'aventure est un type de nav |
| `src/components/Journal/CarteNavigation.tsx` | Remplace par LigneItem |
| `src/components/Journal/ContenuDossier.tsx` | Integre dans PanneauContenu |
| `src/components/Journal/BarreActionsJournal.tsx` | Plus de barre d'actions separee |
| `src/components/Journal/PanneauApercu.tsx` | Remplace par projection sur carte |
| `src/app/api/journal/aventures/` | Routes aventure supprimees |
| `src/app/api/journal/dossiers/[id]/aventures/` | Route creation aventure supprimee |

---

## Task 1 : Couleurs theme + points de snap + utilitaire formaterDistance

**Files:**
- Modify: `src/lib/theme.ts`
- Modify: `src/lib/utilitaires.ts`
- Create: `src/lib/pointsSnap.ts`

- [ ] **Step 1: Ajouter les couleurs aventure et trace en edition dans theme.ts**

```typescript
// Ajouter dans COULEURS :
/** Rouge brique — aventure */
aventure: "#C45B3E",
/** Gris — trace en edition */
traceEdition: "#9E9E9E",
```

- [ ] **Step 2: Ajouter `formaterDistance` dans utilitaires.ts**

`formaterDuree` existe deja. Ajouter a cote :

```typescript
/** Formate une distance en NM (ex: "12.3 NM") */
export function formaterDistance(distanceNm: number): string {
  return `${distanceNm < 10 ? distanceNm.toFixed(1) : Math.round(distanceNm)} NM`;
}
```

- [ ] **Step 3: Creer le fichier pointsSnap.ts avec les coordonnees cotieres OGF**

```typescript
// src/lib/pointsSnap.ts
/**
 * Points de snap predefinies sur la zone cotiere OGF (-28.90 / 48.43, zoom 8).
 * Chaque point represente un "port" fictif ou un dossier peut se placer.
 * Coordonnees relevees manuellement sur la cote gauche de la zone.
 */
export interface PointSnap {
  lat: number;
  lon: number;
  nom: string; // nom decoratif du port fictif
}

export const POINTS_SNAP: PointSnap[] = [
  { lat: -28.12, lon: 47.85, nom: "Port Nord" },
  { lat: -28.35, lon: 47.72, nom: "Baie des Brumes" },
  { lat: -28.58, lon: 47.90, nom: "Cap Ouest" },
  { lat: -28.80, lon: 48.05, nom: "Anse du Phare" },
  { lat: -29.05, lon: 47.95, nom: "Port du Levant" },
  { lat: -29.30, lon: 48.10, nom: "Crique Sauvage" },
  { lat: -29.55, lon: 47.80, nom: "Ile du Large" },
  { lat: -28.25, lon: 48.20, nom: "Pointe des Vents" },
  { lat: -28.65, lon: 48.30, nom: "Havre Tranquille" },
  { lat: -29.10, lon: 48.35, nom: "Mouillage Sud" },
  { lat: -29.45, lon: 48.25, nom: "Baie Cachee" },
  { lat: -28.45, lon: 48.50, nom: "Port Central" },
];

/** Centre de la zone OGF pour la vue initiale */
export const VUE_INITIALE_OGF = {
  latitude: -28.90,
  longitude: 48.43,
  zoom: 8,
} as const;

/** Zone d'eau libre pour projeter les traces (cote droit du viewport) */
export const ZONE_PROJECTION_TRACE = {
  latitude: -28.90,
  longitude: 49.50,
} as const;

/**
 * Trouve le point de snap le plus proche non encore utilise.
 * @param positionsUtilisees - coordonnees deja prises par d'autres dossiers
 */
export function prochainPointSnap(
  positionsUtilisees: { lat: number; lon: number }[]
): PointSnap {
  const utilises = new Set(
    positionsUtilisees.map((p) => `${p.lat},${p.lon}`)
  );
  const libre = POINTS_SNAP.find(
    (p) => !utilises.has(`${p.lat},${p.lon}`)
  );
  return libre ?? POINTS_SNAP[0];
}

/**
 * Trouve le point de snap le plus proche d'une position donnee.
 * Utilise pour le drag-and-drop des marqueurs.
 */
export function snapperVersPointProche(lat: number, lon: number): PointSnap {
  let meilleur = POINTS_SNAP[0];
  let minDist = Infinity;
  for (const p of POINTS_SNAP) {
    const d = (p.lat - lat) ** 2 + (p.lon - lon) ** 2;
    if (d < minDist) {
      minDist = d;
      meilleur = p;
    }
  }
  return meilleur;
}

/** Nom du dossier par defaut auto-cree */
export const NOM_DOSSIER_DEFAUT = "Non classes";

/** Position fixe du marqueur "Non classes" */
export const POSITION_DOSSIER_DEFAUT = {
  lat: -29.70,
  lon: 48.00,
} as const;
```

- [ ] **Step 4: Verifier que le build passe**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.ts src/lib/utilitaires.ts src/lib/pointsSnap.ts
git commit -m "feat(accueil): couleurs aventure/trace + points snap OGF + formaterDistance"
```

---

## Task 2 : Migration Prisma — en deux etapes pour ne pas perdre de donnees

**Files:**
- Modify: `prisma/schema.prisma`
- Create: 2 migrations auto-generees

### Etape A : Ajouter les nouveaux champs (sans rien supprimer)

- [ ] **Step 1: Modifier le schema — ajouts uniquement**

Dans `prisma/schema.prisma` :

**Sur le modele Dossier**, ajouter :
```prisma
  markerLat     Float?
  markerLon     Float?
  parentId      String?
  parent        Dossier?  @relation("DossierParent", fields: [parentId], references: [id])
  sousDossiers  Dossier[] @relation("DossierParent")
```

**Sur l'enum TypeNavigation**, ajouter `AVENTURE` :
```prisma
enum TypeNavigation {
  SOLO
  AVENTURE
  REGATE
}
```

**Sur le modele Navigation**, ajouter :
```prisma
  parentNavId      String?
  parentNav        Navigation?  @relation("NavParent", fields: [parentNavId], references: [id])
  sousNavigations  Navigation[] @relation("NavParent")
  polylineCache    Json?
```

> **Ne PAS toucher a Aventure, aventureId, ou User.aventures pour l'instant.**

- [ ] **Step 2: Generer et appliquer la migration**

Run: `npx prisma migrate dev --name ajout_champs_accueil`

- [ ] **Step 3: Script de migration data**

Editer le fichier SQL genere pour ajouter **a la fin** le script de conversion des Aventures existantes :

```sql
-- Convertir chaque Aventure en Navigation de type AVENTURE
INSERT INTO "Navigation" ("id", "nom", "date", "type", "userId", "dossierId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  a."nom",
  COALESCE(
    (SELECT MIN(n."date") FROM "Navigation" n WHERE n."aventureId" = a."id"),
    a."createdAt"
  ),
  'AVENTURE',
  a."userId",
  a."dossierId",
  a."createdAt",
  a."updatedAt"
FROM "Aventure" a;

-- Rattacher les sous-navigations a leur nouvelle nav AVENTURE
UPDATE "Navigation" n
SET "parentNavId" = nav_aventure."id"
FROM (
  SELECT n2."id", a."id" AS "aventureId"
  FROM "Navigation" n2
  JOIN "Aventure" a ON n2."nom" = a."nom"
    AND n2."userId" = a."userId"
    AND n2."type" = 'AVENTURE'
) nav_aventure
WHERE n."aventureId" = nav_aventure."aventureId"
  AND n."type" != 'AVENTURE';
```

> Note : ce script utilise `gen_random_uuid()` (PostgreSQL). Verifier que la migration s'applique correctement en dev. Si aucune Aventure n'existe, les INSERT/UPDATE ne font rien.

- [ ] **Step 4: Appliquer la migration avec le script data**

Run: `npx prisma migrate dev`

### Etape B : Supprimer Aventure

- [ ] **Step 5: Modifier le schema — suppressions**

- **Retirer** `aventures Aventure[]` de Dossier
- **Retirer** `aventureId`, `aventure` de Navigation
- **Retirer** `aventures Aventure[]` de User
- **Supprimer entierement** le modele `Aventure` et ses index

- [ ] **Step 6: Generer et appliquer la seconde migration**

Run: `npx prisma migrate dev --name suppression_aventure`

- [ ] **Step 7: Regenerer le client Prisma**

Run: `npx prisma generate`

- [ ] **Step 8: Verifier que le build TypeScript compile (il va casser — c'est attendu, on fixe dans les tasks suivantes)**

Run: `npx tsc --noEmit` — noter les erreurs, elles guident les tasks suivantes.

- [ ] **Step 9: Commit**

```bash
git add prisma/
git commit -m "feat(db): migration refonte accueil — Aventure → Navigation type AVENTURE (2 etapes)"
```

---

## Task 3 : Mise a jour des types + theme CSS

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Mettre a jour types.ts**

Modifications :

1. `ResumeDossier` — ajouter `markerLat`, `markerLon`, `parentId`, remplacer `nbAventures` par `nbSousDossiers` :
```typescript
export interface ResumeDossier {
  id: string;
  nom: string;
  description: string | null;
  markerLat: number | null;
  markerLon: number | null;
  parentId: string | null;
  nbSousDossiers: number;
  nbNavigations: number;
  createdAt: string;
}
```

2. `ContenuDossier` — remplacer `aventures` + `navigationsOrphelines` par `sousDossiers` + `navigations` :
```typescript
export interface ContenuDossier {
  sousDossiers: ResumeDossier[];
  navigations: ResumeNavigation[];
}
```

3. `ResumeNavigation` — ajouter `parentNavId`, `polylineCache`, `nbSousNavs` :
```typescript
export interface ResumeNavigation {
  id: string;
  nom: string;
  date: string;
  type: "SOLO" | "AVENTURE" | "REGATE";
  dossierId: string;
  parentNavId: string | null;
  nbSousNavs: number;
  trace: ResumeTraceNavigation | null;
  polylineCache: [number, number][] | null;
  createdAt: string;
}
```

4. **Supprimer** `ResumeAventure` (plus utilisee).

- [ ] **Step 2: Ajouter les variables CSS pour les nouvelles couleurs dans globals.css**

Dans la section `:root` ou les variables existantes :
```css
--accent-aventure: #C45B3E;
--accent-trace-edition: #9E9E9E;
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/app/globals.css
git commit -m "feat(types): ResumeDossier + ResumeNavigation adaptes au nouveau modele"
```

---

## Task 4 : API routes — mise a jour dossiers + navigations

**Files:**
- Modify: `src/app/api/journal/dossiers/route.ts`
- Modify: `src/app/api/journal/dossiers/[id]/route.ts`
- Modify: `src/app/api/journal/dossiers/[id]/contenu/route.ts`
- Create: `src/app/api/journal/dossiers/[id]/position/route.ts`
- Modify: `src/app/api/journal/navigations/route.ts`
- Modify: `src/app/api/journal/navigations/[id]/route.ts`
- Delete: `src/app/api/journal/aventures/` (tout le dossier)
- Delete: `src/app/api/journal/dossiers/[id]/aventures/` (tout le dossier)

- [ ] **Step 1: Lire les routes API existantes**

Lire chaque fichier pour comprendre la logique actuelle avant de modifier.

- [ ] **Step 2: Mettre a jour `/api/journal/dossiers/route.ts`**

- GET : ajouter `markerLat`, `markerLon`, `parentId` dans le select. Inclure `_count: { select: { sousDossiers: true, navigations: true } }`. Ne retourner que les dossiers racine (`where: { userId, parentId: null }`). **Creer automatiquement le dossier "Non classes"** si l'utilisateur n'en a pas (via `upsert` ou check + create). Utiliser `NOM_DOSSIER_DEFAUT` et `POSITION_DOSSIER_DEFAUT` de `pointsSnap.ts`.
- POST : accepter `markerLat`, `markerLon` optionnels. Si non fournis, appeler `prochainPointSnap()` avec les positions existantes pour auto-placer.

- [ ] **Step 3: Mettre a jour `/api/journal/dossiers/[id]/route.ts`**

- PATCH : accepter `markerLat`, `markerLon`, `parentId`
- DELETE : **interdire la suppression du dossier "Non classes"** (verifier `nom !== NOM_DOSSIER_DEFAUT` ou ajouter un champ `isDefaut` sur le modele). Sinon, cascade existante.

- [ ] **Step 4: Mettre a jour `/api/journal/dossiers/[id]/contenu/route.ts`**

Retourner `{ sousDossiers: ResumeDossier[], navigations: ResumeNavigation[] }` au lieu de `{ aventures, navigationsOrphelines }`.

- Sous-dossiers : `prisma.dossier.findMany({ where: { parentId: id } })`
- Navigations : `prisma.navigation.findMany({ where: { dossierId: id, parentNavId: null } })` (exclure les sous-navs d'aventures)
- Pour chaque nav, inclure `_count: { select: { sousNavigations: true } }` et mapper en `nbSousNavs`
- Inclure `trace: { select: { polylineSimplifiee: true, distanceNm: true, durationSeconds: true, bateau: { select: { nom: true } } } }`

- [ ] **Step 5: Creer `/api/journal/dossiers/[id]/position/route.ts`**

```typescript
// PATCH : mise a jour position marqueur
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await obtenirSession();
  if (!session) return Response.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  const userId = await obtenirIdUtilisateurEffectif(session);
  const { markerLat, markerLon } = await request.json();

  const dossier = await prisma.dossier.updateMany({
    where: { id, userId },
    data: { markerLat, markerLon },
  });

  if (dossier.count === 0) {
    return Response.json({ error: "Dossier non trouve" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
```

- [ ] **Step 6: Mettre a jour `/api/journal/navigations/route.ts`**

- POST : accepter `type` (SOLO | AVENTURE | REGATE), `parentNavId` optionnel
- GET : inchange ou filtrer par `parentNavId: null` si on ne veut que les navs racine

- [ ] **Step 7: Mettre a jour `/api/journal/navigations/[id]/route.ts`**

- GET : si type AVENTURE, inclure `sousNavigations` avec leurs traces
- PATCH/DELETE : inchanges

- [ ] **Step 8: Supprimer les routes aventures**

Supprimer :
- `src/app/api/journal/aventures/` (dossier entier)
- `src/app/api/journal/dossiers/[id]/aventures/` (dossier entier)

- [ ] **Step 9: Verifier que le build passe**

Run: `npm run build`

- [ ] **Step 10: Commit**

```bash
git add src/app/api/journal/
git commit -m "feat(api): routes dossiers/navigations adaptees au nouveau modele, aventures supprimees"
```

---

## Task 5 : Composant CarteOGF (MapLibre + tuiles OGF)

**Files:**
- Create: `src/components/Accueil/CarteOGF.tsx`

- [ ] **Step 1: Creer le composant CarteOGF**

```typescript
// src/components/Accueil/CarteOGF.tsx
"use client";

import { useRef, useCallback, type ReactNode } from "react";
import Map, { type MapRef } from "react-map-gl/maplibre";
import { VUE_INITIALE_OGF } from "@/lib/pointsSnap";
import "maplibre-gl/dist/maplibre-gl.css";

interface PropsCarteOGF {
  children?: ReactNode;
  onClicCarte?: () => void;
}

const STYLE_OGF = {
  version: 8 as const,
  sources: {
    ogf: {
      type: "raster" as const,
      tiles: ["https://tile.opengeofiction.net/ogf-carto/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenGeoFiction contributors",
    },
  },
  layers: [
    {
      id: "ogf-tiles",
      type: "raster" as const,
      source: "ogf",
      paint: {
        "raster-saturation": -0.6,
        "raster-brightness-min": 0.15,
        "raster-contrast": -0.1,
      },
    },
  ],
};

export default function CarteOGF({ children, onClicCarte }: PropsCarteOGF) {
  const mapRef = useRef<MapRef>(null);

  const recentrer = useCallback(() => {
    mapRef.current?.flyTo({
      center: [VUE_INITIALE_OGF.longitude, VUE_INITIALE_OGF.latitude],
      zoom: VUE_INITIALE_OGF.zoom,
      duration: 1500,
    });
  }, []);

  return (
    <div className="carte-ogf-container">
      <Map
        ref={mapRef}
        initialViewState={VUE_INITIALE_OGF}
        mapStyle={STYLE_OGF}
        onClick={onClicCarte}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {children}
      </Map>
      <button
        className="carte-ogf-recentrer"
        onClick={recentrer}
        title="Recentrer la carte"
      >
        ⌖
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Ajouter les styles CSS**

Dans `globals.css` :
```css
/* === Accueil — Carte OGF === */
.carte-ogf-container {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.carte-ogf-recentrer {
  position: absolute;
  bottom: 24px;
  right: 24px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 253, 249, 0.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fallback si tuiles OGF indisponibles */
.carte-ogf-container .maplibregl-canvas {
  background: var(--background);
}
```

- [ ] **Step 3: Verifier en dev** — Creer un fichier temporaire de test ou modifier journal/page.tsx pour afficher la carte.

Run: `npm run dev` — verifier que les tuiles OGF s'affichent, que le pan/zoom fonctionne, que le bouton recentrer marche.

- [ ] **Step 4: Commit**

```bash
git add src/components/Accueil/CarteOGF.tsx src/app/globals.css
git commit -m "feat(accueil): composant CarteOGF avec tuiles OpenGeoFiction"
```

---

## Task 6 : MarqueurDossier

**Files:**
- Create: `src/components/Accueil/MarqueurDossier.tsx`

- [ ] **Step 1: Creer le composant MarqueurDossier**

Utiliser `Marker` de react-map-gl avec un element React custom.

```typescript
// src/components/Accueil/MarqueurDossier.tsx
"use client";

import { Marker } from "react-map-gl/maplibre";
import type { ResumeDossier } from "@/lib/types";

interface PropsMarqueurDossier {
  dossier: ResumeDossier;
  actif: boolean;
  onClick: (dossierId: string) => void;
  onDragEnd?: (dossierId: string, lat: number, lon: number) => void;
}

export default function MarqueurDossier({
  dossier,
  actif,
  onClick,
  onDragEnd,
}: PropsMarqueurDossier) {
  if (dossier.markerLat == null || dossier.markerLon == null) return null;

  const total = dossier.nbSousDossiers + dossier.nbNavigations;

  return (
    <Marker
      latitude={dossier.markerLat}
      longitude={dossier.markerLon}
      anchor="bottom"
      draggable={!!onDragEnd}
      onDragEnd={(e) => {
        if (!onDragEnd) return;
        // Snap au point le plus proche
        const { snapperVersPointProche } = require("@/lib/pointsSnap");
        const snapped = snapperVersPointProche(e.lngLat.lat, e.lngLat.lng);
        onDragEnd(dossier.id, snapped.lat, snapped.lon);
      }}
    >
      <button
        className={`marqueur-dossier ${actif ? "marqueur-dossier-actif" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onClick(dossier.id);
        }}
      >
        <span className="marqueur-dossier-nom">{dossier.nom}</span>
        {total > 0 && (
          <span className="marqueur-dossier-count">{total}</span>
        )}
      </button>
    </Marker>
  );
}
```

- [ ] **Step 2: Ajouter les styles CSS**

```css
/* === Marqueurs dossiers === */
.marqueur-dossier {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 253, 249, 0.92);
  backdrop-filter: blur(8px);
  border: 2px solid var(--border);
  border-radius: 20px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--foreground);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: border-color 0.15s, box-shadow 0.15s;
  white-space: nowrap;
  min-height: 44px; /* cible tactile */
}

.marqueur-dossier-actif {
  border-color: var(--accent-yellow);
  box-shadow: 0 2px 12px rgba(246, 188, 0, 0.3);
}

.marqueur-dossier-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: var(--border-light);
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
}

.marqueur-dossier-actif .marqueur-dossier-count {
  background: var(--accent-yellow);
  color: black;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Accueil/MarqueurDossier.tsx src/app/globals.css
git commit -m "feat(accueil): composant MarqueurDossier avec style pill creme"
```

---

## Task 7 : PanneauContenu + LigneItem

**Files:**
- Create: `src/components/Accueil/PanneauContenu.tsx`
- Create: `src/components/Accueil/LigneItem.tsx`

- [ ] **Step 1: Creer LigneItem — ligne compacte pour un item**

```typescript
// src/components/Accueil/LigneItem.tsx
"use client";

import type { ResumeNavigation, ResumeDossier } from "@/lib/types";
import { formaterDistance, formaterDuree } from "@/lib/utilitaires";

type PropsLigneItem =
  | { type: "navigation"; item: ResumeNavigation; onClick: () => void }
  | { type: "sousDossier"; item: ResumeDossier; onClick: () => void };

const COULEURS_TYPE = {
  SOLO: "var(--accent)",
  AVENTURE: "var(--accent-aventure)",
  REGATE: "var(--accent-yellow)",
} as const;

export default function LigneItem(props: PropsLigneItem) {
  if (props.type === "sousDossier") {
    const { item, onClick } = props;
    const total = item.nbSousDossiers + item.nbNavigations;
    return (
      <button className="ligne-item" onClick={onClick}>
        <span
          className="ligne-item-accent"
          style={{ background: "var(--border)" }}
        />
        <span className="ligne-item-nom">{item.nom}</span>
        <span className="ligne-item-pills">
          <span className="ligne-item-pill">{total} items</span>
        </span>
        <span className="ligne-item-chevron">›</span>
      </button>
    );
  }

  const { item, onClick } = props;
  const couleur = COULEURS_TYPE[item.type];
  const distance = item.trace?.distanceNm;
  const duree = item.trace?.durationSeconds;

  return (
    <button className="ligne-item" onClick={onClick}>
      <span className="ligne-item-accent" style={{ background: couleur }} />
      <span className="ligne-item-nom">{item.nom}</span>
      <span className="ligne-item-pills">
        {item.date && (
          <span className="ligne-item-pill">
            {new Date(item.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
            })}
          </span>
        )}
        {distance != null && (
          <span className="ligne-item-pill">
            {formaterDistance(distance)}
          </span>
        )}
        {duree != null && (
          <span className="ligne-item-pill">{formaterDuree(duree)}</span>
        )}
        {item.type === "AVENTURE" && item.nbSousNavs > 0 && (
          <span className="ligne-item-pill">
            {item.nbSousNavs} navs
          </span>
        )}
      </span>
    </button>
  );
}
```

> Note : verifier que `formaterDistance` et `formaterDuree` existent dans `src/lib/formatage.ts`. Si non, creer des helpers simples.

- [ ] **Step 2: Creer PanneauContenu**

```typescript
// src/components/Accueil/PanneauContenu.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import type { ResumeDossier, ResumeNavigation, ContenuDossier } from "@/lib/types";
import LigneItem from "./LigneItem";

interface PropsPanneauContenu {
  dossierId: string;
  nomDossier: string;
  onFermer: () => void;
  onClicNavigation: (nav: ResumeNavigation) => void;
  onOuvrir: (navId: string) => void;
}

interface NiveauBreadcrumb {
  id: string;
  nom: string;
}

export default function PanneauContenu({
  dossierId,
  nomDossier,
  onFermer,
  onClicNavigation,
  onOuvrir,
}: PropsPanneauContenu) {
  const [pile, setPile] = useState<NiveauBreadcrumb[]>([
    { id: dossierId, nom: nomDossier },
  ]);
  const [contenu, setContenu] = useState<ContenuDossier | null>(null);
  const [chargement, setChargement] = useState(true);
  const [navActive, setNavActive] = useState<string | null>(null);

  const niveauActuel = pile[pile.length - 1];

  const charger = useCallback(async (id: string) => {
    setChargement(true);
    try {
      const res = await fetch(`/api/journal/dossiers/${id}/contenu`);
      if (res.ok) setContenu(await res.json());
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger(niveauActuel.id);
  }, [niveauActuel.id, charger]);

  // Reset quand le dossier racine change
  useEffect(() => {
    setPile([{ id: dossierId, nom: nomDossier }]);
    setNavActive(null);
  }, [dossierId, nomDossier]);

  const descendreDans = (sousDossier: ResumeDossier) => {
    setPile((prev) => [...prev, { id: sousDossier.id, nom: sousDossier.nom }]);
    setNavActive(null);
  };

  const remonterA = (index: number) => {
    if (index === -1) {
      onFermer();
      return;
    }
    setPile((prev) => prev.slice(0, index + 1));
    setNavActive(null);
  };

  const gererClicNav = (nav: ResumeNavigation) => {
    setNavActive(nav.id);
    onClicNavigation(nav);
  };

  return (
    <div className="panneau-contenu">
      {/* Breadcrumb */}
      <div className="panneau-contenu-header">
        <div className="panneau-contenu-breadcrumb">
          <button
            className="panneau-contenu-breadcrumb-item"
            onClick={() => remonterA(-1)}
          >
            Accueil
          </button>
          {pile.map((niveau, i) => (
            <span key={niveau.id}>
              <span className="panneau-contenu-breadcrumb-sep"> › </span>
              {i < pile.length - 1 ? (
                <button
                  className="panneau-contenu-breadcrumb-item"
                  onClick={() => remonterA(i)}
                >
                  {niveau.nom}
                </button>
              ) : (
                <span className="panneau-contenu-breadcrumb-actuel">
                  {niveau.nom}
                </span>
              )}
            </span>
          ))}
        </div>
        <button className="panneau-contenu-fermer" onClick={onFermer}>
          ✕
        </button>
      </div>

      {/* Liste */}
      <div className="panneau-contenu-liste">
        {chargement ? (
          <div className="panneau-contenu-chargement">Chargement...</div>
        ) : contenu ? (
          <>
            {contenu.sousDossiers.map((sd) => (
              <LigneItem
                key={sd.id}
                type="sousDossier"
                item={sd}
                onClick={() => descendreDans(sd)}
              />
            ))}
            {contenu.navigations.map((nav) => (
              <LigneItem
                key={nav.id}
                type="navigation"
                item={nav}
                onClick={() => gererClicNav(nav)}
              />
            ))}
            {contenu.sousDossiers.length === 0 &&
              contenu.navigations.length === 0 && (
                <div className="panneau-contenu-vide">Aucun contenu</div>
              )}
          </>
        ) : null}
      </div>

      {/* Bouton ouvrir si nav active */}
      {navActive && (
        <div className="panneau-contenu-footer">
          <button
            className="btn-principal"
            onClick={() => onOuvrir(navActive)}
          >
            Ouvrir
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Ajouter les styles CSS pour panneau + ligne**

```css
/* === Panneau contenu dossier === */
.panneau-contenu {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 20;
  width: 320px;
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: rgba(255, 253, 249, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panneau-contenu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  gap: 8px;
}

.panneau-contenu-breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  font-size: 12px;
  min-width: 0;
}

.panneau-contenu-breadcrumb-item {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: 12px;
  color: var(--accent);
  cursor: pointer;
}

.panneau-contenu-breadcrumb-sep {
  color: var(--text-light);
  margin: 0 2px;
}

.panneau-contenu-breadcrumb-actuel {
  font-weight: 600;
  color: var(--foreground);
}

.panneau-contenu-fermer {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  border: none;
  background: none;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panneau-contenu-liste {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.panneau-contenu-vide,
.panneau-contenu-chargement {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-light);
  font-size: 13px;
}

.panneau-contenu-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
}

/* === Ligne item === */
.ligne-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 13px;
  color: var(--foreground);
  cursor: pointer;
  text-align: left;
  min-height: 44px; /* cible tactile */
  transition: background 0.1s;
}

.ligne-item:active {
  background: rgba(0, 0, 0, 0.04);
}

.ligne-item-accent {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  flex-shrink: 0;
}

.ligne-item-nom {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ligne-item-pills {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.ligne-item-pill {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--border-light);
  color: var(--text-secondary);
  white-space: nowrap;
}

.ligne-item-chevron {
  color: var(--text-light);
  font-size: 16px;
  flex-shrink: 0;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Accueil/PanneauContenu.tsx src/components/Accueil/LigneItem.tsx src/app/globals.css
git commit -m "feat(accueil): PanneauContenu + LigneItem — navigation dans les dossiers"
```

---

## Task 8 : Projection de trace sur la carte OGF

**Files:**
- Create: `src/lib/projectionTrace.ts`
- Create: `src/components/Accueil/ProjectionTrace.tsx`
- Create: `src/components/Accueil/TooltipStats.tsx`

- [ ] **Step 1: Creer les fonctions de projection pure**

```typescript
// src/lib/projectionTrace.ts

/**
 * Projette une polyline reelle sur des coordonnees OGF fictives.
 * La trace est normalisee, mise a l'echelle, et ancree sur un point d'eau libre.
 */

interface Point {
  lat: number;
  lon: number;
}

interface PolylineProjetee {
  coordinates: [number, number][]; // [lon, lat] pour GeoJSON
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}

/**
 * @param polyline - points [lat, lon] de la polyline simplifiee
 * @param ancre - point OGF ou ancrer le centre de la trace
 * @param taillePx - taille cible en pixels a l'ecran (~300)
 * @param zoom - zoom MapLibre courant
 */
export function projeterSurOGF(
  polyline: [number, number][],
  ancre: { lat: number; lon: number },
  taillePx: number = 300,
  zoom: number = 8
): PolylineProjetee {
  if (polyline.length === 0) {
    return { coordinates: [], bbox: { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 } };
  }

  // 1. Bounding box reelle
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  for (const [lat, lon] of polyline) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }

  const largeurReelle = maxLon - minLon || 0.001;
  const hauteurReelle = maxLat - minLat || 0.001;

  // 2. Facteur d'echelle : taillePx en degres au zoom courant
  // A zoom 8, ~1 deg ≈ 256px (approximation)
  const pxParDeg = 256 * Math.pow(2, zoom) / 360;
  const tailleDeg = taillePx / pxParDeg;

  // 3. Scale pour que la plus grande dimension fasse tailleDeg
  const scale = tailleDeg / Math.max(largeurReelle, hauteurReelle);

  // 4. Centrer sur l'ancre
  const centreReelLat = (minLat + maxLat) / 2;
  const centreReelLon = (minLon + maxLon) / 2;

  const coordinates: [number, number][] = polyline.map(([lat, lon]) => [
    ancre.lon + (lon - centreReelLon) * scale,
    ancre.lat + (lat - centreReelLat) * scale,
  ]);

  // 5. Bbox projetee
  const lons = coordinates.map(([lon]) => lon);
  const lats = coordinates.map(([, lat]) => lat);

  return {
    coordinates,
    bbox: {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    },
  };
}
```

- [ ] **Step 2: Creer ProjectionTrace (overlay GeoJSON sur MapLibre)**

```typescript
// src/components/Accueil/ProjectionTrace.tsx
"use client";

import { useMemo } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import { projeterSurOGF } from "@/lib/projectionTrace";
import { ZONE_PROJECTION_TRACE } from "@/lib/pointsSnap";
import type { ResumeNavigation } from "@/lib/types";
import TooltipStats from "./TooltipStats";

interface PropsProjectionTrace {
  navigation: ResumeNavigation;
}

const COULEURS_TRACE: Record<string, string> = {
  SOLO: "#43728B",
  AVENTURE: "#C45B3E",
  REGATE: "#F6BC00",
};

export default function ProjectionTrace({ navigation }: PropsProjectionTrace) {
  const { current: map } = useMap();
  const zoom = map?.getZoom() ?? 8;

  const polylineSource =
    navigation.polylineCache ?? navigation.trace?.polylineSimplifiee;

  const projection = useMemo(() => {
    if (!polylineSource || !Array.isArray(polylineSource)) return null;
    return projeterSurOGF(
      polylineSource as [number, number][],
      ZONE_PROJECTION_TRACE,
      300,
      zoom
    );
  }, [polylineSource, zoom]);

  if (!projection || projection.coordinates.length === 0) return null;

  const geojson = {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: projection.coordinates,
    },
  };

  const couleur = COULEURS_TRACE[navigation.type] ?? "#43728B";

  return (
    <>
      <Source id="trace-preview" type="geojson" data={geojson}>
        <Layer
          id="trace-preview-line"
          type="line"
          paint={{
            "line-color": couleur,
            "line-width": 3,
            "line-opacity": 0.8,
          }}
        />
      </Source>
      <TooltipStats
        navigation={navigation}
        bbox={projection.bbox}
      />
    </>
  );
}
```

- [ ] **Step 3: Creer TooltipStats**

```typescript
// src/components/Accueil/TooltipStats.tsx
"use client";

import { Marker } from "react-map-gl/maplibre";
import type { ResumeNavigation } from "@/lib/types";
import { formaterDistance, formaterDuree } from "@/lib/utilitaires";

interface PropsTooltipStats {
  navigation: ResumeNavigation;
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
}

export default function TooltipStats({ navigation, bbox }: PropsTooltipStats) {
  const centreLat = (bbox.minLat + bbox.maxLat) / 2;
  const centreLon = (bbox.minLon + bbox.maxLon) / 2;
  const distance = navigation.trace?.distanceNm;
  const duree = navigation.trace?.durationSeconds;

  return (
    <>
      {/* Nom + date en haut de la trace */}
      <Marker
        latitude={bbox.maxLat}
        longitude={centreLon}
        anchor="bottom"
      >
        <div className="tooltip-stats tooltip-stats-haut">
          <span>{navigation.nom}</span>
          {navigation.date && (
            <span className="tooltip-stats-sep">
              {new Date(navigation.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      </Marker>

      {/* Distance + duree en bas */}
      {(distance != null || duree != null) && (
        <Marker
          latitude={bbox.minLat}
          longitude={centreLon}
          anchor="top"
        >
          <div className="tooltip-stats tooltip-stats-bas">
            {distance != null && <span>{formaterDistance(distance)}</span>}
            {duree != null && <span>{formaterDuree(duree)}</span>}
          </div>
        </Marker>
      )}
    </>
  );
}
```

- [ ] **Step 4: Styles CSS pour les tooltips**

```css
/* === Tooltips stats trace === */
.tooltip-stats {
  display: flex;
  gap: 8px;
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  font-size: 12px;
  color: white;
  white-space: nowrap;
  pointer-events: none;
}

.tooltip-stats-sep {
  opacity: 0.7;
}

.tooltip-stats-haut {
  font-weight: 600;
}

.tooltip-stats-bas {
  font-size: 11px;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/projectionTrace.ts src/components/Accueil/ProjectionTrace.tsx src/components/Accueil/TooltipStats.tsx src/app/globals.css
git commit -m "feat(accueil): projection de trace sur carte OGF + tooltips stats"
```

---

## Task 9 : PageAccueil — orchestration

**Files:**
- Create: `src/components/Accueil/PageAccueil.tsx`
- Modify: `src/app/journal/page.tsx`

- [ ] **Step 1: Creer PageAccueil — le composant client principal**

```typescript
// src/components/Accueil/PageAccueil.tsx
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { ResumeDossier, ResumeNavigation } from "@/lib/types";
import MarqueurDossier from "./MarqueurDossier";
import PanneauContenu from "./PanneauContenu";
import ProjectionTrace from "./ProjectionTrace";

const CarteOGF = dynamic(() => import("./CarteOGF"), { ssr: false });

interface PropsPageAccueil {
  dossiers: ResumeDossier[];
}

export default function PageAccueil({ dossiers }: PropsPageAccueil) {
  const routeur = useRouter();
  const [dossierActif, setDossierActif] = useState<string | null>(null);
  const [navPreview, setNavPreview] = useState<ResumeNavigation | null>(null);

  const dossierSelectionne = dossiers.find((d) => d.id === dossierActif);

  const gererClicCarte = useCallback(() => {
    setDossierActif(null);
    setNavPreview(null);
  }, []);

  const gererClicDossier = useCallback((dossierId: string) => {
    setDossierActif((prev) => (prev === dossierId ? null : dossierId));
    setNavPreview(null);
  }, []);

  const gererClicNavigation = useCallback((nav: ResumeNavigation) => {
    setNavPreview(nav);
  }, []);

  const gererOuvrir = useCallback(
    (navId: string) => {
      routeur.push(`/navigation/${navId}`);
    },
    [routeur]
  );

  const gererFermer = useCallback(() => {
    setDossierActif(null);
    setNavPreview(null);
  }, []);

  const gererDragDossier = useCallback(
    async (dossierId: string, lat: number, lon: number) => {
      await fetch(`/api/journal/dossiers/${dossierId}/position`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markerLat: lat, markerLon: lon }),
      });
      routeur.refresh();
    },
    [routeur]
  );

  return (
    <>
      <CarteOGF onClicCarte={gererClicCarte}>
        {/* Marqueurs dossiers */}
        {dossiers.map((dossier) => (
          <MarqueurDossier
            key={dossier.id}
            dossier={dossier}
            actif={dossier.id === dossierActif}
            onClick={gererClicDossier}
            onDragEnd={gererDragDossier}
          />
        ))}

        {/* Projection trace si nav selectionnee */}
        {navPreview && <ProjectionTrace navigation={navPreview} />}
      </CarteOGF>

      {/* Panneau contenu si dossier ouvert */}
      {dossierActif && dossierSelectionne && (
        <PanneauContenu
          dossierId={dossierActif}
          nomDossier={dossierSelectionne.nom}
          onFermer={gererFermer}
          onClicNavigation={gererClicNavigation}
          onOuvrir={gererOuvrir}
        />
      )}

      {/* Etat vide */}
      {dossiers.length === 0 && (
        <div className="panneau-onboarding">
          <h2>Bienvenue sur Sillage</h2>
          <p>Placez votre premier port d'attache pour commencer.</p>
          <button className="btn-principal" onClick={() => {/* TODO: modale creation dossier */}}>
            Creer un dossier
          </button>
        </div>
      )}

      {/* Bouton settings */}
      <button
        className="btn-settings-accueil"
        title="Parametres"
        onClick={() => {/* TODO: panneau settings */}}
      >
        ⚙
      </button>
    </>
  );
}
```

- [ ] **Step 2: Modifier la page serveur journal/page.tsx**

Remplacer l'import de `PageJournal` par `PageAccueil`. Adapter la requete Prisma pour inclure les champs position et ne retourner que les dossiers racine :

```typescript
const resultDossiers = await prisma.dossier.findMany({
  where: { userId, parentId: null },
  orderBy: { createdAt: "desc" },
  include: {
    _count: { select: { sousDossiers: true, navigations: true } },
  },
});

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
```

Passer `<PageAccueil dossiers={dossiers} />` au lieu de l'ancien composant.

> On peut retirer les props `bateaux` et `tracesDisponibles` du server component pour l'instant — elles seront chargees par le PanneauSettings quand il sera implemente.

- [ ] **Step 3: Ajouter les styles CSS d'orchestration**

```css
/* === Onboarding === */
.panneau-onboarding {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  background: rgba(255, 253, 249, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 32px 40px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.panneau-onboarding h2 {
  font-size: 18px;
  margin-bottom: 8px;
}

.panneau-onboarding p {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* === Bouton settings === */
.btn-settings-accueil {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 20;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 253, 249, 0.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 4: Verifier en dev**

Run: `npm run dev` — aller sur `/journal`. Verifier :
- La carte OGF s'affiche en plein ecran
- Le bouton recentrer fonctionne
- S'il y a des dossiers, leurs marqueurs apparaissent
- Clic sur un marqueur ouvre le panneau
- Clic sur une nav projette la trace en mer
- Bouton Ouvrir redirige vers `/navigation/{id}`
- Etat vide affiche l'onboarding

- [ ] **Step 5: Commit**

```bash
git add src/components/Accueil/PageAccueil.tsx src/app/journal/page.tsx src/app/globals.css
git commit -m "feat(accueil): PageAccueil — orchestration carte OGF + panneaux + projection"
```

---

## Task 10 : Adapter ModaleElement + creation de contenu

**Files:**
- Modify: `src/components/Journal/ModaleElement.tsx`

- [ ] **Step 1: Lire ModaleElement actuel**

Comprendre la logique actuelle de creation/edition pour dossier, aventure, navigation.

- [ ] **Step 2: Adapter au nouveau modele**

- Retirer le type "aventure" comme entite separee
- Ajouter le type AVENTURE dans le select du type de navigation
- Remplacer le champ `aventureId` par `parentNavId` dans le formulaire navigation
- Adapter les appels API (plus de POST vers `/dossiers/{id}/aventures`)
- Ajouter la creation de sous-dossier (POST vers `/dossiers` avec `parentId`)

- [ ] **Step 3: Integrer la modale dans PageAccueil**

Ajouter un state `modale` dans PageAccueil et passer les callbacks au PanneauContenu pour le bouton "+ Nav" et "+ Sous-dossier".

- [ ] **Step 4: Verifier en dev**

Creer un dossier, creer une nav dedans, creer un sous-dossier. Verifier que tout fonctionne.

- [ ] **Step 5: Commit**

```bash
git add src/components/Journal/ModaleElement.tsx src/components/Accueil/PageAccueil.tsx src/components/Accueil/PanneauContenu.tsx
git commit -m "feat(accueil): ModaleElement adaptee au nouveau modele + creation depuis panneau"
```

---

## Task 11 : PanneauSettings (V1 minimaliste)

**Files:**
- Create: `src/components/PanneauSettings.tsx`

- [ ] **Step 1: Creer le panneau settings avec les 3 onglets de base**

Trois sections pour V1 :
1. **Import traces** — bouton upload GPX (reprendre la logique existante de la page traces)
2. **Bateaux** — liste CRUD simple (reprendre la logique existante)
3. **Dossiers** — vue tableau classique avec arborescence, editable en ligne

Pour V1, la section Dossiers peut etre un tableau simple :
```
| Nom         | Type      | Contenu  | Actions    |
| Glenans 2025| Dossier   | 7 items  | ✎ ✕ ↕     |
|  └ Stage jun| Dossier   | 5 navs   | ✎ ✕ ↕     |
|  └ Balade   | Nav solo  | 12 NM    | ✎ ✕       |
```

- [ ] **Step 2: Ajouter les styles**

Le panneau prend la meme esthetique que les autres panneaux (creme, blur) mais il est plus large (~480px) et positionne en overlay central ou lateral droit.

- [ ] **Step 3: Integrer dans PageAccueil**

Connecter le bouton engrenage a l'ouverture du panneau.

- [ ] **Step 4: Verifier en dev**

- [ ] **Step 5: Commit**

```bash
git add src/components/PanneauSettings.tsx src/components/Accueil/PageAccueil.tsx src/app/globals.css
git commit -m "feat(accueil): PanneauSettings V1 — import traces, bateaux, gestion dossiers tableau"
```

---

## Task 12 : Nettoyage — suppression anciens composants journal

**Files:**
- Delete: `src/components/Journal/PageJournal.tsx`
- Delete: `src/components/Journal/CarteDossier.tsx`
- Delete: `src/components/Journal/CarteAventure.tsx`
- Delete: `src/components/Journal/CarteNavigation.tsx`
- Delete: `src/components/Journal/ContenuDossier.tsx`
- Delete: `src/components/Journal/BarreActionsJournal.tsx`
- Delete: `src/components/Journal/PanneauApercu.tsx`
- Modify: `src/app/globals.css` — retirer les classes CSS orphelines

> Note : les routes API aventures ont deja ete supprimees dans Task 4. Pas besoin de les re-supprimer ici.

- [ ] **Step 1: Verifier qu'aucun import ne reference les composants a supprimer**

Run: `grep -r "PageJournal\|CarteDossier\|CarteAventure\|CarteNavigation\|ContenuDossier\|BarreActionsJournal\|PanneauApercu" src/ --include="*.ts" --include="*.tsx" -l`

Ne devrait retourner que les fichiers a supprimer eux-memes.

- [ ] **Step 2: Supprimer les fichiers composants journal**

- [ ] **Step 3: Nettoyer globals.css**

Retirer les classes :
- `.carte-dossier*`
- `.carte-aventure*`
- `.carte-navigation*`
- `.panneau-apercu*`
- `.journal-layout*`
- `.barre-actions-journal*`

- [ ] **Step 5: Verifier que le build passe**

Run: `npm run build`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(accueil): suppression anciens composants journal + routes aventures"
```

---

## Task 13 : CHANGELOG + validation finale

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Mettre a jour CHANGELOG.md**

Ajouter une entree pour la refonte accueil (v0.6.0 ou similaire).

- [ ] **Step 2: Build de production**

Run: `npm run build`
S'assurer que tout compile sans erreur.

- [ ] **Step 3: Test manuel complet**

Run: `npm run dev` et verifier :
- [ ] Carte OGF s'affiche avec tuiles desaturees
- [ ] Marqueurs dossiers visibles aux bons emplacements
- [ ] Clic marqueur → panneau s'ouvre avec contenu
- [ ] Navigation dans sous-dossiers via breadcrumb
- [ ] Clic item → trace projetee en mer + tooltips stats
- [ ] Bouton Ouvrir → redirige vers vue navigation
- [ ] Creation dossier / nav via modale
- [ ] Bouton recentrer ramene a la zone initiale
- [ ] Panneau settings accessible
- [ ] Etat vide / onboarding fonctionnel
- [ ] Responsive tablette : cibles tactiles >= 44px

- [ ] **Step 4: Commit final**

```bash
git add CHANGELOG.md
git commit -m "docs: changelog v0.6.0 — refonte accueil carte OGF"
```
