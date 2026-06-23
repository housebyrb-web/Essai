# House by RB V2

Estimateur professionnel de coût de construction de maison individuelle en France.

Cette étape pose uniquement l'architecture V2. Les modules métier seront développés et validés un par un.

## Architecture V2

```text
index.html
css/
  style.css
  responsive.css
js/
  app.js
  ui.js
  calculator.js
  taxe.js
  notaire.js
  vrd.js
  terrain.js
  budget.js
  communes.js
  storage.js
  pdf.js
  charts.js
  utils.js
data/
  construction-costs.js
  taxe-defaults.js
assets/
  manifest.webmanifest
  service-worker.js
images/
  logo-house-by-rb.svg
```

## Principes

- Interface haut de gamme, minimaliste et responsive.
- JavaScript ES modules sans dépendance inutile.
- Modules métier indépendants.
- Données réglementaires isolées dans `data/`.
- PWA préparée avec manifest et service worker.
- Les commentaires techniques doivent rester en français.

## Étape 5 - Module communes

Le module `js/communes.js` permet désormais :

- la recherche par nom de commune ;
- la recherche par code postal ;
- la récupération du code INSEE ;
- la normalisation du département et de la région ;
- la gestion d'erreurs explicites ;
- un cache mémoire pour éviter les appels répétés identiques.

Source utilisée : API officielle `geo.api.gouv.fr`.

## Étape 6 - Module taxe

Le module `js/taxe.js` permet désormais :

- la récupération des taux officiels DGFiP / DELTA depuis `data.economie.gouv.fr` ;
- la recherche du taux communal par code INSEE ;
- la récupération du taux départemental ;
- la récupération du taux régional pour l'Île-de-France ;
- la détection des communes sectorisées ;
- le calcul de la taxe d'aménagement ;
- le calcul de la redevance d'archéologie préventive ;
- la prise en compte des 100 premiers m² avec abattement ;
- la prise en compte des piscines et stationnements extérieurs.

Sans adresse ni référence cadastrale, une commune sectorisée utilise le taux communal maximal afin d'éviter
une sous-estimation. La sélection précise du secteur sera traitée dans une étape dédiée.

## Étape 7 - Module terrain

Le module `js/terrain.js` permet désormais :

- la normalisation du prix du terrain ;
- la normalisation de la surface terrain ;
- le calcul du prix au m² ;
- la catégorisation de la parcelle ;
- la détection des informations manquantes ;
- la remontée d'avertissements utiles pour les modules notaire, VRD et budget.

Cette étape ne traite pas encore les VRD, les raccordements, le PLU ou la constructibilité fine.

## Étape 8 - Module notaire

Le module `js/notaire.js` permet désormais :

- le calcul indicatif des droits de mutation ;
- le calcul de la contribution de sécurité immobilière ;
- le calcul des émoluments proportionnels par tranches ;
- le calcul de la TVA sur émoluments ;
- l'ajout des formalités et débours indicatifs ;
- le calcul du taux effectif estimé ;
- l'affichage d'une synthèse liée au prix du terrain.

Le calcul reste indicatif : le régime fiscal exact dépend de l'acte, du terrain, de la TVA éventuelle
et doit être confirmé par le notaire.

## Étape 9 - Module VRD

Le module `js/vrd.js` permet désormais :

- l'estimation de l'accès terrain ;
- l'estimation des tranchées techniques ;
- l'estimation des raccordements selon terrain viabilisé ou non ;
- l'ajout d'un surcoût lié à la distance aux réseaux ;
- l'intégration d'une provision eaux pluviales ;
- l'intégration optionnelle d'un assainissement individuel ;
- l'ajout d'une provision d'aléas ;
- la remontée d'avertissements techniques.

Cette étape reste indicative : les devis concessionnaires, l'étude de sol, le SPANC et les contraintes
d'accès chantier devront confirmer les montants.

## Commandes

```bash
npm run check
npm run serve
```

Le serveur local expose ensuite le site sur `http://localhost:4173`.
