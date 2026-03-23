# Architecture du Journal — Design Notes

> A discuter — notes de reflexion, pas encore une spec.

## Les 3 types dans un Dossier

### Navigation (solo)
- **1 bateau, 1 trace**
- Modes : journal de bord, analyse de performance
- C'est l'unite de base

### Aventure
- **Plusieurs navigations assemblees**
- Mode : journal compile (recit continu sur plusieurs jours/navs)
- Les navigations gardent leur individualite pour l'analyse perf

### Regate
- **Plusieurs bateaux, plusieurs traces**
- Mode journal collectif : chaque equipage peut contribuer des entrees
- Mode perf comparee : superposition des traces, classement, delta temps

## Questions ouvertes

- **Regate** : nouveau modele Prisma ou flag/type sur Navigation ?
  - Pro nouveau modele : semantique claire, relations propres
  - Pro flag : moins de tables, reutilise NavigationTrace pivot existant
- **Lien Regate <-> Bateaux** : NavigationTrace suffit-il ou faut-il une table pivot dediee `RegateBateau` ?
- **Perf comparee** : meme carte avec N traces superposees, meme graphique vitesse/temps avec N courbes
- **Journal collectif** : qui redige quoi ? LogEntry liee a un bateau/equipage ? Fusion chronologique a l'affichage ?
- **Permissions** : une regate peut avoir des participants invites — visibilite des traces entre concurrents ?

## Lien avec la ROADMAP existante

La ROADMAP prevoit deja :
- `NavigationTrace[]` comme pivot (trace + bateau ou bateau invite)
- La notion de "Navigation Regate" avec multi-traces
- `LogEntry[]`, `Leg[]`, `Maneuver[]`

Cette reflexion affine en distinguant clairement les 3 types et leurs modes d'affichage.

---

## Philosophie UI : la carte au centre de tout

La carte n'est pas un outil secondaire — c'est l'identite visuelle de Sillage.
Fond cartographique present partout, meme en arriere-plan decoratif.

### Par page

| Page | Carte |
|------|-------|
| Accueil / Dashboard | Fond carto desature avec traces recentes |
| Navigateur journal (liste dossiers/aventures) | Fond carto ou mini-cartes par entree |
| Navigation — mode journal | Carte active, entrees positionnees dessus |
| Navigation — mode perf | Carte active, trace + curseur synchronise |
| Regate — perf comparee | Carte active, N traces superposees |
| Settings utilisateur | **Pas de carte** (seule exception) |

### Journal + carte : pistes de design

- **Split view** : timeline/entrees a gauche, carte a droite qui suit le curseur temporel
- **Entrees geoloc** : LogEntry affichees comme markers sur la trace, click = detail
- **Mode recit cartographie** : lecture lineaire ou la carte zoome/pan automatiquement au fil du scroll
- **Scroll-driven** : on scrolle le journal → la carte suit. Ou on navigue la carte → les entrees apparaissent

### Fond carto decoratif (accueil, navigateur)

- Tuiles OSM raster desaturees, teintees creme pour coller a la charte
- Traces de l'utilisateur rendues en overlay (polylineSimplifiee suffisante)
- Pas d'interactivite lourde — juste du visuel ambiant
- Option : MapLibre statique ou meme image pre-rendue pour la perf
