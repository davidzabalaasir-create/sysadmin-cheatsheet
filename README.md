# Sysadmin

🌐 **Web:** https://davidzabalaasir-create.github.io/sysadmin-cheatsheet/

Cheat sheet web de comandos para administradores de sistemas y redes: **Linux (Bash)** y **Windows (CMD / PowerShell)**, incluido **Active Directory / LDAP**.

## Características

- Diseño **maestro-detalle** estilo manual impreso: índice de comandos a la izquierda y ficha completa a la derecha (en móvil, hoja a pantalla completa).
- Selector **Todo / Linux / Windows** e índice de 9 categorías numeradas (incluye Paquetes y Actualizaciones) con contadores.
- Navegación con teclado (↑ ↓) y enlaces directos a cada comando (`#linux-find`).
- **Búsqueda en tiempo real** (`Ctrl+K` o `/`) por comando, descripción, flags o etiqueta, sin importar los acentos.
- Fichas con sintaxis resaltada, parámetros habituales, ejemplo real, comandos relacionados y botón de **copiar al portapapeles**, también en cada fila de la lista para copiar el ejemplo sin abrir la ficha.
- Niveles de riesgo: **Seguro**, **Precaución** y **Peligroso** (los destructivos van resaltados en rojo).
- **Variables editables** `{x}`: escribe tu usuario, dominio de AD, dominio web, servidores y red de administración, y todos los ejemplos se rellenan con tus datos al verlos y al copiarlos (se guardan solo en tu navegador).
- **Funciona sin conexión** e instalable como app (PWA) en PC y móvil.
- Tema oscuro cálido con acento ámbar y tipografía editorial (Instrument Serif + IBM Plex), 100 % responsivo, sin dependencias externas en tiempo de ejecución.

## Uso

Abre `index.html` o sírvelo en local (el modo sin conexión requiere http/https):

```bash
python -m http.server 5500
```

## Desarrollo

El CSS de Tailwind y las fuentes se compilan en local y se publican ya generados (`assets/tailwind.css`, `assets/fonts/`). Solo hace falta recompilar si cambias clases en `index.html` o `assets/app.js`:

```bash
npm install
npm run build        # fuentes + CSS
npm run validate     # comprueba el dataset
```

Al publicar una versión nueva, sube `VERSION` en `sw.js` para que los navegadores renueven la caché sin conexión.

## Estructura

```
index.html                  UI
assets/data.js              Dataset de comandos (184)
assets/app.js               Lógica: filtros, búsqueda, ficha, copiar
assets/styles.css           Estilos complementarios
assets/tailwind.css         CSS compilado (generado desde assets/src/input.css)
assets/fonts/ · assets/icons/  Fuentes locales e iconos de la app
sw.js · manifest.webmanifest   Modo sin conexión e instalación (PWA)
data/commands.example.json  Ejemplo del modelo de datos JSON
docs/                       Auditoría Ubuntu + Apache + MariaDB
scripts/                    Validador, copia de fuentes y generador de iconos
AGENTS.md                   Guía para agentes de código (Codex, Claude Code)
```

## Añadir un comando

Añade un objeto a `commands` en `assets/data.js`:

```js
{
  id: "linux-ejemplo", name: "ejemplo", os: "linux", shell: "bash",
  category: "network", risk: "safe",           // safe | caution | danger
  description: "…", syntax: "…",
  requires: "sudo apt install …",              // opcional
  flags: [{ flag: "-x", description: "…" }],
  example: { command: "…", explanation: "…" },
  tags: ["…"]
}
```

Después, valida el dataset:

```bash
node scripts/validate.js
```

## Auditoría

[Ubuntu + Apache + MariaDB](docs/auditoria-ubuntu-apache-mariadb.md): análisis, revisión de comandos existentes y 31 comandos nuevos.

## Licencia

- Código: [MIT](LICENSE).
- Contenido (comandos, descripciones, ejemplos y documentación): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es).
