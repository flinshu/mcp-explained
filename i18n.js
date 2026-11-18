// i18n for MCP Explained. English stays the source of truth in index.html;
// other languages are exact-string dictionaries (see zh.js) applied at display time.
(() => {
  const DICTS = { zh: window.I18N_ZH || {} };
  const SUPPORTED = ["en", "zh"];
  const norm = (l) => (l && String(l).toLowerCase().startsWith("zh") ? "zh" : l && String(l).toLowerCase().startsWith("en") ? "en" : null);
  const pick = () => {
    const q = norm(new URLSearchParams(location.search).get("lang"));
    if (q) return q;
    try { const s = norm(localStorage.getItem("mcpx-lang")); if (s) return s; } catch (e) {}
    return norm(navigator.language) || "en";
  };
  const lang = pick();
  const dict = DICTS[lang] || null;

  // Exact lookup, tolerant of surrounding whitespace and a trailing arrow (" ↗", " →").
  const T = (s) => {
    if (!dict || s == null) return s;
    s = String(s);
    if (Object.prototype.hasOwnProperty.call(dict, s)) return dict[s];
    const m = s.match(/^(\s*)([\s\S]*?)(\s*(?: ?[↗→])?\s*)$/);
    if (m && m[2] && m[2] !== s && Object.prototype.hasOwnProperty.call(dict, m[2])) return m[1] + dict[m[2]] + m[3];
    if (MISSES && /[A-Za-z]/.test(s) && !/^[\s\S]*[⺀-鿿]/.test(s)) MISSES.add(s);
    return s;
  };
  // ?i18ndebug: collect strings T() could not translate in window.I18N.misses (for finding gaps).
  const MISSES = new URLSearchParams(location.search).has("i18ndebug") ? new Set() : null;
  // Templates: F("Step {0} of {1}", 2, 5). The English template is the key.
  const F = (tpl, ...args) => String(T(tpl)).replace(/\{(\d)\}/g, (_, i) => (args[i] == null ? "" : args[i]));
  // Visual width in "Latin character" units: CJK and full-width glyphs count ~1.8.
  const vlen = (s) => { let n = 0; for (const c of String(s)) n += c.codePointAt(0) >= 0x2e80 ? 1.8 : 1; return n; };

  // Translate the static markup once (text nodes + a few attributes).
  const applyStatic = (root = document.body) => {
    if (!dict) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement && n.parentElement.closest("script,style,svg,pre,code") ? NodeFilter.FILTER_REJECT : /[A-Za-z]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    for (const n of nodes) { const t = T(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; }
    for (const a of ["title", "aria-label", "placeholder"]) root.querySelectorAll("[" + a + "]").forEach((e) => { const v = e.getAttribute(a), t = T(v); if (t !== v) e.setAttribute(a, t); });
  };

  const setLang = (l) => {
    try { localStorage.setItem("mcpx-lang", l); } catch (e) {}
    const u = new URL(location.href); u.searchParams.delete("lang"); location.href = u.toString();
  };
  const addToggle = () => {
    const box = document.querySelector("header .theme");
    if (!box || document.getElementById("btn-lang")) return;
    const b = document.createElement("button");
    b.type = "button"; b.id = "btn-lang"; b.className = "lang";
    b.textContent = lang === "zh" ? "EN" : "中文";
    b.title = b.ariaLabel = lang === "zh" ? "Switch to English" : "切换到中文";
    b.addEventListener("click", () => setLang(lang === "zh" ? "en" : "zh"));
    box.prepend(b);
  };

  if (lang === "zh") {
    document.documentElement.lang = "zh-CN";
    document.documentElement.classList.add("lang-zh");
    if (dict["MCP Explained · how the Model Context Protocol works"]) document.title = dict["MCP Explained · how the Model Context Protocol works"];
  }
  window.I18N = { lang, supported: SUPPORTED, T, F, vlen, applyStatic, addToggle, setLang, misses: MISSES };
})();
