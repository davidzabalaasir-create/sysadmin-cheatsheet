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

test("el título se descifra y termina como «Sysadmin» con su marcado original", async ({ page }) => {
  const h1 = page.locator("#brand");
  await expect(page.getByRole("heading", { level: 1, name: "Sysadmin" })).toBeVisible();
  await expect(h1).toHaveText("Sysadmin", { timeout: 5000 });
  await expect(h1.locator(".decrypt-ch")).toHaveCount(0);
  await expect(h1.locator("em")).toHaveText("admin");
});

test("con prefers-reduced-motion el título no se anima", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto("/");
  await expect(p.locator("#list .row").first()).toBeVisible();
  await expect(p.locator("#brand .decrypt-ch")).toHaveCount(0);
  await expect(p.locator("#brand")).toHaveText("Sysadmin");
  await ctx.close();
});

test("el indicador de la pestaña activa se desliza y luego desaparece", async ({ page }) => {
  // Registra qué indicadores llegan a aparecer (duran 240 ms, demasiado poco para sondearlos).
  await page.evaluate(() => {
    window.__inks = [];
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.classList?.contains("tab-ink")) window.__inks.push(n.className);
    }))).observe(document.body, { childList: true, subtree: true });
  });
  await page.locator('[data-os="linux"]').click();
  await expect.poll(() => page.evaluate(() => window.__inks)).toContainEqual(expect.stringContaining("tab-ink--pill"));
  await expect(page.locator("#osSwitch .tab-ink")).toHaveCount(0);   // al terminar queda el estado normal
  await expect(page.locator('[data-os="linux"]')).not.toHaveClass(/tab-sliding/);
  await expect(page.locator('[data-os="linux"]')).toHaveClass(/bg-bone/);
  await page.locator('#catRail [data-cat="network"]').click();
  await expect.poll(() => page.evaluate(() => window.__inks)).toContainEqual(expect.stringContaining("tab-ink--line"));
  await expect(page.locator("#catRail .tab-ink")).toHaveCount(0);
  await expect(page.locator('#catRail [data-cat="network"]')).toHaveClass(/border-amber/);
});

test("con prefers-reduced-motion las pestañas cambian sin deslizar", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto("/");
  await expect(p.locator("#list .row").first()).toBeVisible();
  await p.evaluate(() => {
    window.__inks = 0;
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((n) => {
      if (n.classList?.contains("tab-ink")) window.__inks++;
    }))).observe(document.body, { childList: true, subtree: true });
  });
  await p.locator('[data-os="windows"]').click();
  await p.locator('#catRail [data-cat="network"]').click();
  await expect(p.locator('[data-os="windows"]')).toHaveAttribute("aria-selected", "true");
  expect(await p.evaluate(() => window.__inks)).toBe(0);
  await ctx.close();
});

