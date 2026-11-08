#!/usr/bin/env node
/* Valida assets/data.js: campos obligatorios, valores permitidos e IDs únicos.
 * Uso: node scripts/validate.js   (sale con código 1 si hay errores) */
"use strict";
const path = require("path");

global.window = {};
require(path.join(__dirname, "..", "assets", "data.js"));
const { categories, commands } = window.CHEATSHEET;

const OS = new Set(["linux", "windows", "network"]);
const SHELLS = new Set(["bash", "powershell", "cmd", "ios", "routeros"]);
const RISKS = new Set(["safe", "caution", "danger"]);
const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
const errors = [];
const seen = new Set();

for (const c of commands) {
  const where = c.id || c.name || "(sin id)";
  for (const k of ["id", "name", "os", "shell", "category", "risk", "description", "syntax"]) {
    if (!c[k] || typeof c[k] !== "string") errors.push(`${where}: falta '${k}'`);
  }
  if (seen.has(c.id)) errors.push(`${where}: id duplicado`);
  seen.add(c.id);
  if (!OS.has(c.os)) errors.push(`${where}: os inválido '${c.os}'`);
  if (!SHELLS.has(c.shell)) errors.push(`${where}: shell inválido '${c.shell}'`);
  if (!RISKS.has(c.risk)) errors.push(`${where}: risk inválido '${c.risk}'`);
  const cat = catById[c.category];
  if (!cat) errors.push(`${where}: categoría inexistente '${c.category}'`);
  else if (!cat.os.includes(c.os)) errors.push(`${where}: la categoría '${c.category}' no admite ${c.os}`);
  if (c.os === "linux" && c.shell !== "bash") errors.push(`${where}: Linux debe usar shell 'bash'`);
  if (c.os === "windows" && !["powershell", "cmd"].includes(c.shell)) errors.push(`${where}: Windows usa 'powershell' o 'cmd'`);
  if (c.os === "network" && !["ios", "routeros"].includes(c.shell)) errors.push(`${where}: equipos de red usan 'ios' o 'routeros'`);
  if (!Array.isArray(c.flags) || !c.flags.length) errors.push(`${where}: 'flags' vacío`);
  else c.flags.forEach((f, i) => { if (!f.flag || !f.description) errors.push(`${where}: flags[${i}] incompleto`); });
  if (!c.example?.command || !c.example?.explanation) errors.push(`${where}: 'example' incompleto`);
  if (!Array.isArray(c.tags) || !c.tags.length) errors.push(`${where}: 'tags' vacío`);
  if (c.requires !== undefined && typeof c.requires !== "string") errors.push(`${where}: 'requires' debe ser texto`);
}

// ---- Traducción al inglés del contenido (assets/data-en.js)
require(path.join(__dirname, "..", "assets", "data-en.js"));
const EN = window.CHEATSHEET_EN || {};
for (const c of commands) {
  const e = EN[c.id];
  if (!e) { errors.push(`${c.id}: falta la traducción al inglés en assets/data-en.js`); continue; }
  if (!e.d || !e.x) errors.push(`${c.id}: traducción sin descripción (d) o explicación (x)`);
  if ((e.f || []).length !== c.flags.length) errors.push(`${c.id}: la traducción tiene ${(e.f || []).length} parámetros y el original ${c.flags.length}`);
  if (c.requires && !e.r) errors.push(`${c.id}: falta traducir 'requires' (r)`);
}
for (const id of Object.keys(EN)) if (!seen.has(id)) errors.push(`data-en.js: '${id}' no existe en data.js`);

// ---- Textos de interfaz (assets/i18n.js): mismas claves en español e inglés
require(path.join(__dirname, "..", "assets", "i18n.js"));
const es = Object.keys(window.I18N.es), en = Object.keys(window.I18N.en);
es.filter((k) => !en.includes(k)).forEach((k) => errors.push(`i18n.js: falta la clave '${k}' en inglés`));
en.filter((k) => !es.includes(k)).forEach((k) => errors.push(`i18n.js: falta la clave '${k}' en español`));

