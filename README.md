# Manual de campo del SysAdmin

🌐 **Web:** https://davidzabalaasir-create.github.io/sysadmin-cheatsheet/

Cheat sheet web de comandos para administradores de sistemas y redes: **Linux (Bash)** y **Windows (CMD / PowerShell)**, incluido **Active Directory / LDAP**.

## Características

- Diseño **maestro-detalle** estilo manual impreso: índice de comandos a la izquierda y ficha completa a la derecha (en móvil, hoja a pantalla completa).
- Selector **Todo / Linux / Windows** e índice de 8 categorías numeradas con contadores.
- Navegación con teclado (↑ ↓) y enlaces directos a cada comando (`#linux-find`).
- **Búsqueda en tiempo real** (`Ctrl+K` o `/`) por comando, descripción, flags o etiqueta, sin importar los acentos.
- Fichas con sintaxis resaltada, parámetros habituales, ejemplo real, comandos relacionados y botón de **copiar al portapapeles**.
- Niveles de riesgo: **Seguro**, **Precaución** y **Peligroso** (los destructivos van resaltados en rojo).
- Tema oscuro cálido con acento ámbar y tipografía editorial (Instrument Serif + IBM Plex), 100 % responsivo.

## Uso

Sin compilación. Abre `index.html` o sírvelo en local:

```bash
python -m http.server 5500
```

## Estructura

```
index.html                  UI (Tailwind CDN)
assets/data.js              Dataset de comandos (97)
assets/app.js               Lógica: filtros, búsqueda, ficha, copiar
assets/styles.css           Estilos complementarios
data/commands.example.json  Ejemplo del modelo de datos JSON
```

## Añadir un comando

Añade un objeto a `commands` en `assets/data.js`:

```js
{
  id: "linux-ejemplo", name: "ejemplo", os: "linux", shell: "bash",
  category: "network", risk: "safe",           // safe | caution | danger
  description: "…", syntax: "…",
  flags: [{ flag: "-x", description: "…" }],
  example: { command: "…", explanation: "…" },
  tags: ["…"]
}
```
