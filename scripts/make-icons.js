#!/usr/bin/env node
/* Genera los iconos PNG de la app a partir de scripts/icon.html con Edge o Chrome headless.
 * Uso: node scripts/make-icons.js   (requiere Microsoft Edge o Google Chrome instalado) */
"use strict";
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { pathToFileURL } = require("url");

const candidates = [
  process.env.BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);
const browser = candidates.find((p) => fs.existsSync(p));
if (!browser) { console.error("No se encontró Edge ni Chrome. Define BROWSER=/ruta/al/navegador"); process.exit(1); }

const root = path.join(__dirname, "..");
const outDir = path.join(root, "assets", "icons");
const page = pathToFileURL(path.join(__dirname, "icon.html")).href;
fs.mkdirSync(outDir, { recursive: true });

for (const [name, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  const out = path.join(outDir, name);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "icon-"));
  execFileSync(browser, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`,
    "--allow-file-access-from-files", "--virtual-time-budget=2000",
    // El modo headless no admite ventanas muy pequeñas: se dibuja siempre a 512 px
    // y se escala con el factor de pantalla para obtener el tamaño final.
    "--window-size=512,512", `--force-device-scale-factor=${size / 512}`, `--screenshot=${out}`, page
  ], { stdio: "ignore" });
  console.log(`${name} (${size}px): ${fs.statSync(out).size} bytes`);
}

// Imagen para compartir (Open Graph / Twitter), 1200×630
{
  const out = path.join(root, "assets", "og-image.png");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "og-"));
  execFileSync(browser, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", `--user-data-dir=${profile}`,
    "--allow-file-access-from-files", "--virtual-time-budget=2000", "--force-device-scale-factor=1",
    "--window-size=1200,630", `--screenshot=${out}`, pathToFileURL(path.join(__dirname, "og.html")).href
  ], { stdio: "ignore" });
  console.log(`og-image.png (1200x630): ${fs.statSync(out).size} bytes`);
}
