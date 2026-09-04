from pathlib import Path

base = Path('public/agent_crypto_erith_ia/administrator')
css_p = base / 'technical-reading-cockpit-parity.css'
idx_p = base / 'index.html'
sys_p = base / 'js/views/system-presentation.js'

idx = idx_p.read_text(encoding='utf-8')
system = sys_p.read_text(encoding='utf-8')

def one(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {count}')
    return text.replace(old, new, 1)

# Stable filename, new final authority. 40.4.231 cockpit treatment is rejected:
# it clipped the historical full-frame portrait host and restored dark slabs.
css = r'''/* Agent-Crypto — 40.4.232
   TECHNICAL READING · HISTORICAL FULL-FRAME NEAR-ZERO GLASS RESTORE LOCK

   Canonical visual lineage restored from the already validated Administrator rules:
   - 39.4.6R4/R7: 136px in-flow host + full-panel absolute portrait background;
   - 39.6.2: full-clear structural surfaces;
   - 39.8.0R1 / 40.1.20: near-zero glass (0.8% secondary / 1.8% primary max).

   This file is presentation-only. It does not own portrait source, RND library,
   local image persistence/picker, focus variables, data, graph, Market, Math,
   Atlas, Window Manager, Bridge, storage, timers, observers or networking. */

/* --------------------------------------------------------------------------
   PANEL / LEGACY OVERLAYS — the selected/default image is the only atmosphere.
   -------------------------------------------------------------------------- */
body.atlas-administrator-mirror
#analyste.champagne-clean-lens:not(.detail-collapsed)
#detailPanel.clean-lens-detail-panel{
  position:relative!important;
  isolation:isolate!important;
  display:flex!important;
  flex-direction:column!important;
  min-height:0!important;
  overflow:hidden!important;
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  border-color:rgba(98,236,255,.18)!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

body.atlas-administrator-mirror #detailPanel.clean-lens-detail-panel::before,
body.atlas-administrator-mirror #detailPanel.clean-lens-detail-panel::after,
body.atlas-administrator-mirror #detailPanel .detail-panel-body::before,
body.atlas-administrator-mirror #detailPanel .detail-panel-body::after,
body.atlas-administrator-mirror #detailPanel .detail-project-visual.admin-tech-r3::before,
body.atlas-administrator-mirror #detailPanel .detail-project-visual.admin-tech-r3::after{
  content:none!important;
  display:none!important;
  visibility:hidden!important;
  opacity:0!important;
  background:none!important;
  background-image:none!important;
  box-shadow:none!important;
  filter:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

/* --------------------------------------------------------------------------
   HISTORICAL FULL-FRAME IMAGE CONTRACT
   The host intentionally keeps 136px in normal flow. The portrait itself is
   absolute from below the 48px title bar to the bottom of the whole panel.
   40.4.231 broke this by making the host relative + overflow:hidden.
   -------------------------------------------------------------------------- */
body.atlas-administrator-mirror
#analyste.champagne-clean-lens:not(.detail-collapsed)
#detailPanel .detail-project-visual.admin-tech-r3{
  position:static!important;
  inset:auto!important;
  z-index:auto!important;
  display:block!important;
  width:100%!important;
  height:136px!important;
  min-height:136px!important;
  max-height:136px!important;
  flex:0 0 136px!important;
  aspect-ratio:auto!important;
  margin:0 0 7px!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  overflow:visible!important;
  background:transparent!important;
  box-shadow:none!important;
  cursor:pointer!important;
}

body.atlas-administrator-mirror
#detailPanel .detail-project-visual.admin-tech-r3 > .admin-tech-portrait-r3{
  position:absolute!important;
  z-index:0!important;
  top:48px!important;
  right:0!important;
  bottom:0!important;
  left:0!important;
  inset:48px 0 0 0!important;
  width:100%!important;
  height:auto!important;
  object-fit:cover!important;
  object-position:var(--admin-tech-x,50%) var(--admin-tech-y,12%)!important;
  opacity:1!important;
  filter:none!important;
  transform:none!important;
  pointer-events:none!important;
  user-select:none!important;
}

/* Local picker remains bound to the image host; visible upload/reset chrome stays off. */
body.atlas-administrator-mirror #detailPanel .admin-tech-reset-r3{
  display:none!important;
  opacity:0!important;
}

/* The tiny identity label is allowed, but with near-zero glass. */
body.atlas-administrator-mirror #detailPanel .detail-project-visual.admin-tech-r3 > span{
  position:absolute!important;
  left:10px!important;
  right:auto!important;
  top:156px!important;
  bottom:auto!important;
  z-index:4!important;
  padding:4px 7px!important;
  background:rgba(2,8,17,.018)!important;
  background-image:none!important;
  border-color:rgba(255,215,130,.10)!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

/* --------------------------------------------------------------------------
   FUNCTIONAL DOM FLOATS ABOVE THE IMAGE — original Classic functions retained.
   -------------------------------------------------------------------------- */
body.atlas-administrator-mirror #detailPanel > .detail-panel-toggle{
  position:relative!important;
  z-index:4!important;
}

body.atlas-administrator-mirror
#analyste.champagne-clean-lens:not(.detail-collapsed)
#detailPanel > .detail-panel-body{
  position:relative!important;
  z-index:3!important;
  display:flex!important;
  flex:1 1 auto!important;
  flex-direction:column!important;
  min-height:0!important;
  width:100%!important;
  margin:0!important;
  padding:0!important;
  gap:5px!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  overscroll-behavior:contain!important;
  scrollbar-gutter:auto!important;
  background:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
  pointer-events:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}
body.atlas-administrator-mirror #detailPanel > .detail-panel-body > *{
  pointer-events:auto!important;
}

/* Structural shells never stack alpha over the portrait. */
body.atlas-administrator-mirror #detailPanel .detail-compact-strip,
body.atlas-administrator-mirror #detailPanel .atlas-detail-subwindow,
body.atlas-administrator-mirror #detailPanel .atlas-detail-subwindow-body,
body.atlas-administrator-mirror #detailPanel .atlas-source-dock,
body.atlas-administrator-mirror #detailPanel .source-dock-body,
body.atlas-administrator-mirror #detailPanel .source-dock-portals,
body.atlas-administrator-mirror #detailPanel .detail-grid,
body.atlas-administrator-mirror #detailPanel .clean-lens-detail-grid,
body.atlas-administrator-mirror #detailPanel .broker-strip,
body.atlas-administrator-mirror #detailPanel .diagnostic-strip{
  background:transparent!important;
  background-color:transparent!important;
  background-image:none!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

/* 0.8% historical near-zero glass for secondary information. */
body.atlas-administrator-mirror #detailPanel .atlas-detail-subwindow,
body.atlas-administrator-mirror #detailPanel .atlas-detail-subwindow-body,
body.atlas-administrator-mirror #detailPanel .source-dock-body,
body.atlas-administrator-mirror #detailPanel .source-dock-command,
body.atlas-administrator-mirror #detailPanel .source-dock-status,
body.atlas-administrator-mirror #detailPanel .source-dock-meta,
body.atlas-administrator-mirror #detailPanel .source-dock-meta > span,
body.atlas-administrator-mirror #detailPanel .detail-grid > div,
body.atlas-administrator-mirror #detailPanel .clean-lens-detail-grid > div,
body.atlas-administrator-mirror #detailPanel .broker-strip > div,
body.atlas-administrator-mirror #detailPanel .diagnostic-strip > div,
body.atlas-administrator-mirror #detailPanel .clean-lens-why-box,
body.atlas-administrator-mirror #detailPanel .why-box,
body.atlas-administrator-mirror #detailPanel #detailIntegrityWindow p,
body.atlas-administrator-mirror #detailPanel [data-window-state],
body.atlas-administrator-mirror #detailPanel .source-portal{
  background:rgba(2,8,17,.008)!important;
  background-image:none!important;
  border-color:rgba(98,236,255,.070)!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

/* 1.8% historical maximum for title/primary facts/interactive controls. */
body.atlas-administrator-mirror #detailPanel > .detail-panel-toggle,
body.atlas-administrator-mirror #detailPanel details > summary,
body.atlas-administrator-mirror #detailPanel .detail-compact-strip > span,
body.atlas-administrator-mirror #detailPanel .source-dock-refresh,
body.atlas-administrator-mirror #detailPanel button:not(.detail-panel-toggle),
body.atlas-administrator-mirror #detailPanel a{
  background:rgba(2,8,17,.018)!important;
  background-image:none!important;
  border-color:rgba(98,236,255,.085)!important;
  box-shadow:none!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

/* Expanded sections do not create a second dark bed. */
body.atlas-administrator-mirror #detailPanel details[open] > .atlas-detail-subwindow-body,
body.atlas-administrator-mirror #detailPanel details[open] > .source-dock-body{
  background:rgba(2,8,17,.008)!important;
  background-image:none!important;
  box-shadow:none!important;
}

/* Text is fully opaque; shadow, not slabs, provides contrast over light portraits. */
body.atlas-administrator-mirror #detailPanel :is(h2,h3,h4,h5,b,strong,span,small,p,em,i,summary,a,button){
  opacity:1!important;
  text-shadow:0 1px 2px rgba(0,0,0,.94),0 0 3px rgba(0,0,0,.72)!important;
}

/* Compact row geometry from the validated Classic contract. */
body.atlas-administrator-mirror #detailPanel .atlas-detail-subwindow > summary{
  min-height:34px!important;
  padding:5px 7px!important;
}
body.atlas-administrator-mirror #detailPanel .source-dock-body,
body.atlas-administrator-mirror #detailPanel .atlas-detail-subwindow-body{
  padding-top:3px!important;
  padding-bottom:3px!important;
}
body.atlas-administrator-mirror #detailPanel .source-dock-portals{
  gap:3px!important;
}
body.atlas-administrator-mirror #detailPanel .source-portal{
  padding:4px 5px!important;
}

/* Reduced state preserves the historical rule: no portrait exposure in the bar. */
body.atlas-administrator-mirror #analyste.champagne-clean-lens.detail-collapsed
#detailPanel .detail-project-visual.admin-tech-r3{
  visibility:hidden!important;
}

@media (max-width:760px){
  body.atlas-administrator-mirror #detailPanel .detail-project-visual.admin-tech-r3 > span{
    display:none!important;
  }
}
'''

idx = one(
    idx,
    '<link rel="stylesheet" href="./technical-reading-cockpit-parity.css?v=40.4.231" data-technical-reading-cockpit-parity="true" />',
    '<link rel="stylesheet" href="./technical-reading-cockpit-parity.css?v=40.4.232" data-technical-reading-cockpit-parity="true" />',
    'Technical Reading final CSS cache token',
)
idx = one(
    idx,
    '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.231"></script>',
    '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.232"></script>',
    'System presentation loader token',
)
system = one(
    system,
    'const SOURCE="./views/system.html?v=administrator-build-40.4.231";',
    'const SOURCE="./views/system.html?v=administrator-build-40.4.232";',
    'System presentation source token',
)

css_p.write_text(css, encoding='utf-8')
idx_p.write_text(idx, encoding='utf-8')
sys_p.write_text(system, encoding='utf-8')
print('TECHNICAL_READING_HISTORICAL_RESTORE_404232_PASS')
