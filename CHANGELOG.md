# Navimeter — Changelog

## v0.3.0 — Phase 2 : Bibliothèque de traces & Nettoyage (2026-03-22)

### Nettoyage de traces
- Détection automatique des points aberrants à l'import (pics de vitesse MAD, sauts GPS, timestamps anormaux, seuil absolu 50 kn)
- Page de nettoyage immersive `/trace/[id]/nettoyage` : carte plein écran + panneaux flottants
- Exclusion/inclusion de points par clic sur la carte ou sélection de plage sur le graphique
- Simplification de trace (Ramer-Douglas-Peucker) avec slider de tolérance
- Recalcul automatique des stats après nettoyage (côté client en temps réel + côté serveur à la sauvegarde)
- Curseur synchronisé carte ↔ graphique dans les deux sens
- Export GPX nettoyé (points non-exclus uniquement)

### Bibliothèque de traces
- Import multi-fichiers (drag & drop plusieurs GPX/KML, progression par fichier)
- Filtrage de la liste : recherche par nom, filtre par bateau, tri par date/distance/vitesse
- Bouton nettoyer dans la liste des traces

### Vue trace immersive
- Carte plein écran avec panneaux flottants (stats, graphique, contrôles)
- Graphique vitesse redimensionnable (drag handle)
- Gradient de couleur vitesse sur la ligne du graphique (même échelle que la carte)
- Titre de trace éditable au clic
- Contrôles carte custom : boutons ronds (zoom +/-, boussole, sélecteur de couches)
- Échelle nautique/métrique dynamique (bascule NM ↔ mètres sous 0.3 NM)
- Métadonnées dans le header (date de début, bateau)

### Qualité des données
- Filtrage des waypoints/POI dans le parser GPX (ne garde que les LineString)
- Lissage gaussien des vitesses à l'import (sigma=2)
- Détection des timestamps anormaux (delta < 0.5s, recul dans le temps)
- Couleurs vitesse centralisées (utilitaire partagé, HSL sat 80% / light 50%)

### API
- `PATCH /api/traces/[id]` — renommer une trace
- `PATCH /api/traces/[id]/points` — mise à jour bulk isExcluded + recalcul stats
- `GET /api/traces/[id]/export` — export GPX nettoyé

---

## v0.2.0 — Phase 1 : Auth & Bateaux (2025-08-21)

- Auth utilisateur (Better Auth — email/password)
- Modèle Bateau : nom, classe, longueur
- Page "Mes bateaux" : CRUD
- Bibliothèque de traces liée au user connecté
- Association trace → bateau
- Espace admin : CRUD utilisateurs, transfert de traces, association bateaux
- Role admin via ADMIN_EMAIL (env var)
- Admin : impersonation d'utilisateurs

---

## v0.1.1 — Phase 0 : Refactoring & Montée de versions

- Migration Next.js 15 → 16
- Migration Prisma 6 → 7 (ESM-only)
- Migration Leaflet → MapLibre GL JS (rendu WebGL)
- Intégration algos gpx.studio (MIT) : smoothing, Ramer-Douglas-Peucker, stats cumulatives
- Refactoring code : francisation, service d'import, logger, thème centralisé

---

## v0.1.0 — MVP

- Import de fichiers GPX et KML
- Détection automatique de la source (Navionics, SailGrib, Weather4D, OpenCPN, Garmin, Google Earth, Strava)
- Affichage de la trace sur carte maritime (OSM + OpenSeaMap)
- Coloration de la trace par vitesse
- Statistiques : distance (NM), durée, vitesse moy/max (kn)
- Graphique vitesse/temps
- Liste des traces + suppression
- Déploiement Railway
