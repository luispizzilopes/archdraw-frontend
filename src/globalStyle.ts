import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
:root,
:root[data-theme='dark'] {
  color-scheme: dark;
  --bg: #0e1013;
  --surface: #14171c;
  --surface-2: #1a1e25;
  --surface-3: #222730;
  --border: #272c35;
  --border-strong: #353b47;
  --text: #e6e8ec;
  --text-2: #a4abb8;
  --text-3: #6f7787;
  --accent: #f0b429;
  --accent-fg: #f0b429;
  --accent-ink: #1a1405;
  --accent-soft: color-mix(in srgb, var(--accent) 14%, transparent);
  --danger: #ef6a5e;
  --ok: #5fcf9b;

  --canvas-bg: #101318;
  --grid-dot: #2a303b;
  --node-bg: #1a1e26;
  --node-border: #384050;
  --note-bg: #3a3320;
  --note-border: #6b5c2c;
  --edge-sync: #8e97ab;
  --edge-async: #54c2b0;
  --minimap-mask: rgb(14 16 19 / 70%);
  --minimap-node: #4a5366;

  --cat-apps: #6ea8fe;
  --cat-data: #6fcf97;
  --cat-messaging: #f2994a;
  --cat-infra: #b69cf5;
  --cat-internal: #4fd1c5;
  --cat-context: #e58fb4;
  --cat-structure: #8e97ab;

  --font-sans: 'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --radius: 6px;
  --shadow: 0 8px 28px rgb(0 0 0 / 45%);
}

:root[data-theme='light'] {
  color-scheme: light;
  --bg: #f3f4f6;
  --surface: #ffffff;
  --surface-2: #f6f7f9;
  --surface-3: #eceef2;
  --border: #dfe2e8;
  --border-strong: #c9ced8;
  --text: #171a21;
  --text-2: #4d5565;
  --text-3: #7c8495;
  --accent: #f0b429;
  --accent-fg: #b9770e;
  --accent-ink: #1a1405;
  --danger: #cc3b2d;
  --ok: #1f9d68;

  --canvas-bg: #f7f8fa;
  --grid-dot: #cdd2dc;
  --node-bg: #ffffff;
  --node-border: #b9c0cd;
  --note-bg: #fff6d6;
  --note-border: #e2c765;
  --edge-sync: #5d6678;
  --edge-async: #17917f;
  --minimap-mask: rgb(243 244 246 / 70%);
  --minimap-node: #b9c0cd;

  --cat-apps: #2f6fdc;
  --cat-data: #1f9d68;
  --cat-messaging: #d9731a;
  --cat-infra: #7c5cd6;
  --cat-internal: #108f86;
  --cat-context: #c2487f;
  --cat-structure: #5d6678;
  --shadow: 0 8px 28px rgb(20 24 33 / 16%);
}

*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, p { margin: 0; }
h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; }
h2 { font-size: 16px; font-weight: 600; }
h3 { font-size: 13px; font-weight: 600; }
a { color: inherit; text-decoration: none; }
button, input, select, textarea { font: inherit; color: inherit; }
button { cursor: pointer; }
button:disabled { cursor: default; }
:focus-visible { outline: 2px solid var(--accent-fg); outline-offset: 1px; }
kbd {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 1px 6px;
  border: 1px solid var(--border-strong);
  border-bottom-width: 2px;
  border-radius: 4px;
  background: var(--surface-2);
  color: var(--text-2);
  white-space: nowrap;
}
::selection { background: color-mix(in srgb, var(--accent) 35%, transparent); }
* { scrollbar-width: thin; scrollbar-color: var(--border-strong) transparent; }

.muted { color: var(--text-2); }
.small { font-size: 12px; }
.mono { font-family: var(--font-mono); }
.row { display: flex; align-items: center; gap: 8px; }
.row.wrap { flex-wrap: wrap; }
.clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.loading { padding: 40px; color: var(--text-2); }
.link { color: var(--accent-fg); display: inline-flex; align-items: center; gap: 4px; }
.link:hover { text-decoration: underline; }

.btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 32px; padding: 0 12px;
  background: var(--surface-2); border: 1px solid var(--border-strong);
  border-radius: var(--radius); font-weight: 500; font-size: 13px; white-space: nowrap;
  transition: background 0.12s, border-color 0.12s;
}
.btn:hover:not(:disabled) { background: var(--surface-3); }
.btn:disabled { opacity: 0.45; }
.btn-primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.btn-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--accent) 88%, white); }
.btn-danger { color: var(--danger); }
.btn-danger:hover:not(:disabled) { background: color-mix(in srgb, var(--danger) 14%, transparent); }
.btn-ghost { background: transparent; border-color: transparent; color: var(--text-2); }
.btn-sm { height: 28px; padding: 0 10px; font-size: 12px; }

.icon-btn {
  display: inline-grid; place-items: center; width: 28px; height: 28px; padding: 0;
  background: transparent; border: 0; border-radius: var(--radius); color: var(--text-2);
}
.icon-btn:hover:not(:disabled) { background: var(--surface-3); color: var(--text); }
.icon-btn.danger:hover { color: var(--danger); }
.icon-btn.mini { width: 22px; height: 22px; margin-left: auto; opacity: 0; }
.icon-btn:disabled { opacity: 0.35; }

.input {
  width: 100%; padding: 6px 9px; min-height: 30px;
  background: var(--bg); border: 1px solid var(--border-strong); border-radius: var(--radius);
  font-size: 13px; resize: vertical;
}
.input:focus { outline: none; border-color: var(--accent-fg); box-shadow: 0 0 0 2px var(--accent-soft); }
select.input { padding-right: 4px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field-label { font-size: 11px; font-weight: 500; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 5px; }
.field .field-label { margin-bottom: 0; }
.field-hint { font-size: 11.5px; color: var(--text-3); }
.form { display: flex; flex-direction: column; gap: 14px; }
.check { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 3px 0; cursor: pointer; }
.check input { accent-color: var(--accent); }

.segmented { display: inline-flex; padding: 2px; background: var(--bg); border: 1px solid var(--border); border-radius: 7px; }
.segmented button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 0; background: transparent; height: 26px; padding: 0 11px; font-size: 12px; font-weight: 500; color: var(--text-2); border-radius: 5px; }
.segmented button.on { background: var(--surface-3); color: var(--text); box-shadow: 0 0 0 1px var(--border-strong); }
.segmented.full { display: flex; }
.segmented.full button { flex: 1; padding: 0 4px; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 11px; border-radius: 99px; border: 1px solid var(--border-strong); background: var(--bg); font-size: 12px; }
.chip:hover:not(:disabled) { border-color: var(--text-3); }
.chip.on { background: var(--accent-soft); border-color: var(--accent-fg); color: var(--text); }
.chip.chip-pattern.on { background: color-mix(in srgb, var(--cat-internal) 16%, transparent); border-color: var(--cat-internal); }
.chip:disabled { opacity: 0.35; text-decoration: line-through; }
.chip em { font-style: normal; font-size: 10px; color: var(--accent-fg); text-transform: uppercase; letter-spacing: 0.05em; }
.arch-picker { display: flex; flex-direction: column; gap: 14px; }

.badges { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
.badges:empty { display: none; }
.badge { font-size: 11px; padding: 1px 8px; border-radius: 4px; border: 1px solid var(--border-strong); color: var(--text-2); font-family: var(--font-mono); }
.badge-style.primary { border-color: var(--accent-fg); color: var(--accent-fg); }
.badge-pattern { border-style: dashed; border-color: var(--cat-internal); color: var(--cat-internal); }

.save-status { font-size: 12px; color: var(--text-3); white-space: nowrap; }
.save-status.saving::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-fg); margin-right: 6px; animation: pulse 1s infinite; }
.save-status.saved::before { content: ''; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--ok); margin-right: 6px; }
.save-status.error, .save-status.conflict { color: var(--danger); }
@keyframes pulse { 50% { opacity: 0.3; } }

.modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgb(5 7 10 / 62%); display: grid; place-items: center; padding: 24px; animation: fade 0.12s; }
.modal { max-width: 100%; max-height: 90vh; display: flex; flex-direction: column; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 10px; box-shadow: var(--shadow); animation: rise 0.16s ease-out; }
.modal-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px 12px 20px; border-bottom: 1px solid var(--border); }
.modal-body { padding: 18px 20px; overflow: auto; }
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--border); }
@keyframes fade { from { opacity: 0; } }
@keyframes rise { from { opacity: 0; transform: translateY(6px) scale(0.99); } }

.menu-wrap { position: relative; display: inline-block; }
.menu { position: absolute; top: calc(100% + 4px); z-index: 60; min-width: 230px; padding: 4px; background: var(--surface-2); border: 1px solid var(--border-strong); border-radius: 8px; box-shadow: var(--shadow); }
.menu-right { right: 0; }
.menu-left { left: 0; }
.menu-item { display: flex; align-items: center; gap: 9px; width: 100%; padding: 7px 10px; border: 0; background: transparent; border-radius: 5px; text-align: left; font-size: 13px; }
.menu-item:hover:not(:disabled) { background: var(--surface-3); }
.menu-item:disabled { opacity: 0.4; }
.menu-item.danger { color: var(--danger); }
.menu-item kbd { margin-left: auto; }
.menu-up { top: auto; bottom: calc(100% + 6px); }
.menu-sep { height: 1px; background: var(--border); margin: 4px 2px; }

.toasts { position: fixed; right: 18px; bottom: 18px; z-index: 200; display: flex; flex-direction: column; gap: 8px; }
.toast { padding: 10px 14px; border-radius: 8px; background: var(--surface-3); border: 1px solid var(--border-strong); box-shadow: var(--shadow); font-size: 13px; animation: rise 0.16s; max-width: 380px; }
.toast-error { border-color: var(--danger); }
.toast-success { border-color: var(--ok); }

.tpl-picker { display: flex; flex-direction: column; gap: 16px; }
.tpl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 8px; }
.tpl-card { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 11px 12px; text-align: left; background: var(--bg); border: 1px solid var(--border-strong); border-radius: 8px; color: var(--text-2); }
.tpl-card strong { color: var(--text); font-size: 13px; font-weight: 600; }
.tpl-card span { font-size: 11.5px; line-height: 1.35; }
.tpl-card:hover { border-color: var(--text-3); }
.tpl-card.on { border-color: var(--accent-fg); background: var(--accent-soft); }
.tpl-card.on svg { color: var(--accent-fg); }

.kbd-table { width: 100%; border-collapse: collapse; }
.kbd-table td { padding: 6px 4px; border-bottom: 1px solid var(--border); font-size: 13px; }
.kbd-table td:first-child { width: 55%; }

