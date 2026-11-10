# Sysadmin

🌐 **Web:** https://davidzabalaasir-create.github.io/sysadmin-cheatsheet/ · [![CI](https://github.com/davidzabalaasir-create/sysadmin-cheatsheet/actions/workflows/ci.yml/badge.svg)](https://github.com/davidzabalaasir-create/sysadmin-cheatsheet/actions/workflows/ci.yml)

Biblioteca y cheat sheet de **546 comandos** para administradores de sistemas y redes: **Linux (Bash)**, **Windows (CMD / PowerShell)**, **Active Directory**, **contenedores y Kubernetes**, **Git**, **virtualización** (Hyper-V, VMware, KVM), **Exchange / Microsoft 365** **equipos de red** (Cisco IOS, MikroTik RouterOS) y **Cisco IOS para Packet Tracer** (51 comandos del temario CCNA: VLAN, trunks, STP, EtherChannel, OSPF, EIGRP, DHCP, NAT, ACL, HSRP, IPv6…). En español e inglés.

## Características

- Diseño de **documentación moderna** con **tema claro y oscuro**: barra lateral con las categorías, buscador siempre visible, índice y ficha completa (en móvil, una columna y la ficha a pantalla completa).
- Selector **Todo / Linux / Windows / Red** e índice de **15 categorías** desplazable (flechas, rueda, arrastre).
- **Búsqueda en tiempo real** (`Ctrl+K` o `/`) por comando, descripción, parámetros o etiqueta, sin importar los acentos, en los dos idiomas.
- Fichas con sintaxis resaltada, parámetros habituales, **ejemplo real**, requisitos, comandos relacionados y botones de **copiar**; también en cada fila de la lista.
- Niveles de riesgo **Seguro**, **Precaución** y **Peligroso**, con aviso al copiar comandos destructivos.
- **Favoritos** ☆ y **Recientes** (los últimos 20 copiados), con pestañas propias.
- **Variables editables** `{x}`: tu usuario, dominio de AD, dominio web, servidores y red de administración se aplican a los ejemplos al verlos, copiarlos e imprimirlos.
- **Terminal simulada**: prueba comandos en una consola dentro del navegador (salidas realistas, historial, Tab, `help`), sin ejecutar nada. Dos sistemas: **Linux** (bash) y **Windows** (PowerShell y cmd, sin distinguir mayúsculas). Botón «Terminal» y «▶ Probar» en las fichas con simulación.
- **Segura**: CSP estricta, sin dependencias en tiempo de ejecución ni recursos de terceros; informe en `docs/seguridad/AUDITORIA.md`. Dependabot propone las actualizaciones de npm y de las Actions.
- **Modo práctica**: adivina el comando a partir de su descripción, con puntuación y racha; respeta los filtros para practicar un tema (útil para CCNA, LPIC, RHCSA, AZ-800…).
- **Exportar a PDF / imprimir** la lista actual (categoría, favoritos o búsqueda) en un formato limpio para papel.
- **Español / English** con un clic: interfaz y contenido traducidos.
- **Funciona sin conexión** e instalable como app (PWA). Sin dependencias externas en tiempo de ejecución.
- **Accesible**: navegación completa con teclado, foco visible, enlace para saltar a la lista, contraste AA y respeto a «reducir movimiento».
- Tarjeta de vista previa al compartir el enlace (Open Graph).

## Uso

Abre `index.html` o sírvelo en local (el modo sin conexión requiere http/https):

```bash
npm run serve        # http://127.0.0.1:5500  (o: python -m http.server 5500)
```

## Desarrollo

```bash
npm install
npm run validate     # dataset, traducciones y textos de interfaz
npm run build:css    # tras cambiar clases en index.html o assets/app.js
npm test             # pruebas de interfaz con Playwright (escritorio y móvil)
node scripts/make-icons.js   # regenera iconos e imagen para compartir
```

- El CSS de Tailwind, las fuentes, los iconos y la imagen para compartir se publican ya generados (GitHub Pages no compila).
- En local, las pruebas usan el Edge o Chrome que tengas instalado; en GitHub se descarga Chromium.
- **GitHub Actions** (`.github/workflows/ci.yml`) valida los datos, comprueba que el CSS está al día y ejecuta las pruebas en cada push y pull request.
- Al publicar una versión nueva, sube `VERSION` en `sw.js` y la versión en `assets/data.js` y `assets/version-guard.js` (`APP_VERSION`), que deben coincidir.

## Estructura

```
index.html                      Interfaz
assets/data.js                  Dataset de comandos (español)
assets/data-en.js               Traducción al inglés del contenido
assets/i18n.js                  Textos de la interfaz (ES / EN)
assets/app.js                   Lógica: filtros, búsqueda, ficha, favoritos, práctica, PDF, idioma
assets/terminal*.js · .css      Terminal simulada: motor, datos y estilos
assets/styles.css               Estilos complementarios, accesibilidad e impresión
assets/tailwind.css             CSS compilado (desde assets/src/input.css)
assets/fonts/ · assets/icons/   Fuentes locales e iconos · assets/og-image.png
sw.js · manifest.webmanifest    Modo sin conexión e instalación (PWA)
tests/                          Pruebas de interfaz (Playwright)
scripts/                        Validador, servidor local, fuentes, iconos
docs/                           Auditoría Ubuntu + Apache + MariaDB · especificación de la terminal · auditoría de seguridad
AGENTS.md                       Guía para agentes de código (Codex, Claude Code)
```

## Añadir un comando

1. Añade el objeto a `commands` en `assets/data.js`:

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

2. Añade su traducción en `assets/data-en.js` (`d`, `f`, `x` y, si aplica, `r` y `n`).
3. Ejecuta `npm run validate`.

## Auditoría

[Ubuntu + Apache + MariaDB](docs/auditoria-ubuntu-apache-mariadb.md): análisis, revisión de comandos existentes y 31 comandos nuevos.

## Licencia

- Código: [MIT](LICENSE).
- Contenido (comandos, descripciones, ejemplos y documentación): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es).
