# AGENTS.md — Sysadmin

Instrucciones para agentes de código (Codex, Claude Code…) que continúen este proyecto.

## Qué es

Web estática que funciona como biblioteca y cheat sheet de comandos para administradores de sistemas y redes: Linux, Windows, Active Directory, contenedores, Git, virtualización, Microsoft 365 y equipos de red (Cisco/MikroTik). El idioma principal es el **español**; la interfaz y el contenido están también **en inglés** (botón ES/EN).

- Web publicada: https://davidzabalaasir-create.github.io/sysadmin-cheatsheet/
- Repositorio: https://github.com/davidzabalaasir-create/sysadmin-cheatsheet (público, rama `main`)
- Despliegue: GitHub Pages publica automáticamente la raíz de `main` en 1–2 minutos tras cada push. No hay paso de compilación.

## Estructura

```
index.html                         Maquetación (clases de Tailwind compiladas en assets/tailwind.css)
assets/styles.css                  Estilos complementarios (resaltado de sintaxis, franja de peligro…)
assets/app.js                      Lógica en JavaScript vanilla: filtros, búsqueda, ficha, copiar, favoritos/recientes, práctica, PDF, idioma
assets/data.js                     Dataset: window.CHEATSHEET = { categories, commands }
assets/data-en.js                  Traducción al inglés del contenido: window.CHEATSHEET_EN[id] = { n?, d, f[], x, r? }
assets/i18n.js                     Textos de la interfaz: window.I18N.es / .en (mismas claves)
tests/app.spec.js                  Pruebas de interfaz (Playwright) · playwright.config.js
.github/workflows/ci.yml           CI: validación, CSS al día y pruebas en cada push/PR
data/commands.example.json         Ejemplo documentado del modelo de datos
docs/auditoria-ubuntu-apache-mariadb.md   Informe de auditoría del stack web del usuario
scripts/validate.js                Validador del dataset, traducciones e i18n
scripts/serve.js                   Servidor estático local (lo usan las pruebas)
```

Sin frameworks ni bundler. Las únicas dependencias npm son de desarrollo (Tailwind CLI y fuentes @fontsource); en tiempo de ejecución la web no carga nada externo. **No vuelvas a usar el CDN de Tailwind ni Google Fonts.**

Archivos generados que SÍ se suben al repositorio (GitHub Pages no compila): `assets/tailwind.css`, `assets/fonts/*`, `assets/icons/*`.

## Ejecutar y validar

```bash
npm run serve                  # http://127.0.0.1:5500
node scripts/validate.js       # obligatorio tras tocar data.js, data-en.js o i18n.js (también lo ejecuta la CI)
npm test                       # pruebas Playwright (en local usa el Edge/Chrome instalado)
npm run build:css              # obligatorio tras añadir o cambiar clases en index.html o assets/app.js
node scripts/make-icons.js     # iconos y assets/og-image.png (scripts/icon.html, scripts/og.html)
```

- **Sin conexión (PWA):** `sw.js` guarda en caché los archivos de `ASSETS` (con conexión siempre pide JS/CSS/datos a la red). Si añades un archivo que la web necesita, añádelo a esa lista.
- **Al publicar una versión:** sube a la vez `VERSION` en `sw.js`, `version` en `assets/data.js` y `APP_VERSION` en `index.html` (estas dos últimas deben coincidir; la validación lo comprueba). Si no coinciden en el navegador, la página limpia la caché antigua y recarga una vez.
- **Idioma:** todo texto de interfaz nuevo va en `assets/i18n.js` (en `es` y `en`) y se usa con `t("clave")`; en HTML con `data-i18n`, `data-i18n-html` o `data-i18n-attr="atributo:clave"`. Todo comando nuevo necesita su traducción en `data-en.js` o la validación falla.
- **Favoritos y recientes:** se guardan en localStorage (`mc.favs`, `mc.recent`) y son pseudo-categorías `fav` y `recent`.
- **Variables de usuario:** `VARS` en `assets/app.js` sustituye valores de ejemplo (jlopez/aruiz, corp.local, empresa.com/tu-dominio.com, srv01, srv02, 192.168.10.0/24). Usa esos mismos valores en los ejemplos nuevos para que sean personalizables.

Abrir `index.html` con doble clic también funciona.

## Modelo de datos (assets/data.js)

