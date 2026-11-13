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

- Sources : HelloWork, emploi-territorial.fr, sites des collectivités (MACS, Agglo Pays Basque), le 13/11/2026.
- Seules des annonces réellement consultées sont listées, avec leur lien. Les offres expirées sont exclues.
- Email et téléphone restent vides quand l'annonce ne les donne pas. Aucun contact n'est inventé.
- **Score techno /5** : recouvrement avec le CV master (TypeScript/Node, CI/CD, Kubernetes, Docker, tests, Linux).
- **Score logiciel libre /5** : 5 = contribue aux communs, 3 = usage affirmé du libre, 1-2 = libre présent sans engagement visible, 0 = rien.
- **Distances : estimations.** Les services Nominatim et OSRM n'étaient pas joignables. Le script calcule la distance à vol d'oiseau × 1,3, puis 55 km/h en voiture et 16 km/h à vélo. Vérifie le trajet réel sur openstreetmap.org (itinéraire vélo).
- Beaucoup d'annonces ne donnent que la commune. Le marqueur est alors au centre de la commune (champ `geo_precision`).

## Constats

- Aucune offre informatique ouverte dans les sites de MACS ou de l'Agglo Pays Basque à cette date.
- Aucune offre trouvée à Saint-Pierre-d'Irube ou ses communes limitrophes hors Bayonne.
- Aucune annonce ne mentionne de contribution aux communs numériques. Les scores « libre » restent donc bas.

## Pistes à suivre

- Surveiller emploi-territorial.fr (filtre informatique, Landes et Pyrénées-Atlantiques).
- Candidatures spontanées vers des acteurs du libre locaux.