.shell { display: grid; grid-template-columns: 252px 1fr; height: 100%; }
.sidebar { display: flex; flex-direction: column; gap: 4px; padding: 14px 10px; background: var(--surface); border-right: 1px solid var(--border); min-height: 0; }
.brand { display: flex; align-items: center; gap: 9px; padding: 4px 8px 16px; font-family: var(--font-mono); font-weight: 600; font-size: 15px; letter-spacing: -0.02em; color: var(--accent-fg); }
.nav { display: flex; flex-direction: column; gap: 2px; }
.nav a { display: flex; align-items: center; gap: 10px; padding: 7px 10px; border-radius: var(--radius); color: var(--text-2); font-weight: 500; }
.nav a:hover { background: var(--surface-2); color: var(--text); }
.nav a.active { background: var(--surface-3); color: var(--text); box-shadow: inset 2px 0 0 var(--accent); }
.nav-bottom { margin-top: auto; }
.side-section { margin-top: 18px; flex: 1; overflow: auto; min-height: 0; }
.side-title { padding: 0 10px 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-3); font-weight: 500; }
.side-empty { padding: 4px 10px; font-size: 12px; color: var(--text-3); }
.recent { display: flex; gap: 9px; padding: 6px 10px; border-radius: var(--radius); color: var(--text-2); align-items: flex-start; }
.recent svg { margin-top: 3px; flex: none; }
.recent:hover { background: var(--surface-2); color: var(--text); }
.recent.active { background: var(--surface-3); color: var(--text); }
.recent-text { display: flex; flex-direction: column; min-width: 0; font-size: 13px; }
.recent-text > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.recent-text small { font-size: 11px; color: var(--text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.main { overflow: auto; min-width: 0; }

.page { max-width: 1120px; margin: 0 auto; padding: 32px 36px 56px; display: flex; flex-direction: column; gap: 22px; }
.page.narrow { max-width: 720px; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.page-head > div:first-child { display: flex; flex-direction: column; gap: 4px; }
.crumbs { display: flex; align-items: center; gap: 4px; color: var(--text-3); font-size: 12.5px; margin-bottom: -10px; }
.crumbs a:hover { color: var(--text); }
.section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-2); font-weight: 500; margin-bottom: 10px; }
.section-row { display: flex; justify-content: space-between; align-items: baseline; }
.section-row .section-title { margin-bottom: 10px; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat { display: flex; flex-direction: column; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text-2); font-size: 12.5px; }
.stat-n { font-family: var(--font-mono); font-size: 28px; font-weight: 500; color: var(--text); line-height: 1.1; }
.skeleton { display: block; border-radius: 6px; background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; }
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid var(--border-strong); border-top-color: var(--accent-fg); border-radius: 50%; animation: spin 0.7s linear infinite; }
.stat-n .spinner { width: 22px; height: 22px; margin: 3px 0; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .skeleton, .spinner { animation-duration: 3s; } }
.empty, .empty-hero { padding: 28px; border: 1px dashed var(--border-strong); border-radius: 10px; color: var(--text-2); text-align: center; }
.empty-hero { text-align: left; display: flex; flex-direction: column; gap: 10px; background: var(--surface); border-style: solid; border-color: var(--border); }
.empty-hero .row { margin-top: 6px; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.card { display: flex; flex-direction: column; gap: 5px; padding: 14px 15px; background: var(--surface); border: 1px solid var(--border); border-radius: 9px; transition: border-color 0.12s, transform 0.12s; }
.card-link { cursor: pointer; }
.card-link:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.card-link:focus-visible { outline-offset: 2px; }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.card-title { font-weight: 600; font-size: 14px; }
.card-foot { display: flex; justify-content: space-between; margin-top: auto; padding-top: 10px; font-size: 11.5px; color: var(--text-3); }

.searchbar { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 36px; background: var(--surface); border: 1px solid var(--border-strong); border-radius: 8px; color: var(--text-3); }
.searchbar:focus-within { border-color: var(--accent-fg); }
.searchbar input { flex: 1; background: transparent; border: 0; outline: 0; height: 100%; color: var(--text); font-size: 13px; }
.searchbar.compact { height: 30px; border-radius: var(--radius); margin: 0 10px 8px; }

.list { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 9px; background: var(--surface); }
.list-row { display: grid; grid-template-columns: 1fr auto auto; gap: 20px; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border); }
.list-row:last-child { border-bottom: 0; }
.list-row:hover { background: var(--surface-2); }
.list-main { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.list-meta { text-align: right; line-height: 1.5; }
.row-actions { display: flex; }

.tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--border); margin-bottom: -4px; }
.tabs button { padding: 9px 14px; background: transparent; border: 0; border-bottom: 2px solid transparent; color: var(--text-2); font-weight: 500; margin-bottom: -1px; }
.tabs button:hover { color: var(--text); }
.tabs button.on { color: var(--text); border-bottom-color: var(--accent); }
.count { font-family: var(--font-mono); font-size: 11px; color: var(--text-3); margin-left: 4px; }
.doc-frame { height: calc(100vh - 290px); min-height: 440px; border: 1px solid var(--border); border-radius: 9px; overflow: hidden; background: var(--surface); }

