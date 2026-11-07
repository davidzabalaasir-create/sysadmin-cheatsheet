/* Pruebas de interfaz con Playwright.
 * Local:  npx playwright test           (usa el Edge o Chrome instalado; no descarga navegadores)
 * CI:     npx playwright install --with-deps chromium && npx playwright test */
const { defineConfig, devices } = require("@playwright/test");
const fs = require("fs");

const local = !process.env.CI;
// En local se usa el Edge/Chrome ya instalado (sin descargar navegadores de Playwright).
const localBrowser = [
  process.env.BROWSER,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean).find((p) => fs.existsSync(p));
const browserOpts = local && localBrowser ? { launchOptions: { executablePath: localBrowser } } : {};

module.exports = defineConfig({
  testDir: "tests",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    serviceWorkers: "block", // cada prueba parte sin caché sin conexión
    ...browserOpts
  },
  projects: [
    { name: "escritorio", use: { viewport: { width: 1440, height: 900 } } },
    { name: "movil", use: { ...devices["Pixel 5"], ...browserOpts } }
  ],
  webServer: {
    command: "node scripts/serve.js 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: local
  }
});
