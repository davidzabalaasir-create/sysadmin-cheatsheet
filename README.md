# sysadmin.cheat — Biblioteca de comandos para SysAdmins

Cheat sheet web de comandos para administradores de sistemas y redes: **Linux (Bash)** y **Windows (CMD / PowerShell)**, incluido **Active Directory / LDAP**.

## Características

- Pestañas **Todos / Linux / Windows** y menú lateral con 8 categorías y contadores.
- **Búsqueda en tiempo real** (`Ctrl+K` o `/`) por comando, descripción, flags o etiqueta, sin importar los acentos.
- Tarjetas con sintaxis resaltada, parámetros comunes, ejemplo real y botón de **copiar al portapapeles**.
- Niveles de riesgo: **Seguro**, **Precaución** y **Peligroso** (los destructivos van resaltados en rojo).
- Modo oscuro estilo terminal, 100 % responsivo.

## Uso

Sin compilación. Abre `index.html` o sírvelo en local:

```bash
python -m http.server 5500
```

## Estructura

```
index.html                  UI (Tailwind CDN)
assets/data.js              Dataset de comandos (71)
assets/app.js               Lógica: filtros, búsqueda, copiar
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
