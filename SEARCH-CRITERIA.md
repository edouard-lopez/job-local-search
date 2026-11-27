# Critères de recherche

Ce fichier pilote le workflow « Mettre à jour les offres ». Modifie-le, puis relance le workflow.

## Profil

- Poste visé : ingénieur logiciel, DevOps, SRE, qualité/tests, sysadmin. Profil Staff Engineer DevEx & Quality.
- Technos maîtrisées : TypeScript, Node.js, JavaScript, React, Vue.js, Python, Bash, Docker, Kubernetes, GitLab CI, GitHub Actions, CI/CD, Pact (contract testing), Cypress, Jest, Linux, AWS, Terraform/CDKTF, Datadog, Backstage, SQL, API REST, Tests automatisés, Kotlin, Go, PHP, Java, Git, Helm, Puppeteer, Testkube.
  Cette liste colore aussi les technos sur la carte (connue = verte, inconnue = grise).
- Mainteneur open source (Pure, LessPass).

## Priorités (scores)

- **score_techno /5** : recouvrement entre les technos de l'offre et la liste ci-dessus.
- **score_libre /5** : 5 = l'employeur contribue aux communs (logiciels libres, Wikipédia, OpenStreetMap) ; 3 = usage affirmé du libre ; 1-2 = libre présent sans engagement ; 0 = rien.
- Le vélo est le mode préféré.

## Zones

Domicile : Orx (40). Trajet max : 30-40 min en voiture.

- MACS (Maremne Adour Côte Sud) : toutes les communes
- Seignanx : toutes les communes
- Bayonne et communes limitrophes
- Saint-Pierre-d'Irube et communes limitrophes
- Zone séparée, sans limite de trajet : autour de Lasseube (Pau, Oloron)

## Employeurs

Privé, public (mairies, intercommunalités, syndicats, CDG, hôpitaux) et mixte (SEM, SPL).

## Contrats

Tous : CDI, CDD (avec durée), freelance, intérim, alternance, fonction publique.

## Sources

- hellowork.com, emploi-territorial.fr, choisirleservicepublic.gouv.fr
- Pages recrutement des mairies : voir `data/sources-mairies.md`

## Règles

- Ne garder que des annonces réellement lues, encore ouvertes, avec leur lien.
- Ne jamais inventer un email, un téléphone ou une offre : laisser vide.
- Mission résumée en 250 mots max, en français.
- Champ `salaire` : seulement s'il est écrit dans l'annonce, sinon l'omettre. Format : `{"min": 38, "max": 45, "brut": true}`, en k€ par an (convertir un salaire mensuel × 12). `brut` vaut false si l'annonce donne du net ou ne précise pas.

## Journal des mises à jour

`data/mises-a-jour.md` garde une section `## Mise à jour du JJ/MM/AAAA` par passage, la plus récente en premier. Format : puces, **gras**, `code`, liens https. La dernière section s'affiche dans la cloche de l'application.
