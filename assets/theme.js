/* Fija el tema (claro u oscuro) antes del primer pintado para que la página no parpadee.
 * Va en un archivo propio porque la CSP no permite scripts en línea.
 * Orden: lo que eligió el usuario (localStorage «mc.theme») y, si no, la preferencia del sistema. */
(function () {
  var theme = null;
  try { theme = JSON.parse(localStorage.getItem("mc.theme")); } catch (e) { /* sin almacenamiento */ }
  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  document.documentElement.setAttribute("data-theme", theme);
})();
