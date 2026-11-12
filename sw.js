/* ==========================================================================
   NISCHAY SWAR (निश्चय स्वर) — OFFLINE SERVICE WORKER (sw.js)
   ========================================================================== */

const CACHE_NAME = "nischay-swar-v2";
const ASSETS_TO_CACHE = [
  "./",
  "index.html",
  "legends.html",
  "wildlife.html",
  "timeline.html",
  "quiz.html",
  "about.html",
  "404.html",
  "manifest.json",
  "css/variables.css",
  "css/layout.css",
  "css/components.css",
  "css/player.css",
  "js/lang-hi-en.js",
  "js/lang-regional.js",
  "js/page-i18n.js",
  "js/site-shell.js",
  "assets/voice-fallback.svg",
  "js/db-humans.js",
  "js/db-wildlife-nature.js",
  "js/db-extended-archive.js",
  "js/config.js",
  "js/audio-engine.js",
  "js/engagement.js",
  "js/ui-renderer.js",
  "js/app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
        })
      );
    })
  );
});