// ---- Terminal simulada (assets/terminal-data.js)
require(path.join(__dirname, "..", "assets", "terminal-data.js"));
const TD = window.SYS_TERMINAL_DATA;
if (!TD || !TD.commands || !TD.fs || !TD.env) errors.push("terminal-data.js: faltan commands, fs o env");
else {
  const STYLES_OK = new Set(["ok", "error", "warn", "dim", "info"]);
  const textOk = (v, where) => {
    if (typeof v === "string") return;
    if (v && typeof v === "object" && typeof v.es === "string" && typeof v.en === "string") return;
    errors.push(`terminal ${where}: el texto debe ser un string o { es, en }`);
  };
  const lineOk = (l, where) => {
    if (typeof l === "string") return;
    if (l && typeof l === "object" && Object.prototype.hasOwnProperty.call(l, "text")) {
      textOk(l.text, where);
      if (l.style !== undefined && !STYLES_OK.has(l.style)) errors.push(`terminal ${where}: estilo '${l.style}' no permitido`);
      return;
    }
    textOk(l, where);
  };
  for (const [name, def] of Object.entries(TD.commands)) {
    const w = `«${name}»`;
    if (!/^[a-z][\w-]*$/.test(name)) errors.push(`terminal ${w}: nombre de comando no válido`);
    if (def.libraryId && !seen.has(def.libraryId)) errors.push(`terminal ${w}: libraryId '${def.libraryId}' no existe en data.js`);
    if (!def.summary) errors.push(`terminal ${w}: falta summary`); else textOk(def.summary, `${w} summary`);
    const flags = def.flags || {};
    for (const [f, d] of Object.entries(flags)) textOk(d && typeof d === "object" && "description" in d ? d.description : d, `${w} ${f}`);
    const subs = new Set(Object.values(def.subcommands || {}));
    (def.variants || []).forEach((v, i) => {
      (v.flags || []).forEach((f) => { if (!(f in flags)) errors.push(`terminal ${w} variants[${i}]: flag ${f} no declarado`); });
      if (v.sub && !subs.has(v.sub)) errors.push(`terminal ${w} variants[${i}]: subcomando '${v.sub}' no declarado`);
      if (!Array.isArray(v.output)) errors.push(`terminal ${w} variants[${i}]: falta output`);
      else v.output.forEach((l, j) => lineOk(l, `${w} variants[${i}].output[${j}]`));
    });
    (def.output || []).forEach((l, j) => lineOk(l, `${w} output[${j}]`));
    (def.usage || []).forEach((l, j) => lineOk(l, `${w} usage[${j}]`));
    if (!def.output && !(def.variants || []).length) errors.push(`terminal ${w}: no tiene output ni variantes`);
  }
}

// ---- Versión: data.js e index.html deben coincidir (evita mezclar versiones con cachés antiguas)
const html = require("fs").readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const appVersion = (html.match(/APP_VERSION = "([^"]+)"/) || [])[1];
if (!window.CHEATSHEET.version) errors.push("data.js: falta 'version' en window.CHEATSHEET");
else if (appVersion !== window.CHEATSHEET.version) errors.push(`versión: data.js tiene ${window.CHEATSHEET.version} e index.html (APP_VERSION) tiene ${appVersion}`);

const count = (f) => commands.filter(f).length;
console.log(`Comandos: ${commands.length} (linux ${count((c) => c.os === "linux")}, windows ${count((c) => c.os === "windows")}, red ${count((c) => c.os === "network")})`);
for (const cat of categories) console.log(`  ${cat.id.padEnd(11)} ${count((c) => c.category === cat.id)}`);

if (errors.length) {
  console.error(`\n${errors.length} error(es):\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log("\nOK: dataset válido.");
