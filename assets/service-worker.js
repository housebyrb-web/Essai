const CACHE_NAME = "house-by-rb-v2-communes";
const APP_SHELL = [
  "/",
  "/index.html",
  "/css/style.css",
  "/css/responsive.css",
  "/data/construction-costs.js",
  "/data/taxe-defaults.js",
  "/js/app.js",
  "/js/budget.js",
  "/js/calculator.js",
  "/js/charts.js",
  "/js/communes.js",
  "/js/notaire.js",
  "/js/pdf.js",
  "/js/storage.js",
  "/js/taxe.js",
  "/js/terrain.js",
  "/js/ui.js",
  "/js/utils.js",
  "/js/vrd.js",
  "/images/logo-house-by-rb.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request))
  );
});
