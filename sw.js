/* NISCHAY SWAR — route-aware offline shell cache */
const CACHE_NAME = "nischay-swar-v5";
const APP_CACHE_PREFIX = "nischay-swar-v";
const ASSETS_TO_CACHE = [
  "./", "index.html", "legends.html", "wildlife.html", "timeline.html", "quiz.html",
  "about.html", "space-rare.html", "favorites.html", "404.html", "manifest.json",
  "css/variables.css", "css/layout.css", "css/components.css", "css/player.css",
  "js/lang-hi-en.js", "js/lang-regional.js", "js/page-i18n.js", "js/site-shell.js",
  "assets/voice-fallback.svg", "js/db-humans.js", "js/db-wildlife-nature.js",
  "js/db-extended-archive.js", "js/db-custom-uploads.js", "js/config.js",
  "js/audio-engine.js", "js/engagement.js", "js/ui-renderer.js", "js/app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith(APP_CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      return await fetch(event.request);
    } catch (error) {
      if (event.request.mode !== "navigate") throw error;
      const url = new URL(event.request.url);
      const route = url.pathname.split("/").filter(Boolean).pop() || "index.html";
      return (await cache.match(route)) || (await cache.match("404.html")) || (await cache.match("index.html"));
    }
  })());
});