.panel { padding: 16px 18px; background: var(--surface); border: 1px solid var(--border); border-radius: 9px; display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
.password-input { position: relative; display: block; }
.password-input .input { width: 100%; padding-right: 38px; }
.password-toggle { position: absolute; top: 50%; right: 4px; transform: translateY(-50%); }
.panel.stretch { align-items: stretch; gap: 16px; }
.panel-head { display: flex; align-items: flex-start; gap: 12px; }
.panel-icon { flex: none; display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; background: var(--accent-soft); color: var(--accent-fg); }
.panel-head h3 { font-size: 14px; font-weight: 600; margin: 0; }
.panel-head p { margin: 2px 0 0; }
.panel-foot { display: flex; justify-content: flex-end; gap: 8px; padding-top: 14px; border-top: 1px solid var(--border); }
.setting-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 0; border-top: 1px solid var(--border); }
.setting-row:first-of-type { border-top: 0; }
.setting-text { display: flex; flex-direction: column; gap: 2px; font-size: 13.5px; }
.setting-text .muted { font-size: 12px; }
.switch { appearance: none; flex: none; width: 36px; height: 20px; border-radius: 99px; background: var(--surface-3); border: 1px solid var(--border-strong); position: relative; cursor: pointer; transition: background 0.15s; }
.switch::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--text-2); transition: transform 0.15s, background 0.15s; }
.switch:checked { background: var(--accent); border-color: var(--accent); }
.switch:checked::after { transform: translateX(16px); background: var(--accent-ink); }
.switch:focus-visible { outline: 2px solid var(--accent-fg); outline-offset: 2px; }
.profile-hero { display: flex; align-items: center; gap: 18px; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; }
.profile-hero-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.profile-hero-info strong { font-size: 17px; }
.profile-hero-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.panel.danger-zone { border-color: color-mix(in srgb, var(--danger) 35%, var(--border)); }
.panel .segmented { align-self: flex-start; }

.editor { display: flex; flex-direction: column; height: 100%; background: var(--bg); }
.ed-head { display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 12px; background: var(--surface); border-bottom: 1px solid var(--border); flex: none; }
.ed-crumbs { display: flex; align-items: center; gap: 6px; color: var(--text-3); font-size: 13px; min-width: 0; }
.ed-crumbs a:hover { color: var(--text); }
.ed-name { background: transparent; border: 1px solid transparent; border-radius: 5px; color: var(--text); font-weight: 600; font-size: 14px; padding: 3px 7px; width: 280px; max-width: 34vw; }
.ed-name:hover { border-color: var(--border-strong); }
.ed-name:focus { outline: none; border-color: var(--accent-fg); background: var(--bg); }
.tb-spacer { flex: 1; }

.toolbar { display: flex; align-items: center; gap: 4px; padding: 5px 10px; background: var(--surface); border-bottom: 1px solid var(--border); flex: none; flex-wrap: wrap; }
.tb-group { display: flex; align-items: center; gap: 1px; padding-right: 6px; margin-right: 4px; border-right: 1px solid var(--border); }
.tb-group:last-child { border-right: 0; }
.tb-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-width: 30px; height: 30px; padding: 0 6px; border: 0; background: transparent; border-radius: 6px; color: var(--text-2); font-size: 12.5px; }
.tb-btn.wide { padding: 0 10px; }
.tb-btn:hover:not(:disabled) { background: var(--surface-3); color: var(--text); }
.tb-btn:disabled { opacity: 0.32; }
.tb-btn.on { background: var(--accent-soft); color: var(--accent-fg); }
.tb-zoom { min-width: 48px; height: 30px; border: 0; background: transparent; color: var(--text-2); font-family: var(--font-mono); font-size: 12px; border-radius: 6px; }
.tb-zoom:hover { background: var(--surface-3); }
.tb-select { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-3); }
.tb-select select { height: 28px; background: var(--bg); border: 1px solid var(--border-strong); border-radius: 6px; padding: 0 6px; font-size: 12.5px; }

