# Handoff Spec: Terminal simulada de Sysadmin

> Estado: **integrada en la web (v1.5.0)**: botón «Terminal» en la cabecera y «▶ Probar» en las fichas con simulación.
> Código: [`assets/terminal.js`](../../assets/terminal.js) (motor), [`assets/terminal-data.js`](../../assets/terminal-data.js) (datos), [`assets/terminal.css`](../../assets/terminal.css) (estilos).
> Página de pruebas aislada: [`docs/terminal/prototype/`](prototype/) (usa los mismos archivos) → `npm run serve` y http://127.0.0.1:5500/docs/terminal/prototype/

## Overview

Una consola en el navegador donde el usuario escribe comandos de la biblioteca (`ss -tln`, `df -h`, `ping -c 3 dc01`…) y recibe una **salida simulada realista**. Nada se ejecuta: no hay servidor, ni shell, ni red. El objetivo es que quien aprende pueda *probar* sin miedo, y que quien ya sabe pueda recordar cómo es la salida de un comando antes de lanzarlo en producción.

**Contexto de uso:** se abre desde la ficha de un comando («Probar en terminal», con la orden ya escrita) o desde un botón global. Público: técnicos y estudiantes (CCNA, LPIC…), en escritorio sobre todo, pero también en móvil.

---

## 1. Arquitectura y tecnologías

### Recomendación: interfaz propia con HTML + CSS + JavaScript vanilla

| Opción | A favor | En contra |
|---|---|---|
| **Xterm.js** | Emulador VT100 real: colores ANSI, cursor, redimensionado; el estándar en VS Code, etc. | Pensado para conectarse a una **shell real** (PTY por WebSocket): aquí no hay ninguna. ~300 KB. Pinta en canvas → texto no seleccionable de forma natural y accesibilidad limitada (tiene modo lector de pantalla, pero es un añadido). Hay que reimplementar la edición de línea, el historial y el autocompletado. Se tendría que incluir en el repositorio (el proyecto prohíbe CDN). |
| **jquery.terminal** | Muy rápido de montar: historial, autocompletado y parser incluidos. | Depende de **jQuery** (otra dependencia solo para esto). Su formato `[[;color;]texto]` interpreta marcado en la salida: hay que escapar con cuidado para no abrir una vía de inyección. Estilo difícil de llevar al diseño editorial de la web. |
| **Propia (vanilla)** ✅ | ~22 KB sin minificar y con comentarios, sin dependencias. Texto real del DOM: seleccionable, copiable, accesible (`role="log"`, `<input>` nativo con teclado móvil). Usa los tokens de diseño de la web. Seguridad sencilla de razonar: **todo se pinta con `textContent`**. Encaja con la arquitectura actual (sin frameworks ni bundler, funciona sin conexión). | Hay que programar historial, autocompletado y el analizador de argumentos (ya hecho en el prototipo). No interpreta secuencias ANSI ni programas a pantalla completa (`top`, `vim`)… que de todos modos no tienen sentido en un simulador. |

**Por qué:** Xterm.js resuelve un problema que no tenemos (emular un terminal conectado a un proceso). Lo que necesitamos es **mostrar líneas de texto según una tabla de datos**, y eso se hace mejor y de forma más segura con el DOM.

### Módulos ([`assets/terminal.js`](../../assets/terminal.js))

```
Terminal ──► Registry ──► commands (JSON)  +  builtins (JS: help, ls, cd, cat, echo…)
   │            └─ suggest() (Levenshtein)
   ├─► tokenize()  ─► parseArgs()         ← comillas, flags agrupados (-tulpn), valores (-c 3)
   ├─► VirtualFS   ─► árbol del JSON       ← ls, cd, cat, autocompletado de rutas
   └─► Screen      ─► DOM (solo textContent, clases de una lista blanca, enlaces validados)
```

- **Datos y lógica separados:** el 95 % de los comandos solo necesita datos (JSON). Solo los que dependen de estado (`cd`, `ls`, `cat`, `history`) se programan como *builtins*.
- **Escalable:** añadir un comando = añadir un objeto al JSON. Ver §2 y el plan de integración.

---

## 2. Estructura de datos (mocking)

