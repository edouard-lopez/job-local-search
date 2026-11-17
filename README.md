# Recherche d'emploi locale autour d'Orx

Carte et tableau des offres informatiques (ingénieur, DevOps, sysadmin, développeur) autour d'Orx (40).

## Contenu

- `index.html` : carte OpenStreetMap (Leaflet). La liste suit la zone visible. Filtres par type de contrat et par technos. Compatible mobile.
- `data/offres.csv` : le tableau demandé, une offre par ligne.
- `data/offres.json` : les mêmes données, avec coordonnées et distances.
- `data/offres-source.json` : la saisie manuelle. Modifie ce fichier, puis relance le build.
- `scripts/build.py` : calcule les distances et régénère CSV, JSON et `index.html`.

```sh
python3 scripts/build.py   # puis ouvrir index.html dans un navigateur
```

## Zones couvertes

MACS, Seignanx, Bayonne et communes limitrophes, Saint-Pierre-d'Irube et communes limitrophes.
Bidart est hors zone stricte, mais à moins de 40 min en voiture : l'offre est gardée et marquée.

**Lasseube** est une zone à part. Elle est à environ 2 h d'Orx, donc la limite de 30-40 min ne s'applique pas.
Peu d'offres existent à Lasseube même : les offres listées sont à Pau (environ 20 km de Lasseube).
Une case de la carte masque cette zone.

## Méthode

- Sources : HelloWork, emploi-territorial.fr et sites des mairies, le 13/11/2026. Détail commune par commune dans `data/sources-mairies.md`.
- Seules des annonces réellement consultées sont listées, avec leur lien. Les offres expirées sont exclues.
- Email et téléphone restent vides quand l'annonce ne les donne pas. Aucun contact n'est inventé.
- **Score techno /5** : recouvrement avec le CV master (TypeScript/Node, CI/CD, Kubernetes, Docker, tests, Linux).
- **Score logiciel libre /5** : 5 = contribue aux communs, 3 = usage affirmé du libre, 1-2 = libre présent sans engagement visible, 0 = rien.
- **Distances : estimations.** Les services Nominatim et OSRM n'étaient pas joignables. Le script calcule la distance à vol d'oiseau × 1,3, puis 55 km/h en voiture et 16 km/h à vélo. Vérifie le trajet réel sur openstreetmap.org (itinéraire vélo).
- Beaucoup d'annonces ne donnent que la commune. Le marqueur est alors au centre de la commune (champ `geo_precision`).

## Constats

- Sur les ~45 mairies et collectivités, seule la Ville de Bayonne a une offre informatique ouverte.
- Anglet n'a pas pu être lu automatiquement : à vérifier à la main.
- Aucune offre trouvée à Saint-Pierre-d'Irube ou ses communes limitrophes hors Bayonne.
- Aucune annonce ne mentionne de contribution aux communs numériques. Les scores « libre » restent donc bas.

## Pistes à suivre

- Surveiller emploi-territorial.fr (filtre informatique, Landes et Pyrénées-Atlantiques).
- Candidatures spontanées vers des acteurs du libre locaux.

## Publication sur GitHub

- `pages.yml` publie la carte sur GitHub Pages à chaque push sur `main`.
- `update-offers.yml` (bouton « ↻ Mettre à jour les offres ») : Claude relit `SEARCH-CRITERIA.md`, refait la recherche, committe et republie.
- `generate-application.yml` (lien « ✉ Candidature » sur chaque offre) : lance « Run workflow » avec le numéro de l'offre. Claude applique le skill `adapter-candidature` et dépose CV + lettre en artefact du run.
- Seul `edouard-lopez` peut lancer ces workflows. Les autres doivent se connecter avec ce compte ou forker le dépôt.

Secrets à créer (Settings → Secrets and variables → Actions) :
- `ANTHROPIC_API_KEY` : clé API Anthropic.
- `CV_MASTER_MD` : contenu de `cv-extended-master.claude.md`. Il reste hors du dépôt public.

Pages : Settings → Pages → Source : « GitHub Actions ».
