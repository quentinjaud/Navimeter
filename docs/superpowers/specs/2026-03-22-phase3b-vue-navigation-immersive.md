# Phase 3b — Vue navigation immersive

## Contexte

La Phase 3a a livre le journal de bord (dossiers, aventures, navigations) et la vue trace brute (`/trace/[id]`). La Phase 3b cree une vue navigation immersive (`/navigation/[id]`) distincte de la vue trace, et enrichit les deux vues avec de nouveaux composants partages.

### Deux vues, deux contextes

- `/trace/[id]` (depuis "Mes traces") : vue brute, nettoyage, edition GPS
- `/navigation/[id]` (depuis le journal) : meme carte/graphique + journalisation (Phase 3c)

## Perimetre

### Composants partages (les deux vues)

1. **TraceChart** — remplace SpeedChart, graphique multi-donnees
2. **Timeline** — slider temporel sous le graphique
3. **PanneauStats enrichi** — stats globales + donnees du point actif + switch de donnee graphee
4. **Marqueur directionnel** — curseur en forme de coque sur la carte

### Specifique a la vue navigation

5. **Route `/navigation/[id]`** — page immersive avec NavigationVueClient
6. **Metadonnees editables** — nom, date, type (edition inline). Le bateau est celui de la trace associee (en lecture seule).
7. **Lien depuis le journal** — CarteNavigation pointe vers `/navigation/[id]`

### Hors perimetre

- Entrees journal (notes, photos) → Phase 3c
- Animation/replay automatique (play/pause) → non retenu (curseur manuel uniquement)
- Donnees NMEA → futur, mais l'archi est extensible
- Edition du bateau depuis la vue navigation (le bateau vit sur la trace)

## Architecture

### Arbre de composants

```
Partages (src/components/) :
├── Map/TraceMap.tsx              — existant, + marqueur directionnel
├── Stats/TraceChart.tsx          — nouveau, remplace SpeedChart
├── Stats/GraphiqueRedimensionnable.tsx  — existant, inchange
├── Stats/PanneauStats.tsx        — enrichi (stats globales + point actif)
├── Stats/Timeline.tsx            — nouveau, slider temporel

Orchestrateurs :
├── TraceVueClient.tsx            — adapte pour utiliser les nouveaux composants
├── NavigationVueClient.tsx       — nouveau, fork de TraceVueClient + metadonnees

Routes :
├── app/trace/[id]/page.tsx       — existant, inchange
├── app/navigation/[id]/page.tsx  — nouveau (server component)
├── app/navigation/[id]/loading.tsx
├── app/navigation/[id]/not-found.tsx
```

### Etat central (orchestrateurs)

```typescript
pointActifIndex: number | null    // index du point actif (hover ou drag timeline)
donneeGraphee: 'vitesse' | 'cap'  // serie affichee dans le graphique
```

`pointActifIndex` est la source unique de synchronisation entre tous les composants :
- **Timeline** : le deplace par drag
- **TraceChart** : le deplace au hover souris
- **TraceMap** : affiche le marqueur directionnel a la position du point
- **PanneauStats** : affiche vitesse + cap du point

`donneeGraphee` est controle par le clic dans PanneauStats.

### Flux de donnees

```
                    pointActifIndex
                         |
        +--------+-------+-------+---------+
        |        |               |         |
    Timeline  TraceChart     TraceMap  PanneauStats
    (drag→set) (hover→set)  (marqueur) (affiche + switch donneeGraphee)
```

## Detail des composants

### TraceChart

Remplace `SpeedChart.tsx`. Meme base Recharts.

**Props :**
- `points: PointCarte[]`
- `donnee: 'vitesse' | 'cap'`
- `pointActifIndex: number | null`
- `onHoverPoint: (index: number | null) => void`