test("el modo práctica anima el acierto o el fallo solo al responder", async ({ page }) => {
  await page.locator("#btnQuiz").click();
  const dialog = page.locator("#quizDialog");
  await expect(dialog.locator(".quiz-hit, .quiz-miss, .quiz-reveal")).toHaveCount(0);  // antes de responder, nada
  const first = dialog.locator("[data-answer]").first();
  const chosen = await first.getAttribute("data-answer");
  await first.click();
  await expect(dialog.locator(".quiz-hit")).toHaveCount(1);               // la correcta siempre late en verde
  await expect(dialog.locator("#quizFeedback.quiz-reveal")).toHaveCount(1);
  const hitId = await dialog.locator(".quiz-hit").getAttribute("data-answer");
  // Si fallas, tu opción se sacude en rojo; si aciertas, no hay sacudida.
  await expect(dialog.locator(".quiz-miss")).toHaveCount(hitId === chosen ? 0 : 1);
  if (hitId !== chosen) await expect(dialog.locator(`.quiz-miss[data-answer="${chosen}"]`)).toHaveCount(1);
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

test("la opción Red muestra Cisco/Packet Tracer y el selector cabe en pantalla", async ({ page }) => {
  await page.locator('[data-os="network"]').click();
  const netCount = await page.evaluate(() => window.CHEATSHEET.commands.filter((c) => c.os === "network").length);
  await expect(page.locator("#list .row")).toHaveCount(netCount);
  await expect(page.locator('#catRail [data-cat="packettracer"]')).toBeVisible();
  await page.locator('#catRail [data-cat="packettracer"]').click();
  await expect(row(page, "pt-ospf")).toBeVisible();
  expect(await page.evaluate(() => { const s = document.getElementById("osSwitch"); return s.scrollWidth <= s.clientWidth + 1; })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("si el sistema elegido no tiene resultados, ofrece verlos en Todo", async ({ page }) => {
  await page.locator('[data-os="windows"]').click();
  await expect(page.locator('#catRail [data-cat="packettracer"]')).toHaveCount(0);
  await page.locator("#search").fill("ospf");
  await expect(page.locator("#empty")).toBeVisible();
  await expect(page.locator("#btnShowAllOs")).toBeVisible();
  await page.locator("#btnShowAllOs").click();
  await expect(page.locator('[data-os="all"]')).toHaveAttribute("aria-selected", "true");
  await expect(row(page, "pt-ospf")).toBeVisible();
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

test("las variables sustituyen los valores de ejemplo", async ({ page }) => {
  await page.locator("#btnVars").click();
  await page.locator('[data-var="dominio"]').fill("miempresa.lan");
  await page.locator('[data-var="usuario"]').fill("dzabala");
  await page.locator("#varsDialog button[value=close]").last().click();
  await expect(page.locator("#varsBadge")).toHaveText("2");
  await page.goto("/#win-runas"); // en móvil, el enlace directo abre la ficha como hoja
  await expect(page.locator("#detailTitle")).toHaveText("runas");
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

// ---------------------------------------------------------------- Terminal simulada
const termRun = async (page, cmd) => {
  await page.locator("#term-in").fill(cmd);
  await page.locator("#term-in").press("Enter");
};
const termText = (page) => page.locator("#termDialog [data-term-output]");

test("la terminal se abre desde la cabecera, ejecuta comandos y responde a errores", async ({ page }) => {
  await page.locator("#btnTerm").click();
  await expect(page.locator("#termDialog")).toBeVisible();
  await expect(page.locator("#term-in")).toBeFocused();
  await termRun(page, "ss -tln");
  await expect(termText(page)).toContainText("LISTEN");
  await termRun(page, "ss -z");
  await expect(termText(page)).toContainText("opción inválida -- 'z'");
  await termRun(page, "sss");
  await expect(termText(page)).toContainText("¿Quisiste decir «ss»?");
  await termRun(page, "cd /etc");
  await expect(page.locator("[data-term-prompt]")).toHaveText("admin@srv01:/etc$");
  await page.locator("#term-in").press("Escape");
  await expect(page.locator("#termDialog")).toBeHidden();
});

test("la terminal no interpreta HTML ni acepta nombres peligrosos", async ({ page }) => {
  const dialogs = [];
  page.on("dialog", (d) => { dialogs.push(d.message()); d.dismiss(); });
  await page.locator("#btnTerm").click();
  for (const cmd of ['echo "<img src=x onerror=alert(1)>"', 'cat "<svg onload=alert(2)>"', "<script>alert(3)</script>", "__proto__", "constructor"]) await termRun(page, cmd);
  await expect(termText(page)).toContainText("<img src=x onerror=alert(1)>");
  expect(await page.locator("#termDialog [data-term-output] img, #termDialog [data-term-output] svg, #termDialog [data-term-output] script").count()).toBe(0);
  await expect(termText(page)).toContainText("constructor: orden no encontrada");
  expect(dialogs).toEqual([]);
});

test("el botón Probar de una ficha abre la terminal con su comando", async ({ page, isMobile }) => {
  await page.goto("/#linux-ss");
  const probar = page.locator("#detail [data-try]");
  await expect(probar).toBeVisible();
  await probar.click();
  await expect(page.locator("#termDialog")).toBeVisible();
  await expect(termText(page)).toContainText("LISTEN");
  // Fichas sin simulación no muestran el botón
  await page.locator("#termDialog .term-close").click();
  if (!isMobile) {
    await page.goto("/#win-robocopy");
    await expect(page.locator("#detailTitle")).toHaveText("robocopy");
    await expect(page.locator("#detail [data-try]")).toHaveCount(0);
  }
});

test("la terminal también simula Windows PowerShell", async ({ page }) => {
  await page.locator("#btnTerm").click();
  await page.locator('#termDialog [data-term-os="windows"]').click();
  await expect(page.locator('#termDialog [data-term-os="windows"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-term-prompt]")).toHaveText("PS C:\\Users\\admin>");
  // Sin distinguir mayúsculas, con parámetros de PowerShell y de cmd
  await termRun(page, "get-service -name SPOOLER");
  await expect(termText(page)).toContainText("Print Spooler");
  await termRun(page, "ipconfig /all");
  await expect(termText(page)).toContainText("Physical Address");
  await termRun(page, "netstat -ano");
  await expect(termText(page)).toContainText("LISTENING       1188");
  await termRun(page, "tnc srv01 -Port 443");
  await expect(termText(page)).toContainText("RemotePort       : 443");
  // Sistema de archivos con rutas C:\ y alias dir / type
  await termRun(page, "cd \\Windows\\System32\\drivers\\etc");
  await expect(page.locator("[data-term-prompt]")).toHaveText("PS C:\\Windows\\System32\\drivers\\etc>");
  await termRun(page, "type hosts");
  await expect(termText(page)).toContainText("dc01.corp.local");
  await termRun(page, "dir C:\\Users\\admin");
  await expect(termText(page)).toContainText("Directory: C:\\Users\\admin");
  // Errores al estilo de PowerShell
  await termRun(page, "Get-Nada");
  await expect(termText(page)).toContainText("El término 'Get-Nada' no se reconoce");
  await termRun(page, "Get-Process -Foo");
  await expect(termText(page)).toContainText("nombre del parámetro 'foo'");
  // «linux» vuelve a bash
  await termRun(page, "linux");
  await expect(page.locator("[data-term-prompt]")).toHaveText("admin@srv01:~$");
});

test("el botón Probar de una ficha de Windows abre PowerShell", async ({ page }) => {
  await page.goto("/#win-ipconfig");
  await page.locator("#detail [data-try]").click();
  await expect(page.locator("[data-term-prompt]")).toHaveText("PS C:\\Users\\admin>");
  await expect(termText(page)).toContainText("Windows IP Configuration");
});

test("la terminal habla el idioma de la página", async ({ page }) => {
  await page.locator("#btnLang").click();
  await page.locator("#btnTerm").click();
  await termRun(page, "nope");
  await expect(termText(page)).toContainText("nope: command not found");
  await expect(page.locator("#termTitle")).toHaveText("Simulated terminal");
});

// ---------------------------------------------------------------- Seguridad
test("la política de seguridad (CSP) está activa y no bloquea nada legítimo", async ({ page }) => {
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
  await page.goto("/?csp=1#linux-ss"); // carga nueva del documento para que se instale el vigilante
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute("content", /script-src 'self'/);
  // Recorre las funciones principales
  await page.locator("#btnVars").click();
  await page.locator('[data-var="usuario"]').fill("dzabala");
  await page.locator("#varsDialog button[value=close]").last().click();
  await page.locator("#btnQuiz").click();
  await page.locator("#quizDialog [data-answer]").first().click();
  await page.locator("#quizDialog button[value=close]").first().click();
  await page.locator("#btnTerm").click();
  await page.locator("#term-in").fill("help ss");
  await page.locator("#term-in").press("Enter");
  await page.locator("#term-in").press("Escape");
  await page.locator("#btnPrint").click();
  await page.locator("#btnLang").click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__csp)).toEqual([]);
});
