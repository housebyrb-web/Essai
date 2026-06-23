const CACHE_NAME = "house-by-rb-v2-shell";
const APP_SHELL = [
  "/",
  "/index.html",
  "/css/style.css",
  "/css/responsive.css",
  "/js/app.js",
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