.ed-body { flex: 1; min-height: 0; display: flex; }
.ed-center { flex: 1; min-width: 0; display: flex; }
.ed-canvas { flex: 1 1 0; min-width: 0; position: relative; }
.ed-canvas > .react-flow { position: absolute; inset: 0; }
.ed-doc { flex: 1 1 0; min-width: 0; border-left: 1px solid var(--border); background: var(--surface); }
.editor[data-view='doc'] .ed-canvas { display: none; }
.editor[data-view='doc'] .ed-doc { border-left: 0; }
.editor[data-view='split'] .ed-canvas { flex-basis: 55%; }
.editor[data-view='split'] .ed-doc { flex-basis: 45%; }

.library, .props { flex: none; display: flex; flex-direction: column; background: var(--surface); min-height: 0; }
.library { width: 248px; border-right: 1px solid var(--border); }
.props { width: 308px; border-left: 1px solid var(--border); }
.panel-title { padding: 11px 14px 9px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); }
.library-scroll, .props-scroll { overflow: auto; flex: 1; min-height: 0; }
.library-scroll { padding: 0 6px 16px; }
.lib-cat { display: flex; align-items: center; gap: 6px; width: 100%; padding: 8px 6px 5px; margin-top: 6px; background: transparent; border: 0; color: var(--text-2); font-size: 11.5px; font-weight: 600; text-align: left; }
.lib-cat.static { cursor: default; padding-left: 8px; }
.lib-cat .dot { width: 7px; height: 7px; border-radius: 2px; background: var(--accent); }
.lib-item { display: flex; align-items: center; gap: 10px; padding: 6px 10px; margin-left: 8px; border-radius: 6px; color: var(--text-2); font-size: 13px; cursor: grab; border: 1px solid transparent; }
.lib-item svg { color: var(--accent); flex: none; }
.lib-item:hover { background: var(--surface-3); color: var(--text); border-color: var(--border); }
.lib-item:hover .icon-btn.mini { opacity: 1; }
.lib-item:active { cursor: grabbing; }

.props-scroll { padding: 0 14px 24px; }
.props-form { display: flex; flex-direction: column; gap: 12px; }
.props-kicker { display: flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 11.5px; color: var(--accent, var(--accent-fg)); text-transform: uppercase; letter-spacing: 0.05em; }
.props-sep { height: 1px; background: var(--border); margin: 4px 0; }
.kv { display: grid; grid-template-columns: 1fr 1.3fr auto; gap: 6px; align-items: center; }
.kv a.icon-btn { grid-column: 3; }
.route { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; padding: 8px 10px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; }
.ids { margin: 0; display: grid; gap: 4px; }
.ids dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-3); margin-top: 6px; }
.ids dd { margin: 0; overflow-wrap: anywhere; }
.link-btn { display: flex; align-items: center; gap: 7px; background: transparent; border: 0; padding: 4px 0; color: var(--accent-fg); text-align: left; }
.link-btn:hover { text-decoration: underline; }

.react-flow { --xy-background-color: var(--canvas-bg); --xy-edge-stroke-default: var(--edge-sync); --xy-selection-background-color-default: color-mix(in srgb, var(--accent-fg) 10%, transparent); --xy-selection-border-default: 1px dashed var(--accent-fg); background: var(--canvas-bg); font-family: var(--font-sans); }
.react-flow__node { cursor: default; }
.react-flow__node.is-boundary { pointer-events: none !important; }
.is-boundary .boundary-label, .is-boundary .rs-handle, .is-boundary .rs-line, .is-boundary .arch-handle { pointer-events: auto; }
.react-flow__pane.draggable { cursor: default; }
.react-flow__nodesselection-rect { border-radius: 6px; }
.minimap.react-flow__minimap { background: var(--surface); border: 1px solid var(--border-strong); border-radius: 8px; }

