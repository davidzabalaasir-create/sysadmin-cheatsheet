#!/usr/bin/env node
/* Copia las fuentes (subconjunto latin, woff2) desde node_modules/@fontsource
 * a assets/fonts para servirlas desde el propio sitio y funcionar sin conexión. */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "assets", "fonts");
const files = [
  ["instrument-serif", "instrument-serif-latin-400-normal.woff2"],
  ["instrument-serif", "instrument-serif-latin-400-italic.woff2"],
  ["ibm-plex-sans", "ibm-plex-sans-latin-400-normal.woff2"],
  ["ibm-plex-sans", "ibm-plex-sans-latin-500-normal.woff2"],
  ["ibm-plex-sans", "ibm-plex-sans-latin-600-normal.woff2"],
  ["ibm-plex-mono", "ibm-plex-mono-latin-400-normal.woff2"],
  ["ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff2"],
  ["ibm-plex-mono", "ibm-plex-mono-latin-600-normal.woff2"]
];

fs.mkdirSync(out, { recursive: true });
for (const [pkg, file] of files) {
  const src = path.join(root, "node_modules", "@fontsource", pkg, "files", file);
  fs.copyFileSync(src, path.join(out, file));
  console.log("copiado", file);
}
