// @ts-check
/* Pruebas de interfaz de Sysadmin: búsqueda, filtros, copiar, favoritos, recientes,
 * variables, idioma, modo práctica, impresión, móvil y accesibilidad básica. */
const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  // Idioma fijo y sin el diálogo de impresión real
  await page.addInitScript(() => {
    if (!localStorage.getItem("mc.lang")) localStorage.setItem("mc.lang", JSON.stringify("es"));
    window.print = () => { window.__printed = (window.__printed || 0) + 1; };
  });
  await page.goto("/");
  await expect(page.locator("#list .row").first()).toBeVisible();
});

const row = (page, id) => page.locator(`#list .row[data-id="${id}"]`);
const total = (page) => page.evaluate(() => window.CHEATSHEET.commands.length);

test("muestra todos los comandos del dataset", async ({ page }) => {
  await expect(page.locator("#list .row")).toHaveCount(await total(page));
  await expect(page.locator("#listMeta")).toContainText(String(await total(page)));
});

test("la búsqueda filtra en tiempo real y sin tener en cuenta los acentos", async ({ page }) => {
  await page.locator("#search").fill("bloquear cuenta");
  await expect(row(page, "linux-usermod")).toBeVisible();
  await expect(row(page, "win-unlock-adaccount")).toBeVisible();
  await expect(page.locator("#listMeta")).toContainText("resultado");
  await page.locator("#search").fill("auditoria");           // sin tilde
  await expect(row(page, "linux-ausearch")).toBeVisible();
  await page.locator("#search").fill("zzzz-no-existe");
  await expect(page.locator("#empty")).toBeVisible();
});

test("el filtro de sistema muestra solo Windows y oculta Active Directory en Linux", async ({ page }) => {
  await page.locator('[data-os="windows"]').click();
  const winCount = await page.evaluate(() => window.CHEATSHEET.commands.filter((c) => c.os === "windows").length);
  await expect(page.locator("#list .row")).toHaveCount(winCount);
  await expect(page.locator('#catRail [data-cat="ad"]')).toBeVisible();
  await page.locator('[data-os="linux"]').click();
  await expect(page.locator('#catRail [data-cat="ad"]')).toHaveCount(0);
});

test("el filtro de riesgo oculta los comandos peligrosos", async ({ page }) => {
  await page.locator('[data-risk="danger"]').click();
  await expect(page.locator('[data-risk="danger"]')).toHaveAttribute("aria-pressed", "false");
  await expect(row(page, "linux-rm")).toHaveCount(0);
  await expect(row(page, "linux-ls")).toBeVisible();
});

test("copiar desde una fila pone el ejemplo en el portapapeles y lo añade a Recientes", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "permisos de portapapeles solo en Chromium");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await row(page, "linux-ss").locator("[data-copy]").click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  const expected = await page.evaluate(() => window.CHEATSHEET.commands.find((c) => c.id === "linux-ss").example.command);
  expect(clip).toBe(expected);
  await page.locator('#catRail [data-cat="recent"]').click();
  await expect(page.locator("#list .row")).toHaveCount(1);
  await expect(row(page, "linux-ss")).toBeVisible();
});

test("los favoritos se guardan y tienen su propia pestaña", async ({ page }) => {
  await row(page, "linux-find").locator("[data-fav]").click();
  await expect(row(page, "linux-find").locator("[data-fav]")).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await page.locator('#catRail [data-cat="fav"]').click();
  await expect(page.locator("#list .row")).toHaveCount(1);
  await expect(row(page, "linux-find")).toBeVisible();
  await row(page, "linux-find").locator("[data-fav]").click();
  await expect(page.locator("#emptyTitle")).toContainText("favoritos");
});

test("las variables sustituyen los valores de ejemplo", async ({ page, isMobile }) => {
  await page.locator("#btnVars").click();
  await page.locator('[data-var="dominio"]').fill("miempresa.lan");
  await page.locator('[data-var="usuario"]').fill("dzabala");
  await page.locator("#varsDialog button[value=close]").last().click();
  await expect(page.locator("#varsBadge")).toHaveText("2");
  await page.goto("/#win-runas");
  if (isMobile) await row(page, "win-runas").locator(".row-main").click();
  const ex = page.locator("#detail pre").last();
  await expect(ex).toContainText("MIEMPRESA\\adm.dzabala");
  await expect(page.locator("#detail .tk-user").first()).toBeVisible();
});

test("el cambio de idioma traduce interfaz y contenido", async ({ page, isMobile }) => {
  await page.locator("#btnLang").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("#btnQuiz")).toContainText("Practice");
  await expect(page.locator("#search")).toHaveAttribute("placeholder", /Search by command/);
  await expect(row(page, "linux-ss")).toContainText("Shows sockets");
  await page.locator("#btnLang").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("el modo práctica plantea preguntas con cuatro opciones y lleva la puntuación", async ({ page }) => {
  await page.locator("#btnQuiz").click();
  const dialog = page.locator("#quizDialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-answer]")).toHaveCount(4);
  await dialog.locator("[data-answer]").first().click();
  await expect(dialog.locator("#quizFeedback")).toContainText(/Correcto|Era/);
  await expect(page.locator("#quizScore")).toContainText("/1");
  await page.locator("#quizNext").click();
  await expect(dialog.locator("[data-answer]:not([disabled])")).toHaveCount(4);
});

test("exportar a PDF genera una versión imprimible de la lista actual", async ({ page }) => {
  await page.locator('#catRail [data-cat="git"]').click();
  const n = await page.locator("#list .row").count();
  await page.locator("#btnPrint").click();
  expect(await page.evaluate(() => window.__printed)).toBe(1);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("#printArea")).toBeVisible();
  await expect(page.locator("#printArea .p-cmd")).toHaveCount(n);
  await expect(page.locator("#list")).toBeHidden();
});

test("un enlace directo abre la ficha del comando", async ({ page, isMobile }) => {
  test.skip(isMobile, "en móvil la ficha se abre al tocar");
  await page.goto("/#win-netsh");
  await expect(page.locator("#detailTitle")).toHaveText("netsh");
});

test("en móvil la ficha se abre como hoja y se cierra con Volver", async ({ page, isMobile }) => {
  test.skip(!isMobile, "solo móvil");
  await row(page, "linux-find").locator(".row-main").click();
  await expect(page.locator("body")).toHaveClass(/sheet-open/);
  await expect(page.locator("#detailTitle")).toHaveText("find");
  await page.locator("#btnBack").click();
  await expect(page.locator("body")).not.toHaveClass(/sheet-open/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("accesibilidad básica: enlace de salto, sin controles anidados y todos los botones con nombre", async ({ page }) => {
  await expect(page.locator(".skip-link")).toHaveAttribute("href", "#list");
  expect(await page.locator("button button, a button, button a").count()).toBe(0);
  const unnamed = await page.evaluate(() => [...document.querySelectorAll("button")].filter((b) => {
    if (b.closest("dialog:not([open])")) return false;
    const name = (b.getAttribute("aria-label") || b.textContent || b.title || "").trim();
    return !name;
  }).length);
  expect(unnamed).toBe(0);
});
