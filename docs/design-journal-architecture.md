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
