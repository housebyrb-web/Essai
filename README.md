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

Les taux de taxe d'aménagement ne sont pas encore branchés : ils seront traités dans le module `taxe.js`.

## Commandes

```bash
npm run check
npm run serve
```

Le serveur local expose ensuite le site sur `http://localhost:4173`.
