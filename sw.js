/* Service worker de Sysadmin: guarda la web para usarla sin conexión.
 * IMPORTANTE: sube VERSION en cada publicación para que los navegadores renueven la caché.
 * Estrategia: con conexión, HTML/JS/CSS/datos siempre de la red (versiones coherentes);
 * sin conexión, la copia guardada. Fuentes e imágenes, desde la caché.
 * Las peticiones a la red usan cache: "no-cache" para revalidar con el servidor (ETag) y no
 * mezclar archivos de dos publicaciones por la caché HTTP de GitHub Pages (max-age=600). */
const fresh = (request) => fetch(request, { cache: "no-cache" });
const VERSION = "1.9.2";
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
  "./assets/version-guard.js",
  "./assets/theme.js",
  "./assets/terminal.css",
  "./assets/terminal.js",
  "./assets/terminal-data.js",
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
  // cache: "reload" evita guardar copias desactualizadas de la caché HTTP
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("sysadmin-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Guarda una copia de la respuesta (la copia se hace antes de que el navegador consuma el cuerpo). */
function remember(key, res) {
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(key, copy));
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Páginas: primero la red y, sin conexión, la copia guardada.
  if (request.mode === "navigate") {
    event.respondWith(fresh(request).then((res) => remember("./index.html", res)).catch(() => caches.match("./index.html")));
    return;
  }

  // JS, CSS y datos: primero la red (versiones siempre coherentes) y, sin conexión, la caché.
  if (/\.(js|css|json|webmanifest)$/.test(url.pathname)) {
    event.respondWith(fresh(request).then((res) => remember(request, res)).catch(() => caches.match(request, { ignoreSearch: true })));
    return;
  }

  // Fuentes e imágenes (no cambian entre versiones): desde la caché y, si no están, de la red.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).then((res) => remember(request, res)))
  );
});