Datos reales: [`assets/terminal-data.js`](../../assets/terminal-data.js) (`window.SYS_TERMINAL_DATA`, con formato JSON; va en JS como `data.js` para que también funcione al abrir el archivo directamente). Los textos traducibles son un string o `{ "es": …, "en": … }`; las salidas de los comandos se dejan como en un sistema real.

```json
{
  "version": 1,
  "env": { "user": "admin", "host": "srv01", "home": "/home/admin", "cwd": "/home/admin" },
  "fs": {
    "/etc": ["hostname", "hosts", "os-release"],
    "/etc/hosts": "127.0.0.1   localhost\n10.0.0.10   dc01.corp.local dc01"
  },
  "commands": {
    "ss": {
      "libraryId": "linux-ss",
      "summary": "Sockets: puertos en escucha y conexiones.",
      "flags": { "-t": "Solo TCP.", "-u": "Solo UDP.", "-l": "Solo en escucha.", "-n": "Sin resolver nombres.", "-p": "Muestra el proceso." },
      "variants": [
        { "flags": ["-t", "-l", "-n"], "output": [
          "State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port",
          "LISTEN  0       511           0.0.0.0:443         0.0.0.0:*"
        ]}
      ],
      "output": ["Netid State  Recv-Q Send-Q  Local Address:Port   Peer Address:Port"]
    },
    "ping": {
      "libraryId": "win-test-connection",
      "flags": { "-c": { "description": "Número de paquetes.", "takesValue": true } },
      "requiresArgs": 1,
      "usage": ["Uso: ping [-c N] destino"],
      "stream": { "delayMs": 350 },
      "output": ["PING {arg0} ({ip}) 56(84) bytes of data.", { "text": "0% packet loss", "style": "ok" }]
    }
  }
}
```

### Campos de un comando

| Campo | Tipo | Obligatorio | Uso |
|---|---|---|---|
| `libraryId` | string `[a-z0-9-]+` | recomendado | Enlaza con la ficha de la biblioteca (`index.html#linux-ss`). |
| `summary` | string | sí | Línea de `help`. |
| `flags` | objeto `flag → descripción` o `{ description, takesValue }` | sí (puede ser `{}`) | Lista blanca: cualquier otro flag da «opción inválida», como la herramienta real. |
| `subcommands` | objeto `alias → nombre` | no | `ip a` / `ip addr` / `ip address` → `addr`. |
| `variants[]` | `{ sub?, flags[], args[]?, output[] }` | no | Salida para una combinación exacta de flags (el orden no importa; `-tln` = `-t -l -n`). En `args`, `*` acepta cualquier valor. |
| `output[]` | líneas | no | Salida por defecto (sin flags). |
| `requiresArgs` / `usage` | número / líneas | no | Si faltan argumentos se muestra el uso. |
| `stream.delayMs` | número | no | Salida línea a línea (ping); cancelable con Ctrl+C. |
| `danger` | booleano | no | Comandos destructivos: el simulador explica qué haría, sin «hacer» nada. |

**Una línea** es un texto o `{ "text": "…", "style": "ok|error|warn|dim|info" }`. Plantillas disponibles (se sustituyen como texto): `{arg0}`, `{args}`, `{cmdline}`, `{ip}` (resuelto con `/etc/hosts` del FS virtual), `{user}`, `{host}`, `{cwd}`.

**Reglas de resolución:** subcomando → flags desconocidos (error) → argumentos obligatorios → variante exacta → `output` por defecto → «esta combinación no está simulada todavía» + sugerencia de `help`.

---

## 3. Código de ejemplo

Código completo y probado: [`assets/terminal.js`](../../assets/terminal.js) (motor, con comentarios), [`assets/terminal.css`](../../assets/terminal.css) (consola oscura con los tokens de Sysadmin) y la página aislada [`docs/terminal/prototype/index.html`](prototype/index.html) (estructura y CSP). En la web se monta en un `<dialog>` de `index.html` y se abre desde `app.js` (`openTerminal()`); API: `SysTerminal.mount(root)` → `terminal.run("ss -tln")`, y `SysTerminal.examples()` para saber qué fichas tienen simulación.

El núcleo, reducido a lo esencial:

