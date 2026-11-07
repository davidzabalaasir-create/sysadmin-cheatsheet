/* =========================================================================
 * Sysadmin — lógica (JavaScript vanilla)
 * Diseño maestro-detalle: índice de comandos a la izquierda y ficha completa
 * a la derecha (en móvil, la ficha se abre como hoja a pantalla completa).
 * ========================================================================= */
(() => {
  "use strict";

  const { categories, commands } = window.CHEATSHEET;
  const $ = (s) => document.querySelector(s);
  const mqDesktop = window.matchMedia("(min-width: 1024px)");

  // ------------------------------------------------------------ Config
  const OS = [
    { id: "all",     label: "Todo" },
    { id: "linux",   label: "Linux" },
    { id: "windows", label: "Windows" }
  ];
  const OS_STYLE = {
    linux:   { letter: "L", ring: "border-amber/60 text-amber", name: "Linux" },
    windows: { letter: "W", ring: "border-sky/60 text-sky",     name: "Windows" }
  };
  /* Logos del selector de sistema (SVG en línea, usan currentColor). */
  const OS_LOGO = {
    // Terminal genérico para «Todo»
    all: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15H17"/></svg>`,
    // Tux simplificado: barriga, ojos y pico recortados en hueco
    linux: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M12 2.5c-2.6 0-4.3 2.1-4.3 5 0 1.2.2 2.1-.4 3.3C6 13 4.8 15 4.8 17.3c0 2.6 3.2 4.2 7.2 4.2s7.2-1.6 7.2-4.2c0-2.3-1.2-4.3-2.5-6.5-.6-1.2-.4-2.1-.4-3.3 0-2.9-1.7-5-4.3-5z
        M8.3 15.8a3.7 4.4 0 1 0 7.4 0a3.7 4.4 0 1 0-7.4 0z
        M9.5 7.2a1 1 0 1 0 2 0a1 1 0 1 0-2 0z M12.5 7.2a1 1 0 1 0 2 0a1 1 0 1 0-2 0z
        M10.6 9.6a1.4 .75 0 1 0 2.8 0a1.4 .75 0 1 0-2.8 0z"/>
      <ellipse cx="7.9" cy="21" rx="2.7" ry="1.25"/><ellipse cx="16.1" cy="21" rx="2.7" ry="1.25"/></svg>`,
    // Ventana de cuatro paneles
    windows: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.6l7.4-1v6.9H3zM11.4 4.4L21 3v8.5h-9.6zM3 12.5h7.4v6.9L3 18.4zM11.4 12.5H21V21l-9.6-1.4z"/></svg>`
  };
  const OS_LOGO_COLOR = { all: "text-bone-dim", linux: "text-amber", windows: "text-sky" };

  const SHELL = { bash: "bash", powershell: "PowerShell", cmd: "CMD" };
  const RISK = {
    safe:    { label: "Seguro",     text: "text-sage",  dot: "bg-sage",  border: "border-sage/40" },
    caution: { label: "Precaución", text: "text-amber", dot: "bg-amber", border: "border-amber/50" },
    danger:  { label: "Peligroso",  text: "text-blood", dot: "bg-blood", border: "border-blood/60" }
  };

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const catNum = Object.fromEntries(categories.map((c, i) => [c.id, String(i + 1).padStart(2, "0")]));
  const cmdById = Object.fromEntries(commands.map((c) => [c.id, c]));

  // ------------------------------------------------------------ Estado
  const state = {
    os: localStorage.getItem("mc.os") || "all",
    category: "all",
    risks: new Set(Object.keys(RISK)),
    query: "",
    selected: decodeURIComponent(location.hash.slice(1)) || null,
    visible: []
  };

  // ------------------------------------------------------------ Utils
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const terms = () => norm(state.query).split(/\s+/).filter(Boolean);

  /** Subraya los términos buscados en texto plano. */
  function hl(text) {
    const plain = String(text), n = norm(plain), ts = terms();
    if (!ts.length || n.length !== plain.length) return esc(plain);
    const ranges = [];
    ts.forEach((t) => { for (let i = n.indexOf(t); i !== -1; i = n.indexOf(t, i + t.length)) ranges.push([i, i + t.length]); });
    if (!ranges.length) return esc(plain);
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    ranges.forEach((r) => { const l = merged.at(-1); l && r[0] <= l[1] ? (l[1] = Math.max(l[1], r[1])) : merged.push([...r]); });
    let out = "", p = 0;
    merged.forEach(([a, b]) => { out += esc(plain.slice(p, a)) + "<mark>" + esc(plain.slice(a, b)) + "</mark>"; p = b; });
    return out + esc(plain.slice(p));
  }

  /** Resaltado de sintaxis ligero para bash / PowerShell / CMD. */
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
        if (word.startsWith("#") && shell !== "cmd") {
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

  // ------------------------------------------------------------ Búsqueda
  const index = commands.map((c) => ({
    c,
    name: norm(c.name),
    tags: (c.tags || []).map(norm),
    hay: norm([
      c.name, c.description, c.syntax, SHELL[c.shell], c.os, catById[c.category].label, catById[c.category].labelEn,
      (c.tags || []).join(" "), (c.flags || []).map((f) => `${f.flag} ${f.description}`).join(" "),
      c.example.command, c.example.explanation, RISK[c.risk].label, c.requires || ""
    ].join(" "))
  }));

  function score(e, ts) {
    let s = 0;
    for (const t of ts) {
      if (!e.hay.includes(t)) return -1;
      s += e.name === t ? 100 : e.name.startsWith(t) ? 50 : e.name.includes(t) ? 25 : e.tags.some((x) => x.includes(t)) ? 10 : 1;
    }
    return s;
  }

  function filter({ ignoreCategory = false } = {}) {
    const ts = terms(), out = [];
    for (const e of index) {
      const c = e.c;
      if (state.os !== "all" && c.os !== state.os) continue;
      if (!ignoreCategory && state.category !== "all" && c.category !== state.category) continue;
      if (!state.risks.has(c.risk)) continue;
      const s = ts.length ? score(e, ts) : 0;
      if (s >= 0) out.push({ c, s });
    }
    out.sort((a, b) => b.s - a.s || catNum[a.c.category].localeCompare(catNum[b.c.category]) || a.c.os.localeCompare(b.c.os) || a.c.name.localeCompare(b.c.name));
    return out.map((x) => x.c);
  }

  // ------------------------------------------------------------ Render: cabecera
  function renderHeader() {
    $("#osSwitch").innerHTML = OS.map((o) => {
      const on = state.os === o.id;
      const n = o.id === "all" ? commands.length : commands.filter((c) => c.os === o.id).length;
      return `<button role="tab" aria-selected="${on}" data-os="${o.id}"
        class="flex items-center gap-2 px-4 py-1.5 rounded-full transition ${on ? "bg-bone text-paper" : "text-bone-dim hover:text-bone"}">
        <span class="${on ? "" : OS_LOGO_COLOR[o.id]}">${OS_LOGO[o.id]}</span>
        ${o.label} <span class="${on ? "text-paper/60" : "text-bone-mute"}">${n}</span></button>`;
    }).join("");

    const pool = filter({ ignoreCategory: true });
    const counts = pool.reduce((a, c) => ((a[c.category] = (a[c.category] || 0) + 1), a), {});
    const cats = categories.filter((c) => state.os === "all" || c.os.includes(state.os));
    if (state.category !== "all" && !cats.some((c) => c.id === state.category)) state.category = "all";

    const tab = (id, num, label, n, winOnly = false) => {
      const on = state.category === id;
      return `<button data-cat="${id}" class="group shrink-0 flex items-baseline gap-2 px-3 py-3.5 border-b-2 transition whitespace-nowrap
        ${on ? "border-amber text-bone" : "border-transparent text-bone-dim hover:text-bone"} ${n ? "" : "opacity-40"}">
        <span class="font-mono text-[10px] ${on ? "text-amber" : "text-bone-mute"}">${num}</span>
        <span class="text-sm">${label}</span>
        ${winOnly ? `<span class="font-mono text-[9px] text-sky border border-sky/40 rounded px-1">WIN</span>` : ""}
        <span class="font-mono text-[10px] text-bone-mute">${n}</span></button>`;
    };
    $("#catRail").innerHTML = tab("all", "§", "Todo", pool.length) +
      cats.map((c) => tab(c.id, catNum[c.id], c.label, counts[c.id] || 0, c.os.length === 1)).join("");
    // Sin requestAnimationFrame: así funciona aunque la pestaña esté en segundo plano.
    if (lastCenteredCat !== state.category) { centerActiveCat(lastCenteredCat !== null); lastCenteredCat = state.category; }
    updateRailArrows();

    $("#riskToggles").innerHTML = Object.entries(RISK).map(([id, r]) => {
      const on = state.risks.has(id);
      return `<button data-risk="${id}" aria-pressed="${on}" title="${on ? "Ocultar" : "Mostrar"} comandos: ${r.label}"
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-mono text-[10px] uppercase tracking-wider transition
        ${on ? `${r.border} ${r.text}` : "border-paper-line text-bone-mute line-through"}">
        <span class="w-1.5 h-1.5 rounded-full ${on ? r.dot : "bg-bone-mute/40"}"></span><span class="hidden sm:inline">${r.label}</span></button>`;
    }).join("");

    const linux = commands.filter((c) => c.os === "linux").length;
    $("#counter").innerHTML = `
      <p class="font-serif text-5xl leading-none text-bone">${commands.length}</p>
      <p class="font-mono text-[10px] uppercase tracking-widest text-bone-mute mt-1">comandos · ${linux} linux / ${commands.length - linux} windows</p>`;
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
    const tab = rail.querySelector(`[data-cat="${state.category}"]`);
    if (!tab) return;
    const left = tab.offsetLeft - (rail.clientWidth - tab.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: smooth ? "smooth" : "instant" });
  }

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
    return `<div data-id="${c.id}" role="button" tabindex="0" class="row group cursor-pointer w-full text-left grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-3 px-3 py-3 rounded-lg hover:bg-paper-2 transition" aria-current="${sel}">
      <span class="mt-0.5 grid place-items-center w-7 h-7 rounded-full border font-mono text-[11px] ${o.ring}" title="${o.name}">${o.letter}</span>
      <span class="min-w-0">
        <span class="flex items-baseline gap-2 flex-wrap">
          <code class="font-mono text-[15px] font-medium ${sel ? "text-amber" : "text-bone"}">${hl(c.name)}</code>
          <span class="font-mono text-[10px] text-bone-mute">${SHELL[c.shell]}</span>
        </span>
        <span class="block text-[13px] text-bone-dim leading-snug mt-0.5 line-clamp-2">${hl(c.description)}</span>
      </span>
      <span class="flex flex-col items-end gap-2">
        <span class="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${r.text}" title="${r.label}">
          ${c.risk === "safe" ? "" : `<span class="hidden sm:inline">${r.label}</span>`}<span class="w-2 h-2 rounded-full ${r.dot}"></span>
        </span>
        <button data-copy="${c.id}" data-field="example" title="Copiar ejemplo: ${esc(c.example.command.split("\n")[0].slice(0, 80))}" aria-label="Copiar ejemplo de ${esc(c.name)}"
          class="flex items-center gap-1 px-2 py-1 rounded-md border border-paper-line2 text-bone-mute font-mono text-[10px] uppercase tracking-wider
                 hover:text-amber hover:border-amber/60 transition lg:opacity-0 lg:group-hover:opacity-100 lg:focus:opacity-100 group-aria-[current=true]:opacity-100">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span>Copiar</span>
        </button>
      </span>
    </div>`;
  }

  function renderList() {
    const list = (state.visible = filter());
    const grouped = !state.query;
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
            <span class="font-serif text-2xl text-bone">${cat.label}</span>
            <span class="ml-auto font-mono text-[10px] text-bone-mute uppercase tracking-wider hidden sm:inline">${cat.labelEn}</span></h2>`;
        }
        html += row(c);
      });
      if (current) html += "</div>";
    } else {
      html = list.map(row).join("");
    }
    $("#list").innerHTML = html;
    $("#empty").classList.toggle("hidden", list.length > 0);
    $("#listMeta").innerHTML = state.query
      ? `<span class="text-bone">${list.length}</span> resultado${list.length === 1 ? "" : "s"} para «${esc(state.query)}»`
      : `<span class="text-bone">${list.length}</span> entradas`;
  }

  // ------------------------------------------------------------ Render: ficha
  const copyBtn = (id, field, label) => `
    <button data-copy="${id}" data-field="${field}" class="shrink-0 font-mono text-[10px] uppercase tracking-widest text-bone-mute hover:text-amber transition flex items-center gap-1.5">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span>${label}</span></button>`;

  const sectionTitle = (n, t, extra = "") =>
    `<div class="flex items-center gap-3 mb-3"><span class="font-mono text-[10px] text-amber">${n}</span>
     <h3 class="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-dim">${t}</h3>
     <span class="flex-1 h-px bg-paper-line"></span>${extra}</div>`;

  function renderDetail() {
    const box = $("#detail");
    const c = cmdById[state.selected];
    if (!c) {
      box.innerHTML = `<div class="h-full grid place-items-center p-10 text-center">
        <div><p class="font-serif text-6xl text-amber">§</p><p class="font-serif text-3xl italic text-bone-dim mt-3">Elige un comando del índice</p>
        <p class="text-sm text-bone-mute mt-2">Su ficha completa aparecerá aquí.</p></div></div>`;
      return;
    }
    const cat = catById[c.category], r = RISK[c.risk], o = OS_STYLE[c.os];
    const related = commands.filter((x) => x.category === c.category && x.id !== c.id && (state.os === "all" || x.os === state.os)).slice(0, 5);
    const prompt = c.os === "linux" ? "root@srv01:~#" : c.shell === "powershell" ? "PS C:\\>" : "C:\\>";

    box.innerHTML = `<article class="fade-in">
      <!-- barra superior -->
      <div class="sticky top-0 z-10 flex items-center gap-3 px-5 sm:px-8 py-3 bg-paper-2/95 backdrop-blur border-b border-paper-line">
        <button id="btnBack" class="lg:hidden -ml-1 p-1 text-bone-dim hover:text-bone" aria-label="Volver al índice">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/></svg>
        </button>
        <p class="font-mono text-[11px] text-bone-mute truncate">
          <span class="${o.ring.split(" ")[1]}">${o.name}</span> / <button data-cat="${cat.id}" class="hover:text-bone">§${catNum[cat.id]} ${cat.label}</button>
        </p>
        <span class="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${r.text}">
          <span class="w-2 h-2 rounded-full ${r.dot}"></span>${r.label}</span>
      </div>

      <div class="px-5 sm:px-8 py-7">
        <p class="font-mono text-[11px] text-bone-mute mb-2">${SHELL[c.shell]}</p>
        <div class="flex items-start justify-between gap-4">
          <h2 class="font-mono text-3xl sm:text-4xl font-semibold text-bone break-words">${esc(c.name)}</h2>
          <div class="pt-3">${copyBtn(c.id, "name", "Copiar")}</div>
        </div>
        <p class="font-serif text-2xl sm:text-[1.7rem] leading-snug text-bone-dim mt-4">${hl(c.description)}</p>

        ${c.risk === "danger" ? `
        <div class="mt-6 rounded-xl overflow-hidden border border-blood/50">
          <div class="hazard h-2"></div>
          <div class="bg-blood-soft px-4 py-3 flex gap-3">
            <span class="font-mono text-blood text-lg leading-none mt-0.5">!</span>
            <p class="text-sm text-bone"><strong class="text-blood font-semibold">Comando destructivo.</strong> Puede borrar datos o cortar el acceso de forma irreversible. Verifica el objetivo, ten copia de seguridad y prueba primero en un entorno de laboratorio.</p>
          </div>
        </div>` : c.risk === "caution" ? `
        <p class="mt-6 text-sm text-bone-dim border-l-2 border-amber pl-3"><span class="text-amber font-medium">Precaución:</span> modifica configuración o estado del sistema. Revisa los parámetros antes de ejecutar.</p>` : ""}

        ${c.requires ? `
        <div class="mt-6 flex gap-3 rounded-lg border border-sky/30 bg-sky-soft px-4 py-3">
          <span class="font-mono text-[10px] uppercase tracking-widest text-sky pt-0.5 shrink-0">Requisitos</span>
          <p class="text-sm text-bone">${hl(c.requires)}</p>
        </div>` : ""}

        <!-- 1. Sintaxis -->
        <section class="mt-9">
          ${sectionTitle("01", "Sintaxis", copyBtn(c.id, "syntax", "Copiar"))}
          <pre class="overflow-x-auto thin-scroll font-mono text-[13px] leading-relaxed bg-paper rounded-lg border border-paper-line px-4 py-3"><code>${code(c.syntax, c.shell)}</code></pre>
        </section>

        <!-- 2. Parámetros -->
        ${c.flags?.length ? `
        <section class="mt-9">
          ${sectionTitle("02", "Parámetros habituales")}
          <dl class="divide-y divide-paper-line">
            ${c.flags.map((f) => `<div class="grid sm:grid-cols-[minmax(0,15rem)_1fr] gap-x-6 gap-y-1 py-2.5">
              <dt class="font-mono text-[13px] text-sky break-words">${esc(f.flag)}</dt>
              <dd class="text-sm text-bone-dim">${hl(f.description)}</dd></div>`).join("")}
          </dl>
        </section>` : ""}

        <!-- 3. Ejemplo -->
        <section class="mt-9">
          ${sectionTitle("03", "En el mundo real", copyBtn(c.id, "example", "Copiar ejemplo"))}
          <div class="rounded-xl bg-[#0d0c0a] border ${c.risk === "danger" ? "border-blood/40" : "border-paper-line"} overflow-hidden">
            <div class="px-4 py-2 border-b border-paper-line font-mono text-[11px] text-bone-mute">${prompt}</div>
            <pre class="px-4 py-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words"><code>${code(c.example.command, c.shell)}</code></pre>
          </div>
          <p class="mt-4 font-serif text-xl italic leading-snug text-bone">“${hl(c.example.explanation)}”</p>
        </section>

        <!-- 4. Etiquetas -->
        <section class="mt-9">
          ${sectionTitle("04", "Palabras clave")}
          <div class="flex flex-wrap gap-2">
            ${(c.tags || []).map((t) => `<button data-tag="${esc(t)}" class="font-mono text-xs px-2.5 py-1 rounded-full border border-paper-line2 text-bone-dim hover:border-amber hover:text-amber transition">${hl(t)}</button>`).join("")}
          </div>
        </section>

        ${related.length ? `
        <section class="mt-9 pb-4">
          ${sectionTitle("→", "Ver también")}
          <div class="grid sm:grid-cols-2 gap-2">
            ${related.map((x) => `<button data-id="${x.id}" class="text-left rounded-lg border border-paper-line hover:border-paper-line2 hover:bg-paper-3 px-3 py-2.5 transition">
              <span class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full ${RISK[x.risk].dot}"></span><code class="font-mono text-sm text-bone">${esc(x.name)}</code>
              <span class="ml-auto font-mono text-[10px] ${OS_STYLE[x.os].ring.split(" ")[1]}">${OS_STYLE[x.os].letter}</span></span>
              <span class="block text-xs text-bone-mute mt-1 line-clamp-1">${esc(x.description)}</span></button>`).join("")}
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
  function openSheet() { if (!mqDesktop.matches) { detailWrap.classList.remove("translate-y-full"); document.body.classList.add("sheet-open"); } }
  function closeSheet() { detailWrap.classList.add("translate-y-full"); document.body.classList.remove("sheet-open"); }

  function select(id, { open = true, scroll = false } = {}) {
    state.selected = id;
    history.replaceState(null, "", id ? `#${id}` : location.pathname);
    document.querySelectorAll("#list .row").forEach((el) => {
      const on = el.dataset.id === id;
      el.setAttribute("aria-current", on);
      el.querySelector("code")?.classList.toggle("text-amber", on);
      el.querySelector("code")?.classList.toggle("text-bone", !on);
      if (on && scroll) el.scrollIntoView({ block: "nearest" });
    });
    renderDetail();
    if (open) openSheet();
  }

  // ------------------------------------------------------------ Portapapeles
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
  }
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg;
    t.classList.remove("opacity-0", "translate-y-2");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("opacity-0", "translate-y-2"), 1700);
  }

  // ------------------------------------------------------------ Eventos
  const setOs = (os) => { state.os = os; localStorage.setItem("mc.os", os); render(); };

  document.addEventListener("click", async (e) => {
    if (e.target.closest("#btnBack")) return closeSheet();
    const el = e.target.closest("[data-os],[data-cat],[data-risk],[data-copy],[data-tag],[data-id]");
    if (!el) return;
    const d = el.dataset;

    if (d.copy) {
      const c = cmdById[d.copy];
      // El nombre puede llevar una aclaración entre paréntesis («nc (transferir archivos)»): se copia solo el comando.
      await copy(d.field === "example" ? c.example.command : d.field === "syntax" ? c.syntax : c.name.replace(/\s*\(.*\)\s*$/, ""));
      const span = el.querySelector("span"), prev = span.textContent;
      span.textContent = "Copiado"; el.classList.add("!text-amber");
      setTimeout(() => { span.textContent = prev; el.classList.remove("!text-amber"); }, 1200);
      return toast(c.risk === "danger" ? "Copiado · comando PELIGROSO, revísalo antes de ejecutar" : "Copiado al portapapeles");
    }
    if (d.os) return setOs(d.os);
    if (d.cat) { state.category = d.cat; closeSheet(); render(); return window.scrollTo({ top: 0, behavior: "smooth" }); }
    if (d.risk) {
      state.risks.has(d.risk) ? state.risks.delete(d.risk) : state.risks.add(d.risk);
      if (!state.risks.size) state.risks = new Set(Object.keys(RISK));
      return render();
    }
    if (d.tag) { state.query = d.tag; $("#search").value = d.tag; state.category = "all"; closeSheet(); render(); return window.scrollTo({ top: 0, behavior: "smooth" }); }
    if (d.id) return select(d.id, { scroll: true });
  });

  let deb;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(deb);
    deb = setTimeout(() => { state.query = e.target.value.trim(); if (state.query) state.category = "all"; render(); }, 60);
  });

  document.addEventListener("keydown", (e) => {
    const search = $("#search");
    const inInput = document.activeElement === search;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); closeSheet(); search.focus(); search.select(); return; }
    if (e.key === "/" && !inInput) { e.preventDefault(); search.focus(); return; }
    if (e.key === "Escape") {
      if (document.body.classList.contains("sheet-open")) return closeSheet();
      if (search.value) { search.value = ""; state.query = ""; render(); }
      search.blur(); return;
    }
    if (e.altKey && ["1", "2", "3"].includes(e.key)) { e.preventDefault(); return setOs(OS[+e.key - 1].id); }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!state.visible.length) return;
      e.preventDefault();
      const i = state.visible.findIndex((c) => c.id === state.selected);
      const next = e.key === "ArrowDown" ? Math.min(i + 1, state.visible.length - 1) : Math.max(i - 1, 0);
      select(state.visible[i === -1 ? 0 : next].id, { open: false, scroll: true });
      return;
    }
    const focusedRow = document.activeElement?.closest?.(".row");
    if ((e.key === "Enter" || e.key === " ") && focusedRow && document.activeElement === focusedRow) { e.preventDefault(); return select(focusedRow.dataset.id); }
    if (e.key === "Enter" && state.selected && !mqDesktop.matches) openSheet();
  });

  $("#btnReset").addEventListener("click", () => {
    state.category = "all"; state.query = ""; state.risks = new Set(Object.keys(RISK)); $("#search").value = ""; render();
  });
  mqDesktop.addEventListener("change", () => { closeSheet(); render(); });
  window.addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!cmdById[id] || id === state.selected) return;
    if (!state.visible.some((c) => c.id === id)) {
      state.category = "all"; state.query = ""; $("#search").value = ""; state.risks = new Set(Object.keys(RISK));
      if (state.os !== "all" && cmdById[id].os !== state.os) state.os = "all";
      state.selected = id; render();
    }
    select(id, { scroll: true });
  });

  // Arranque: si llega un enlace con #comando, se abre su ficha.
  render();
  if (state.selected && cmdById[state.selected] && location.hash) select(state.selected, { scroll: true });
})();
