# MCP Explained

An interactive, animated explainer of the [Model Context Protocol](https://modelcontextprotocol.io): every JSON-RPC message on the wire, step by step.

Live at **https://mcp-explained.com**

- **Start here:** what MCP is, in one definition and one diagram
- **Protocol lessons:** JSON-RPC, lifecycle, transports, authorization, tools, resources, prompts, sampling, elicitation, roots, progress, tasks
- **Spec time machine:** each flow as it worked in 2024-11-05, 2025-03-26, 2025-06-18, 2025-11-25 and 2026-07-28
- **Harness techniques:** tool search and codemode, with and without a gateway
- **Break it:** tool poisoning, tool shadowing, token passthrough, prompt injection, elicitation phishing
- **Coming to MCP:** Skills over MCP, MCP Apps, Server Cards

Every lesson links to the official spec. Corrections welcome: open an issue or a PR.

## How it's built

It's one self-contained HTML file (`public/index.html`): lesson data and the renderer are plain JavaScript, with no build step or dependencies. Open it in a browser to run it locally.

Lessons are objects in the `LESSONS` array. Each has a summary, facts and steps, and each step is a list of messages (`from`, `to`, `kind`, `json`, `notes`). Spec-version differences live in `TM[lessonId][version]`.

It's served as static assets by a Cloudflare Worker (`wrangler.jsonc`):

```sh
npx wrangler dev      # local preview
npx wrangler deploy   # deploy
```

## 中文版 / Chinese

This fork adds a Simplified Chinese translation with an in-page language toggle (top right). The language is picked from `?lang=zh|en`, then the last choice (localStorage), then the browser language.

- `public/zh.js`: exact-string dictionary, English source text → Chinese. Wire payloads (`json`) are never translated.
- `public/i18n.js`: `T()` lookup, `F()` templates, static-markup pass and the toggle. The renderer's `esc()` runs every displayed string through `T()`, so lesson data in `index.html` stays untouched and upstream changes merge cleanly.
- After merging upstream, run `node tools/i18n-missing.js` to list new strings that need a translation, then add them to `zh.js`. Entries whose value equals the key mean "reviewed, keep in English".

中文翻译由社区完成，术语以 MCP 官方规范为准；发现翻译问题欢迎提 issue / PR。

Made by [Runlayer](https://runlayer.com).
