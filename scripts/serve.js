#!/usr/bin/env node
/* Servidor estático mínimo (sin dependencias) para desarrollo y pruebas.
 * Uso: node scripts/serve.js [puerto]   (por defecto 4173) */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const port = Number(process.argv[2] || process.env.PORT || 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
  ".png": "image/png", ".woff2": "font/woff2", ".md": "text/markdown; charset=utf-8"
};

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.normalize(path.join(root, url === "/" ? "index.html" : url));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) file = path.join(file, "index.html");
    fs.readFile(file, (e, data) => {
      if (e) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("404"); }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
  });
}).listen(port, "127.0.0.1", () => console.log(`Sysadmin en http://127.0.0.1:${port}`));
