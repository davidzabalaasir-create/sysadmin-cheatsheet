/* Service worker de Sysadmin: guarda la web para usarla sin conexión.
 * IMPORTANTE: sube VERSION en cada publicación para que los navegadores renueven la caché. */
const VERSION = "1.2.0";
const CACHE = `sysadmin-${VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/tailwind.css",
  "./assets/styles.css",
  "./assets/data.js",
  "./assets/data-en.js",
  "./assets/i18n.js",
  "./assets/app.js",
  "./assets/icons/favicon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon.png",
  "./assets/fonts/instrument-serif-latin-400-normal.woff2",
  "./assets/fonts/instrument-serif-latin-400-italic.woff2",
  "./assets/fonts/ibm-plex-sans-latin-400-normal.woff2",
  "./assets/fonts/ibm-plex-sans-latin-500-normal.woff2",
  "./assets/fonts/ibm-plex-sans-latin-600-normal.woff2",
  "./assets/fonts/ibm-plex-mono-latin-400-normal.woff2",
  "./assets/fonts/ibm-plex-mono-latin-500-normal.woff2",
  "./assets/fonts/ibm-plex-mono-latin-600-normal.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("sysadmin-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  // Páginas: primero la red (para ver siempre la última versión) y, sin conexión, la copia guardada.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => { caches.open(CACHE).then((c) => c.put("./index.html", res.clone())); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Recursos: responde al instante desde la caché y la actualiza en segundo plano.
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((res) => { if (res.ok) cache.put(request, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    })
  );
});
