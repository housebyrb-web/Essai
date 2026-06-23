# House by RB

Base front statique pour House by RB, logiciel professionnel destiné aux maîtres d'oeuvre en maisons individuelles.

## Architecture

```text
index.html
css/
  main.css
js/
  content-loader.js
  dom-renderer.js
  main.js
  navigation.js
data/
  site-content.json
images/
```

## Principes

- HTML sémantique dans `index.html`.
- Styles centralisés dans `css/main.css`.
- JavaScript séparé en modules ES6 courts.
- Données de présentation isolées dans `data/site-content.json`.
- Aucune dépendance externe à ce stade.

## Commandes

```bash
npm run check
npm run serve
```

Le serveur local expose ensuite le site sur `http://localhost:4173`.