```js
// Pinta una línea SIEMPRE como texto (nunca innerHTML)
function print(out, line) {
  const { text, style } = typeof line === "string" ? { text: line } : line;
  const div = document.createElement("div");
  div.className = "t-line" + (["ok", "error", "warn", "dim", "info"].includes(style) ? ` t-${style}` : "");
  div.textContent = text;
  out.append(div);
  div.scrollIntoView({ block: "nearest" });
}

const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);   // nunca «name in commands»

function run(line, db, out) {
  const [name, ...args] = line.trim().split(/\s+/);
  if (!has(db.commands, name)) return print(out, { text: `${name}: orden no encontrada`, style: "error" });
  const def = db.commands[name];
  const flags = new Set(args.filter((a) => a.startsWith("-")).flatMap((a) => [...a.slice(1)].map((c) => "-" + c)));
  const bad = [...flags].find((f) => !has(def.flags || {}, f));
  if (bad) return print(out, { text: `${name}: opción inválida -- '${bad.slice(1)}'`, style: "error" });
  const variant = (def.variants || []).find((v) => v.flags.length === flags.size && v.flags.every((f) => flags.has(f)));
  (variant ? variant.output : def.output || []).forEach((l) => print(out, l));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const line = input.value.slice(0, 256);
  input.value = "";
  run(line, db, output);
});
```

---

## 4. Seguridad (XSS y otros)

