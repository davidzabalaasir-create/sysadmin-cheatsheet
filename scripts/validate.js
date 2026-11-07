#!/usr/bin/env node
/* Valida assets/data.js: campos obligatorios, valores permitidos e IDs únicos.
 * Uso: node scripts/validate.js   (sale con código 1 si hay errores) */
"use strict";
const path = require("path");

global.window = {};
require(path.join(__dirname, "..", "assets", "data.js"));
const { categories, commands } = window.CHEATSHEET;

const OS = new Set(["linux", "windows"]);
const SHELLS = new Set(["bash", "powershell", "cmd"]);
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
  if (c.os === "windows" && c.shell === "bash") errors.push(`${where}: Windows no usa 'bash'`);
  if (!Array.isArray(c.flags) || !c.flags.length) errors.push(`${where}: 'flags' vacío`);
  else c.flags.forEach((f, i) => { if (!f.flag || !f.description) errors.push(`${where}: flags[${i}] incompleto`); });
  if (!c.example?.command || !c.example?.explanation) errors.push(`${where}: 'example' incompleto`);
  if (!Array.isArray(c.tags) || !c.tags.length) errors.push(`${where}: 'tags' vacío`);
  if (c.requires !== undefined && typeof c.requires !== "string") errors.push(`${where}: 'requires' debe ser texto`);
}

const count = (f) => commands.filter(f).length;
console.log(`Comandos: ${commands.length} (linux ${count((c) => c.os === "linux")}, windows ${count((c) => c.os === "windows")})`);
for (const cat of categories) console.log(`  ${cat.id.padEnd(11)} ${count((c) => c.category === cat.id)}`);

if (errors.length) {
  console.error(`\n${errors.length} error(es):\n- ` + errors.join("\n- "));
  process.exit(1);
}
console.log("\nOK: dataset válido.");
