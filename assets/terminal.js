/* =========================================================================
 * Terminal simulada de Sysadmin (JavaScript vanilla, sin dependencias).
 * La usan la web (panel «Terminal» y botones «Probar») y el prototipo de docs/terminal/.
 *
 * Módulos:
 *   1. Utilidades, idioma y límites de seguridad
 *   2. Tokenizador        → tokens y detección de lo no soportado (| ; & > <)
 *   3. Analizador de args → flags, valores y argumentos según la definición
 *   4. VirtualFS          → sistema de archivos de solo lectura (ls, cd, cat…)
 *   5. Screen             → única salida al DOM (siempre textContent)
 *   6. Registry           → comandos de terminal-data.js + integrados
 *   7. Terminal           → entrada, historial, autocompletado y ejecución
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
  function parseArgs(tokens, def) {
    const flags = new Set(), values = Object.create(null), positional = [];
    const known = def.flags || {};
    const takesValue = (f) => has(known, f) && typeof known[f] === "object" && known[f].takesValue === true;
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok === "--") { positional.push(...tokens.slice(i + 1)); break; }
      if (/^--?[A-Za-z][\w-]*$/.test(tok)) {
        const group = has(known, tok) || tok.startsWith("--") ? [tok] : [...tok.slice(1)].map((c) => "-" + c);
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
    constructor(tree, env) { this.tree = Object.assign(Object.create(null), tree); this.env = env; }
    resolve(path = ".") {
      let p = path.startsWith("~") ? this.env.home + path.slice(1) : path;
      if (!p.startsWith("/")) p = `${this.env.cwd}/${p}`;
      const parts = [];
      for (const seg of p.split("/")) {
        if (!seg || seg === ".") continue;
        if (seg === "..") parts.pop(); else parts.push(seg);
      }
      return "/" + parts.join("/");
    }
    exists(p) { return has(this.tree, p); }
    isDir(p) { return this.exists(p) && Array.isArray(this.tree[p]); }
    list(p) { return this.isDir(p) ? [...this.tree[p]] : null; }
    read(p) { return this.exists(p) && typeof this.tree[p] === "string" ? this.tree[p] : null; }
    display(p) { return p === this.env.home ? "~" : p.startsWith(this.env.home + "/") ? "~" + p.slice(this.env.home.length) : p; }
  }

  // ------------------------------------------------------------------ 5. Pantalla (salida segura)
  class Screen {
    constructor(el, linkBase) { this.el = el; this.linkBase = linkBase || ""; }
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
      const p = document.createElement("span"); p.className = "t-prompt"; p.textContent = prompt;
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
      this.el.append(node);
      while (this.el.childElementCount > LIMITS.lines) this.el.firstElementChild.remove();
      this.el.scrollTop = this.el.scrollHeight;
    }
    clear() { this.el.replaceChildren(); }
  }

  // ------------------------------------------------------------------ 6. Registro de comandos
  class Registry {
    constructor(data) {
      this.commands = Object.assign(Object.create(null), data.commands);
      this.builtins = Object.create(null);
    }
    addBuiltin(name, spec) { this.builtins[name] = spec; }
    get(name) {
      if (has(this.builtins, name)) return { kind: "builtin", spec: this.builtins[name] };
      if (has(this.commands, name)) return { kind: "data", spec: this.commands[name] };
      return null;
    }
    names() { return [...Object.keys(this.builtins), ...Object.keys(this.commands)].sort(); }
    suggest(name) {
      let best = null, dist = Infinity;
      for (const n of this.names()) { const d = levenshtein(name, n); if (d < dist) { dist = d; best = n; } }
      return dist <= LIMITS.suggestDistance ? best : null;
    }
  }

  /** Orden de ejemplo de un comando de datos (para «help» y los botones «Probar»). */
  function exampleFor(name, def) {
    if (def.tryExample) return def.tryExample;
    const v = (def.variants || [])[0];
    if (!v) return name;
    return [name, ...(v.flags || []), v.sub, ...(v.args || []).map((a) => (a === "*" ? "nginx" : a))].filter(Boolean).join(" ");
  }

  // ------------------------------------------------------------------ 7. Terminal
  class Terminal {
    constructor(root, data) {
      this.root = root;
      this.env = { ...data.env };
      this.fs = new VirtualFS(data.fs, this.env);
      this.registry = new Registry(data);
      this.history = [];
      this.histIndex = 0;
      this.busy = null;

      this.output = root.querySelector("[data-term-output]");
      this.form = root.querySelector("[data-term-form]");
      this.input = root.querySelector("[data-term-input]");
      this.promptEl = root.querySelector("[data-term-prompt]");
      this.screen = new Screen(this.output, root.dataset.linkBase);

      this.registerBuiltins();
      this.bindEvents();
      this.updatePrompt();
      this.screen.print({ text: t("term.welcome"), style: "info" });
      this.screen.print({ text: t("term.welcome2"), style: "dim" });
      root.removeAttribute("aria-busy");
    }

    get prompt() { return `${this.env.user}@${this.env.host}:${this.fs.display(this.env.cwd)}$`; }
    updatePrompt() { this.promptEl.textContent = this.prompt; }
    focus() { this.input.focus({ preventScroll: true }); }

    /** Escribe y ejecuta una orden como si la tecleara el usuario (botones «Probar»). */
    run(line) {
      if (this.busy) this.busy.cancel();
      this.input.value = line;
      this.submit();
      this.focus();
    }

    // ---------------- Entrada
    bindEvents() {
      this.form.addEventListener("submit", (e) => { e.preventDefault(); this.submit(); });
      this.input.addEventListener("keydown", (e) => this.onKey(e));
      this.output.addEventListener("mouseup", () => { if (!window.getSelection().toString()) this.focus(); });
    }

    onKey(e) {
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
      if (this.busy) return;
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
        candidates = this.registry.names().filter((n) => n.startsWith(last));
      } else {
        const slash = last.lastIndexOf("/");
        const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
        const base = slash >= 0 ? last.slice(slash + 1) : last;
        const entries = this.fs.list(this.fs.resolve(dirPart || ".")) || [];
        candidates = entries.filter((n) => n.startsWith(base)).map((n) => dirPart + n);
      }
      if (candidates.length === 1) {
        parts[parts.length - 1] = candidates[0];
        this.input.value = parts.join(" ") + (parts.length === 1 ? " " : "");
      } else if (candidates.length > 1) {
        const prefix = candidates.reduce((a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return a.slice(0, i); });
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
        this.screen.print({ text: t("term.notFound", { name }), style: "error" });
        const s = this.registry.suggest(name);
        if (s) this.screen.print({ text: t("term.didYouMean", { name: s }), style: "dim" });
        return;
      }
      if (found.kind === "builtin") return found.spec.run(args);
      this.runDataCommand(name, found.spec, args);
    }

    runDataCommand(name, def, args) {
      let tokens = args, sub = null;
      if (def.subcommands) {
        const first = tokens.find((x) => !x.startsWith("-"));
        if (!first || !has(def.subcommands, first)) return this.printLines(def.usage || [`${name} …`], {}, "dim");
        sub = def.subcommands[first];
        tokens = tokens.filter((x) => x !== first);
      }

      const parsed = parseArgs(tokens, def);
      if (parsed.unknown) {
        this.screen.print({ text: t("term.invalidOption", { name, opt: parsed.unknown.replace(/^-+/, "") }), style: "error" });
        return this.screen.print({ text: t("term.tryHelp", { name }), style: "dim" });
      }
      if (parsed.missingValue) return this.screen.print({ text: t("term.needsValue", { name, opt: parsed.missingValue }), style: "error" });
      if (def.requiresArgs && parsed.positional.length < def.requiresArgs) return this.printLines(def.usage || [`${name} …`], {}, "dim");

      const vars = this.templateVars(parsed.positional, [name, ...args].join(" "));
      const variant = (def.variants || []).find((v) =>
        (v.sub ?? null) === sub &&
        sameSet(new Set(v.flags || []), parsed.flags) &&
        (!v.args || (v.args.length === parsed.positional.length && v.args.every((a, i) => a === "*" || a === parsed.positional[i]))));

      if (variant) return this.printLines(variant.output, vars, null, def.stream);
      const hasVariants = (def.variants || []).length > 0;
      if (def.output && (parsed.flags.size === 0 || !hasVariants) && !sub) return this.printLines(def.output, vars, null, def.stream);

      this.screen.print({ text: t("term.notSimulated", { name }), style: "warn" });
      this.screen.print({ text: t("term.tryHelp", { name }), style: "dim" });
    }

    templateVars(positional, cmdline) {
      const target = positional[0] || "";
      const hosts = this.fs.read("/etc/hosts") || "";
      const line = hosts.split("\n").find((l) => l.split(/\s+/).slice(1).includes(target));
      return {
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
        if (i >= lines.length) return finish();
        render(lines[i++]);
        timer = setTimeout(step, stream.delayMs || 300);
      };
      this.busy = { cancel: () => { finish(); this.screen.print("^C"); } };
      step();
    }

    // ---------------- Comandos integrados
    registerBuiltins() {
      const r = this.registry, s = this.screen, fs = this.fs, env = this.env;

      r.addBuiltin("help", { summary: () => t("term.b.help"), run: ([cmd]) => {
        if (!cmd) {
          s.print({ text: t("term.help.title"), style: "info" });
          for (const n of r.names()) {
            const sp = r.get(n).spec;
            s.print(`  ${n.padEnd(11)} ${typeof sp.summary === "function" ? sp.summary() : L(sp.summary)}`);
          }
          return s.print({ text: t("term.help.more"), style: "dim" });
        }
        const f = r.get(cmd);
        if (!f) return s.print({ text: t("term.help.none", { name: cmd }), style: "error" });
        const sp = f.spec;
        s.print({ text: `${cmd} — ${typeof sp.summary === "function" ? sp.summary() : L(sp.summary)}`, style: "info" });
        for (const [flag, d] of Object.entries(sp.flags || {})) s.print(`  ${flag.padEnd(12)} ${flagText(d)}`);
        if (sp.subcommands) s.print(`  ${t("term.help.subcommands")}: ${[...new Set(Object.values(sp.subcommands))].join(", ")}`);
        if (f.kind === "data") {
          const examples = new Set([exampleFor(cmd, sp), ...(sp.variants || []).map((v) =>
            [cmd, ...(v.flags || []), v.sub, ...(v.args || []).map((a) => (a === "*" ? "nginx" : a))].filter(Boolean).join(" "))]);
          examples.forEach((ex) => s.print({ text: `  ${t("term.help.example")}: ${ex}`, style: "dim" }));
          if (sp.libraryId) s.link(t("term.help.open"), sp.libraryId);
        }
      } });

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
      const out = Object.create(null), cmds = window.SYS_TERMINAL_DATA?.commands || {};
      for (const [name, def] of Object.entries(cmds)) {
        if (!def.libraryId) continue;
        (out[def.libraryId] ||= []).push({ name, line: exampleFor(name, def) });
      }
      return out;
    }
  };

  // Montaje automático de las terminales visibles al cargar (prototipo). La web la monta al abrir el panel.
  document.querySelectorAll("[data-terminal][data-autostart]").forEach((root) => window.SysTerminal.mount(root));
})();
