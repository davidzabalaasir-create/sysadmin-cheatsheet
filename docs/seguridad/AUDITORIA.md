# Auditoría de seguridad — Sysadmin (v1.5.1)

Fecha: 8 de noviembre de 2026 · Alcance: la web publicada en GitHub Pages, el código del repositorio, la CI y las dependencias.

## Resumen

La web es estática (sin backend, sin cuentas, sin formularios que envíen datos), así que la superficie de ataque es pequeña. No se encontró ninguna vulnerabilidad explotable. Se aplicaron varias medidas de refuerzo (defensa en profundidad).

| Área | Estado | Notas |
|------|--------|-------|
| XSS (innerHTML, búsqueda, hash, variables, localStorage, terminal) | ✅ Sin hallazgos | 15 puntos con `innerHTML` revisados: todo dato externo pasa por `esc()`. La terminal solo usa `textContent`. |
| Content-Security-Policy | ✅ Corregido | Antes no había CSP. Ahora: `script-src 'self'`, sin `'unsafe-inline'` ni `eval`. |
| Clickjacking | ⚠️ Riesgo bajo aceptado | GitHub Pages no permite enviar cabeceras (`frame-ancestors`/`X-Frame-Options` no funcionan en `<meta>`). La web no tiene acciones sensibles. |
| HTTPS / HSTS | ✅ | Redirección 301 a HTTPS y HSTS servidos por GitHub Pages. |
| Archivos expuestos (.git, .env, node_modules) | ✅ | No accesibles en la web publicada. |
| Secretos en el repositorio | ✅ | Ninguno en los commits revisados. |
| Dependencias | ✅ | `npm audit`: 0 vulnerabilidades. Ninguna dependencia en tiempo de ejecución (solo Tailwind CLI y fuentes, de desarrollo). |
| GitHub Actions | ✅ Corregido | Fijadas por SHA, `permissions: contents: read` y `persist-credentials: false`. |
| Service worker | ✅ | Solo cachea peticiones GET del mismo origen. |
| Almacenamiento local | ✅ | Solo preferencias (favoritos, recientes, idioma, variables); nada sensible. Datos manipulados no rompen ni inyectan nada. |
| Privacidad | ⚠️ Informativo | El correo personal aparece en los metadatos de los commits (ver recomendaciones). |

## Pruebas realizadas

1. **Revisión de código** de `assets/app.js`, `assets/terminal.js`, `sw.js` e `index.html`: todos los sumideros (`innerHTML`, `insertAdjacentHTML`, `href`) y todas las fuentes (búsqueda, `location.hash`, `localStorage`, variables de usuario, entrada de la terminal).
2. **Ataques dinámicos con Playwright** contra el servidor local, con cargas como `<img src=x onerror=…>`, `"><svg onload=…>`, `javascript:` y `__proto__`:
   - búsqueda e impresión a PDF,
   - variables de usuario,
   - enlace directo `#…`,
   - `localStorage` manipulado (favoritos, recientes, variables),
   - entrada de la terminal simulada.

   Resultado: 0 scripts ejecutados, 0 elementos inyectados, 0 enlaces `javascript:` y sin contaminación de prototipos, tanto antes como después de activar la CSP.
3. **Prueba de CSP** en `tests/app.spec.js`: recorre la web (variables, práctica, terminal, PDF, idioma) y falla si el navegador registra cualquier `securitypolicyviolation`.
4. **Comprobaciones en la web publicada**: redirección HTTPS, HSTS y rutas sensibles (`/.git/config`, `/.env`, `/package-lock.json` de `node_modules`).
5. **Historial de git**: búsqueda de claves, tokens y contraseñas.

## Cambios aplicados

- `index.html`: CSP estricta y `referrer` `strict-origin-when-cross-origin`. El script en línea de control de versión pasa a `assets/version-guard.js`, porque la CSP bloquea los scripts en línea.
- `assets/app.js`: las variables de usuario eliminan los caracteres de control internos (U+0001/U+0002) que se usan como marcas al resaltar.
- `.github/workflows/ci.yml`: Actions fijadas por SHA y `persist-credentials: false`.
- `scripts/validate.js`: lee `APP_VERSION` de `assets/version-guard.js`.
- `sw.js`: incluye `assets/version-guard.js` en la caché sin conexión.
- Además se corrigió un fallo de interfaz: una búsqueda muy larga desbordaba la línea de resultados y tapaba el botón PDF.

## Reglas para mantenerlo seguro

- No añadir `<script>`, `<style>` ni atributos `on*=` en línea: la CSP los bloquea. Todo va en archivos de `assets/`.
- Todo dato que vaya a `innerHTML` pasa por `esc()`. En la terminal, nunca `innerHTML`.
- Para buscar en objetos con claves que escribe el usuario, usar `Object.prototype.hasOwnProperty.call` u objetos `Object.create(null)`.
- Al actualizar una Action, cambiar el SHA y el comentario de versión.
- No cargar recursos de terceros (CDN, fuentes, analítica): la CSP los bloquearía y además filtrarían visitas a terceros.

## Recomendaciones pendientes (requieren decisión del propietario)

1. ~~Dependabot~~ — **hecho**: `.github/dependabot.yml` abre cada lunes PR agrupados para npm y GitHub Actions (actualiza también los SHA fijados).
2. **Correo noreply de GitHub** para los commits futuros (`git config user.email <id>+<usuario>@users.noreply.github.com`) y activar «Block command line pushes that expose my email». No se reescribe el historial existente.
3. Si en el futuro se necesitan cabeceras reales (`frame-ancestors`, `Permissions-Policy`), servir la web detrás de un proxy o CDN que permita añadirlas (Cloudflare Pages, Netlify…).
