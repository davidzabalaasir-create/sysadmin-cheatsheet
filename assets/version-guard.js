/* Comprobación de versión (antes era un script en línea; va en archivo para permitir una CSP
 * estricta sin 'unsafe-inline'). APP_VERSION debe coincidir con version de assets/data.js. */
  /* Si un service worker antiguo sirvió datos de otra versión (HTML nuevo con JS/datos viejos),
     se limpia la caché y se recarga una sola vez. Solo con conexión, para no romper el modo sin conexión. */
  (function () {
    var APP_VERSION = "1.9.0";
    if ((window.CHEATSHEET || {}).version === APP_VERSION || !navigator.onLine || sessionStorage.getItem("sw-refresh")) return;
    sessionStorage.setItem("sw-refresh", "1");
    var regs = "serviceWorker" in navigator ? navigator.serviceWorker.getRegistrations() : Promise.resolve([]);
    regs.then(function (rs) { return Promise.all(rs.map(function (r) { return r.unregister(); })); })
      .then(function () { return window.caches ? caches.keys() : []; })
      .then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })
      .then(function () { location.reload(); });
  })();
