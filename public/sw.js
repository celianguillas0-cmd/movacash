// Service worker minimal : rend l'appli installable et affiche une page hors ligne.
// Rien n'est mis en cache à part cette page (les données du compte restent toujours à jour).
const CACHE = "movacash-v1";
const HORS_LIGNE = "/hors-ligne.html";

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([HORS_LIGNE, "/icon-192.png"])));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(() => caches.match(HORS_LIGNE)));
});