| Riesgo | Precaución | Dónde |
|---|---|---|
| **XSS por la entrada del usuario** | Todo se inserta con `textContent` / `createElement`. **Prohibido** `innerHTML`, `insertAdjacentHTML`, `document.write` y `outerHTML` con datos de usuario o del JSON. | `Screen.print`, `Screen.echo` |
| XSS por los datos | El JSON también se trata como texto: un `output` con `<img onerror>` se ve como texto, no se ejecuta. Los estilos solo admiten clases de una **lista blanca**. | `STYLES`, `Screen.print` |
| Enlaces maliciosos | Los enlaces solo se construyen a partir de `libraryId` validado con `/^[a-z0-9-]+$/`, nunca con URLs del JSON o del usuario (evita `javascript:`). | `Screen.link` |
| Contaminación del prototipo | Búsqueda con `hasOwnProperty` y registro con `Object.create(null)`: `__proto__`, `constructor` o `toString` no son comandos. | `has()`, `Registry` |
| Ejecución de código | Nunca `eval`, `new Function`, `setTimeout("texto")` ni plantillas evaluadas; las plantillas `{arg0}` se sustituyen con una función que devuelve texto. | `printLines` |
| Política del navegador | **CSP estricta** (`default-src 'none'; script-src 'self'…`): aunque se colara HTML, el navegador no ejecutaría scripts inline ni externos. Sin estilos ni scripts inline en la página. | `index.html` |
| Caracteres invisibles o de control pegados | Se eliminan (C0/C1, de ancho cero, separadores de línea, controles bidireccionales) y la entrada se limita a 256 caracteres. | `sanitizeInput` |
| Abuso de memoria o del DOM | Máximo 500 líneas en pantalla y 100 en el historial. | `LIMITS` |
| Encadenado de órdenes | `|`, `;`, `&`, `>`, `<`, `` ` `` y `$(` se rechazan con un mensaje: no hay nada que encadenar y evita que se crea que se ejecuta algo. | `tokenize` |
| Expresiones regulares lentas (ReDoS) | El tokenizador recorre la línea carácter a carácter; no hay regex con retroceso sobre la entrada. | `tokenize` |
| Privacidad | La entrada no va a la URL, ni a analítica, ni a ningún servidor. Si se guarda el historial en `localStorage`, con límite y botón para borrarlo. | — |
| Desinformación | Las órdenes destructivas (`rm -rf`) muestran un aviso claro; la cabecera indica «sin ejecución real». | `danger`, `.badge` |

**Comprobado en el prototipo:** `<img src=x onerror=alert(1)>`, `echo <script>…`, `echo "<svg onload=…>"`, `cat "<img…>"` y `help <b>x</b>` se muestran como texto o se rechazan; 0 elementos inyectados y ningún diálogo.

---

## Layout

- En la web: panel modal (`<dialog id="termDialog">`) de `min(980px, 100vw-2rem) × min(680px, 100vh-2rem)` en escritorio y a pantalla completa (`100vw × 100dvh`) en móvil. En el prototipo, incrustado en la página (`max-width 960px`).
- Estructura: barra (puntos de ventana, título `usuario@host`, insignia «sin ejecución real») → salida (`role="log"`) → línea de entrada (prompt + `<input>`).
- La línea de entrada queda fija abajo y solo se desplaza la salida (como una terminal real); nunca se desplaza la página.

## Design Tokens Used

| Token | Valor | Uso |
|---|---|---|
| `--term-bg` | `#0d0c0a` | Fondo de la consola (el mismo que los ejemplos de las fichas). |
| `--paper-2` / `--paper-line` | `#1b1a16` / `#2f2c25` | Barra superior y bordes. |
| `--bone` | `#ece6d9` | Texto de salida. |
| `--amber` | `#ffb454` | Prompt, cursor (`caret-color`), avisos, enlaces, borde con foco. |
| `--sage` | `#9fd8a6` | Salidas correctas (`t-ok`), insignia. |
| `--blood` | `#ff6b5e` | Errores (`t-error`). |
| `--sky` | `#8cc4ff` | Información (`t-info`, directorios). |
| `--bone-mute` | `#8f897c` | Pistas y texto secundario (contraste AA 5,3:1). |
| `--font-mono` | IBM Plex Mono 400/600 | Toda la consola. |
| `--term-font-size` | 14px (13px en móvil) | Texto de consola; `line-height 1.6`. |
| `--space-sm/md/lg` | 8 / 16 / 24 px | Relleno de barra, salida y página. |
| `--radius-lg` | 16px | Esquinas de la consola. |

Estética «retro» sin neón: fósforo ámbar, líneas de barrido muy sutiles (`repeating-linear-gradient`, opacidad 1,2 %), sin brillos ni parpadeos.

## Components

| Componente | Variante | Props / datos | Notas |
|---|---|---|---|
| `Terminal` | — | `{ root, data }` | Raíz con `data-terminal` y `data-source` (ruta del JSON). |
| Barra | — | título, insignia | La insignia se oculta por debajo de 640px. |
| Línea de salida | `default · ok · error · warn · dim · info · echo` | `text`, `style` | `white-space: pre-wrap` (las tablas conservan sus columnas). |
| Línea de entrada | `idle · busy` | prompt dinámico | `busy` (`aria-busy`) mientras se transmite una salida lenta: el cursor se oculta e Intro no hace nada. |
| Enlace a ficha | — | `libraryId` | Solo ids validados. |

## States and Interactions

| Elemento | Estado | Comportamiento |
|---|---|---|
| Consola | Cargando | `aria-busy="true"` en la raíz hasta cargar el JSON. |
| Consola | Error de carga | Mensaje en la salida con cómo abrirla (servidor local). |
| Consola | Foco | Borde ámbar (`:focus-within`); clic en cualquier zona → foco en la entrada (salvo si se está seleccionando texto). |
| Entrada | Intro | Eco de la orden, ejecución, historial. |
| Entrada | ↑ / ↓ | Recorre el historial de la sesión. |
| Entrada | Tab | Con texto escrito: completa el comando o la ruta; si hay varias, completa el prefijo común y, si no avanza, las lista. Con la línea vacía: mueve el foco como siempre. |
| Entrada | Shift+Tab / Escape | Saca el foco de la consola (nunca atrapa al teclado). |
| Entrada | Ctrl+L | Limpia la pantalla (también `clear`). |
| Entrada | Ctrl+C | Cancela la salida en curso (`^C`) o la línea actual. Si hay texto seleccionado, copia (comportamiento normal). |
| Salida | Comando desconocido | `x: orden no encontrada` + «¿Quisiste decir…?» (distancia de Levenshtein ≤ 2). |
| Salida | Flag no admitido | `x: opción inválida -- 'z'` + pista de `help x`. |
| Salida | Combinación no simulada | Aviso y sugerencia de `help x`, que lista los ejemplos que sí funcionan. |

## Responsive Behavior

| Breakpoint | Cambios |
|---|---|
| Escritorio (>1024px) | Panel modal centrado de hasta 980×680px. |
| Tableta (641–1024px) | Igual, ocupando todo el ancho de la columna. |
| Móvil (≤640px) | Panel a pantalla completa, fuente de 13px (la entrada a 16px para que iOS no haga zoom), insignia oculta, `enterkeyhint="send"`. Las líneas largas se parten (`word-break`) en vez de desbordar. En la cabecera, los botones «Terminal» y «Practicar» muestran solo el icono (con `aria-label`). |

## Edge Cases

- **Vacío:** Intro sin texto deja una línea de prompt vacía, como una shell real.
- **Texto largo:** entrada limitada a 256 caracteres (`maxlength` + recorte); la salida se parte en varias líneas.
- **Muchas órdenes:** se conservan 500 líneas; las más antiguas se eliminan.
- **Comillas sin cerrar:** «falta cerrar unas comillas».
- **Tuberías y redirecciones:** mensaje explicativo, no error genérico.
- **Rutas:** `~`, `.`, `..`, rutas absolutas y relativas; errores con el texto de GNU coreutils.
- **Conexión lenta / sin conexión:** el JSON es pequeño y lo guardará el service worker; si falla, mensaje claro.
- **Idioma:** los mensajes del simulador están en `i18n.js` (`term.*`) y los textos de los datos como `{ es, en }`; siguen el idioma de la página. Las salidas de los comandos se dejan en inglés, como en un sistema real.

## Animation / Motion

| Elemento | Disparador | Animación | Duración | Easing |
|---|---|---|---|---|
| Salida «streaming» | `stream.delayMs` | Línea a línea | 350 ms/línea (ping) | lineal |
| Desplazamiento | Nueva línea | `scrollIntoView({ block: "nearest" })` | instantáneo | — |
| Borde de foco | `:focus-within` | Cambio de color | sin transición | — |

Con `prefers-reduced-motion` se anulan las transiciones; el streaming se mantiene porque transmite información (el tiempo entre paquetes), no es decorativo.

## Accessibility Notes

- **Orden de foco:** enlaces y botones de la página → entrada de la consola. La salida no es enfocable (es un registro).
- **ARIA:** salida con `role="log"`, `aria-live="polite"` y `aria-relevant="additions"` (se anuncian solo las líneas nuevas); `<label>` del prompt asociado al `<input>`; `aria-describedby` con la ayuda de teclado; `aria-busy` durante la carga y el streaming.
- **Teclado:** todo funciona sin ratón (ver tabla de interacciones). Tab solo autocompleta si hay texto escrito; con la línea vacía, y siempre con Shift+Tab o Escape, el foco sale de la consola, así que no hay trampa de teclado (WCAG 2.1.2). Al integrarlo, Escape cerrará además el panel.
- **Contraste:** todos los colores de texto cumplen AA sobre `#0d0c0a`.
- **Móvil:** `autocapitalize`, `autocorrect` y `spellcheck` desactivados para que el teclado no cambie los comandos.

---

## Integración en Sysadmin (hecho en v1.5.0)

- [x] **Datos:** `assets/terminal-data.js`, bilingüe; cada simulación referencia su ficha con `libraryId`.
- [x] **Validación:** `scripts/validate.js` comprueba que cada `libraryId` existe, que los flags de las variantes están declarados, que los subcomandos existen, que los estilos son válidos y que todo texto traducible tiene `es` y `en`. Lo ejecuta la CI.
- [x] **Interfaz:** botón «Terminal» en la cabecera y «▶ Probar» en las fichas con simulación (abre el panel y ejecuta la orden). Los enlaces «Abrir la ficha» cierran el panel. Textos en `i18n.js` (`term.*`).
- [x] **PWA:** `terminal.js`, `terminal-data.js` y `terminal.css` en `ASSETS` de `sw.js`.
- [x] **Pruebas:** Playwright (escritorio y móvil): abrir y ejecutar, flags inválidos, sugerencias, `cd`, Escape, intentos de XSS, `__proto__`/`constructor`, botón «Probar» e idioma.

### Próximos pasos

1. **Más contenido:** los ~30 comandos más consultados de Linux y de Cisco IOS (`show ip interface brief`, `show vlan brief`…). Para Cisco, prompt `R1>` / `R1#` / `R1(config)#` y los modos (`enable`, `configure terminal`) como estado de la sesión.
2. **Dividir los datos** por categoría y cargarlos bajo demanda cuando pasen de ~200 comandos.
3. **Historial persistente** opcional en `localStorage`, con límite y botón para borrarlo.
4. **CSP en la web principal:** hoy solo la tiene la página del prototipo; la web tiene un script en línea (la comprobación de versión) que habría que mover a un archivo antes de activar `script-src 'self'`.
