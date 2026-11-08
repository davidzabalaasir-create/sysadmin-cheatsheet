/* =========================================================================
 * Terminal simulada de Sysadmin (JavaScript vanilla, sin dependencias).
 * La usan la web (panel «Terminal» y botones «Probar») y el prototipo de docs/terminal/.
 *
 * Módulos:
 *   1. Utilidades, idioma y límites de seguridad
 *   2. Tokenizador        → tokens y detección de lo no soportado (| ; & > <)
 *   3. Analizador de args → flags, valores y argumentos según la definición
 *   4. VirtualFS          → sistema de archivos de solo lectura (ls, cd, cat…); rutas C:\ en Windows
 *   5. Screen             → única salida al DOM (siempre textContent)
 *   6. Registry           → comandos de terminal-data.js + integrados
 *   7. Terminal           → entrada, historial, autocompletado y ejecución; dos sistemas:
 *                           Linux (bash) y Windows (PowerShell, sin distinguir mayúsculas)
 *   8. API pública        → window.SysTerminal
 *
 * Regla de oro: nada de lo que escribe el usuario ni de los datos se inserta como HTML.
 * Especificación: docs/terminal/HANDOFF.md
 * ========================================================================= */
(() => {
  "use strict";

  // ------------------------------------------------------------------ 1. Utilidades
  const LIMITS = { input: 256, lines: 500, history: 100, suggestDistance: 2 };
  const STYLES = new Set(["ok", "error", "warn", "dim", "info"]);
  const ID_RE = /^[a-z0-9-]+$/;
  // Rangos de caracteres de control e invisibles que se eliminan de la entrada (C0, C1,
  // ancho cero, separadores de línea/párrafo y controles bidireccionales).
  const BLOCKED_RANGES = [[0x00, 0x1f], [0x7f, 0x9f], [0x200b, 0x200f], [0x2028, 0x202e], [0x2066, 0x2069]];

  /** hasOwnProperty seguro: «constructor» o «__proto__» nunca son comandos. */
  const has = (obj, key) => obj != null && Object.prototype.hasOwnProperty.call(obj, key);

  const sanitizeInput = (s) =>
    Array.from(String(s))
      .filter((ch) => { const c = ch.codePointAt(0); return !BLOCKED_RANGES.some(([a, b]) => c >= a && c <= b); })
      .join("")
      .slice(0, LIMITS.input);

  const lang = () => (document.documentElement.lang === "en" ? "en" : "es");
  /** Texto de interfaz desde window.I18N (claves term.*), con {variables}. */
  const t = (key, vars) => {
    const I = window.I18N || {};
    let s = I[lang()]?.[key] ?? I.es?.[key] ?? key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (has(vars, k) ? vars[k] : m));
    return s;
  };
  /** Texto de datos: string o { es, en }. */
  const L = (v) => (v && typeof v === "object" ? v[lang()] ?? v.es ?? "" : v ?? "");
  const flagText = (d) => (d && typeof d === "object" && has(d, "description") ? L(d.description) : L(d));

  /** Animaciones solo si el usuario no pidió reducir el movimiento. */
  const motion = () => !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
  function levenshtein(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  // ------------------------------------------------------------------ 2. Tokenizador
  function tokenize(line) {
    const tokens = [];
    let cur = "", quote = null, inToken = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quote) { if (ch === quote) quote = null; else cur += ch; continue; }
      if (ch === '"' || ch === "'") { quote = ch; inToken = true; continue; }
      if ("|;&><`".includes(ch) || (ch === "$" && line[i + 1] === "(")) return { unsupported: ch };
      if (/\s/.test(ch)) { if (inToken) { tokens.push(cur); cur = ""; inToken = false; } continue; }
      cur += ch; inToken = true;
    }
    if (quote) return { error: "unclosed" };
    if (inToken) tokens.push(cur);
    return { tokens };
  }

  // ------------------------------------------------------------------ 3. Analizador de argumentos
  function parseArgs(tokens, def, win = false) {
    const flags = new Set(), values = Object.create(null), positional = [];
    const known = def.flags || {};
    const FLAG_RE = win ? /^(--?|\/)[A-Za-z][\w-]*$/ : /^--?[A-Za-z][\w-]*$/;
    const takesValue = (f) => has(known, f) && typeof known[f] === "object" && known[f].takesValue === true;
    for (let i = 0; i < tokens.length; i++) {
      // En Windows los parámetros no distinguen mayúsculas (-Name = -name) y también valen con «/» (ipconfig /all).
      const tok = win && FLAG_RE.test(tokens[i]) ? tokens[i].toLowerCase() : tokens[i];
      if (tok === "--") { positional.push(...tokens.slice(i + 1)); break; }
      if (FLAG_RE.test(tok)) {
        // «/ruta» que no es un parámetro conocido se trata como argumento (cd /Users).
        if (win && tok.startsWith("/") && !has(known, tok)) { positional.push(tokens[i]); continue; }
        const letters = [...tok.slice(1)].map((c) => "-" + c);
        const group = has(known, tok) || tok.startsWith("--") || tok.startsWith("/") ||
          (win && !letters.every((f) => has(known, f))) ? [tok] : letters;
        for (const f of group) {
          if (!has(known, f)) return { unknown: f };
          flags.add(f);
          if (takesValue(f)) {
            const v = tokens[++i];
            if (v === undefined) return { missingValue: f };
            values[f] = v;
          }
        }
        continue;
      }
      positional.push(tok);
    }
    return { flags, values, positional };
  }

  // ------------------------------------------------------------------ 4. Sistema de archivos virtual
  class VirtualFS {
    /** Las rutas se guardan con «/». En Windows (win) se aceptan «C:\» y «\», y no se distinguen mayúsculas. */
    constructor(tree, env, win = false) {
      this.tree = Object.assign(Object.create(null), tree); this.env = env; this.win = win;
      this.index = Object.create(null);
      for (const k of Object.keys(this.tree)) this.index[win ? k.toLowerCase() : k] = k;
    }
    resolve(path = ".") {
      let p = String(path);
      if (this.win) { p = p.replace(/\\/g, "/"); if (/^[a-z]:/i.test(p)) p = p.slice(2) || "/"; }
      p = p.startsWith("~") ? this.env.home + p.slice(1) : p;
      if (!p.startsWith("/")) p = `${this.env.cwd}/${p}`;
      const parts = [];
      for (const seg of p.split("/")) {
        if (!seg || seg === ".") continue;
        if (seg === "..") parts.pop(); else parts.push(seg);
      }
      const norm = "/" + parts.join("/");
      return this.win ? (this.index[norm.toLowerCase()] ?? norm) : norm;
    }
    exists(p) { return has(this.tree, p); }
    isDir(p) { return this.exists(p) && Array.isArray(this.tree[p]); }
    list(p) { return this.isDir(p) ? [...this.tree[p]] : null; }
    read(p) { return this.exists(p) && typeof this.tree[p] === "string" ? this.tree[p] : null; }
    display(p) {
      if (this.win) return "C:" + (p === "/" ? "\\" : p.replace(/\//g, "\\"));
      return p === this.env.home ? "~" : p.startsWith(this.env.home + "/") ? "~" + p.slice(this.env.home.length) : p;
    }
  }

  // ------------------------------------------------------------------ 5. Pantalla (salida segura)
  class Screen {
    constructor(el, linkBase) { this.el = el; this.linkBase = linkBase || ""; this.batch = 0; this.batchTimer = null; }
    print(line) {
      const { text, style } = typeof line === "string" ? { text: line } : line;
      const div = document.createElement("div");
      div.className = "t-line" + (STYLES.has(style) ? ` t-${style}` : "");
      div.textContent = text === "" ? " " : String(text);
      this.append(div);
    }
    echo(prompt, input) {
      const div = document.createElement("div");
      div.className = "t-line t-echo";
      const p = document.createElement("span"); p.className = prompt.startsWith("PS ") ? "t-prompt is-win" : "t-prompt"; p.textContent = prompt;
      const c = document.createElement("span"); c.textContent = " " + input;
      div.append(p, c);
      this.append(div);
    }
    /** Enlace a una ficha de la biblioteca: solo ids validados, nunca URLs de los datos. */
    link(label, libraryId) {
      if (!ID_RE.test(libraryId)) return;
      const div = document.createElement("div");
      div.className = "t-line t-dim";
      const a = document.createElement("a");
      a.href = `${this.linkBase}#${libraryId}`;
      a.textContent = label;
      a.dataset.libraryLink = libraryId;
      div.append("→ ", a);
      this.append(div);
    }
    append(node) {
      // Las líneas que llegan juntas aparecen en cascada (retardo por CSSOM, permitido por la CSP).
      if (motion()) {
        node.classList.add("t-in");
        node.style.setProperty("--t-delay", `${Math.min(this.batch++, 24) * 18}ms`);
        clearTimeout(this.batchTimer);
        this.batchTimer = setTimeout(() => { this.batch = 0; }, 0);
      }
      this.el.append(node);
      while (this.el.childElementCount > LIMITS.lines) this.el.firstElementChild.remove();
      this.el.scrollTop = this.el.scrollHeight;
    }
    clear() { this.el.replaceChildren(); }
  }

  // ------------------------------------------------------------------ 6. Registro de comandos
  class Registry {
    /** ci: sin distinguir mayúsculas (PowerShell). Los alias (gsv, dir…) sirven para buscar y autocompletar. */
    constructor(commands, ci = false) {
      this.ci = ci;
      this.commands = Object.assign(Object.create(null), commands);
      this.builtins = Object.create(null);
      this.index = Object.create(null);   // clave normalizada → nombre canónico
      for (const [n, def] of Object.entries(this.commands)) this.addIndex(n, def.aliases);
    }
    key(name) { return this.ci ? String(name).toLowerCase() : String(name); }
    addIndex(name, aliases = []) { for (const a of [name, ...aliases]) if (!has(this.index, this.key(a))) this.index[this.key(a)] = name; }
    addBuiltin(name, spec) { this.builtins[name] = spec; this.addIndex(name, spec.aliases); }
    canonical(name) { return has(this.index, this.key(name)) ? this.index[this.key(name)] : null; }
    get(name) {
      const n = this.canonical(name);
      if (n === null) return null;
      if (has(this.builtins, n)) return { kind: "builtin", spec: this.builtins[n], name: n };
      if (has(this.commands, n)) return { kind: "data", spec: this.commands[n], name: n };
      return null;
    }
    names() { return [...Object.keys(this.builtins), ...Object.keys(this.commands)].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })); }
    /** Nombres y alias para autocompletar. */
    completions() {
      const aliases = [...Object.values(this.builtins), ...Object.values(this.commands)].flatMap((c) => c.aliases || []);
      return [...new Set([...this.names(), ...aliases])];
    }
    suggest(name) {
      let best = null, dist = Infinity;
      for (const n of this.names()) { const d = levenshtein(this.key(name), this.key(n)); if (d < dist) { dist = d; best = n; } }
      return dist <= LIMITS.suggestDistance ? best : null;
    }
  }

  /** Orden de ejemplo de un comando de datos (para «help» y los botones «Probar»). */
  function exampleFor(name, def) {
    if (def.tryExample) return def.tryExample;
    const v = (def.variants || [])[0];
    if (!v) return name;
    return variantLine(name, def, v);
  }
  /** Orden que dispara una variante (para «help»): «*» se sustituye por el argumento de ejemplo. */
  function variantLine(name, def, v) {
    const label = (f) => (def.flagLabels && has(def.flagLabels, f) ? def.flagLabels[f] : f);
    return [name, ...(v.flags || []).map(label), v.sub, ...(v.args || []).map((a) => (a === "*" ? def.sample || "nginx" : a))].filter(Boolean).join(" ");
  }

  /** PowerShell no distingue mayúsculas: copia las definiciones con flags y subcomandos en minúsculas
   *  y guarda la forma original (-Name) para mostrarla en «help». */
  function normaliseWin(commands) {
    const out = Object.create(null);
    for (const [name, def] of Object.entries(commands)) {
      const flags = Object.create(null), flagLabels = Object.create(null);
      for (const [f, d] of Object.entries(def.flags || {})) { flags[f.toLowerCase()] = d; flagLabels[f.toLowerCase()] = f; }
      const subcommands = def.subcommands ? Object.fromEntries(Object.entries(def.subcommands).map(([k, v]) => [k.toLowerCase(), v])) : undefined;
      const variants = (def.variants || []).map((v) => ({ ...v, flags: (v.flags || []).map((f) => f.toLowerCase()) }));
      out[name] = { ...def, flags, flagLabels, subcommands, variants };
    }
    return out;
  }

  // ------------------------------------------------------------------ 7. Terminal
  class Terminal {
    constructor(root, data) {
      this.root = root;
      // Un perfil por sistema: entorno, sistema de archivos y comandos propios.
      this.profiles = { linux: this.makeProfile("linux", data) };
      if (data.windows) this.profiles.windows = this.makeProfile("windows", data.windows);
      this.mode = "linux";
      this.history = [];
      this.histIndex = 0;
      this.busy = null;

      this.output = root.querySelector("[data-term-output]");
      this.form = root.querySelector("[data-term-form]");
      this.input = root.querySelector("[data-term-input]");
      this.promptEl = root.querySelector("[data-term-prompt]");
      this.screen = new Screen(this.output, root.dataset.linkBase);
      this.osButtons = [...root.querySelectorAll("[data-term-os]")];

      this.registerBuiltins(this.profiles.linux);
      if (this.profiles.windows) this.registerWinBuiltins(this.profiles.windows);
      else this.osButtons.forEach((b) => (b.hidden = true));
      this.bindEvents();
      this.updatePrompt();
      this.screen.print({ text: t("term.welcome"), style: "info" });
      this.screen.print({ text: t("term.welcome2"), style: "dim" });
      root.removeAttribute("aria-busy");
    }

    makeProfile(mode, data) {
      const win = mode === "windows", env = { ...data.env };
      const commands = win ? normaliseWin(data.commands) : data.commands;
      return { mode, win, env, fs: new VirtualFS(data.fs, env, win), registry: new Registry(commands, win) };
    }
    get p() { return this.profiles[this.mode]; }
    get env() { return this.p.env; }
    get fs() { return this.p.fs; }
    get registry() { return this.p.registry; }
    get win() { return this.p.win; }

    /** Cambia entre Linux y Windows (botones de la barra, órdenes «windows» / «linux» y botones «Probar»). */
    setMode(mode, announce = true) {
      if (!has(this.profiles, mode) || mode === this.mode) return;
      if (this.busy) this.busy.cancel();
      this.stopTyping();
      this.mode = mode;
      this.root.dataset.os = mode;
      this.updatePrompt();
      if (announce) {
        this.screen.print({ text: t(`term.os.${mode}`), style: "info" });
        this.screen.print({ text: t(`term.os.${mode}.hint`), style: "dim" });
      }
    }

    get prompt() {
      if (this.win) return `PS ${this.fs.display(this.env.cwd)}>`;
      return `${this.env.user}@${this.env.host}:${this.fs.display(this.env.cwd)}$`;
    }
    updatePrompt() {
      this.promptEl.textContent = this.prompt;
      this.osButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.termOs === this.mode)));
    }
    focus() { this.input.focus({ preventScroll: true }); }

    /** Escribe y ejecuta una orden como si la tecleara el usuario (botones «Probar»). */
    run(line, mode) {
      if (mode) this.setMode(mode);
      if (this.busy) this.busy.cancel();
      this.stopTyping();
      this.focus();
      if (!motion()) { this.input.value = line; return this.submit(); }
      // Efecto de mecanografía: letra a letra, como mucho ~0,9 s en total.
      const chars = Array.from(line), step = Math.max(12, Math.min(38, 900 / chars.length));
      let i = 0;
      this.input.value = "";
      this.input.dataset.typing = "";
      const tick = () => {
        this.input.value = chars.slice(0, ++i).join("");
        if (i < chars.length) this.typing = { timer: setTimeout(tick, step), line };
        else { this.typing = null; delete this.input.dataset.typing; this.submit(); }
      };
      this.typing = { timer: setTimeout(tick, 220), line };
    }
    /** Termina al instante la mecanografía en curso (al pulsar una tecla); con submit, la ejecuta. */
    stopTyping(submit = false) {
      if (!this.typing) return false;
      clearTimeout(this.typing.timer);
      const { line } = this.typing;
      this.typing = null;
      delete this.input.dataset.typing;
      if (submit) { this.input.value = line; this.submit(); }
      return true;
    }

    // ---------------- Entrada
    bindEvents() {
      this.form.addEventListener("submit", (e) => { e.preventDefault(); this.submit(); });
      this.osButtons.forEach((b) => b.addEventListener("click", () => { this.setMode(b.dataset.termOs); this.focus(); }));
      this.input.addEventListener("keydown", (e) => this.onKey(e));
      this.output.addEventListener("mouseup", () => { if (!window.getSelection().toString()) this.focus(); });
    }

    onKey(e) {
      if (this.typing) { e.preventDefault(); this.stopTyping(true); return; }
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        if (!this.history.length) return;
        this.histIndex = Math.max(0, Math.min(this.history.length, this.histIndex + (e.key === "ArrowUp" ? -1 : 1)));
        this.input.value = this.history[this.histIndex] ?? "";
      } else if (e.key === "Tab" && !e.shiftKey && this.input.value.trim()) {
        // Solo autocompleta si hay algo escrito: con la línea vacía, Tab y Shift+Tab mueven el foco.
        e.preventDefault();
        this.complete();
      } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        this.screen.clear();
      } else if (e.ctrlKey && e.key.toLowerCase() === "c" && !window.getSelection().toString()) {
        e.preventDefault();
        if (this.busy) this.busy.cancel();
        else { this.screen.echo(this.prompt, this.input.value + "^C"); this.input.value = ""; }
      }
    }

    submit() {
      if (this.busy) this.busy.flush();
      const line = sanitizeInput(this.input.value);
      this.input.value = "";
      this.screen.echo(this.prompt, line);
      const trimmed = line.trim();
      if (!trimmed) return;
      if (this.history.at(-1) !== trimmed) this.history.push(trimmed);
      if (this.history.length > LIMITS.history) this.history.shift();
      this.histIndex = this.history.length;
      this.execute(trimmed);
    }

    complete() {
      const value = this.input.value;
      const parts = value.split(/\s+/);
      const last = parts.at(-1);
      let candidates;
      if (parts.length === 1) {
        const k = this.registry.key(last);
        candidates = this.registry.completions().filter((n) => this.registry.key(n).startsWith(k));
      } else {
        const slash = last.lastIndexOf("/");
        const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
        const base = slash >= 0 ? last.slice(slash + 1) : last;
        const entries = this.fs.list(this.fs.resolve(dirPart || ".")) || [];
        const lc = (x) => (this.win ? x.toLowerCase() : x);
        candidates = entries.filter((n) => lc(n).startsWith(lc(base))).map((n) => dirPart + n);
      }
      if (candidates.length === 1) {
        parts[parts.length - 1] = candidates[0];
        this.input.value = parts.join(" ") + (parts.length === 1 ? " " : "");
      } else if (candidates.length > 1) {
        const lc = (x) => (this.win ? x.toLowerCase() : x);
        const prefix = candidates.reduce((a, b) => { let i = 0; while (i < a.length && lc(a[i]) === lc(b[i] || "")) i++; return a.slice(0, i); });
        if (prefix.length > last.length) { parts[parts.length - 1] = prefix; this.input.value = parts.join(" "); return; }
        this.screen.echo(this.prompt, value);
        this.screen.print({ text: candidates.join("   "), style: "dim" });
      }
    }

    // ---------------- Ejecución
    execute(line) {
      const tk = tokenize(line);
      if (tk.unsupported) return this.screen.print({ text: t("term.unsupported", { op: tk.unsupported }), style: "warn" });
      if (tk.error) return this.screen.print({ text: t("term.unclosed"), style: "error" });

      const [name, ...args] = tk.tokens;
      const found = this.registry.get(name);
      if (!found) {
        this.screen.print({ text: t(this.win ? "term.win.notFound" : "term.notFound", { name }), style: "error" });
        const s = this.registry.suggest(name);
        if (s) this.screen.print({ text: t("term.didYouMean", { name: s }), style: "dim" });
        return;
      }
      if (found.kind === "builtin") return found.spec.run(args);
      this.runDataCommand(found.name, found.spec, args);
    }

    runDataCommand(name, def, args) {
      let tokens = args, sub = null;
      const lc = (x) => (this.win ? String(x).toLowerCase() : String(x));
      if (def.subcommands) {
        const first = tokens.find((x) => !x.startsWith("-"));
        if (!first || !has(def.subcommands, lc(first))) return this.printLines(def.usage || [`${name} …`], {}, "dim");
        sub = def.subcommands[lc(first)];
        tokens = tokens.filter((x) => x !== first);
      }

      const parsed = parseArgs(tokens, def, this.win);
      if (parsed.unknown) {
        this.screen.print({ text: t(this.win ? "term.win.invalidOption" : "term.invalidOption", { name, opt: parsed.unknown.replace(/^[-/]+/, "") }), style: "error" });
        return this.screen.print({ text: t("term.tryHelp", { name }), style: "dim" });
      }
      if (parsed.missingValue) return this.screen.print({ text: t("term.needsValue", { name, opt: parsed.missingValue }), style: "error" });
      if (def.requiresArgs && parsed.positional.length < def.requiresArgs) return this.printLines(def.usage || [`${name} …`], {}, "dim");

      const vars = this.templateVars(parsed.positional, [name, ...args].join(" "), parsed.values);
      const variant = (def.variants || []).find((v) =>
        (v.sub ?? null) === sub &&
        sameSet(new Set(v.flags || []), parsed.flags) &&
        (!v.args || (v.args.length === parsed.positional.length && v.args.every((a, i) => a === "*" || lc(a) === lc(parsed.positional[i])))));

      if (variant) return this.printLines(variant.output, vars, null, def.stream);
      const hasVariants = (def.variants || []).length > 0;
      if (def.output && (parsed.flags.size === 0 || !hasVariants) && !sub) return this.printLines(def.output, vars, null, def.stream);

      this.screen.print({ text: t("term.notSimulated", { name }), style: "warn" });
      this.screen.print({ text: t("term.tryHelp", { name }), style: "dim" });
    }

    templateVars(positional, cmdline, values = {}) {
      const target = positional[0] || "";
      const hosts = this.fs.read(this.win ? this.fs.resolve("C:/Windows/System32/drivers/etc/hosts") : "/etc/hosts") || "";
      // Valores de parámetros: -Port 443 → {port}, -c 3 → {c}
      const named = Object.create(null);
      for (const [f, v] of Object.entries(values)) named[f.replace(/^[-/]+/, "")] = v;
      const line = hosts.split("\n").find((l) => l.split(/\s+/).slice(1).some((h) => h.toLowerCase() === target.toLowerCase()));
      return {
        ...named,
        arg0: target, args: positional.join(" "), cmdline,
        ip: line ? line.split(/\s+/)[0] : /^\d+\.\d+\.\d+\.\d+$/.test(target) ? target : "93.184.215.14",
        user: this.env.user, host: this.env.host, cwd: this.env.cwd
      };
    }

    printLines(lines, vars, forcedStyle = null, stream = null) {
      const fill = (s) => String(s).replace(/\{(\w+)\}/g, (m, k) => (has(vars, k) ? vars[k] : m));
      const render = (l) => {
        const obj = typeof l === "string" || (l && !has(l, "text")) ? { text: l } : l;
        this.screen.print({ text: fill(L(obj.text)), style: forcedStyle || obj.style });
      };
      if (!stream) return lines.forEach(render);

      let i = 0, timer = null;
      this.input.setAttribute("aria-busy", "true");
      const finish = () => { clearTimeout(timer); this.busy = null; this.input.removeAttribute("aria-busy"); };
      const step = () => {
        render(lines[i++]);
        if (i >= lines.length) return finish();
        timer = setTimeout(step, stream.delayMs || 300);
      };
      this.busy = {
        cancel: () => { finish(); this.screen.print("^C"); },
        // Si el usuario envía otra orden, la salida pendiente se muestra de golpe (no se pierde ninguna orden).
        flush: () => { clearTimeout(timer); while (i < lines.length) render(lines[i++]); finish(); }
      };
      if (!lines.length) return finish();
      step();
    }

    // ---------------- Comandos integrados
    /** «help» de cualquiera de los dos sistemas. */
    showHelp(r, cmd) {
      const s = this.screen, sum = (sp) => (typeof sp.summary === "function" ? sp.summary() : L(sp.summary));
      if (!cmd) {
        s.print({ text: t("term.help.title"), style: "info" });
        const names = r.names(), pad = Math.max(...names.map((n) => n.length)) + 2;
        for (const n of names) {
          const sp = r.get(n).spec;
          const alias = sp.aliases && sp.aliases.length ? ` (${sp.aliases.join(", ")})` : "";
          s.print(`  ${n.padEnd(pad)} ${sum(sp)}${alias}`);
        }
        return s.print({ text: t("term.help.more"), style: "dim" });
      }
      const f = r.get(cmd);
      if (!f) return s.print({ text: t("term.help.none", { name: cmd }), style: "error" });
      const sp = f.spec, label = (fl) => (sp.flagLabels && has(sp.flagLabels, fl) ? sp.flagLabels[fl] : fl);
      s.print({ text: `${f.name} — ${sum(sp)}`, style: "info" });
      if (sp.aliases && sp.aliases.length) s.print(`  ${t("term.help.aliases")}: ${sp.aliases.join(", ")}`);
      for (const [flag, d] of Object.entries(sp.flags || {})) s.print(`  ${label(flag).padEnd(14)} ${flagText(d)}`);
      if (sp.subcommands) s.print(`  ${t("term.help.subcommands")}: ${[...new Set(Object.values(sp.subcommands))].join(", ")}`);
      if (f.kind === "data") {
        const examples = new Set([exampleFor(f.name, sp), ...(sp.variants || []).map((v) => variantLine(f.name, sp, v))]);
        examples.forEach((ex) => s.print({ text: `  ${t("term.help.example")}: ${ex}`, style: "dim" }));
        if (sp.libraryId) s.link(t("term.help.open"), sp.libraryId);
      }
    }

    registerBuiltins(profile) {
      const r = profile.registry, s = this.screen, fs = profile.fs, env = profile.env;

      r.addBuiltin("help", { summary: () => t("term.b.help"), run: ([cmd]) => this.showHelp(r, cmd) });
      if (this.profiles.windows) r.addBuiltin("windows", { aliases: ["powershell", "pwsh"], summary: () => t("term.b.windows"), run: () => this.setMode("windows") });

      r.addBuiltin("man", { summary: () => t("term.b.man"), run: (a) => r.get("help").spec.run(a) });
      r.addBuiltin("clear", { summary: () => t("term.b.clear"), run: () => s.clear() });
      r.addBuiltin("history", { summary: () => t("term.b.history"), run: () =>
        this.history.forEach((h, i) => s.print(`${String(i + 1).padStart(4)}  ${h}`)) });
      r.addBuiltin("echo", { summary: () => t("term.b.echo"), run: (a) => s.print(a.join(" ")) });
      r.addBuiltin("pwd", { summary: () => t("term.b.pwd"), run: () => s.print(env.cwd) });

      r.addBuiltin("cd", { summary: () => t("term.b.cd"), run: ([dir = "~"]) => {
        const p = fs.resolve(dir);
        if (!fs.exists(p)) return s.print({ text: t("term.noEnt", { cmd: "cd", path: dir }), style: "error" });
        if (!fs.isDir(p)) return s.print({ text: t("term.notDir", { cmd: "cd", path: dir }), style: "error" });
        env.cwd = p; this.updatePrompt();
      } });

      const lsFlags = { "-l": { es: "Formato largo.", en: "Long format." }, "-a": { es: "Incluye ocultos.", en: "Include hidden." } };
      r.addBuiltin("ls", { summary: () => t("term.b.ls"), flags: lsFlags, run: (args) => {
        const parsed = parseArgs(args, { flags: lsFlags });
        if (parsed.unknown) return s.print({ text: t("term.invalidOption", { name: "ls", opt: parsed.unknown.slice(1) }), style: "error" });
        const target = parsed.positional[0] || ".";
        const p = fs.resolve(target);
        if (!fs.exists(p)) return s.print({ text: t("term.noEnt", { cmd: "ls", path: target }), style: "error" });
        const entries = fs.isDir(p) ? fs.list(p) : [p.split("/").pop()];
        if (parsed.flags.has("-a") && fs.isDir(p)) entries.unshift(".", "..");
        if (!parsed.flags.has("-l")) return s.print(entries.join("  "));
        for (const n of entries) {
          const full = fs.resolve(`${p}/${n}`), dir = n === "." || n === ".." || fs.isDir(full);
          const size = dir ? 4096 : (fs.read(full) || "").length;
          s.print({ text: `${dir ? "drwxr-xr-x" : "-rw-r--r--"} 1 ${env.user} ${env.user} ${String(size).padStart(5)} Nov  8 09:00 ${n}`, style: dir ? "info" : null });
        }
      } });

      r.addBuiltin("cat", { summary: () => t("term.b.cat"), run: (args) => {
        if (!args.length) return s.print({ text: t("term.cat.usage"), style: "dim" });
        for (const a of args) {
          const p = fs.resolve(a);
          if (fs.isDir(p)) { s.print({ text: t("term.isDir", { cmd: "cat", path: a }), style: "error" }); continue; }
          const content = fs.read(p);
          if (content === null) { s.print({ text: t("term.noEnt", { cmd: "cat", path: a }), style: "error" }); continue; }
          content.split("\n").forEach((l) => s.print(l));
        }
      } });
    }

    /** Comandos integrados de PowerShell (con sus alias habituales). Nombres y parámetros sin distinguir mayúsculas. */
    registerWinBuiltins(profile) {
      const r = profile.registry, s = this.screen, fs = profile.fs, env = profile.env;
      const notFound = (cmd, path) => s.print({ text: t("term.win.noEnt", { cmd, path: fs.display(fs.resolve(path)) }), style: "error" });
      const badParam = (name, args, known) => {
        const parsed = parseArgs(args, { flags: known }, true);
        if (parsed.unknown) s.print({ text: t("term.win.invalidOption", { name, opt: parsed.unknown.replace(/^[-/]+/, "") }), style: "error" });
        if (parsed.missingValue) s.print({ text: t("term.needsValue", { name, opt: parsed.missingValue }), style: "error" });
        return parsed.unknown || parsed.missingValue ? null : parsed;
      };

      r.addBuiltin("Get-Help", { aliases: ["help", "man"], summary: () => t("term.b.help"), run: ([cmd]) => this.showHelp(r, cmd) });
      r.addBuiltin("linux", { aliases: ["bash", "wsl"], summary: () => t("term.b.linux"), run: () => this.setMode("linux") });
      r.addBuiltin("Clear-Host", { aliases: ["cls", "clear"], summary: () => t("term.b.clear"), run: () => s.clear() });
      r.addBuiltin("Get-History", { aliases: ["history", "h"], summary: () => t("term.b.history"), run: () => {
        if (!this.history.length) return;
        s.print("  Id CommandLine");
        s.print("  -- -----------");
        this.history.forEach((h, i) => s.print(`${String(i + 1).padStart(4)} ${h}`));
      } });
      // Write-Output escribe cada argumento en su línea, como PowerShell.
      r.addBuiltin("Write-Output", { aliases: ["echo", "write"], summary: () => t("term.b.echo"), run: (a) => a.forEach((x) => s.print(x)) });
      r.addBuiltin("Get-Location", { aliases: ["pwd", "gl"], summary: () => t("term.b.pwd"), run: () => {
        s.print(""); s.print("Path"); s.print("----"); s.print(fs.display(env.cwd)); s.print("");
      } });

      r.addBuiltin("Set-Location", { aliases: ["cd", "chdir", "sl"], summary: () => t("term.b.cd"), run: ([dir = "~"]) => {
        const p = fs.resolve(dir);
        if (!fs.exists(p)) return notFound("Set-Location", dir);
        if (!fs.isDir(p)) return s.print({ text: t("term.win.notDir", { cmd: "Set-Location", path: fs.display(p) }), style: "error" });
        env.cwd = p; this.updatePrompt();
      } });

      const dirFlags = { "-force": { es: "Incluye elementos ocultos.", en: "Includes hidden items." },
                         "-name": { es: "Solo los nombres.", en: "Names only." } };
      r.addBuiltin("Get-ChildItem", { aliases: ["dir", "ls", "gci"], flags: dirFlags, flagLabels: { "-force": "-Force", "-name": "-Name" },
        summary: () => t("term.wb.dir"), run: (args) => {
          const parsed = badParam("Get-ChildItem", args, dirFlags);
          if (!parsed) return;
          const target = parsed.positional[0] || ".";
          const p = fs.resolve(target);
          if (!fs.exists(p)) return notFound("Get-ChildItem", target);
          const entries = fs.isDir(p) ? fs.list(p) : [p.split("/").pop()];
          if (parsed.flags.has("-name")) return entries.forEach((n) => s.print(n));
          const parent = fs.isDir(p) ? p : p.slice(0, p.lastIndexOf("/")) || "/";
          s.print("");
          s.print(`    Directory: ${fs.display(parent)}`);
          s.print("");
          s.print("Mode                 LastWriteTime         Length Name");
          s.print("----                 -------------         ------ ----");
          const rows = entries.map((n) => ({ n, full: fs.resolve(`${parent}/${n}`) }))
            .sort((a, b) => Number(fs.isDir(b.full)) - Number(fs.isDir(a.full)) || a.n.localeCompare(b.n));
          for (const { n, full } of rows) {
            const dir = fs.isDir(full);
            const len = dir ? "" : String((fs.read(full) || "").length);
            s.print({ text: `${dir ? "d-----" : "-a----"}        08/11/2026      9:00 ${len.padStart(14)} ${n}`, style: dir ? "info" : null });
          }
          s.print("");
        } });

      const gcFlags = { "-tail": { description: { es: "Solo las últimas N líneas.", en: "Only the last N lines." }, takesValue: true },
                        "-totalcount": { description: { es: "Solo las primeras N líneas.", en: "Only the first N lines." }, takesValue: true } };
      r.addBuiltin("Get-Content", { aliases: ["type", "cat", "gc"], flags: gcFlags, flagLabels: { "-tail": "-Tail", "-totalcount": "-TotalCount" },
        summary: () => t("term.wb.type"), run: (args) => {
          const parsed = badParam("Get-Content", args, gcFlags);
          if (!parsed) return;
          if (!parsed.positional.length) return s.print({ text: t("term.win.gc.usage"), style: "dim" });
          const n = (f) => Math.max(0, parseInt(parsed.values[f], 10) || 0);
          for (const a of parsed.positional) {
            const p = fs.resolve(a);
            if (fs.isDir(p)) { s.print({ text: t("term.win.isDir", { cmd: "Get-Content", path: fs.display(p) }), style: "error" }); continue; }
            const content = fs.read(p);
            if (content === null) { notFound("Get-Content", a); continue; }
            let lines = content.split("\n");
            if (parsed.flags.has("-tail")) lines = lines.slice(-n("-tail") || lines.length);
            if (parsed.flags.has("-totalcount")) lines = lines.slice(0, n("-totalcount"));
            lines.forEach((l) => s.print(l));
          }
        } });
    }
  }

  // ------------------------------------------------------------------ 8. API pública
  const instances = new WeakMap();
  window.SysTerminal = {
    /** Crea (una sola vez) la terminal en el elemento raíz [data-terminal]. */
    mount(root) {
      if (!instances.has(root)) {
        const data = window.SYS_TERMINAL_DATA;
        if (!data) { root.querySelector("[data-term-output]").textContent = t("term.loadError"); return null; }
        instances.set(root, new Terminal(root, data));
      }
      return instances.get(root);
    },
    /** Mapa libraryId → orden de ejemplo, para mostrar «Probar» en las fichas que tienen simulación. */
    examples() {
      const out = Object.create(null), data = window.SYS_TERMINAL_DATA || {};
      const add = (cmds, os) => {
        for (const [name, def] of Object.entries(cmds || {})) {
          if (!def.libraryId) continue;
          (out[def.libraryId] ||= []).push({ name, os, aliases: def.aliases || [], line: exampleFor(name, def) });
        }
      };
      add(data.commands, "linux");
      add(data.windows?.commands, "windows");
      return out;
    }
  };

  // Montaje automático de las terminales visibles al cargar (prototipo). La web la monta al abrir el panel.
  document.querySelectorAll("[data-terminal][data-autostart]").forEach((root) => window.SysTerminal.mount(root));
})();
