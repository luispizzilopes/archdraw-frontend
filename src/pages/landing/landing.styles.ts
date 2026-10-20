import styled from 'styled-components';

export const LandingRoot = styled.div`
  min-height: 100%;
  overflow-x: clip;
  background: var(--bg);
  color: var(--text);
  --ease: cubic-bezier(0.22, 0.7, 0.2, 1);

  .skip { position: absolute; left: 12px; top: -48px; z-index: 300; padding: 8px 12px; background: var(--accent); color: var(--accent-ink); border-radius: 6px; font-weight: 600; }
  .skip:focus { top: 10px; }
  .l-wrap { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 24px; }
  .mono { font-family: var(--font-mono); }

  /* ---------- header ---------- */
  .l-header { position: sticky; top: 0; z-index: 50; background: color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border); }
  .l-header-in { display: flex; align-items: center; gap: 24px; height: 56px; }
  .l-brand { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-mono); font-weight: 600; font-size: 15px; letter-spacing: -0.02em; color: var(--accent-fg); }
  .l-nav { display: flex; gap: 4px; margin-left: 12px; }
  .l-nav a { padding: 6px 10px; border-radius: var(--radius); color: var(--text-2); font-weight: 500; }
  .l-nav a:hover { color: var(--text); background: var(--surface-2); }
  .l-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; }

  /* ---------- hero ---------- */
  .l-hero { position: relative; padding: 72px 0 56px; overflow: hidden; border-bottom: 1px solid var(--border);
    background: radial-gradient(circle at 1px 1px, var(--grid-dot) 1px, transparent 0) 0 0 / 24px 24px; }
  .l-hero::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(to bottom, transparent 55%, var(--bg)), radial-gradient(ellipse at 20% 30%, var(--bg) 0, transparent 62%); }
  .l-hero .l-wrap { position: relative; z-index: 1; display: grid; gap: 56px; }
  .l-hero .l-wrap > * { min-width: 0; }
  .l-hero-copy { max-width: 760px; display: flex; flex-direction: column; align-items: flex-start; gap: 20px; }
  .l-pill { display: inline-flex; align-items: center; gap: 7px; height: 28px; padding: 0 12px; border: 1px solid var(--border-strong); border-radius: 99px; background: var(--surface); color: var(--text-2); font-size: 12.5px; transition: border-color .15s, color .15s; }
  .l-pill:hover { border-color: var(--accent-fg); color: var(--text); }
  .l-pill svg:first-child { color: var(--accent-fg); }
  .l-hero h1 { font-size: clamp(36px, 6vw, 62px); line-height: 1.04; letter-spacing: -0.035em; font-weight: 600; }
  .l-hero h1 span { color: var(--accent-fg); }
  .l-lead { font-size: clamp(15px, 1.6vw, 18px); line-height: 1.6; color: var(--text-2); max-width: 640px; }
  .l-cta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
  .l-cta.center { justify-content: center; }
  .l-cta .btn-lg { height: 42px; padding: 0 18px; font-size: 14px; }
  .l-cta .btn { transition: background .12s, border-color .12s, transform .12s; }
  .l-cta .btn:active { transform: translateY(1px); }
  .l-facts { display: flex; flex-wrap: wrap; gap: 6px 18px; margin: 4px 0 0; padding: 0; list-style: none; font-size: 12px; color: var(--text-3); }
  .l-facts li::before { content: '/'; margin-right: 18px; color: var(--border-strong); }
  .l-facts li:first-child::before { display: none; }

  .hero-window { border: 1px solid var(--border-strong); border-radius: 12px; background: var(--surface); box-shadow: var(--shadow), 0 0 0 6px color-mix(in srgb, var(--surface) 55%, transparent); overflow: hidden; }
  .hero-chrome { display: flex; align-items: center; gap: 12px; height: 40px; padding: 0 14px; border-bottom: 1px solid var(--border); background: var(--surface-2); }
  .dots { display: inline-flex; gap: 6px; } .dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--border-strong); }
  .hero-title { flex: 1; font-size: 12px; color: var(--text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hero-canvas { background: var(--canvas-bg) radial-gradient(circle at 1px 1px, var(--grid-dot) 1.2px, transparent 0) 0 0 / 20px 20px; padding: 18px 16px; }

  /* ---------- stage (palco compartilhado pelas demos) ---------- */
  .stage-wrap { position: relative; width: 100%; }
  .stage-scroll { position: absolute; inset: 0; overflow-x: auto; overflow-y: hidden; }
  .stage-box { position: relative; }
  .stage { position: absolute; left: 0; top: 0; transform-origin: top left; }
  .stage-edges { position: absolute; inset: 0; overflow: visible; pointer-events: none; }
  .stage-edge path.draw, .stage-edge path.fade { opacity: 0; transition: opacity .35s var(--ease), stroke .15s; }
  .stage-edge.on path.fade { opacity: 1; }
  .stage-edge path.draw { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset .6s var(--ease), opacity .2s, stroke .15s; }
  .stage-edge.on path.draw { opacity: 1; stroke-dashoffset: 0; }
  .stage-edge:not(.on) marker, .stage-edge:not(.on) .packet { display: none; }
  .stage-node { position: absolute; opacity: 0; transform: translateY(8px) scale(0.96); pointer-events: none; transition: opacity .35s var(--ease), transform .4s var(--ease), border-color .1s, box-shadow .1s; }
  .stage-node.on { opacity: 1; transform: none; pointer-events: auto; }
  .stage-node.clickable { cursor: pointer; }
  .stage-node.clickable:hover { border-color: color-mix(in srgb, var(--accent) 70%, var(--node-border)); transform: translateY(-1px); }
  .stage-node .node-link { animation: nudge 2.2s ease-in-out infinite; }
  .stage-node.shape-cylinder, .stage-node.shape-pill, .stage-node.shape-actor { overflow: visible; }
  .stage-chip { transform: translate(-50%, -50%); opacity: 0; transition: opacity .3s .25s; pointer-events: none; z-index: 2; }
  .stage-chip.on { opacity: 1; }
  @keyframes nudge { 50% { transform: translateY(-2px); background: color-mix(in srgb, var(--accent-fg) 24%, transparent); } }

  /* ---------- sections ---------- */
  .l-section { padding: 88px 0; }
  .l-alt { background: var(--surface); border-block: 1px solid var(--border); }
  .l-head { max-width: 680px; margin-bottom: 36px; display: flex; flex-direction: column; gap: 10px; }
  .l-kicker { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent-fg); }
  .l-section h2, .l-final h2 { font-size: clamp(26px, 3.4vw, 38px); line-height: 1.15; letter-spacing: -0.025em; font-weight: 600; }
  .l-sub { color: var(--text-2); font-size: 16px; line-height: 1.6; }

  .l-tabs { display: flex; gap: 2px; overflow-x: auto; border-bottom: 1px solid var(--border); margin-bottom: 18px; scrollbar-width: none; }
  .l-tabs button { flex: none; padding: 11px 16px; background: transparent; border: 0; border-bottom: 2px solid transparent; margin-bottom: -1px; color: var(--text-2); font-weight: 500; font-size: 14px; transition: color .12s, border-color .12s; }
  .l-tabs button:hover { color: var(--text); }
  .l-tabs button.on { color: var(--text); border-bottom-color: var(--accent); }

  /* ---------- demos ---------- */
  .l-panel:not([hidden]) { animation: enter .35s var(--ease); }
  @keyframes enter { from { opacity: 0; transform: translateY(6px); } }
  .demo { display: flex; flex-direction: column; gap: 12px; }
  .demo-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .demo-bar-text { color: var(--text-2); font-size: 13.5px; max-width: 640px; }
  .demo-ctrl { display: flex; gap: 6px; flex-wrap: wrap; }
  .demo-steps { display: flex; gap: 4px; }
  .step { width: 28px; height: 28px; padding: 0; border-radius: 50%; border: 1px solid var(--border-strong); background: var(--surface); color: var(--text-3); font-family: var(--font-mono); font-size: 11.5px; transition: all .2s; }
  .step:hover { color: var(--text); border-color: var(--text-3); }
  .step.done { border-color: color-mix(in srgb, var(--accent-fg) 55%, var(--border)); color: var(--accent-fg); }
  .step.on { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); font-weight: 600; transform: scale(1.1); }

  .demo-window { display: grid; grid-template-columns: 188px minmax(0, 1fr) 232px; border: 1px solid var(--border-strong); border-radius: 12px; overflow: hidden; background: var(--surface); box-shadow: var(--shadow); }
  .demo-window.single { grid-template-columns: minmax(0, 1fr); }
  .demo-lib, .demo-props { background: var(--surface); display: flex; flex-direction: column; min-width: 0; }
  .demo-lib { border-right: 1px solid var(--border); padding: 0 6px 10px; }
  .demo-props { border-left: 1px solid var(--border); }
  .demo-lib-item { width: 100%; background: transparent; text-align: left; margin-left: 0; cursor: pointer; }
  .demo-lib-item:disabled { opacity: 0.4; cursor: default; }
  .demo-lib-item:disabled:hover { background: transparent; border-color: transparent; }
  .demo-hint { margin: 10px 8px 0; font-size: 12px; color: var(--text-3); line-height: 1.45; }
  .demo-hint.pad { margin: 4px 14px; }
  .demo-canvas { position: relative; padding: 16px; background: var(--canvas-bg) radial-gradient(circle at 1px 1px, var(--grid-dot) 1.2px, transparent 0) 0 0 / 20px 20px; min-height: 260px; display: flex; flex-direction: column; justify-content: center; }
  .demo-canvas > .stage-wrap { width: 100%; }
  .demo-empty { position: absolute; inset: 0; display: grid; place-items: center; color: var(--text-3); font-size: 13px; pointer-events: none; }
  .demo-props-body { padding: 0 14px 18px; animation: enter .25s var(--ease); }
  .demo-input { min-height: 30px; display: flex; align-items: center; font-size: 12.5px; line-height: 1.35; background: var(--bg); }
  .demo-caption { padding: 12px 16px; border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: 8px; background: var(--surface); color: var(--text-2); font-size: 14px; line-height: 1.55; min-height: 52px; }
  .demo-caption strong { color: var(--text); }
  .demo-caption code { font-family: var(--font-mono); font-size: 12px; color: var(--accent-fg); background: var(--accent-soft); padding: 1px 5px; border-radius: 3px; }
  .demo-cta { display: inline-flex; align-items: center; gap: 6px; color: var(--text); }

  .demo-split { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); border: 1px solid var(--border-strong); border-radius: 12px; overflow: hidden; background: var(--surface); box-shadow: var(--shadow); }
  .demo-pane.padded { padding: 20px 22px; }
  .demo-pane + .demo-pane { border-left: 1px solid var(--border); background: var(--surface-2); }
  .demo .chip { transition: background .15s, border-color .15s, opacity .15s; }
  .summary { display: flex; flex-direction: column; gap: 12px; min-height: 280px; }
  .summary-body { display: flex; flex-direction: column; gap: 10px; animation: enter .3s var(--ease); }
  .summary-item { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
  .summary-item p { font-size: 13px; color: var(--text-2); }
  .summary-foot { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }
  .demo-note { font-size: 13px; color: var(--text); padding: 9px 11px; background: var(--accent-soft); border-radius: 6px; animation: enter .3s var(--ease); }
  .demo-note:empty { display: none; }

  .demo-crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 2px; }
  .crumb { display: inline-flex; align-items: center; gap: 2px; color: var(--text-3); }
  .crumb button { background: transparent; border: 0; padding: 4px 8px; border-radius: 5px; color: var(--text-2); font-weight: 500; font-size: 13px; }
  .crumb button:hover:not(.on) { background: var(--surface-3); color: var(--text); }
  .crumb button.on { color: var(--text); cursor: default; }
  .demo-canvas.drill.in { animation: drill-in .5s var(--ease); }
  .demo-canvas.drill.out { animation: drill-out .5s var(--ease); }
  @keyframes drill-in { from { opacity: 0; transform: scale(1.1); } }
  @keyframes drill-out { from { opacity: 0; transform: scale(0.92); } }

  .demo-window.doc { grid-template-columns: 1fr 1fr; height: 460px; }
  .doc-col { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
  .doc-col.preview { border-left: 1px solid var(--border); background: var(--surface); }
  .doc-col .md-input { flex: 1; min-height: 0; padding: 14px 18px; font-size: 12.5px; }
  .doc-col .md-preview { flex: 1; padding: 0 22px 24px; }
  .caret-tag { margin-left: 8px; color: var(--accent-fg); text-transform: none; letter-spacing: 0; animation: pulse 1s infinite; }

  /* ---------- features ---------- */
  .l-stats { display: grid; grid-template-columns: repeat(4, 1fr); margin: 0 0 28px; padding: 0; list-style: none; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
  .l-stats li { padding: 18px 20px; display: flex; flex-direction: column; gap: 2px; }
  .l-stats li + li { border-left: 1px solid var(--border); }
  .l-stats b { font-size: 32px; font-weight: 500; line-height: 1.1; }
  .l-stats span { color: var(--text-2); font-size: 13px; }
  .l-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .l-card { padding: 20px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); display: flex; flex-direction: column; gap: 8px; transition: border-color .18s, transform .18s var(--ease); }
  .l-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
  .l-card h3 { font-size: 15px; }
  .l-card p { color: var(--text-2); font-size: 13.5px; line-height: 1.55; }
  .l-ico { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; background: var(--accent-soft); color: var(--accent-fg); margin-bottom: 4px; }

  /* ---------- open source ---------- */
  .l-repos { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .l-repo { display: flex; }
  .l-repo-card { display: flex; flex-direction: column; gap: 14px; width: 100%; padding: 22px; border: 1px solid var(--border-strong); border-radius: 12px; background: var(--surface); transition: border-color .15s; }
  .l-repo-card:hover { border-color: color-mix(in srgb, var(--accent-fg) 60%, var(--border-strong)); }
  .l-repo-top { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 600; }
  .l-repo-top:hover span { text-decoration: underline; }
  .l-repo-top svg:last-child { margin-left: auto; color: var(--text-3); }
  .l-repo-card > p { color: var(--text-2); line-height: 1.55; }
  .l-group { display: flex; flex-direction: column; gap: 7px; padding-top: 12px; border-top: 1px solid var(--border); }
  .l-group h3 { font-size: 10.5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.09em; color: var(--text-3); }
  .l-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
  .l-tags li { font-size: 11px; padding: 2px 9px; border: 1px solid var(--border-strong); border-radius: 4px; color: var(--text-2); }
  .l-tags.pattern li { border-style: dashed; border-color: var(--cat-internal); color: var(--cat-internal); }
  .chev { transition: transform .15s; margin-left: 2px; } .chev.open { transform: rotate(180deg); }
  .l-license { display: flex; gap: 8px; align-items: flex-start; margin-top: 18px; color: var(--text-3); font-size: 13px; line-height: 1.5; }
  .l-license svg { flex: none; margin-top: 2px; }

  /* ---------- final + footer ---------- */
  .l-final { padding: 20px 0 96px; }
  .l-final-in { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 56px 24px; border: 1px solid var(--border-strong); border-radius: 16px; background: var(--surface) radial-gradient(circle at 1px 1px, var(--grid-dot) 1px, transparent 0) 0 0 / 22px 22px; }
  .l-final-in h2 { max-width: 620px; }
  .l-final-in .l-sub { max-width: 560px; }
  .l-final-ico { color: var(--accent-fg); }
  .l-footer { border-top: 1px solid var(--border); padding: 22px 0; }
  .l-footer-in { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .l-foot-links { margin-left: auto; display: flex; gap: 16px; font-size: 13px; color: var(--text-2); }
  .l-foot-links a:hover { color: var(--text); text-decoration: underline; }

  /* ---------- reveal ---------- */
  .reveal { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease) var(--d, 0ms), transform .6s var(--ease) var(--d, 0ms); }
  .reveal.in { opacity: 1; transform: none; }

  /* ---------- responsive ---------- */
  @media (max-width: 980px) {
    .demo-window { grid-template-columns: minmax(0, 1fr); }
    .demo-lib { display: none; }
    .demo-props { border-left: 0; border-top: 1px solid var(--border); }
    .l-grid { grid-template-columns: repeat(2, 1fr); }
    .l-stats { grid-template-columns: repeat(2, 1fr); }
    .l-stats li:nth-child(3) { border-left: 0; }
    .l-stats li:nth-child(n + 3) { border-top: 1px solid var(--border); }
  }
  @media (max-width: 720px) {
    .l-wrap { padding: 0 16px; }
    .l-nav, .l-hide-sm { display: none; }
    .l-hero { padding: 40px 0 36px; }
    .l-hero .l-wrap { gap: 36px; }
    .l-section { padding: 60px 0; }
    .l-repos, .l-grid, .demo-split { grid-template-columns: minmax(0, 1fr); }
    .demo-pane + .demo-pane { border-left: 0; border-top: 1px solid var(--border); }
    .demo-window.doc { grid-template-columns: minmax(0, 1fr); height: auto; }
    .doc-col .md-input { height: 220px; flex: none; }
    .doc-col.preview { border-left: 0; border-top: 1px solid var(--border); }
    .doc-col .md-preview { max-height: 320px; }
    .l-final-in { padding: 40px 18px; }
    .l-foot-links { margin-left: 0; }
    .hero-canvas { padding: 10px 8px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; transition-delay: 0ms !important; scroll-behavior: auto !important; }
    .reveal { opacity: 1; transform: none; }
    .stage-node .node-link { animation: none; }
  }
`;
