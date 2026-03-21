@AGENTS.md

# Navimeter

App d'analyse de traces de navigation à voile.

## Stack

- Next.js 16 + React 19 + TypeScript + Mantine + CSS vanilla
- Prisma 7 + PostgreSQL (Railway)
- Better Auth (email/password, sessions 7j)
- MapLibre GL JS + react-map-gl + OpenStreetMap + OpenSeaMap (tuiles nautiques, rendu WebGL)
- Recharts (graphiques vitesse/temps)

## Architecture

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx            # Accueil (redirige vers /traces si connecté)
│   ├── trace/[id]/page.tsx # Vue immersive trace (carte plein écran + panneaux flottants)
│   ├── trace/[id]/nettoyage/page.tsx  # Page nettoyage (détection aberrants, exclusion, export)
│   └── api/traces/         # API REST (CRUD, points bulk update, export GPX)
├── components/
│   ├── Map/                # TraceMap (MapLibre GL JS) + TraceMapWrapper (ssr:false)
│   │   └── EchelleCarte    # Échelle nautique/métrique dynamique
│   ├── Nettoyage/          # Page nettoyage : carte, graphique, contrôles, stats flottantes
│   ├── Stats/              # StatsPanel + SpeedChart
│   │   └── GraphiqueRedimensionnable  # Wrapper drag-resize pour graphiques
│   ├── Upload/             # FileUpload (drag & drop, validation taille)
│   ├── TraceList/          # Liste des traces importées
│   ├── TitreEditable.tsx   # Titre inline éditable (clic → input)
│   └── TraceVueClient.tsx  # Carte + graphique synchronisés (client component)
└── lib/
    ├── parsers/            # GPX et KML → TraceAnalysee
    │   └── commun.ts       # Logique partagée (enrichirPoints, extrairePointsGeoJson)
    ├── geo/                # Calculs : distance, cap, vitesse, stats, simplification, lissage, détection aberrants
    │   ├── math.ts         # Fonctions mathématiques partagées (enRadians, enDegres)
    │   ├── couleur-vitesse.ts  # Gradient vitesse HSL partagé (carte + graphique)
    │   └── detection-aberrants.ts  # Détection pics vitesse (MAD), sauts GPS, timestamps anormaux
    ├── export/             # Export GPX nettoyé
    ├── services/           # Logique métier (import-trace.ts)
    │   └── recalculer-stats.ts  # Recalcul stats après exclusion de points
    ├── types.ts            # Types partagés (PointAnalyse, TraceAnalysee, etc.)
    ├── theme.ts            # Constantes de couleurs (COULEURS)
    ├── utilitaires.ts      # Fonctions utilitaires (formaterDuree)
    ├── journal.ts          # Logger minimal (journalErreur, journalAvertissement)
    └── db.ts               # Singleton Prisma
```

## Conventions

- **Langue** : tout en français (UI, code, commits, logs GitHub)
- **Nommage code** : français sans accents (ex: `formaterDuree`, `detecterSource`, `PointAnalyse`)
- **Unités nautiques** : nœuds (kn), milles nautiques (NM), degrés (°)
- **Charte graphique** : jaune #F6BC00, bleu #43728B, gris chauds, fond crème #FFFDF9 — constantes centralisées dans `src/lib/theme.ts`
- **Police** : Atkinson Hyperlegible Next
- **Carte** : MapLibre GL JS côté client uniquement (ssr: false via TraceMapWrapper)
- **Desktop-first** : l'analyse de traces se fait sur desktop, le responsive est secondaire

## Commandes

```bash
npm run dev          # Dev local (port 3000)
npm run build        # Build production (inclut prisma generate)
npm run db:migrate   # Prisma migrate dev
npm run db:studio    # Prisma Studio (port 5555)
```

## Déploiement

- Railway : auto-deploy sur push `main` via GitHub — **chaque push déclenche un build payant**
- **Ne pas push directement sur `main`** : travailler sur une branche, regrouper les changements, puis merger quand c'est prêt
- La variable `DATABASE_URL` utilise l'URL **interne** Railway en prod
- Start command : `prisma migrate deploy && next start`
- Build : `prisma generate && next build`

## Points d'attention

- `force-dynamic` obligatoire sur les pages qui font des requêtes DB (sinon erreur au build)
- MapLibre GL JS ne supporte pas le SSR → toujours wrapper avec `dynamic()` + `ssr: false`
- Les coordonnées sont stockées en WGS84 (lat/lon décimaux)
- Les points sont ordonnés par `pointIndex` (pas par timestamp, qui peut être null)
- Validation taille fichier : 50 Mo max (client + serveur)
- **Soft-delete GPS** : `isExcluded` sur TrackPoint, jamais de suppression de données originales
- **Turbopack cache** : si un changement JSX n'est pas pris en compte, `rm -rf .next` et relancer le serveur
- **Recharts types** : `onMouseMove` sur LineChart nécessite un type `any` (types incompatibles)
- **Vues immersives** : pattern `body:has(.layout-class)` en CSS pour masquer header/footer sur les pages carte plein écran
- **Variables CSS dynamiques** : `--hauteur-graphique` synchronise le positionnement de l'échelle et des contrôles carte avec le graphique redimensionnable

## Roadmap

Voir [ROADMAP.md](ROADMAP.md) pour le backlog et [CHANGELOG.md](CHANGELOG.md) pour l'historique des versions.
