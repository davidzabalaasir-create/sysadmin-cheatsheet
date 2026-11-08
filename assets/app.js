/* =========================================================================
 * Sysadmin — lógica (JavaScript vanilla)
 * Diseño maestro-detalle: índice de comandos a la izquierda y ficha completa
 * a la derecha (en móvil, la ficha se abre como hoja a pantalla completa).
 * Incluye: búsqueda, filtros, favoritos/recientes, variables de usuario,
 * modo práctica, exportación a PDF, idioma ES/EN y modo sin conexión (PWA).
 * ========================================================================= */
(() => {
  "use strict";

  const { categories, commands } = window.CHEATSHEET;
  const EN = window.CHEATSHEET_EN || {};
  const I18N = window.I18N;
  const $ = (s) => document.querySelector(s);
  const mqDesktop = window.matchMedia("(min-width: 1024px)");

  // ------------------------------------------------------------ Almacenamiento local
  const store = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* modo privado */ } }
  };

  // ------------------------------------------------------------ Idioma
  let lang = store.get("mc.lang", null) || ((navigator.language || "es").toLowerCase().startsWith("es") ? "es" : "en");
  /** Texto de interfaz traducido; admite {variables}. */
  const t = (k, vars) => {
    let s = I18N[lang]?.[k] ?? I18N.es[k] ?? k;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, n) => (vars[n] ?? m));
    return s;
  };
  // Contenido de los comandos en el idioma activo (con respaldo en español).
  const tr = (c) => (lang === "en" ? EN[c.id] : null);
  const cName = (c) => tr(c)?.n || c.name;
  const cDesc = (c) => tr(c)?.d || c.description;
  const cExpl = (c) => tr(c)?.x || c.example.explanation;
  const cReq = (c) => (c.requires ? tr(c)?.r || c.requires : "");
  const cFlag = (c, i) => tr(c)?.f?.[i] || c.flags[i].description;
  const shortName = (c) => cName(c).replace(/\s*\(.*\)\s*$/, "");
  const catLabel = (cat) => (lang === "en" ? cat.labelEn : cat.label);
  const catSub = (cat) => (lang === "en" ? cat.label : cat.labelEn);

  // ------------------------------------------------------------ Config
  const OS_IDS = ["all", "linux", "windows", "network"];
  const OS_STYLE = {
    linux:   { letter: "L", ring: "border-amber/60 text-amber", text: "text-amber" },
    windows: { letter: "W", ring: "border-sky/60 text-sky",     text: "text-sky" },
    network: { letter: "N", ring: "border-sage/60 text-sage",   text: "text-sage" }
  };
  const osName = (os) => t(`os.${os}`);

  /* Logos del selector de sistema (SVG en línea, usan currentColor). */
  const OS_LOGO = {
    all: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15H17"/></svg>`,
    linux: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M12 2.5c-2.6 0-4.3 2.1-4.3 5 0 1.2.2 2.1-.4 3.3C6 13 4.8 15 4.8 17.3c0 2.6 3.2 4.2 7.2 4.2s7.2-1.6 7.2-4.2c0-2.3-1.2-4.3-2.5-6.5-.6-1.2-.4-2.1-.4-3.3 0-2.9-1.7-5-4.3-5z
        M8.3 15.8a3.7 4.4 0 1 0 7.4 0a3.7 4.4 0 1 0-7.4 0z
        M9.5 7.2a1 1 0 1 0 2 0a1 1 0 1 0-2 0z M12.5 7.2a1 1 0 1 0 2 0a1 1 0 1 0-2 0z
        M10.6 9.6a1.4 .75 0 1 0 2.8 0a1.4 .75 0 1 0-2.8 0z"/>
      <ellipse cx="7.9" cy="21" rx="2.7" ry="1.25"/><ellipse cx="16.1" cy="21" rx="2.7" ry="1.25"/></svg>`,
    windows: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.6l7.4-1v6.9H3zM11.4 4.4L21 3v8.5h-9.6zM3 12.5h7.4v6.9L3 18.4zM11.4 12.5H21V21l-9.6-1.4z"/></svg>`,
    // Equipo de red (switch/router) para Cisco y MikroTik
    network: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true">
      <rect x="2.5" y="8" width="19" height="9" rx="1.8"/><path d="M6 12.5h1.5M9.5 12.5H11M13 12.5h1.5M16.5 12.5H18M8 8V5M16 8V5"/></svg>`
  };
  const OS_LOGO_COLOR = { all: "text-bone-dim", linux: "text-amber", windows: "text-sky", network: "text-sage" };
  /** Nombre corto para el selector (el largo, «Equipos de red», no cabe en móvil). */
  const osTab = (id) => (id === "network" ? t("os.tab.network") : osName(id));

  /* Iconos (trazo, 24×24). La clave coincide con categories[].icon. */
  const CAT_ICONS = {
    all:       '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    star:      '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    history:   '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    users:     '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    folder:    '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    network:   '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5 6.5 17M12 11.5l5.5 5.5"/>',
    cpu:       '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    shield:    '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    clock:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    disk:      '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    package:   '<path d="M12 2.5 3.5 7v10L12 21.5 20.5 17V7z"/><path d="M3.5 7 12 11.5 20.5 7M12 11.5v10M7.8 4.8l8.5 4.5"/>',
    container: '<rect x="2.5" y="10" width="5.5" height="4.5" rx=".5"/><rect x="9.25" y="10" width="5.5" height="4.5" rx=".5"/><rect x="16" y="10" width="5.5" height="4.5" rx=".5"/><rect x="9.25" y="4.5" width="5.5" height="4.5" rx=".5"/><path d="M2 17.5c3 2.5 7 3 11 2.5s7-2 9-4.5"/>',
    git:       '<circle cx="6" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="9" r="2.2"/><path d="M6 7.2v9.6M18 11.2c0 3.5-4 4.3-12 5.6"/>',
    server:    '<rect x="3" y="3.5" width="18" height="7" rx="1.5"/><rect x="3" y="13.5" width="18" height="7" rx="1.5"/><path d="M7 7h.01M7 17h.01M11 7h6M11 17h6"/>',
    cloud:     '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.5 1.6A3.8 3.8 0 0 1 17.5 18.5z"/>',
    router:    '<rect x="2.5" y="13" width="19" height="7" rx="1.5"/><path d="M6.5 16.5h.01M10 16.5h.01M15 13V9M8.5 8.5a6.5 6.5 0 0 1 13 0M11.5 10.5a3.5 3.5 0 0 1 7 0"/>',
    switch:    '<rect x="2.5" y="7" width="19" height="10" rx="1.5"/><path d="M6 11h1.5M9.5 11H11M13 11h1.5M16.5 11H18M6 14h12"/><path d="M8 7V4.5M16 7V4.5"/>',
    tree:      '<rect x="9" y="2.5" width="6" height="5" rx="1"/><rect x="2.5" y="16.5" width="6" height="5" rx="1"/><rect x="15.5" y="16.5" width="6" height="5" rx="1"/><path d="M12 7.5V12M5.5 16.5V12h13v4.5"/>'
  };
  const catIcon = (name, cls = "w-4 h-4") =>
    `<svg class="${cls}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">${CAT_ICONS[name] || CAT_ICONS.all}</svg>`;
  const ICON_COPY = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';
  const starIcon = (on, cls = "w-4 h-4") =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>`;

  const SHELL = { bash: "bash", powershell: "PowerShell", cmd: "CMD", ios: "Cisco IOS", routeros: "RouterOS" };
  const PROMPT = { bash: "root@srv01:~#", powershell: "PS C:\\>", cmd: "C:\\>", ios: "SW-CORE-01#", routeros: "[admin@MikroTik] >" };
  const RISK = {
    safe:    { text: "text-sage",  dot: "bg-sage",  border: "border-sage/40" },
    caution: { text: "text-amber", dot: "bg-amber", border: "border-amber/50" },
    danger:  { text: "text-blood", dot: "bg-blood", border: "border-blood/60" }
  };
  const riskLabel = (r) => t(`risk.${r}`);
  const SPECIAL = ["fav", "recent"]; // pseudo-categorías

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const catNum = Object.fromEntries(categories.map((c, i) => [c.id, String(i + 1).padStart(2, "0")]));
  const cmdById = Object.fromEntries(commands.map((c) => [c.id, c]));

  // ------------------------------------------------------------ Estado
  const state = {
    os: store.get("mc.os", "all"),
    category: "all",
    risks: new Set(Object.keys(RISK)),
    query: "",
    selected: decodeURIComponent(location.hash.slice(1)) || null,
    visible: []
  };
  if (!OS_IDS.includes(state.os)) state.os = "all";
  let favs = new Set(store.get("mc.favs", []).filter((id) => cmdById[id]));
  let recents = store.get("mc.recent", []).filter((id) => cmdById[id]);

  // ------------------------------------------------------------ Utils
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const terms = () => norm(state.query).split(/\s+/).filter(Boolean);
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /** Subraya los términos buscados en texto plano. */
  function hl(text) {
    const plain = String(text), n = norm(plain), ts = terms();
    if (!ts.length || n.length !== plain.length) return esc(plain);
    const ranges = [];
    ts.forEach((q) => { for (let i = n.indexOf(q); i !== -1; i = n.indexOf(q, i + q.length)) ranges.push([i, i + q.length]); });
    if (!ranges.length) return esc(plain);
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    ranges.forEach((r) => { const l = merged.at(-1); l && r[0] <= l[1] ? (l[1] = Math.max(l[1], r[1])) : merged.push([...r]); });
    let out = "", p = 0;
    merged.forEach(([a, b]) => { out += esc(plain.slice(p, a)) + "<mark>" + esc(plain.slice(a, b)) + "</mark>"; p = b; });
    return out + esc(plain.slice(p));
  }

  /** Resaltado de sintaxis ligero para bash / PowerShell / CMD / IOS / RouterOS. */
  function code(src, shell) {
    const re = /(\r?\n)|([ \t]+)|("(?:[^"\\]|\\.)*"|'[^']*')|(2>&1|\|\||&&|>>|[|;>])|([^\s|;"'>]+)|(.)/g;
    let out = "", m, expectCmd = true;
    while ((m = re.exec(src))) {
      const [tok, nl, ws, str, op, word, other] = m;
      if (nl) { out += "\n"; expectCmd = true; continue; }
      if (ws) { out += ws; continue; }
      if (str) { out += `<span class="tk-str">${esc(str)}</span>`; expectCmd = false; continue; }
      if (op) { out += `<span class="tk-op">${esc(op)}</span>`; expectCmd = ![">", ">>", "2>&1"].includes(op); continue; }
      if (word) {
        if (word.startsWith("#") && shell !== "cmd" && shell !== "ios") {
          const end = src.indexOf("\n", m.index);
          const rest = end === -1 ? src.slice(m.index) : src.slice(m.index, end);
          out += `<span class="tk-com">${esc(rest)}</span>`;
          re.lastIndex = m.index + rest.length;
          continue;
        }
        let cls = "";
        if (word.startsWith("$")) cls = "tk-var";
        else if (expectCmd && !/^[{}()@]/.test(word)) cls = "tk-cmd";
        else if (/^--?[A-Za-z]/.test(word)) cls = "tk-flag";
        else if (shell === "cmd" && /^\/[A-Za-z?]/.test(word)) cls = "tk-flag";
        out += cls ? `<span class="${cls}">${esc(word)}</span>` : esc(word);
        if (!/^[{(]$/.test(word)) expectCmd = false;
        continue;
      }
      out += esc(other || tok);
    }
    return out;
  }

  // ------------------------------------------------------------ Variables de usuario
  /* Cada variable sustituye los valores de ejemplo que usan los comandos del dataset.
   * Se guardan en localStorage y se aplican al mostrar, copiar e imprimir los ejemplos. */
  const VARS = [
    { key: "usuario",   sample: "jlopez",          re: /\b(?:jlopez|aruiz)\b/g },
    { key: "dominio",   sample: "corp.local" },
    { key: "web",       sample: "empresa.com",     re: /tu-dominio\.com|empresa\.com/g },
    { key: "servidor",  sample: "srv01",           re: /\bsrv01\b/g },
    { key: "servidor2", sample: "srv02",           re: /\bsrv02\b/g },
    { key: "redAdmin",  sample: "192.168.10.0/24", re: /192\.168\.10\.0\/24/g }
  ];
  let userVars = store.get("mc.vars", {}) || {};
  const activeVars = () => VARS.filter((v) => (userVars[v.key] || "").trim());

  /** Sustituye los valores de ejemplo por los del usuario.
   *  Con `mark`, rodea cada sustitución con \u0001…\u0002 para resaltarla después. */
  function applyVars(text, mark = false) {
    let s = text;
    const wrap = (v) => (mark && !/[\s"']/.test(v) ? `\u0001${v}\u0002` : v);
    // Se eliminan los caracteres que el resaltado usa como marcas internas (U+0001 y U+0002),
    // para que una variable no pueda descuadrar el marcado.
    const MARKS = new RegExp("[" + String.fromCharCode(1) + String.fromCharCode(2) + "]", "g");
    const get = (k) => String(userVars[k] || "").replace(MARKS, "").trim();
    const dom = get("dominio");
    if (dom) {
      const dn = dom.split(".").filter(Boolean).map((p) => `DC=${p}`).join(",");
      const netbios = dom.split(".")[0].toUpperCase();
      s = s.replace(/DC=corp,DC=local/g, () => wrap(dn))
           .replace(/corp\.local/g, () => wrap(dom))
           .replace(/\bCORP(?=\\)/g, () => wrap(netbios));
    }
    for (const v of VARS) {
      if (!v.re || !get(v.key)) continue;
      s = s.replace(v.re, () => wrap(get(v.key)));
    }
    return s;
  }

  /** HTML resaltado de un ejemplo con las variables aplicadas y marcadas. */
  const exampleHtml = (c) =>
    code(applyVars(c.example.command, true), c.shell)
      .replace(/\u0001/g, `<span class="tk-user" title="${esc(t("vars.yours"))}">`)
      .replace(/\u0002/g, "</span>");

  function renderVarsBadge() {
    const n = activeVars().length, b = $("#varsBadge");
    b.textContent = n;
    b.classList.toggle("hidden", !n);
    b.classList.toggle("grid", !!n);
  }

  function renderVarsForm() {
    $("#varsFields").innerHTML = VARS.map((v) => `
      <label class="block">
        <span class="flex items-baseline justify-between gap-3">
          <span class="text-sm text-bone">${esc(t(`var.${v.key}`))}</span>
          <span class="font-mono text-[10px] text-bone-mute">${esc(t("vars.example"))}: ${esc(v.sample)}</span>
        </span>
        <input data-var="${v.key}" value="${esc(userVars[v.key] || "")}" placeholder="${esc(v.sample)}" autocomplete="off" spellcheck="false"
          class="mt-1.5 w-full rounded-lg bg-paper border border-paper-line2 focus:border-amber px-3 py-2 font-mono text-sm text-amber placeholder:text-bone-mute" />
        ${I18N[lang][`var.${v.key}.hint`] ? `<span class="block mt-1 text-xs text-bone-mute">${esc(t(`var.${v.key}.hint`))}</span>` : ""}
      </label>`).join("");
  }

  function saveVars() {
    store.set("mc.vars", userVars);
    renderVarsBadge();
    renderList();
    renderDetail();
  }

  // ------------------------------------------------------------ Favoritos y recientes
  function toggleFav(id) {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    store.set("mc.favs", [...favs]);
    toast(favs.has(id) ? t("toast.favAdded") : t("toast.favRemoved"));
    if (state.category === "fav") render(); else { renderHeader(); refreshFavButtons(id); }
  }
  function refreshFavButtons(id) {
    document.querySelectorAll(`[data-fav="${id}"]`).forEach((b) => {
      const on = favs.has(id);
      b.setAttribute("aria-pressed", on);
      b.classList.toggle("text-amber", on);
      b.innerHTML = starIcon(on, b.dataset.size === "lg" ? "w-5 h-5" : "w-4 h-4");
      b.setAttribute("aria-label", t(on ? "fav.remove" : "fav.add", { name: shortName(cmdById[id]) }));
    });
  }
  function pushRecent(id) {
    recents = [id, ...recents.filter((x) => x !== id)].slice(0, 20);
    store.set("mc.recent", recents);
  }
  const favBtn = (c, size = "sm") => {
    const on = favs.has(c.id);
    return `<button type="button" data-fav="${c.id}" data-size="${size}" aria-pressed="${on}" aria-label="${esc(t(on ? "fav.remove" : "fav.add", { name: shortName(c) }))}"
      class="p-1 rounded-md transition hover:text-amber ${on ? "text-amber" : "text-bone-mute"}">${starIcon(on, size === "lg" ? "w-5 h-5" : "w-4 h-4")}</button>`;
  };

  // ------------------------------------------------------------ Búsqueda
  let index = [];
  function buildIndex() {
    index = commands.map((c) => {
      const en = EN[c.id] || {};
      return {
        c,
        name: norm(cName(c)),
        tags: (c.tags || []).map(norm),
        hay: norm([
          c.name, en.n || "", c.description, en.d || "", c.syntax, SHELL[c.shell], c.os, osName(c.os),
          catById[c.category].label, catById[c.category].labelEn,
          (c.tags || []).join(" "), (c.flags || []).map((f) => `${f.flag} ${f.description}`).join(" "), (en.f || []).join(" "),
          c.example.command, c.example.explanation, en.x || "", riskLabel(c.risk), c.requires || "", en.r || ""
        ].join(" "))
      };
    });
  }

  function score(e, ts) {
    let s = 0;
    for (const q of ts) {
      if (!e.hay.includes(q)) return -1;
      s += e.name === q ? 100 : e.name.startsWith(q) ? 50 : e.name.includes(q) ? 25 : e.tags.some((x) => x.includes(q)) ? 10 : 1;
    }
    return s;
  }

  /** Ejecuta fn() como si estuviera seleccionado otro sistema (sin cambiar el estado real). */
  function withOs(os, fn) {
    const prev = state.os;
    state.os = os;
    try { return fn(); } finally { state.os = prev; }
  }

  function filter({ ignoreCategory = false } = {}) {
    const ts = terms(), out = [];
    for (const e of index) {
      const c = e.c;
      if (state.os !== "all" && c.os !== state.os) continue;
      if (!ignoreCategory) {
        if (state.category === "fav") { if (!favs.has(c.id)) continue; }
        else if (state.category === "recent") { if (!recents.includes(c.id)) continue; }
        else if (state.category !== "all" && c.category !== state.category) continue;
      }
      if (!state.risks.has(c.risk)) continue;
      const s = ts.length ? score(e, ts) : 0;
      if (s >= 0) out.push({ c, s });
    }
    if (!ignoreCategory && state.category === "recent" && !ts.length) {
      out.sort((a, b) => recents.indexOf(a.c.id) - recents.indexOf(b.c.id));
    } else {
      out.sort((a, b) => b.s - a.s || catNum[a.c.category].localeCompare(catNum[b.c.category]) || a.c.os.localeCompare(b.c.os) || a.c.name.localeCompare(b.c.name));
    }
    return out.map((x) => x.c);
  }

  // ------------------------------------------------------------ Render: cabecera
  /** Posición de la pestaña activa de un grupo, antes de volver a pintarlo. */
  function activeTabBox(host, sel) {
    const el = host.querySelector(sel);
    return el ? { key: el.dataset.os || el.dataset.cat, left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight } : null;
  }
  /** Desliza el indicador (píldora del sistema o subrayado ámbar de la categoría) desde la
   *  pestaña anterior hasta la nueva. Mientras dura, la pestaña nueva oculta su propio
   *  indicador; al acabar se quita el elemento y queda el estado normal de siempre. */
  function slideTabInk(host, sel, from, kind) {
    const to = host.querySelector(sel);
    if (!from || !to || from.key === (to.dataset.os || to.dataset.cat) || reducedMotion() || !to.animate) return;
    host.querySelector(".tab-ink")?.remove();
    const ink = document.createElement("span");
    ink.className = `tab-ink tab-ink--${kind}`;
    ink.setAttribute("aria-hidden", "true");
    host.appendChild(ink);
    to.classList.add("tab-sliding");
    const box = (b) => kind === "pill"
      ? { left: b.left + "px", top: b.top + "px", width: b.width + "px", height: b.height + "px" }
      : { left: b.left + "px", width: b.width + "px" };
    const end = { left: to.offsetLeft, top: to.offsetTop, width: to.offsetWidth, height: to.offsetHeight };
    if (kind === "line") ink.style.top = end.top + end.height - 2 + "px"; // sobre el borde inferior de la pestaña
    const anim = ink.animate([box(from), box(end)], { duration: 240, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" });
    const done = () => {
      // Cambio instantáneo al estado final (sin la transición de color del botón) para que no parpadee.
      to.style.transition = "none";
      to.querySelectorAll("*").forEach((el) => { el.style.transition = "none"; });
      to.classList.remove("tab-sliding");
      ink.remove();
      void to.offsetWidth;
      to.style.transition = "";
      to.querySelectorAll("*").forEach((el) => { el.style.transition = ""; });
    };
    anim.onfinish = done; anim.oncancel = done;
  }

  function renderHeader() {
    const osHost = $("#osSwitch"), catHost = $("#catRail");
    const prevOs = activeTabBox(osHost, '[aria-selected="true"]');
    const prevCat = activeTabBox(catHost, '[aria-current="page"]');
    $("#osSwitch").innerHTML = OS_IDS.map((id) => {
      const on = state.os === id;
      const n = id === "all" ? commands.length : commands.filter((c) => c.os === id).length;
      return `<button type="button" role="tab" aria-selected="${on}" data-os="${id}"
        class="flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-full transition ${on ? "bg-bone text-paper" : "text-bone-dim hover:text-bone"}">
        <span class="hidden sm:inline ${on ? "" : OS_LOGO_COLOR[id]}">${OS_LOGO[id]}</span>
        ${esc(osTab(id))} <span class="hidden sm:inline ${on ? "text-paper/70" : "text-bone-mute"}">${n}</span></button>`;
    }).join("");

    const pool = filter({ ignoreCategory: true });
    const counts = pool.reduce((a, c) => ((a[c.category] = (a[c.category] || 0) + 1), a), {});
    const cats = categories.filter((c) => state.os === "all" || c.os.includes(state.os));
    if (!SPECIAL.includes(state.category) && state.category !== "all" && !cats.some((c) => c.id === state.category)) state.category = "all";

    const badge = (cat) => {
      if (cat.os.length !== 1) return "";
      const os = cat.os[0], st = OS_STYLE[os];
      return `<span class="font-mono text-[9px] ${st.text} border border-current/40 rounded px-1 opacity-80">${esc(t(`os.short.${os}`))}</span>`;
    };
    const tab = (id, num, label, n, icon, extra = "") => {
      const on = state.category === id;
      return `<button type="button" data-cat="${id}" aria-current="${on ? "page" : "false"}" class="group shrink-0 flex items-center gap-2 px-3 py-3.5 border-b-2 transition whitespace-nowrap
        ${on ? "border-amber text-bone" : "border-transparent text-bone-dim hover:text-bone"} ${n ? "" : "opacity-50"}">
        <span class="font-mono text-[10px] ${on ? "text-amber" : "text-bone-mute"}" aria-hidden="true">${num}</span>
        <span class="${on ? "text-amber" : "text-bone-mute group-hover:text-amber"} transition-colors">${catIcon(icon)}</span>
        <span class="text-sm">${esc(label)}</span>${extra}
        <span class="font-mono text-[10px] text-bone-mute"><span class="sr-only">, </span>${n}</span></button>`;
    };
    const favN = pool.filter((c) => favs.has(c.id)).length;
    const recN = pool.filter((c) => recents.includes(c.id)).length;
    $("#catRail").innerHTML =
      tab("all", "§", t("cat.all"), pool.length, "all") +
      tab("fav", "★", t("cat.fav"), favN, "star") +
      tab("recent", "↺", t("cat.recent"), recN, "history") +
      `<span class="shrink-0 w-px my-3 bg-paper-line" aria-hidden="true"></span>` +
      cats.map((c) => tab(c.id, catNum[c.id], catLabel(c), counts[c.id] || 0, c.icon, badge(c))).join("");
    // Sin requestAnimationFrame: así funciona aunque la pestaña esté en segundo plano.
    if (lastCenteredCat !== state.category) { centerActiveCat(lastCenteredCat !== null); lastCenteredCat = state.category; }
    updateRailArrows();
    slideTabInk(osHost, '[aria-selected="true"]', prevOs, "pill");
    slideTabInk(catHost, '[aria-current="page"]', prevCat, "line");

    $("#riskToggles").innerHTML = Object.entries(RISK).map(([id, r]) => {
      const on = state.risks.has(id);
      return `<button type="button" data-risk="${id}" aria-pressed="${on}" title="${esc(t(on ? "risk.hide" : "risk.show", { risk: riskLabel(id) }))}"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] uppercase tracking-wider transition
        ${on ? `${r.border} ${r.text}` : "border-paper-line text-bone-mute line-through"}">
        <span class="w-1.5 h-1.5 rounded-full ${on ? r.dot : "bg-bone-mute/40"}" aria-hidden="true"></span><span class="hidden sm:inline">${esc(riskLabel(id))}</span><span class="sm:hidden sr-only">${esc(riskLabel(id))}</span></button>`;
    }).join("");

    const n = (os) => commands.filter((c) => c.os === os).length;
    $("#counter").innerHTML = `
      <p class="font-serif text-5xl leading-none text-bone">${commands.length}</p>
      <p class="font-mono text-[10px] uppercase tracking-widest text-bone-mute mt-1">${esc(t("counter", { l: n("linux"), w: n("windows"), r: n("network") }))}</p>`;
  }

  // ------------------------------------------------------------ Barra de categorías desplazable
  const rail = $("#catRail"), railPrev = $("#railPrev"), railNext = $("#railNext");
  let lastCenteredCat = null;

  function updateRailArrows() {
    const max = rail.scrollWidth - rail.clientWidth;
    railPrev.hidden = rail.scrollLeft <= 4;
    railNext.hidden = max <= 4 || rail.scrollLeft >= max - 4;
  }

  /** Centra la pestaña activa sin mover la página en vertical. */
  function centerActiveCat(smooth) {
    const tabEl = rail.querySelector(`[data-cat="${state.category}"]`);
    if (!tabEl) return;
    const left = tabEl.offsetLeft - (rail.clientWidth - tabEl.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: smooth && !reducedMotion() ? "smooth" : "instant" });
  }
  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  railPrev.addEventListener("click", () => rail.scrollBy({ left: -rail.clientWidth * 0.7, behavior: "smooth" }));
  railNext.addEventListener("click", () => rail.scrollBy({ left: rail.clientWidth * 0.7, behavior: "smooth" }));
  rail.addEventListener("scroll", updateRailArrows, { passive: true });
  window.addEventListener("resize", updateRailArrows);

  // Rueda vertical del ratón → desplazamiento horizontal.
  rail.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || rail.scrollWidth <= rail.clientWidth) return;
    e.preventDefault();
    rail.scrollBy({ left: e.deltaY, behavior: "instant" });
  }, { passive: false });

  // Arrastrar con el ratón para desplazar (en táctil ya funciona el gesto nativo).
  let drag = null, suppressClick = false;
  rail.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, left: rail.scrollLeft, moved: false };
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; rail.classList.add("dragging"); }
    if (drag.moved) rail.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", () => {
    if (!drag) return;
    suppressClick = drag.moved;
    setTimeout(() => { suppressClick = false; }, 0); // por si se soltó fuera y no llega el click
    rail.classList.remove("dragging");
    drag = null;
  });
  // Tras arrastrar no se debe seleccionar la categoría sobre la que se soltó.
  rail.addEventListener("click", (e) => {
    if (suppressClick) { e.stopPropagation(); e.preventDefault(); suppressClick = false; }
  }, true);

  // ------------------------------------------------------------ Render: lista
  function row(c) {
    const r = RISK[c.risk], o = OS_STYLE[c.os];
    const sel = c.id === state.selected;
    return `<div data-id="${c.id}" class="row group cursor-pointer w-full grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3 px-3 py-3 rounded-lg hover:bg-paper-2 transition" aria-current="${sel}">
      <span class="mt-0.5 grid place-items-center w-7 h-7 rounded-full border font-mono text-[11px] ${o.ring}" aria-hidden="true">${o.letter}</span>
      <button type="button" data-id="${c.id}" class="row-main min-w-0 text-left rounded" aria-current="${sel}">
        <span class="flex items-baseline gap-2 flex-wrap">
          <code class="font-mono text-[15px] font-medium ${sel ? "text-amber" : "text-bone"}">${hl(cName(c))}</code>
          <span class="font-mono text-[10px] text-bone-mute"><span class="sr-only">${esc(osName(c.os))}, </span>${SHELL[c.shell]}</span>
        </span>
        <span class="block text-[13px] text-bone-dim leading-snug mt-0.5 line-clamp-2">${hl(cDesc(c))}</span>
      </button>
      <span class="flex flex-col items-end gap-1.5">
        <span class="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${r.text}">
          ${c.risk === "safe" ? `<span class="sr-only">${esc(riskLabel(c.risk))}</span>` : `<span class="hidden sm:inline">${esc(riskLabel(c.risk))}</span><span class="sm:hidden sr-only">${esc(riskLabel(c.risk))}</span>`}<span class="w-2 h-2 rounded-full ${r.dot}" aria-hidden="true"></span>
        </span>
        <span class="flex items-center gap-1 row-actions">
          ${favBtn(c)}
          <button type="button" data-copy="${c.id}" data-field="example" title="${esc(t("copy.exampleTitle", { cmd: applyVars(c.example.command).split("\n")[0].slice(0, 80) }))}" aria-label="${esc(t("copy.exampleOf", { name: shortName(c) }))}"
            class="flex items-center gap-1 px-2 py-1 rounded-md border border-paper-line2 text-bone-mute font-mono text-[10px] uppercase tracking-wider hover:text-amber hover:border-amber/60 transition">
            ${ICON_COPY}<span>${esc(t("copy"))}</span>
          </button>
        </span>
      </span>
    </div>`;
  }

  function renderList() {
    const list = (state.visible = filter());
    const grouped = !state.query && state.category !== "recent";
    let html = "";
    if (grouped) {
      let current = null;
      list.forEach((c) => {
        if (c.category !== current) {
          if (current) html += "</div>";
          current = c.category;
          const cat = catById[c.category];
          html += `<div class="mb-6"><h2 class="flex items-baseline gap-3 px-3 pb-2 mb-1 border-b border-paper-line">
            <span class="font-mono text-xs text-amber">§${catNum[cat.id]}</span>
            <span class="self-center text-amber/80">${catIcon(cat.icon, "w-5 h-5")}</span>
            <span class="font-serif text-2xl text-bone">${esc(catLabel(cat))}</span>
            <span class="ml-auto font-mono text-[10px] text-bone-mute uppercase tracking-wider hidden sm:inline" lang="${lang === "en" ? "es" : "en"}">${esc(catSub(cat))}</span></h2>`;
        }
        html += row(c);
      });
      if (current) html += "</div>";
    } else {
      html = list.map(row).join("");
    }
    $("#list").innerHTML = html;

    // Estado vacío (con mensajes específicos para favoritos y recientes)
    const empty = list.length === 0;
    $("#empty").classList.toggle("hidden", !empty);
    if (empty) {
      const special = !state.query && (state.category === "fav" ? "fav" : state.category === "recent" ? "recent" : null);
      $("#emptyTitle").textContent = special ? t(`empty.${special}.title`) : t("empty.title");
      $("#emptyText").textContent = special ? t(`empty.${special}.text`) : t("empty.text");
      $("#btnReset").classList.toggle("hidden", !!special);
      // Si el filtro de sistema oculta resultados que sí existen en otros sistemas, se avisa.
      const other = !special && state.os !== "all" ? withOs("all", () => filter().length) : 0;
      $("#btnShowAllOs").classList.toggle("hidden", !other);
      if (other) {
        $("#emptyText").textContent = t("empty.otherOs", { n: other, os: osName(state.os) });
        $("#btnShowAllOs").textContent = t("empty.showAll");
      }
    }
    $("#listMeta").innerHTML = state.query
      ? `<span class="text-bone">${list.length}</span> ${esc(t(list.length === 1 ? "meta.result" : "meta.results"))} «${esc(state.query)}»`
      : `<span class="text-bone">${list.length}</span> ${esc(t("meta.entries"))}`;
  }

  // ------------------------------------------------------------ Render: ficha
  const copyBtn = (id, field, label) => `
    <button type="button" data-copy="${id}" data-field="${field}" class="shrink-0 font-mono text-[10px] uppercase tracking-widest text-bone-mute hover:text-amber transition flex items-center gap-1.5">
      ${ICON_COPY}<span>${esc(label)}</span></button>`;

  const sectionTitle = (n, title, extra = "") =>
    `<div class="flex items-center gap-3 mb-3"><span class="font-mono text-[10px] text-amber" aria-hidden="true">${n}</span>
     <h3 class="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-dim">${esc(title)}</h3>
     <span class="flex-1 h-px bg-paper-line" aria-hidden="true"></span>${extra}</div>`;

  function renderDetail() {
    const box = $("#detail");
    const c = cmdById[state.selected];
    if (!c) {
      box.innerHTML = `<div class="h-full grid place-items-center p-10 text-center">
        <div><p class="font-serif text-6xl text-amber" aria-hidden="true">§</p><p class="font-serif text-3xl italic text-bone-dim mt-3">${esc(t("detail.emptyTitle"))}</p>
        <p class="text-sm text-bone-mute mt-2">${esc(t("detail.emptyText"))}</p></div></div>`;
      return;
    }
    const cat = catById[c.category], r = RISK[c.risk], o = OS_STYLE[c.os];
    const related = commands.filter((x) => x.category === c.category && x.id !== c.id && (state.os === "all" || x.os === state.os)).slice(0, 5);
    const varsOn = applyVars(c.example.command) !== c.example.command;

    box.innerHTML = `<article class="fade-in" aria-labelledby="detailTitle">
      <div class="sticky top-0 z-10 flex items-center gap-3 px-5 sm:px-8 py-3 bg-paper-2/95 backdrop-blur border-b border-paper-line">
        <button type="button" id="btnBack" class="lg:hidden -ml-1 p-1 text-bone-dim hover:text-bone rounded" aria-label="${esc(t("detail.back"))}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/></svg>
        </button>
        <p class="font-mono text-[11px] text-bone-mute truncate">
          <span class="${o.text}">${esc(osName(c.os))}</span> / <button type="button" data-cat="${cat.id}" class="hover:text-bone">§${catNum[cat.id]} ${esc(catLabel(cat))}</button>
        </p>
        <span class="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${r.text}">
          <span class="w-2 h-2 rounded-full ${r.dot}" aria-hidden="true"></span>${esc(riskLabel(c.risk))}</span>
      </div>

      <div class="px-5 sm:px-8 py-7">
        <p class="font-mono text-[11px] text-bone-mute mb-2">${SHELL[c.shell]}</p>
        <div class="flex items-start justify-between gap-4">
          <h2 id="detailTitle" class="font-mono text-3xl sm:text-4xl font-semibold text-bone break-words">${esc(cName(c))}</h2>
          <div class="pt-2 flex items-center gap-3">${tryBtn(c)}${favBtn(c, "lg")}${copyBtn(c.id, "name", t("copy"))}</div>
        </div>
        <p class="font-serif text-2xl sm:text-[1.7rem] leading-snug text-bone-dim mt-4">${hl(cDesc(c))}</p>

        ${c.risk === "danger" ? `
        <div class="mt-6 rounded-xl overflow-hidden border border-blood/50" role="note">
          <div class="hazard h-2" aria-hidden="true"></div>
          <div class="bg-blood-soft px-4 py-3 flex gap-3">
            <span class="font-mono text-blood text-lg leading-none mt-0.5" aria-hidden="true">!</span>
            <p class="text-sm text-bone"><strong class="text-blood font-semibold">${esc(t("danger.title"))}</strong> ${esc(t("danger.text"))}</p>
          </div>
        </div>` : c.risk === "caution" ? `
        <p class="mt-6 text-sm text-bone-dim border-l-2 border-amber pl-3" role="note"><span class="text-amber font-medium">${esc(t("caution.title"))}</span> ${esc(t("caution.text"))}</p>` : ""}

        ${c.requires ? `
        <div class="mt-6 flex gap-3 rounded-lg border border-sky/30 bg-sky-soft px-4 py-3">
          <span class="font-mono text-[10px] uppercase tracking-widest text-sky pt-0.5 shrink-0">${esc(t("detail.requires"))}</span>
          <p class="text-sm text-bone">${hl(cReq(c))}</p>
        </div>` : ""}

        <section class="mt-9">
          ${sectionTitle("01", t("detail.syntax"), copyBtn(c.id, "syntax", t("copy")))}
          <pre class="overflow-x-auto thin-scroll font-mono text-[13px] leading-relaxed bg-paper rounded-lg border border-paper-line px-4 py-3" tabindex="0"><code>${code(c.syntax, c.shell)}</code></pre>
        </section>

        ${c.flags?.length ? `
        <section class="mt-9">
          ${sectionTitle("02", t("detail.flags"))}
          <dl class="divide-y divide-paper-line">
            ${c.flags.map((f, i) => `<div class="grid sm:grid-cols-[minmax(0,15rem)_1fr] gap-x-6 gap-y-1 py-2.5">
              <dt class="font-mono text-[13px] text-sky break-words">${esc(f.flag)}</dt>
              <dd class="text-sm text-bone-dim">${hl(cFlag(c, i))}</dd></div>`).join("")}
          </dl>
        </section>` : ""}

        <section class="mt-9">
          ${sectionTitle("03", t("detail.example"), copyBtn(c.id, "example", t("copy.example")))}
          <div class="rounded-xl bg-[#0d0c0a] border ${c.risk === "danger" ? "border-blood/40" : "border-paper-line"} overflow-hidden">
            <div class="flex items-center justify-between gap-3 px-4 py-2 border-b border-paper-line font-mono text-[11px] text-bone-mute">
              <span aria-hidden="true">${esc(PROMPT[c.shell])}</span>
              <button type="button" data-open-vars class="${varsOn ? "text-amber hover:underline" : "hover:text-amber"}">${esc(varsOn ? t("vars.applied") : t("vars.customize"))}</button>
            </div>
            <pre class="px-4 py-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words" tabindex="0"><code>${exampleHtml(c)}</code></pre>
          </div>
          <p class="mt-4 font-serif text-xl italic leading-snug text-bone">“${hl(cExpl(c))}”</p>
        </section>

        <section class="mt-9">
          ${sectionTitle("04", t("detail.tags"))}
          <div class="flex flex-wrap gap-2">
            ${(c.tags || []).map((tag) => `<button type="button" data-tag="${esc(tag)}" class="font-mono text-xs px-2.5 py-1 rounded-full border border-paper-line2 text-bone-dim hover:border-amber hover:text-amber transition" lang="es">${hl(tag)}</button>`).join("")}
          </div>
        </section>

        ${related.length ? `
        <section class="mt-9 pb-4">
          ${sectionTitle("→", t("detail.related"))}
          <div class="grid sm:grid-cols-2 gap-2">
            ${related.map((x) => `<button type="button" data-id="${x.id}" class="text-left rounded-lg border border-paper-line hover:border-paper-line2 hover:bg-paper-3 px-3 py-2.5 transition">
              <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full ${RISK[x.risk].dot}" aria-hidden="true"></span><code class="font-mono text-sm text-bone">${esc(cName(x))}</code>
              <span class="ml-auto font-mono text-[10px] ${OS_STYLE[x.os].text}" aria-hidden="true">${OS_STYLE[x.os].letter}</span></span>
              <span class="block text-xs text-bone-mute mt-1 line-clamp-1">${esc(cDesc(x))}</span></button>`).join("")}
          </div>
        </section>` : ""}
      </div>
    </article>`;
    box.scrollTop = 0;
  }

  // ------------------------------------------------------------ Orquestación
  function ensureSelection() {
    if (!mqDesktop.matches) return;
    if (!state.visible.some((c) => c.id === state.selected)) state.selected = state.visible[0]?.id || null;
  }

  function render() {
    renderHeader();
    renderList();
    ensureSelection();
    renderList(); // repinta la fila seleccionada
    renderDetail();
  }

  const detailWrap = $("#detailWrap");
  let lastFocus = null;
  function openSheet() {
    if (mqDesktop.matches) return;
    lastFocus = document.activeElement;
    detailWrap.classList.remove("translate-y-full");
    document.body.classList.add("sheet-open");
    $("#btnBack")?.focus({ preventScroll: true });
  }
  function closeSheet() {
    const wasOpen = document.body.classList.contains("sheet-open");
    detailWrap.classList.add("translate-y-full");
    document.body.classList.remove("sheet-open");
    if (wasOpen && lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  }

  function select(id, { open = true, scroll = false } = {}) {
    state.selected = id;
    history.replaceState(null, "", id ? `#${id}` : location.pathname + location.search);
    document.querySelectorAll("#list .row").forEach((el) => {
      const on = el.dataset.id === id;
      el.setAttribute("aria-current", on);
      el.querySelector(".row-main")?.setAttribute("aria-current", on);
      el.querySelector("code")?.classList.toggle("text-amber", on);
      el.querySelector("code")?.classList.toggle("text-bone", !on);
      if (on && scroll) el.scrollIntoView({ block: "nearest" });
    });
    renderDetail();
    if (open) openSheet();
  }

  // ------------------------------------------------------------ Portapapeles y avisos
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
  }
  let toastT;
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg;
    el.classList.remove("opacity-0", "translate-y-2");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.add("opacity-0", "translate-y-2"), 1800);
  }

  // ------------------------------------------------------------ Exportar / imprimir
  function printList() {
    const list = state.visible;
    if (!list.length) return toast(t("print.empty"));
    const scope = SPECIAL.includes(state.category) ? t(`cat.${state.category}`)
      : state.category === "all" ? t("cat.all") : catLabel(catById[state.category]);
    const extra = [state.os !== "all" ? osName(state.os) : "", state.query ? `«${state.query}»` : ""].filter(Boolean).join(" · ");
    const date = new Date().toLocaleDateString(lang === "en" ? "en-GB" : "es-ES", { day: "numeric", month: "long", year: "numeric" });
    $("#printArea").innerHTML = `
      <header class="p-head">
        <h1>Sys<em>admin</em> — ${esc(scope)}${extra ? ` <small>(${esc(extra)})</small>` : ""}</h1>
        <p>${esc(t("print.meta", { n: list.length, date }))}${activeVars().length ? " · " + esc(t("print.vars")) : ""}</p>
      </header>
      ${list.map((c) => `
        <article class="p-cmd">
          <h2>${esc(cName(c))} <span class="p-tag">${esc(osName(c.os))} · ${SHELL[c.shell]}</span> <span class="p-risk p-${c.risk}">${esc(riskLabel(c.risk))}</span></h2>
          <p>${esc(cDesc(c))}</p>
          ${c.requires ? `<p class="p-req"><b>${esc(t("detail.requires"))}:</b> ${esc(cReq(c))}</p>` : ""}
          <pre>${esc(c.syntax)}</pre>
          <table>${c.flags.map((f, i) => `<tr><td><code>${esc(f.flag)}</code></td><td>${esc(cFlag(c, i))}</td></tr>`).join("")}</table>
          <p class="p-label">${esc(t("detail.example"))}</p>
          <pre>${esc(applyVars(c.example.command))}</pre>
          <p class="p-expl">${esc(cExpl(c))}</p>
        </article>`).join("")}
      <footer class="p-foot">${esc(location.origin + location.pathname)}</footer>`;
    window.print();
  }

  // ------------------------------------------------------------ Modo práctica
  const quiz = { score: 0, total: 0, streak: 0, best: store.get("mc.quizBest", 0), current: null, options: [], answered: false };
  // ------------------------------------------------------------ Terminal simulada
  const termDialog = $("#termDialog");
  /** libraryId → órdenes que se pueden probar en la terminal (assets/terminal-data.js). */
  const TRY = window.SysTerminal ? window.SysTerminal.examples() : {};

  /** Orden de prueba para una ficha: la del comando simulado cuyo nombre aparece en la ficha. */
  function tryLineFor(c) {
    const list = TRY[c.id];
    if (!list) return null;
    const words = c.name.toLowerCase().split(/[\s/(),]+/);
    return (list.find((x) => words.includes(x.name)) || list[0]).line;
  }
  function tryBtn(c) {
    const line = tryLineFor(c);
    if (!line) return "";
    return `<button type="button" data-try="${esc(line)}" title="${esc(t("term.try.title", { cmd: line }))}"
      class="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-amber/50 text-amber font-mono text-[10px] uppercase tracking-widest hover:bg-amber hover:text-paper transition">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12-7.5z"/></svg>${esc(t("term.try"))}</button>`;
  }

  function openTerminal(line) {
    if (!window.SysTerminal) return;
    if (!termDialog.open) termDialog.showModal();
    const term = window.SysTerminal.mount(termDialog.querySelector("[data-terminal]"));
    if (!term) return;
    if (line) term.run(line); else term.focus();
  }
  // Un enlace «Abrir la ficha» dentro de la terminal cierra el panel (el cambio de #hash abre la ficha).
  termDialog.addEventListener("click", (e) => {
    if (e.target === termDialog) return termDialog.close();
    const a = e.target.closest("a[data-library-link]");
    if (a) {
      termDialog.close();
      if (location.hash === a.getAttribute("href")) goTo(a.dataset.libraryLink);
    }
  });

  const quizDialog = $("#quizDialog");

  /** Palabras del nombre que identifican el comando (deben aparecer en el ejemplo). */
  function baseTokens(c) {
    const ex = c.example.command.toLowerCase();
    return [...new Set(c.name.split(/\s*\/\s*|,\s*/)
      .map((p) => p.replace(/\(.*?\)/g, "").trim().split(/\s+/)[0])
      .filter((w) => w && /^[\w.\-]+$/.test(w) && w.length > 1 && ex.includes(w.toLowerCase())))];
  }
  function quizPool() {
    let pool = commands.filter((c) => (state.os === "all" || c.os === state.os) && state.risks.has(c.risk) && baseTokens(c).length);
    if (!SPECIAL.includes(state.category) && state.category !== "all") {
      const inCat = pool.filter((c) => c.category === state.category);
      if (inCat.length >= 4) pool = inCat;
    } else if (state.category === "fav") {
      const f = pool.filter((c) => favs.has(c.id));
      if (f.length >= 4) pool = f;
    }
    return pool;
  }
  function quizScopeLabel() {
    const parts = [];
    if (!SPECIAL.includes(state.category) && state.category !== "all") parts.push(catLabel(catById[state.category]));
    else if (state.category === "fav") parts.push(t("cat.fav"));
    parts.push(state.os === "all" ? t("quiz.allSystems") : osName(state.os));
    return parts.join(" · ");
  }
  function maskName(text, c) {
    let s = text;
    baseTokens(c).forEach((w) => { s = s.replace(new RegExp(`(^|[^\\w-])${reEsc(w)}(?=$|[^\\w-])`, "gi"), "$1▢▢▢"); });
    return s;
  }
  function nextQuestion() {
    const pool = quizPool();
    if (pool.length < 4) { $("#quizBody").innerHTML = `<p class="text-bone-dim">${esc(t("quiz.notEnough"))}</p>`; return; }
    let c;
    do { c = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && c.id === quiz.current?.id);
    const label = (x) => shortName(x);
    const taken = new Set([norm(label(c))]);
    const pick = (cands) => shuffle(cands).filter((x) => { const k = norm(label(x)); if (taken.has(k)) return false; taken.add(k); return true; });
    let distractors = pick(commands.filter((x) => x.id !== c.id && x.category === c.category && x.os === c.os));
    if (distractors.length < 3) distractors = distractors.concat(pick(commands.filter((x) => x.id !== c.id && x.os === c.os)));
    quiz.current = c;
    quiz.options = shuffle([c, ...distractors.slice(0, 3)]);
    quiz.answered = false;
    renderQuiz();
  }
  /** animate: solo al responder (no al repintar por un cambio de idioma). */
  function renderQuiz(chosenId = null, animate = false) {
    const fx = (cls) => (animate ? ` ${cls}` : "");
    const c = quiz.current;
    $("#quizScope").textContent = quizScopeLabel();
    $("#quizScore").textContent = t("quiz.score", { ok: quiz.score, total: quiz.total, streak: quiz.streak, best: quiz.best });
    $("#quizBody").innerHTML = `
      <p class="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">${esc(t("quiz.question"))} · ${esc(osName(c.os))} · ${esc(catLabel(catById[c.category]))}</p>
      <p class="font-serif text-2xl leading-snug text-bone mt-2">${esc(maskName(cDesc(c), c))}</p>
      <div class="grid sm:grid-cols-2 gap-2 mt-5" role="group" aria-label="${esc(t("quiz.options"))}">
        ${quiz.options.map((o, i) => {
          let cls = "border-paper-line2 hover:border-amber hover:text-amber";
          if (quiz.answered) cls = o.id === c.id ? "border-sage text-sage bg-sage/10" + fx("quiz-hit") : o.id === chosenId ? "border-blood text-blood bg-blood-soft" + fx("quiz-miss") : "border-paper-line text-bone-mute opacity-70";
          return `<button type="button" data-answer="${o.id}" ${quiz.answered ? "disabled" : ""} class="flex items-center gap-3 text-left rounded-lg border px-4 py-3 font-mono text-sm transition ${cls}">
            <span class="grid place-items-center w-6 h-6 rounded border border-current text-[11px] shrink-0" aria-hidden="true">${i + 1}</span><span>${esc(shortName(o))}</span></button>`;
        }).join("")}
      </div>
      <div id="quizFeedback" class="mt-5${quiz.answered ? fx("quiz-reveal") : ""}" aria-live="polite">${quiz.answered ? `
        <p class="font-mono text-sm ${chosenId === c.id ? "text-sage" : "text-blood"}">${esc(chosenId === c.id ? t("quiz.correct") : t("quiz.wrong", { name: shortName(c) }))}</p>
        <pre class="mt-3 px-4 py-3 rounded-lg bg-[#0d0c0a] border border-paper-line font-mono text-[13px] whitespace-pre-wrap break-words"><code>${exampleHtml(c)}</code></pre>
        <p class="mt-2 text-sm text-bone-dim">${esc(cExpl(c))}</p>
        <button type="button" data-quiz-open="${c.id}" class="mt-2 font-mono text-[11px] uppercase tracking-widest text-amber hover:underline">${esc(t("quiz.openCard"))}</button>` : ""}
      </div>`;
    $("#quizNext").textContent = quiz.answered ? t("quiz.next") : t("quiz.skip");
    if (quiz.answered) $("#quizNext").focus();
  }
  function answer(id) {
    if (quiz.answered) return;
    quiz.answered = true;
    quiz.total++;
    if (id === quiz.current.id) { quiz.score++; quiz.streak++; if (quiz.streak > quiz.best) { quiz.best = quiz.streak; store.set("mc.quizBest", quiz.best); } }
    else quiz.streak = 0;
    renderQuiz(id, true);
  }
  function openQuiz() {
    quizDialog.showModal();
    nextQuestion();
  }
  quizDialog.addEventListener("click", (e) => {
    if (e.target === quizDialog) return quizDialog.close();
    const a = e.target.closest("[data-answer]");
    if (a) return answer(a.dataset.answer);
    const o = e.target.closest("[data-quiz-open]");
    if (o) { quizDialog.close(); goTo(o.dataset.quizOpen); }
  });
  $("#quizNext").addEventListener("click", () => nextQuestion());
  quizDialog.addEventListener("keydown", (e) => {
    if (/^[1-4]$/.test(e.key) && !quiz.answered) { const o = quiz.options[+e.key - 1]; if (o) { e.preventDefault(); answer(o.id); } }
  });

  /** Abre la ficha de un comando aunque esté oculto por los filtros. */
  function goTo(id) {
    if (!cmdById[id]) return;
    if (!filter().some((c) => c.id === id)) {
      state.category = "all"; state.query = ""; $("#search").value = ""; state.risks = new Set(Object.keys(RISK));
      if (state.os !== "all" && cmdById[id].os !== state.os) state.os = "all";
      state.selected = id; render();
    }
    select(id, { scroll: true });
  }

  // ------------------------------------------------------------ Idioma: textos estáticos
  function applyStaticI18n() {
    document.documentElement.lang = lang;
    document.title = t("meta.title");
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => { const [attr, key] = pair.split(":"); el.setAttribute(attr, t(key)); });
    });
    $("#btnLang").textContent = lang === "es" ? "EN" : "ES";
    $("#btnLang").setAttribute("aria-label", t("lang.switch"));
    $("#btnLang").setAttribute("lang", lang === "es" ? "en" : "es");
  }
  function setLang(l) {
    lang = l;
    store.set("mc.lang", l);
    buildIndex();
    applyStaticI18n();
    render();
    if (quizDialog.open && quiz.current) renderQuiz();
    if (varsDialog.open) renderVarsForm();
  }

  // ------------------------------------------------------------ Eventos
  const setOs = (os) => { state.os = os; store.set("mc.os", os); render(); };

  document.addEventListener("click", async (e) => {
    if (e.target.closest("#btnBack")) return closeSheet();
    if (e.target.closest("#btnVars, [data-open-vars]")) return openVars();
    if (e.target.closest("#btnQuiz")) return openQuiz();
    if (e.target.closest("#btnTerm")) return openTerminal();
    const tryEl = e.target.closest("[data-try]");
    if (tryEl) return openTerminal(tryEl.dataset.try);
    if (e.target.closest("#btnPrint")) return printList();
    if (e.target.closest("#btnLang")) return setLang(lang === "es" ? "en" : "es");
    if (e.target.closest("#btnShowAllOs")) return setOs("all");
    if (e.target.closest("dialog")) return; // los diálogos gestionan sus propios clics
    const el = e.target.closest("[data-fav],[data-os],[data-cat],[data-risk],[data-copy],[data-tag],[data-id]");
    if (!el) return;
    const d = el.dataset;

    if (d.fav) return toggleFav(d.fav);
    if (d.copy) {
      const c = cmdById[d.copy];
      // El nombre puede llevar una aclaración entre paréntesis («nc (transferir archivos)»): se copia solo el comando.
      await copy(d.field === "example" ? applyVars(c.example.command) : d.field === "syntax" ? c.syntax : c.name.replace(/\s*\(.*\)\s*$/, ""));
      pushRecent(c.id);
      const span = el.querySelector("span"), prev = span.textContent;
      span.textContent = t("copied"); el.classList.add("!text-amber");
      setTimeout(() => { span.textContent = prev; el.classList.remove("!text-amber"); }, 1200);
      if (state.category !== "recent") renderHeader();
      return toast(c.risk === "danger" ? t("toast.copiedDanger") : t("toast.copied"));
    }
    if (d.os) return setOs(d.os);
    if (d.cat) { state.category = d.cat; closeSheet(); render(); return window.scrollTo({ top: 0, behavior: reducedMotion() ? "instant" : "smooth" }); }
    if (d.risk) {
      state.risks.has(d.risk) ? state.risks.delete(d.risk) : state.risks.add(d.risk);
      if (!state.risks.size) state.risks = new Set(Object.keys(RISK));
      return render();
    }
    if (d.tag) { state.query = d.tag; $("#search").value = d.tag; state.category = "all"; closeSheet(); render(); return window.scrollTo({ top: 0, behavior: reducedMotion() ? "instant" : "smooth" }); }
    if (d.id) return select(d.id, { scroll: true });
  });

  let deb;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(deb);
    deb = setTimeout(() => { state.query = e.target.value.trim(); if (state.query && !SPECIAL.includes(state.category)) state.category = "all"; render(); }, 60);
  });

  document.addEventListener("keydown", (e) => {
    if (document.querySelector("dialog[open]")) return; // los diálogos gestionan su teclado (Esc los cierra)
    const search = $("#search");
    const inInput = document.activeElement === search;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); closeSheet(); search.focus(); search.select(); return; }
    if (e.key === "/" && !inInput) { e.preventDefault(); search.focus(); return; }
    if (e.key === "Escape") {
      if (document.body.classList.contains("sheet-open")) return closeSheet();
      if (search.value) { search.value = ""; state.query = ""; render(); }
      search.blur(); return;
    }
    if (e.altKey && ["1", "2", "3", "4"].includes(e.key)) { e.preventDefault(); return setOs(OS_IDS[+e.key - 1]); }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!state.visible.length || (document.activeElement && document.activeElement.closest("#catRail, #osSwitch"))) return;
      e.preventDefault();
      const i = state.visible.findIndex((c) => c.id === state.selected);
      const next = e.key === "ArrowDown" ? Math.min(i + 1, state.visible.length - 1) : Math.max(i - 1, 0);
      const id = state.visible[i === -1 ? 0 : next].id;
      select(id, { open: false, scroll: true });
      if (!inInput) document.querySelector(`#list .row[data-id="${id}"] .row-main`)?.focus({ preventScroll: true });
      return;
    }
  });

  // Panel de variables
  const varsDialog = $("#varsDialog");
  function openVars() {
    renderVarsForm();
    varsDialog.showModal();
    varsDialog.querySelector("input")?.focus();
  }
  $("#varsFields").addEventListener("input", (e) => {
    const key = e.target.dataset.var;
    if (!key) return;
    userVars[key] = e.target.value;
    if (!e.target.value.trim()) delete userVars[key];
    saveVars();
  });
  $("#varsReset").addEventListener("click", () => {
    userVars = {};
    saveVars();
    renderVarsForm();
    toast(t("toast.varsReset"));
  });
  varsDialog.addEventListener("click", (e) => { if (e.target === varsDialog) varsDialog.close(); });

  $("#btnReset").addEventListener("click", () => {
    state.category = "all"; state.query = ""; state.risks = new Set(Object.keys(RISK)); $("#search").value = ""; render();
  });
  mqDesktop.addEventListener("change", () => { closeSheet(); render(); });
  window.addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!cmdById[id] || id === state.selected) return;
    goTo(id);
  });

  // Modo sin conexión (PWA). Solo por http/https: abriendo el archivo directamente no aplica.
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    const firstInstall = !navigator.serviceWorker.controller;
    navigator.serviceWorker.register("./sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        sw?.addEventListener("statechange", () => {
          if (sw.state === "activated" && firstInstall) toast(t("toast.offline"));
        });
      });
    }).catch(() => { /* sin service worker la web sigue funcionando online */ });
  }

  // ------------------------------------------------------------ Título que se descifra
  /** Efecto de descifrado del título: cada letra muestra glifos aleatorios y se fija
   *  en su valor real de izquierda a derecha. El <h1> conserva aria-label="Sysadmin",
   *  así que los lectores de pantalla nunca leen los glifos intermedios. */
  function decryptBrand() {
    const h1 = $("#brand");
    if (!h1 || reducedMotion() || typeof requestAnimationFrame !== "function") return;
    const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#$%&/<>_";
    const original = h1.innerHTML;
    const chars = [];
    // Sustituye cada nodo de texto («Sys» y el «admin» del <em>) por una letra por span.
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      for (const ch of node.nodeValue.trim()) {
        const s = document.createElement("span");
        s.className = "decrypt-ch";
        s.setAttribute("aria-hidden", "true");
        s.textContent = ch;
        frag.appendChild(s);
        chars.push({ el: s, final: ch });
      }
      node.replaceWith(frag);
    });
    // Fija el ancho de cada letra con su glifo final (tras cargar la fuente) para evitar saltos.
    // Las fuentes son locales y se precargan, así que la espera es mínima.
    const start = () => {
      chars.forEach((c) => { c.el.style.width = c.el.getBoundingClientRect().width + "px"; });
      const t0 = performance.now(), STEP = 70, SPIN = 380, TICK = 45;
      let last = 0;
      const frame = (now) => {
        const elapsed = now - t0;
        const tick = now - last >= TICK;
        if (tick) last = now;
        let done = true;
        chars.forEach((c, i) => {
          if (elapsed >= SPIN + i * STEP) {
            if (c.el.textContent !== c.final) { c.el.textContent = c.final; c.el.classList.remove("is-scrambling"); }
          } else {
            done = false;
            if (tick) { c.el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; c.el.classList.add("is-scrambling"); }
          }
        });
        if (!done) requestAnimationFrame(frame);
        else h1.innerHTML = original; // deja el marcado original, con su kerning
      };
      requestAnimationFrame(frame);
    };
    (document.fonts?.ready || Promise.resolve()).then(start, start);
  }

  // ------------------------------------------------------------ Arranque
  decryptBrand();
  buildIndex();
  applyStaticI18n();
  renderVarsBadge();
  render();
  if (state.selected && cmdById[state.selected] && location.hash) select(state.selected, { scroll: true, open: false });
})();
