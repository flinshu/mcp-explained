#!/usr/bin/env node
// Lists English display strings in public/index.html that have no entry in public/zh.js.
// Run after merging upstream:  node tools/i18n-missing.js  [> missing.json]
// Then translate the printed strings and add them to zh.js.
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "public");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const win = {};
new Function("window", fs.readFileSync(path.join(root, "zh.js"), "utf8"))(win);
const zh = win.I18N_ZH || {};

const names = ["LESSONS", "TM", "WHATS_NEXT", "GROUPS", "LAYERS", "GROUP_HEAD", "GROUP_LABEL", "A", "Z", "VERSIONS"];
const data = new Function(scripts[0] + "\nreturn {" + names.join(",") + "};")();
const r = scripts[1];
const grab = (a, b) => { const i = r.indexOf(a); return i < 0 ? "{}" : r.slice(i, r.indexOf(b, i)); };
const objOf = (decl, end) => new Function(grab(decl, end).replace(/^const \w+ =/, "return"))();
const PLAIN = objOf("const PLAIN = {", "// PLAIN:END");
const RISKS = objOf("const RISKS = {", "const riskOf");

// Keys whose values are identifiers, not display text.
const SKIP = new Set(["json", "id", "icon", "kind", "from", "to", "ids", "group", "mono", "layer", "args", "tool"]);
const out = new Set();
const add = (s) => {
  if (typeof s !== "string" || /^https?:\/\/|^#/.test(s) || !/[A-Za-z]/.test(s) || /^\d{4}-\d\d-\d\d$/.test(s)) return;
  if (!(s in zh) && !/^[\w./:@\-\[\]{}#*|$]+$/.test(s)) out.add(s); // bare identifiers may legitimately stay English
};
const walk = (v) => {
  if (typeof v === "string") return add(v);
  if (!v || typeof v !== "object") return;
  if (Array.isArray(v)) return v.forEach(walk);
  for (const k in v) if (!SKIP.has(k)) walk(v[k]);
};
names.forEach((n) => walk(data[n]));
Object.values(PLAIN).forEach(add);
walk(RISKS);
// Strings passed to T("...") / F("...") in the renderer.
for (const m of r.matchAll(/\b[TF]\("((?:[^"\\]|\\.)+)"/g)) add(JSON.parse('"' + m[1] + '"'));

const list = [...out];
console.error(`${list.length} untranslated string(s)`);
console.log(JSON.stringify(list, null, 1));