.arch-node { position: relative; width: 100%; height: 100%; min-height: 0; padding: 7px 11px 8px; background: var(--node-bg); border: 1px solid var(--node-border); border-left: 3px solid var(--accent); border-radius: 7px; display: flex; flex-direction: column; justify-content: center; gap: 2px; transition: border-color 0.1s, box-shadow 0.1s; }
.arch-node:hover { border-color: color-mix(in srgb, var(--accent) 60%, var(--node-border)); }
.arch-node.selected { border-color: var(--accent-fg); box-shadow: 0 0 0 1px var(--accent-fg), 0 4px 16px rgb(0 0 0 / 25%); }
.node-head { display: flex; align-items: center; gap: 6px; color: var(--accent); font-family: var(--font-mono); font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.07em; }
.node-head .node-type { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.node-name { font-weight: 600; font-size: 13px; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.node-tech { font-family: var(--font-mono); font-size: 10.5px; color: var(--text-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.node-link { position: absolute; right: 6px; bottom: 5px; display: inline-flex; align-items: center; gap: 3px; font-size: 9.5px; font-family: var(--font-mono); color: var(--accent-fg); background: var(--accent-soft); padding: 1px 5px; border-radius: 3px; }
.tag { margin-left: auto; font-style: normal; font-size: 9px; padding: 0 5px; border: 1px dashed var(--cat-internal); border-radius: 3px; color: var(--cat-internal); text-transform: none; letter-spacing: 0; white-space: nowrap; }

.shape-cylinder { border-radius: 14px / 16px; border-left-width: 1px; border-top: 1px solid var(--node-border); padding-top: 18px; }
.shape-cylinder::before { content: ''; position: absolute; left: -1px; right: -1px; top: 0; height: 22px; border-bottom: 1px solid var(--node-border); border-radius: 50%; background: color-mix(in srgb, var(--accent) 9%, transparent); }
.shape-cylinder > .node-head, .shape-cylinder > .node-name, .shape-cylinder > .node-tech { position: relative; }
.shape-cylinder.selected::before { border-bottom-color: var(--accent-fg); }
.shape-pill { border-radius: 999px; padding-left: 20px; padding-right: 20px; border-left-width: 1px; }
.shape-pill .node-head { color: var(--accent); }
.shape-external { border-style: dashed; border-left-style: dashed; background: transparent; }
.shape-actor { border-radius: 14px; border-left-width: 1px; align-items: center; text-align: center; }
.shape-actor .node-head { justify-content: center; }
.shape-boundary { background: color-mix(in srgb, var(--accent) 4%, transparent); border: 1.5px dashed color-mix(in srgb, var(--accent) 55%, var(--node-border)); border-left-width: 1.5px; border-radius: 12px; justify-content: flex-start; padding: 0; overflow: visible; pointer-events: none; }
.shape-boundary.selected { border-color: var(--accent-fg); box-shadow: none; }
.boundary-label { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start; margin: 8px 0 0 10px; padding: 3px 9px; border-radius: 5px; background: color-mix(in srgb, var(--accent) 14%, var(--canvas-bg)); color: var(--text); font-size: 12px; font-weight: 600; cursor: grab; }
.boundary-label svg { color: var(--accent); }
.shape-note { background: var(--note-bg); border: 1px solid var(--note-border); border-left-width: 1px; border-radius: 3px; justify-content: flex-start; padding: 9px 11px; }
.note-body { font-size: 12px; line-height: 1.4; overflow: hidden; }
.note-body strong { display: block; margin-bottom: 3px; }
.note-body p { color: var(--text-2); white-space: pre-wrap; }

.arch-handle.react-flow__handle { width: 10px; height: 10px; background: var(--surface); border: 2px solid var(--accent-fg); opacity: 0; transition: opacity 0.1s; }
.react-flow__node:hover .arch-handle, .react-flow__node.selected .arch-handle, .arch-handle.connectingfrom, .arch-handle.connectingto { opacity: 1; }
.arch-handle:hover { background: var(--accent-fg); }
.react-flow__handle-top { top: -5px; } .react-flow__handle-bottom { bottom: -5px; } .react-flow__handle-left { left: -5px; } .react-flow__handle-right { right: -5px; }
.rs-handle.react-flow__resize-control.handle { width: 9px; height: 9px; border-radius: 2px; background: var(--accent-fg); border: 1px solid var(--surface); }
.rs-line.react-flow__resize-control.line { border-color: var(--accent-fg); }

.react-flow__edge-path { transition: stroke 0.1s; }
.react-flow__edge:hover .react-flow__edge-path { stroke-width: 3; }
.edge-chip { position: absolute; display: inline-flex; align-items: center; gap: 4px; max-width: 220px; padding: 1px 6px; background: var(--surface-2); border: 1px solid var(--border-strong); border-radius: 4px; font-family: var(--font-mono); font-size: 10px; color: var(--text-2); pointer-events: all; white-space: nowrap; }
.edge-chip.async { border-style: dashed; }
.edge-chip.selected { border-color: var(--accent-fg); color: var(--text); }
.edge-chip b { font-weight: 600; color: var(--text); }
.edge-chip span { overflow: hidden; text-overflow: ellipsis; font-family: var(--font-sans); font-size: 10.5px; }
.edge-chip i { font-style: normal; color: var(--edge-async); font-size: 9px; text-transform: uppercase; }
.react-flow.exporting .arch-handle, .react-flow.exporting .rs-handle, .react-flow.exporting .rs-line { display: none; }
.react-flow.exporting .arch-node.selected { box-shadow: none; border-color: var(--node-border); }

.md-editor { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.md-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 6px 10px; border-bottom: 1px solid var(--border); flex: none; flex-wrap: wrap; }
.md-tools, .md-right { display: flex; align-items: center; gap: 2px; }
.md-right { gap: 12px; }
.md-panes { flex: 1; min-height: 0; display: grid; }
.md-panes.md-split { grid-template-columns: 1fr 1fr; }
.md-input { width: 100%; height: 100%; padding: 18px 20px; resize: none; background: var(--bg); border: 0; outline: 0; font-family: var(--font-mono); font-size: 13px; line-height: 1.65; tab-size: 2; color: var(--text); }
.md-split .md-input { border-right: 1px solid var(--border); }
.md-preview { overflow: auto; padding: 8px 28px 40px; min-height: 0; }
.md { max-width: 780px; line-height: 1.65; color: var(--text); font-size: 14px; }
.md h1 { font-size: 26px; margin: 22px 0 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
.md h2 { font-size: 19px; margin: 26px 0 8px; }
.md h3 { font-size: 15px; margin: 20px 0 6px; }
.md p, .md ul, .md ol, .md table, .md pre, .md blockquote { margin: 0 0 12px; }
.md ul, .md ol { padding-left: 22px; }
.md li > input { margin-right: 6px; accent-color: var(--accent); }
.md a { color: var(--accent-fg); text-decoration: underline; text-underline-offset: 2px; }
.md code { font-family: var(--font-mono); font-size: 12.5px; padding: 1px 5px; background: var(--surface-3); border-radius: 4px; }
.md pre { padding: 12px 14px; background: var(--bg); border: 1px solid var(--border); border-radius: 7px; overflow: auto; }
.md pre code { padding: 0; background: transparent; }
.md blockquote { padding: 2px 14px; border-left: 3px solid var(--accent); color: var(--text-2); }
.md table { border-collapse: collapse; width: 100%; font-size: 13px; }
.md th, .md td { padding: 6px 10px; border: 1px solid var(--border-strong); text-align: left; }
.md th { background: var(--surface-2); font-weight: 600; }
.md hr { border: 0; border-top: 1px solid var(--border); margin: 20px 0; }

@media (max-width: 1100px) {
  .props { width: 270px; } .library { width: 210px; }
}
@media (max-width: 860px) {
  .shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .page { padding: 20px 16px; }
  .library, .props { display: none; }
}

.wp { position: absolute; width: 11px; height: 11px; border-radius: 3px; background: var(--accent-fg); border: 2px solid var(--surface); cursor: move; pointer-events: all; z-index: 5; }
.wp-add { width: 9px; height: 9px; border-radius: 50%; background: var(--surface); border: 2px solid var(--accent-fg); opacity: 0.75; cursor: crosshair; }
.wp-add:hover { opacity: 1; background: var(--accent-fg); }
.react-flow.exporting .wp { display: none; }
.edge-chip.selected { pointer-events: none; }
.react-flow__edgelabel-renderer { z-index: 1100; }
`;