```js
{
  id: "linux-ejemplo",        // único; prefijos: linux-, win-, web- (stack Ubuntu+Apache+MariaDB), net- (equipos de red), pt- (Cisco IOS · Packet Tracer)
  name: "comando",            // un paréntesis final aclaratorio está permitido: "nc (transferir archivos)"
  os: "linux" | "windows" | "network",
  shell: "bash" | "powershell" | "cmd" | "ios" | "routeros",   // Linux → bash; network → ios/routeros
  category: "users" | "filesystem" | "network" | "processes" | "security" | "automation" | "storage" |
            "packages" | "containers" | "git" | "virtualization" | "m365" | "netdevices" | "packettracer" | "ad",
  risk: "safe" | "caution" | "danger",
  description: "Qué hace, en una o dos frases.",
  syntax: "comando [opciones] argumentos",
  requires: "sudo apt install x",          // opcional: qué hay que instalar o activar
  flags: [{ flag: "-x", description: "…" }],
  example: { command: "comando real y completo", explanation: "Escenario real de un sysadmin." },
  tags: ["palabras", "clave", "sin tildes", "para la búsqueda"]
}
```

Las categorías se definen en `categories` (id, label, labelEn, icon, os). El orden del array determina su numeración (§01, §02…).

## Convenciones de contenido

- **Español neutro** en descripciones, explicaciones y etiquetas, con su traducción al inglés británico en `data-en.js`. Los nombres de comandos y parámetros se dejan tal cual.
- Cada `example.command` debe ser un **comando real, completo y listo para copiar**, con un escenario profesional en `explanation`. Nada de `foo`/`bar`.
- Nivel de riesgo:
  - `safe`: solo lectura.
  - `caution`: cambia configuración o estado.
  - `danger`: puede destruir datos o cortar el acceso (rm -rf, format, diskpart clean, fsck, reinicios…).
- Si la herramienta no viene instalada por defecto, rellena `requires`.
- Ejemplos de Cisco IOS / Packet Tracer: topología R1/R2 y SW1/SW2, VLAN 10 Ventas, 20 Contabilidad, 99 Gestión (192.168.99.0/24); bloques de configuración completos con `configure terminal` … `end`.
- Los logs de Apache se asumen en formato **combined** de Ubuntu (`$1` IP, `$4` fecha, `$6` método, `$7` ruta, `$9` código HTTP).
- En cadenas JS escapa bien: `\\` para la barra invertida de Windows y `\\n` cuando el comando necesite un `\n` literal. Para un ejemplo de varias líneas usa `\n` real.
- Comprueba la sintaxis de los ejemplos bash, por ejemplo con `bash -n`.

## Convenciones de interfaz

- Nombre de la web: **Sysadmin** (título «Sys» en hueso + «admin» en ámbar cursiva).
- Diseño editorial de manual impreso: negro cálido (`paper`), texto hueso (`bone`), acento ámbar, Instrument Serif para títulos e IBM Plex Sans/Mono para el resto. **No vuelvas al estilo terminal neón**: el usuario lo descartó porque ya lo usa en otros proyectos.
- Distribución en dos columnas: índice a la izquierda y ficha a la derecha. En móvil (<1024 px) la ficha se abre como hoja a pantalla completa.
- Cada fila del índice tiene un botón «Copiar» que copia el ejemplo. En la ficha se puede copiar el comando, la sintaxis y el ejemplo.
- Enlaces directos `#id-del-comando`, navegación con ↑ ↓, `Ctrl+K` o `/` para buscar y `Alt+1/2/3` para elegir sistema.
- Accesibilidad: botones reales (nunca controles anidados), `aria-label` en los botones de solo icono, foco visible, contraste AA (el gris más tenue es `bone-mute` #8f897c). Las pruebas lo comprueban.
- Prueba en escritorio (1440 px) y en móvil (360–375 px) sin errores en la consola; `npm test` en verde.

## Git

- Mensajes de commit en español, en imperativo y con un resumen en la primera línea.
- Haz push a `main` solo cuando el usuario lo pida o lo haya autorizado para la tarea.
- Antes de hacer commit: `npm run validate` y `npm test` en verde, y `npm run build:css` si cambiaste clases.

## Ideas pendientes (backlog)

- Tema claro opcional, manteniendo la identidad editorial.
- Exportar también a Markdown.
- Más contenido: AWS/Azure CLI, Terraform, Ansible, PostgreSQL, Nginx, Proxmox, FortiGate, Juniper.
- Modo práctica con respuesta escrita (además de opciones) y repaso de los fallos.
