# AGENTS.md — Sysadmin

Instrucciones para agentes de código (Codex, Claude Code…) que continúen este proyecto.

## Qué es

Web estática que funciona como biblioteca y cheat sheet de comandos para administradores de sistemas y redes: Linux (Bash) y Windows (CMD, PowerShell, Active Directory). La interfaz y todo el contenido están **en español**.

- Web publicada: https://davidzabalaasir-create.github.io/sysadmin-cheatsheet/
- Repositorio: https://github.com/davidzabalaasir-create/sysadmin-cheatsheet (público, rama `main`)
- Despliegue: GitHub Pages publica automáticamente la raíz de `main` en 1–2 minutos tras cada push. No hay paso de compilación.

## Estructura

```
index.html                         Maquetación (clases de Tailwind compiladas en assets/tailwind.css)
assets/styles.css                  Estilos complementarios (resaltado de sintaxis, franja de peligro…)
assets/app.js                      Lógica en JavaScript vanilla: filtros, búsqueda, ficha, copiar
assets/data.js                     Dataset: window.CHEATSHEET = { categories, commands }
data/commands.example.json         Ejemplo documentado del modelo de datos
docs/auditoria-ubuntu-apache-mariadb.md   Informe de auditoría del stack web del usuario
scripts/validate.js                Validador del dataset
```

Sin frameworks ni bundler. Las únicas dependencias npm son de desarrollo (Tailwind CLI y fuentes @fontsource); en tiempo de ejecución la web no carga nada externo. **No vuelvas a usar el CDN de Tailwind ni Google Fonts.**

Archivos generados que SÍ se suben al repositorio (GitHub Pages no compila): `assets/tailwind.css`, `assets/fonts/*`, `assets/icons/*`.

## Ejecutar y validar

```bash
python -m http.server 5500     # y abre http://localhost:5500
node scripts/validate.js       # obligatorio tras tocar assets/data.js
npm run build:css              # obligatorio tras añadir o cambiar clases en index.html o assets/app.js
node scripts/make-icons.js     # solo si cambias el diseño del icono (scripts/icon.html)
```

- **Sin conexión (PWA):** `sw.js` guarda en caché los archivos de `ASSETS`. Si añades un archivo que la web necesita, añádelo a esa lista. **Sube `VERSION` en `sw.js` en cada publicación.**
- **Variables de usuario:** `VARS` en `assets/app.js` sustituye valores de ejemplo (jlopez/aruiz, corp.local, empresa.com/tu-dominio.com, srv01, srv02, 192.168.10.0/24). Usa esos mismos valores en los ejemplos nuevos para que sean personalizables.

Abrir `index.html` con doble clic también funciona.

## Modelo de datos (assets/data.js)

```js
{
  id: "linux-ejemplo",        // único; prefijos: linux-, win-, web- (stack Ubuntu+Apache+MariaDB)
  name: "comando",            // un paréntesis final aclaratorio está permitido: "nc (transferir archivos)"
  os: "linux" | "windows",
  shell: "bash" | "powershell" | "cmd",   // Linux siempre bash
  category: "users" | "filesystem" | "network" | "processes" | "security" |
            "automation" | "storage" | "packages" | "ad",  // "ad" solo Windows
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

- **Español neutro** en descripciones, explicaciones y etiquetas. Los nombres de comandos y parámetros se dejan tal cual.
- Cada `example.command` debe ser un **comando real, completo y listo para copiar**, con un escenario profesional en `explanation`. Nada de `foo`/`bar`.
- Nivel de riesgo:
  - `safe`: solo lectura.
  - `caution`: cambia configuración o estado.
  - `danger`: puede destruir datos o cortar el acceso (rm -rf, format, diskpart clean, fsck, reinicios…).
- Si la herramienta no viene instalada por defecto, rellena `requires`.
- Los logs de Apache se asumen en formato **combined** de Ubuntu (`$1` IP, `$4` fecha, `$6` método, `$7` ruta, `$9` código HTTP).
- En cadenas JS escapa bien: `\\` para la barra invertida de Windows y `\\n` cuando el comando necesite un `\n` literal. Para un ejemplo de varias líneas usa `\n` real.
- Comprueba la sintaxis de los ejemplos bash, por ejemplo con `bash -n`.

## Convenciones de interfaz

- Nombre de la web: **Sysadmin** (título «Sys» en hueso + «admin» en ámbar cursiva).
- Diseño editorial de manual impreso: negro cálido (`paper`), texto hueso (`bone`), acento ámbar, Instrument Serif para títulos e IBM Plex Sans/Mono para el resto. **No vuelvas al estilo terminal neón**: el usuario lo descartó porque ya lo usa en otros proyectos.
- Distribución en dos columnas: índice a la izquierda y ficha a la derecha. En móvil (<1024 px) la ficha se abre como hoja a pantalla completa.
- Cada fila del índice tiene un botón «Copiar» que copia el ejemplo. En la ficha se puede copiar el comando, la sintaxis y el ejemplo.
- Enlaces directos `#id-del-comando`, navegación con ↑ ↓, `Ctrl+K` o `/` para buscar y `Alt+1/2/3` para elegir sistema.
- Prueba en escritorio (1440 px) y en móvil (375 px) sin errores en la consola.

## Git

- Mensajes de commit en español, en imperativo y con un resumen en la primera línea.
- Haz push a `main` solo cuando el usuario lo pida o lo haya autorizado para la tarea.
- Antes de hacer commit: `node scripts/validate.js` en verde.

## Ideas pendientes (backlog)

- Favoritos guardados en localStorage y un filtro «Mis favoritos».
- Tema claro opcional, manteniendo la identidad editorial.
- Exportar la ficha o la categoría a PDF/Markdown para imprimir.
- Pruebas automáticas de la interfaz (por ejemplo con Playwright) para la búsqueda, los filtros y el botón de copiar.