**Comportement :**
- `donnee === 'vitesse'` : axe Y en kn, gradient bleu→rouge (identique a SpeedChart actuel)
- `donnee === 'cap'` : axe Y en degres 0-360°, couleur unique bleu `--accent` (#43728B)
- Si la donnee est absente (ex: `headingDeg` null sur tous les points) : option desactivee dans PanneauStats, graphique non affichable
- Points individuels avec valeur null : gaps dans la courbe (pas d'interpolation)
- Axe X : temporel (timestamp)
- Downsampling : max 500 points (meme algo que SpeedChart)
- Trait vertical curseur a `pointActifIndex`
- Hover souris → met a jour `pointActifIndex`

### Timeline

Barre horizontale sous le graphique, dans le conteneur GraphiqueRedimensionnable.

**Props :**
- `points: PointCarte[]`
- `pointActifIndex: number | null`
- `onChangeIndex: (index: number) => void`

**Comportement :**
- Represente la duree totale (premier→dernier timestamp)
- Curseur draggable : trouve le point le plus proche du timestamp vise (binaire sur les points downsamplees)
- Affiche l'heure du point actif (format HH:mm:ss)
- Implementation legere : `<div>` custom avec drag events (pas de lib externe)
- Largeur alignee sur le graphique au-dessus
- Utilise le meme jeu de points downsamplees que TraceChart
- Masquee si la trace n'a pas de timestamps

### Marqueur directionnel (carte)

**Forme :** SVG coque de bateau vue de dessus — triangle allonge, pointe vers l'avant.

**Props sur TraceMap :**
- `pointActif: { lat, lon, headingDeg } | null`

**Comportement :**
- Rotation : `rotate({headingDeg}deg)` via le bearing du point
- Couleur : jaune `#F6BC00` (ressort sur fond carte)
- Visible uniquement quand `pointActif !== null`
- Position : coordonnees [lon, lat] du point actif
- Implementation : MapLibre marker avec element HTML/SVG custom

### PanneauStats enrichi

Nouveau composant `PanneauStats.tsx`, remplace `StatsPanel.tsx` (renommage FR + enrichissement). `StatsPanel.tsx` est supprime.

**Zone haute — stats globales (inchange) :**
- Distance (NM), duree, vitesse moy, vitesse max

**Zone basse — point actif (nouveau) :**
- Vitesse : valeur en kn
- Cap : valeur en °
- La donnee graphee est **accentuee** : taille plus grande + couleur `--accent`
- L'autre donnee est en gris secondaire
- **Clic sur la donnee non-accentuee** → switch `donneeGraphee` et change le graphique
- Si `pointActifIndex === null` : zone masquee ou tirets `--`

### NavigationVueClient

Fork de `TraceVueClient` avec ajouts :

**Header navigation :**
- Nom de la navigation (editable inline)
- Breadcrumb : Dossier > Aventure > Navigation
- Badges : type (SOLO/REGATE), bateau

**Metadonnees editables :**
- Nom, date, type (SOLO/REGATE) — edition inline ou mini-formulaire
- Bateau : affiche en lecture seule (vient de la trace associee)
- Sauvegarde via PATCH `/api/journal/navigations/[id]`

**Breadcrumb :**
- Necessite le nom du dossier et de l'aventure (optionnelle) — inclure dans la requete server component

### Route `/navigation/[id]`

**Server component (`page.tsx`) :**
- Requete Prisma directe (meme pattern que `/trace/[id]/page.tsx`) — pas de fetch API
- Include : navigation + trace + trackPoints + dossier.nom + aventure?.nom + trace.bateau
- Verification : navigation appartient au user connecte
- Si pas de trace associee : afficher un etat vide avec lien pour associer

**API :**
- PATCH metadonnees : API existante `/api/journal/navigations/[id]`, deja fonctionnelle
- Pas de nouveau GET — le server component query directement Prisma

### Lien depuis le journal

`CarteNavigation.tsx` : le clic sur une navigation pointe vers `/navigation/[id]` au lieu de `/trace/[id]`.

## Styles

### Layout

Meme structure CSS que la vue trace (`.trace-vue-layout`, `.trace-vue-header`, etc.).
La vue navigation ajoute une classe `.navigation-vue-layout` pour les specificites (header enrichi).

### Timeline

- Barre fine, couleur gris clair, hauteur ~24px
- Curseur : cercle ou pointe, couleur `--accent-yellow`
- Heure affichee a cote du curseur
- Integree visuellement sous le graphique (meme largeur, pas de gap)

### Marqueur directionnel

- SVG ~20x30px, jaune `#F6BC00`, contour blanc 1px pour lisibilite
- Rotation fluide (transition CSS si le point change au hover)

### Point actif dans PanneauStats

- Donnee accentuee : `font-size: 1.4rem`, `color: var(--accent)`, `cursor: default`
- Donnee secondaire : `font-size: 1rem`, `color: var(--text-secondary)`, `cursor: pointer`
- Transition douce sur le switch

## Migration

- `SpeedChart.tsx` → supprime, remplace par `TraceChart.tsx`
- `StatsPanel.tsx` → supprime, remplace par `PanneauStats.tsx`
- `pointSurvole` → renomme en `pointActifIndex` dans TraceVueClient (coherence avec le nouveau modele)
- `TraceVueClient` adapte pour utiliser TraceChart, PanneauStats, Timeline, marqueur directionnel
- Extraire `PointCarte` dans `src/lib/types.ts` (actuellement duplique dans TraceVueClient et TraceMap)
- Nettoyer le CSS `.nettoyage-curseur-sync` si remplace par le marqueur directionnel
- Les imports dans `/trace/[id]/page.tsx` restent identiques (le server component ne change pas)

## Extensibilite

- `donneeGraphee` est un type union `'vitesse' | 'cap'` — extensible a `'twa' | 'vmg' | 'tws'` quand les donnees NMEA seront disponibles (Phase 4+)
- Le `TraceChart` accepte n'importe quelle serie numerique via sa prop `donnee`
- La timeline est generique, reutilisable pour le replay anime si on le veut plus tard
