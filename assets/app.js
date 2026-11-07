/* =========================================================================
 * SysAdmin Cheat Sheet — Lógica de la aplicación (JavaScript vanilla)
 * - Pestañas Linux / Windows / Todos
 * - Sidebar de categorías con contadores
 * - Búsqueda en tiempo real (Ctrl+K / "/"), insensible a acentos
 * - Filtro por nivel de riesgo
 * - Copiar al portapapeles con fallback
 * ========================================================================= */
(() => {
  "use strict";

  const { categories, commands } = window.CHEATSHEET;
  const $ = (sel) => document.querySelector(sel);

  // ---------------------------------------------------------------- Config
  const OS_TABS = [
    { id: "all",     label: "Todos",   icon: "◆" },
    { id: "linux",   label: "Linux",   icon: "🐧" },
    { id: "windows", label: "Windows", icon: "⊞" }
  ];

  const RISK = {
    safe:    { label: "Seguro",     dot: "bg-emerald-400", chip: "text-emerald-300 bg-emerald-400/10 border-emerald-400/30" },
    caution: { label: "Precaución", dot: "bg-amber-400",   chip: "text-amber-300 bg-amber-400/10 border-amber-400/30" },
    danger:  { label: "Peligroso",  dot: "bg-red-500",     chip: "text-red-300 bg-red-500/15 border-red-500/50" }
  };

  const SHELL = {
    bash:       { label: "bash",       cls: "text-neon-green border-neon-green/30" },
    powershell: { label: "PowerShell", cls: "text-neon-cyan border-neon-cyan/30" },
    cmd:        { label: "CMD",        cls: "text-slate-300 border-slate-500/40" }
  };

  const ICONS = {
    all:     '<path d="M4 5h16M4 12h16M4 19h16"/>',
    users:   '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    folder:  '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    network: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4M12 11.5 6.5 17M12 11.5l5.5 5.5"/>',
    cpu:     '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    shield:  '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    clock:   '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    disk:    '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    tree:    '<rect x="9" y="2.5" width="6" height="5" rx="1"/><rect x="2.5" y="16.5" width="6" height="5" rx="1"/><rect x="15.5" y="16.5" width="6" height="5" rx="1"/><path d="M12 7.5V12M5.5 16.5V12h13v4.5"/>'
  };
  const icon = (name, cls = "w-4 h-4") =>
    `<svg class="${cls} shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">${ICONS[name] || ICONS.all}</svg>`;

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const catOrder = Object.fromEntries(categories.map((c, i) => [c.id, i]));

  // ---------------------------------------------------------------- Estado
  const state = {
    os: localStorage.getItem("cs.os") || "all",
    category: "all",
    risks: new Set(["safe", "caution", "danger"]),
    query: ""
  };

  // ---------------------------------------------------------------- Utils
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const normalize = (s) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const queryTerms = () => normalize(state.query).split(/\s+/).filter(Boolean);

  /** Resalta los términos de búsqueda en texto plano (ya escapado). */
  function highlight(text) {
    const safe = escapeHtml(text);
    const terms = queryTerms();
    if (!terms.length) return safe;
    // Construimos un mapa de índices sobre la versión normalizada (misma longitud
    // carácter a carácter para la mayoría de textos en español).
    const plain = String(text);
    const norm = normalize(plain);
    if (norm.length !== plain.length) return safe;
    const ranges = [];
    terms.forEach((t) => {
      let i = norm.indexOf(t);
      while (i !== -1) { ranges.push([i, i + t.length]); i = norm.indexOf(t, i + t.length); }
    });
    if (!ranges.length) return safe;
    ranges.sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const r of ranges) {
      const last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]); else merged.push([...r]);
    }
    let out = "", pos = 0;
    for (const [a, b] of merged) {
      out += escapeHtml(plain.slice(pos, a)) + "<mark>" + escapeHtml(plain.slice(a, b)) + "</mark>";
      pos = b;
    }
    return out + escapeHtml(plain.slice(pos));
  }

  /** Resaltado de sintaxis ligero para bash / PowerShell / CMD. */
  function highlightCode(code, shell) {
    const re = /(\r?\n)|([ \t]+)|("(?:[^"\\]|\\.)*"|'[^']*')|(2>&1|\|\||&&|>>|[|;>])|([^\s|;"'>]+)|(.)/g;
    let out = "", m, expectCmd = true;
    while ((m = re.exec(code))) {
      const [tok, nl, ws, str, op, word, other] = m;
      if (nl) { out += "\n"; expectCmd = true; continue; }
      if (ws) { out += ws; continue; }
      if (str) {
        out += `<span class="tk-str">${escapeHtml(str)}</span>`;
        expectCmd = false; continue;
      }
      if (op) {
        out += `<span class="tk-op">${escapeHtml(op)}</span>`;
        expectCmd = op !== ">" && op !== ">>" && op !== "2>&1";
        continue;
      }
      if (word) {
        // Comentarios estilo bash/PowerShell
        if (word.startsWith("#") && (shell === "bash" || shell === "powershell")) {
          const end = code.indexOf("\n", m.index);
          const rest = end === -1 ? code.slice(m.index) : code.slice(m.index, end);
          out += `<span class="tk-com">${escapeHtml(rest)}</span>`;
          re.lastIndex = m.index + rest.length;
          continue;
        }
        let cls = "";
        if (/^\$/.test(word)) cls = "tk-var";
        else if (expectCmd && !/^[{}()@]/.test(word)) cls = "tk-cmd";
        else if (/^--?[A-Za-z]/.test(word)) cls = "tk-flag";
        else if (shell === "cmd" && /^\/[A-Za-z?]/.test(word)) cls = "tk-flag";
        out += cls ? `<span class="${cls}">${escapeHtml(word)}</span>` : escapeHtml(word);
        if (!/^[{(]$/.test(word)) expectCmd = false;
        continue;
      }
      out += escapeHtml(other || tok);
    }
    return out;
  }

  // ---------------------------------------------------------------- Búsqueda
  const index = commands.map((c) => {
    const cat = catById[c.category];
    return {
      cmd: c,
      name: normalize(c.name),
      hay: normalize([
        c.name, c.description, c.syntax, c.shell, c.os, cat?.label, cat?.labelEn,
        (c.tags || []).join(" "),
        (c.flags || []).map((f) => f.flag + " " + f.description).join(" "),
        c.example?.command, c.example?.explanation, RISK[c.risk]?.label
      ].join(" "))
    };
  });

  function score(entry, terms) {
    let s = 0;
    for (const t of terms) {
      if (!entry.hay.includes(t)) return -1;
      if (entry.name === t) s += 100;
      else if (entry.name.startsWith(t)) s += 50;
      else if (entry.name.includes(t)) s += 25;
      else if ((entry.cmd.tags || []).some((tag) => normalize(tag).includes(t))) s += 10;
      else s += 1;
    }
    return s;
  }

  /** Aplica filtros. `ignoreCategory` se usa para calcular los contadores del sidebar. */
  function filter({ ignoreCategory = false } = {}) {
    const terms = queryTerms();
    const res = [];
    for (const e of index) {
      const c = e.cmd;
      if (state.os !== "all" && c.os !== state.os) continue;
      if (!ignoreCategory && state.category !== "all" && c.category !== state.category) continue;
      if (!state.risks.has(c.risk)) continue;
      const s = terms.length ? score(e, terms) : 0;
      if (s < 0) continue;
      res.push({ c, s });
    }
    res.sort((a, b) =>
      b.s - a.s ||
      catOrder[a.c.category] - catOrder[b.c.category] ||
      a.c.os.localeCompare(b.c.os) ||
      a.c.name.localeCompare(b.c.name)
    );
    return res.map((r) => r.c);
  }

  // ---------------------------------------------------------------- Render
  function renderOsTabs() {
    const html = OS_TABS.map((t) => {
      const active = state.os === t.id;
      const n = t.id === "all" ? commands.length : commands.filter((c) => c.os === t.id).length;
      return `<button role="tab" aria-selected="${active}" data-os="${t.id}"
        class="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition
        ${active ? "bg-ink-700 text-white shadow-glow" : "text-slate-400 hover:text-white md:hover:bg-ink-800 bg-ink-850 md:bg-transparent border border-ink-700 md:border-0"}">
        <span aria-hidden="true">${t.icon}</span>${t.label}<span class="text-[10px] ${active ? "text-neon-green" : "text-slate-500"}">${n}</span>
      </button>`;
    }).join("");
    $("#osTabsDesktop").innerHTML = html;
    $("#osTabsMobile").innerHTML = html;
  }

  function renderSidebar() {
    const pool = filter({ ignoreCategory: true });
    const counts = pool.reduce((acc, c) => ((acc[c.category] = (acc[c.category] || 0) + 1), acc), {});
    const visibleCats = categories.filter((c) => state.os === "all" || c.os.includes(state.os));

    // Si la categoría activa no existe en este SO (p. ej. AD en Linux), volvemos a "todas".
    if (state.category !== "all" && !visibleCats.some((c) => c.id === state.category)) state.category = "all";

    const item = (id, label, sub, iconName, n, extra = "") => {
      const active = state.category === id;
      return `<li><button data-cat="${id}" class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left text-sm transition group
        ${active ? "bg-ink-800 text-white ring-1 ring-neon-green/30" : "text-slate-400 hover:bg-ink-850 hover:text-slate-100"}">
        <span class="${active ? "text-neon-green" : "text-slate-500 group-hover:text-neon-cyan"}">${icon(iconName)}</span>
        <span class="flex-1 min-w-0">
          <span class="block truncate">${label}${extra}</span>
          ${sub ? `<span class="block truncate text-[11px] text-slate-600 font-mono">${sub}</span>` : ""}
        </span>
        <span class="font-mono text-[11px] px-1.5 rounded ${n ? (active ? "bg-neon-green/15 text-neon-green" : "bg-ink-800 text-slate-400") : "text-slate-700"}">${n}</span>
      </button></li>`;
    };

    $("#categoryList").innerHTML =
      item("all", "Todas las categorías", "", "all", pool.length) +
      visibleCats.map((c) =>
        item(c.id, c.label, c.labelEn, c.icon, counts[c.id] || 0,
          c.os.length === 1 ? ` <span class="ml-1 text-[10px] px-1 rounded border border-neon-cyan/30 text-neon-cyan font-mono">WIN</span>` : "")
      ).join("");

    $("#riskFilters").innerHTML = Object.entries(RISK).map(([id, r]) => {
      const on = state.risks.has(id);
      return `<button data-risk="${id}" aria-pressed="${on}" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition
        ${on ? r.chip : "border-ink-700 text-slate-600 line-through"}">
        <span class="w-1.5 h-1.5 rounded-full ${on ? r.dot : "bg-slate-700"}"></span>${r.label}</button>`;
    }).join("");
  }

  function riskBadge(risk) {
    const r = RISK[risk];
    const pulse = risk === "danger" ? `<span class="absolute inset-0 rounded-full ${r.dot} animate-ping opacity-60"></span>` : "";
    return `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${r.chip}">
      <span class="relative w-1.5 h-1.5"><span class="absolute inset-0 rounded-full ${r.dot}"></span>${pulse}</span>${r.label}</span>`;
  }

  const copyBtn = (id, field, label = "Copiar") => `
    <button data-copy="${id}" data-field="${field}" title="Copiar al portapapeles"
      class="copy-btn shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md border border-ink-600 bg-ink-800/80 text-[11px] font-mono text-slate-400
             hover:text-neon-green hover:border-neon-green/50 transition">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
      <span>${label}</span>
    </button>`;

  function card(c, i) {
    const cat = catById[c.category];
    const sh = SHELL[c.shell];
    const danger = c.risk === "danger";
    return `
    <article class="card-enter flex flex-col rounded-xl border ${danger ? "border-red-500/40 bg-gradient-to-b from-red-950/30 to-ink-900" : "border-ink-700 bg-ink-900/80"}
      hover:border-ink-600 transition overflow-hidden" style="animation-delay:${Math.min(i, 12) * 25}ms">
      <!-- Cabecera -->
      <header class="flex items-start gap-3 p-4 pb-3">
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span class="text-[11px] font-mono px-1.5 py-0.5 rounded border ${sh.cls}">${c.os === "linux" ? "🐧" : "⊞"} ${sh.label}</span>
            ${riskBadge(c.risk)}
          </div>
          <h2 class="font-mono text-lg font-bold text-white break-words"><code>${highlight(c.name)}</code></h2>
          <p class="mt-1 text-sm text-slate-400 leading-relaxed">${highlight(c.description)}</p>
        </div>
        ${copyBtn(c.id, "name", "")}
      </header>

      <!-- Sintaxis -->
      <div class="px-4">
        <p class="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Sintaxis</p>
        <div class="flex items-start gap-2 rounded-lg bg-ink-950 border border-ink-700 p-2.5">
          <pre class="flex-1 min-w-0 overflow-x-auto scroll-thin text-[12.5px] leading-relaxed font-mono text-slate-300"><code>${highlightCode(c.syntax, c.shell)}</code></pre>
          ${copyBtn(c.id, "syntax", "")}
        </div>
      </div>

      <!-- Flags -->
      ${c.flags?.length ? `
      <details class="px-4 mt-3 group/f" ${c.flags.length <= 4 ? "open" : ""}>
        <summary class="cursor-pointer select-none text-[10px] uppercase tracking-widest text-slate-500 font-semibold hover:text-slate-300 list-none flex items-center gap-1">
          <svg class="w-3 h-3 transition group-open/f:rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M7 5l6 5-6 5z"/></svg>
          Parámetros comunes <span class="text-slate-600">(${c.flags.length})</span>
        </summary>
        <dl class="mt-2 grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 text-[13px]">
          ${c.flags.map((f) => `
            <dt class="font-mono text-neon-violet whitespace-nowrap">${escapeHtml(f.flag)}</dt>
            <dd class="text-slate-400">${highlight(f.description)}</dd>`).join("")}
        </dl>
      </details>` : ""}

      <!-- Ejemplo -->
      <div class="px-4 mt-4">
        <div class="flex items-center justify-between mb-1">
          <p class="text-[10px] uppercase tracking-widest text-neon-cyan/80 font-semibold">▸ Ejemplo real</p>
          ${copyBtn(c.id, "example", "Copiar ejemplo")}
        </div>
        <div class="rounded-lg bg-black/60 border ${danger ? "border-red-500/30" : "border-ink-700"}">
          <div class="flex items-center gap-1.5 px-3 py-1.5 border-b border-ink-800">
            <span class="w-2 h-2 rounded-full bg-red-500/70"></span><span class="w-2 h-2 rounded-full bg-amber-400/70"></span><span class="w-2 h-2 rounded-full bg-emerald-400/70"></span>
            <span class="ml-2 text-[10px] font-mono text-slate-600">${c.os === "linux" ? "root@srv01:~#" : c.shell === "powershell" ? "PS C:\\>" : "C:\\>"}</span>
          </div>
          <pre class="p-3 overflow-x-auto scroll-thin text-[12.5px] leading-relaxed font-mono text-slate-300 whitespace-pre-wrap break-all"><code>${highlightCode(c.example.command, c.shell)}</code></pre>
        </div>
        <p class="mt-2 text-[13px] text-slate-400 leading-relaxed">${highlight(c.example.explanation)}</p>
      </div>

      <!-- Footer -->
      <footer class="mt-auto px-4 py-3 border-t border-ink-800 flex flex-wrap items-center gap-1.5">
        <button data-cat-jump="${c.category}" class="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-neon-cyan mr-1">${icon(cat.icon, "w-3.5 h-3.5")}${cat.label}</button>
        ${(c.tags || []).slice(0, 6).map((t) => `<button data-tag="${escapeHtml(t)}" class="text-[11px] font-mono px-1.5 py-0.5 rounded bg-ink-800 text-slate-400 hover:text-neon-green hover:bg-ink-700">#${highlight(t)}</button>`).join("")}
      </footer>
    </article>`;
  }

  function renderMain(list) {
    const cat = state.category === "all" ? null : catById[state.category];
    const osLabel = OS_TABS.find((t) => t.id === state.os).label;
    $("#breadcrumb").textContent = `~/${state.os}/${cat ? cat.id : "*"}${state.query ? ` | grep "${state.query}"` : ""}`;
    $("#pageTitle").textContent = cat ? cat.label : state.query ? "Resultados de búsqueda" : "Todos los comandos";
    $("#pageSubtitle").textContent = cat ? `${cat.labelEn} · ${osLabel}` : `${osLabel} · Bash, PowerShell y CMD`;

    const byRisk = list.reduce((a, c) => ((a[c.risk] = (a[c.risk] || 0) + 1), a), {});
    $("#stats").innerHTML = `<span class="text-white">${list.length}</span> comandos · ` +
      Object.keys(RISK).map((k) => `<span class="inline-flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full ${RISK[k].dot}"></span>${byRisk[k] || 0}</span>`).join(" ");

    $("#grid").innerHTML = list.map(card).join("");
    $("#empty").classList.toggle("hidden", list.length > 0);
    $("#footerCount").textContent = `${commands.length} comandos · ${categories.length} categorías`;
  }

  function render() {
    renderOsTabs();
    renderSidebar();
    renderMain(filter());
  }

  // ---------------------------------------------------------------- Portapapeles
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.remove("opacity-0", "translate-y-3");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add("opacity-0", "translate-y-3"), 1600);
  }

  // ---------------------------------------------------------------- Sidebar móvil
  const sidebar = $("#sidebar"), overlay = $("#overlay");
  const openSidebar = () => { sidebar.classList.remove("-translate-x-full"); overlay.classList.remove("hidden"); };
  const closeSidebar = () => { sidebar.classList.add("-translate-x-full"); overlay.classList.add("hidden"); };

  // ---------------------------------------------------------------- Eventos
  const setOs = (os) => { state.os = os; localStorage.setItem("cs.os", os); render(); };

  document.addEventListener("click", async (e) => {
    const el = e.target.closest("[data-os],[data-cat],[data-risk],[data-copy],[data-tag],[data-cat-jump]");
    if (!el) return;

    if (el.dataset.os) return setOs(el.dataset.os);

    if (el.dataset.cat) {
      state.category = el.dataset.cat;
      closeSidebar();
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (el.dataset.catJump) { state.category = el.dataset.catJump; render(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    if (el.dataset.risk) {
      const r = el.dataset.risk;
      state.risks.has(r) ? state.risks.delete(r) : state.risks.add(r);
      if (!state.risks.size) state.risks = new Set(Object.keys(RISK)); // nunca vacío
      return render();
    }

    if (el.dataset.tag) {
      state.query = el.dataset.tag;
      $("#search").value = state.query;
      state.category = "all";
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (el.dataset.copy) {
      const c = commands.find((x) => x.id === el.dataset.copy);
      const field = el.dataset.field;
      const text = field === "example" ? c.example.command : field === "syntax" ? c.syntax : c.name;
      await copyText(text);
      const label = el.querySelector("span");
      const prev = label?.textContent;
      el.classList.add("!text-neon-green", "!border-neon-green/60");
      if (label && prev) label.textContent = "¡Copiado!";
      setTimeout(() => { el.classList.remove("!text-neon-green", "!border-neon-green/60"); if (label && prev) label.textContent = prev; }, 1200);
      toast(c.risk === "danger" ? "⚠ Copiado — comando PELIGROSO, revísalo antes de ejecutar" : "✓ Copiado al portapapeles");
    }
  });

  let debounce;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      state.query = e.target.value.trim();
      if (state.query) state.category = "all";
      render();
    }, 60);
  });

  document.addEventListener("keydown", (e) => {
    const search = $("#search");
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); search.focus(); search.select(); return; }
    if (e.key === "/" && !typing) { e.preventDefault(); search.focus(); return; }
    if (e.key === "Escape") {
      if (!sidebar.classList.contains("-translate-x-full") && window.innerWidth < 1024) return closeSidebar();
      search.value = ""; state.query = ""; search.blur(); render(); return;
    }
    if (e.altKey && ["1", "2", "3"].includes(e.key)) { e.preventDefault(); setOs(OS_TABS[+e.key - 1].id); }
  });

  $("#btnMenu").addEventListener("click", openSidebar);
  $("#btnClose").addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);
  $("#logo").addEventListener("click", (e) => { e.preventDefault(); state.category = "all"; state.query = ""; $("#search").value = ""; render(); });
  $("#btnReset").addEventListener("click", () => {
    state.category = "all"; state.query = ""; state.risks = new Set(Object.keys(RISK)); $("#search").value = ""; render();
  });

  render();
})();
