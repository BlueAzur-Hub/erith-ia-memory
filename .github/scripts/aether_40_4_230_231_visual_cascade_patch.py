from pathlib import Path
import re, sys

ROOT=Path('public/agent_crypto_erith_ia/administrator')
INDEX=ROOT/'index.html'
SYSTEM=ROOT/'js/views/system-presentation.js'
MARKET=ROOT/'market-visual-master-parity.css'
TECH=ROOT/'technical-reading-cockpit-parity.css'

MARKET_CSS=r'''/* Agent-Crypto — Market Visual Master Parity
   Final presentation owner for Metals + Indices + Energy + Cross.
   Crypto remains the visual master. No data/renderer/source/math ownership. */

:root{
  --market-master-glass:rgba(3,12,22,.84);
  --market-master-glass-soft:rgba(3,12,22,.66);
  --market-master-line:rgba(98,236,255,.20);
  --market-master-gold:rgba(255,216,135,.90);
  --market-master-cyan:rgba(98,236,255,.92);
}

/* One visual instrument: shell, stage, summary and rail share the Crypto grammar. */
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-shell,
html[data-cyclic-market-domain="metals"] #analyste.champagne-clean-lens .chart-panel{
  position:relative!important;
  isolation:isolate!important;
  overflow:hidden!important;
  border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#d8c07a) 28%,rgba(98,236,255,.16))!important;
  border-radius:16px!important;
  background:
    linear-gradient(180deg,rgba(2,8,17,.20),rgba(2,8,17,.38)),
    url("./assets/visual/admin-chart-office.png") center/cover no-repeat!important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.025),0 16px 40px rgba(0,0,0,.20)!important;
}

html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-stage{
  border-radius:13px!important;
  border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 26%,rgba(98,236,255,.14))!important;
  background:
    linear-gradient(180deg,rgba(1,7,14,.34),rgba(1,8,15,.18)),
    radial-gradient(circle at 74% 18%,color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 9%,transparent),transparent 36%)!important;
  box-shadow:inset 0 0 36px rgba(30,150,205,.045)!important;
}

html[data-cyclic-market-mode="parallel"] #atlasParallelLiveCanvas404170{
  filter:drop-shadow(0 2px 2px rgba(0,0,0,.38))!important;
}

/* Operator bar: same dense metallic/glass cadence as Crypto. */
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168,
html[data-cyclic-market-domain="metals"] #atlasMetalsUnifiedToolbar{
  min-height:46px!important;
  padding:5px 8px!important;
  border:1px solid rgba(98,236,255,.12)!important;
  border-radius:12px!important;
  background:linear-gradient(180deg,rgba(4,13,24,.80),rgba(2,8,17,.64))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 7px 18px rgba(0,0,0,.16)!important;
}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button,
html[data-cyclic-market-domain="metals"] #atlasMetalsUnifiedToolbar button{
  min-height:30px!important;
  border-radius:9px!important;
  border:1px solid rgba(255,255,255,.13)!important;
  background:linear-gradient(180deg,rgba(255,255,255,.065),rgba(0,0,0,.16))!important;
  color:#c8d6df!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important;
}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketMirrorToolbar404168 button.is-active,
html[data-cyclic-market-domain="metals"] #atlasMetalsUnifiedToolbar button.is-active{
  color:#f6fbff!important;
  border-color:color-mix(in srgb,var(--cyclic-market-accent,#d8c07a) 68%,rgba(255,255,255,.18))!important;
  background:linear-gradient(180deg,color-mix(in srgb,var(--cyclic-market-accent,#d8c07a) 25%,rgba(7,20,32,.88)),rgba(3,10,18,.90))!important;
  box-shadow:0 0 14px color-mix(in srgb,var(--cyclic-market-accent,#d8c07a) 18%,transparent),inset 0 1px 0 rgba(255,255,255,.06)!important;
}

/* Crypto-like summary glass in the chart, not a detached generic strip. */
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary{
  padding:10px 13px!important;
  min-height:54px!important;
  max-width:min(720px,calc(100% - 52px))!important;
  border-left:4px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 82%,white)!important;
  border-radius:12px!important;
  background:linear-gradient(110deg,rgba(3,13,23,.93),rgba(5,19,29,.84))!important;
  box-shadow:0 12px 28px rgba(0,0,0,.24),inset 0 0 0 1px rgba(255,255,255,.025)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary b{
  font-size:15px!important;
  color:#fff0c9!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary span{
  color:#a9bdc9!important;
  font-weight:800!important;
}

html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-legend{
  gap:6px!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-legend span{
  min-height:25px!important;
  padding:5px 8px!important;
  background:rgba(2,9,18,.79)!important;
  border:1px solid color-mix(in srgb,var(--series,#fff) 24%,rgba(255,255,255,.08))!important;
  box-shadow:0 5px 14px rgba(0,0,0,.17)!important;
}

/* Right rail: same information hierarchy and card rhythm as Crypto. */
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168{
  padding:13px!important;
  border-radius:15px!important;
  background:linear-gradient(180deg,rgba(3,12,22,.94),rgba(3,10,19,.90))!important;
  border:1px solid color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 28%,rgba(98,236,255,.13))!important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.018),0 18px 36px rgba(0,0,0,.22)!important;
}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168 header{
  padding-bottom:10px!important;
  margin-bottom:10px!important;
  border-bottom:1px solid rgba(255,255,255,.09)!important;
}
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168 header strong{
  font-size:19px!important;
  line-height:1.05!important;
  color:color-mix(in srgb,var(--cyclic-market-accent,#a9b9c7) 42%,#fff0c9)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-detail-state span,
html[data-cyclic-market-mode="parallel"] .atlas-parallel-math-grid span,
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168 section,
html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168 article{
  border-radius:11px!important;
  background:rgba(5,16,27,.72)!important;
  border-color:rgba(255,255,255,.085)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.022)!important;
}

/* Memory + source-truth bars finish the graph like Crypto. */
html[data-cyclic-market-mode="parallel"] .atlas-parallel-memory,
html[data-cyclic-market-mode="parallel"] .atlas-parallel-source-truth{
  min-height:36px!important;
  border-radius:10px!important;
  border:1px solid rgba(98,236,255,.14)!important;
  background:linear-gradient(90deg,rgba(3,14,24,.88),rgba(3,10,18,.70))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.02)!important;
}

/* Metals receives the same glass quality without touching its native renderer. */
html[data-cyclic-market-domain="metals"] #analyste.champagne-clean-lens .chart-toolbar,
html[data-cyclic-market-domain="metals"] #analyste.champagne-clean-lens .chart-memory-bar,
html[data-cyclic-market-domain="metals"] #analyste.champagne-clean-lens .chart-legend,
html[data-cyclic-market-domain="metals"] #analyste.champagne-clean-lens .chart-analysis-card{
  border-radius:11px!important;
  background:rgba(3,12,22,.76)!important;
  border-color:rgba(255,216,135,.16)!important;
  box-shadow:0 7px 18px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.025)!important;
}

@media(max-width:900px){
  html[data-cyclic-market-mode="parallel"] .atlas-parallel-live-summary{max-width:none!important;min-height:0!important}
  html[data-cyclic-market-mode="parallel"] #atlasCyclicMarketInertDetail404168{padding:10px!important}
}
'''

TECH_CSS=r'''/* Agent-Crypto — Technical Reading Cockpit Parity
   Final CSS owner for the right Technical Reading rail.
   Image source/RND/local upload/interactions untouched. Firefox-safe alpha only. */

body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel{
  --tr231-bg:rgba(3,11,20,.76);
  --tr231-card:rgba(2,9,18,.70);
  --tr231-card-strong:rgba(2,9,18,.80);
  --tr231-line:rgba(98,236,255,.18);
  --tr231-gold:rgba(255,216,135,.22);
  border-radius:15px!important;
  border:1px solid rgba(98,236,255,.22)!important;
  background:linear-gradient(180deg,rgba(3,11,20,.34),rgba(2,8,16,.50))!important;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.018),0 18px 38px rgba(0,0,0,.22)!important;
  overflow:hidden!important;
  backdrop-filter:none!important;
  -webkit-backdrop-filter:none!important;
}

/* Header becomes a compact cockpit title bar. */
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel > .detail-panel-toggle{
  min-height:54px!important;
  padding:9px 12px!important;
  background:linear-gradient(180deg,rgba(3,13,23,.92),rgba(2,9,17,.82))!important;
  border-bottom:1px solid rgba(255,216,135,.12)!important;
  box-shadow:inset 0 -1px 0 rgba(98,236,255,.06)!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel > .detail-panel-toggle h2,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel > .detail-panel-toggle strong{
  color:#fff0cf!important;
  letter-spacing:.01em!important;
}

/* The portrait remains the hero. Never change source, crop logic or RND state. */
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-project-visual.admin-tech-r3{
  position:relative!important;
  isolation:isolate!important;
  overflow:hidden!important;
  border-radius:0!important;
  border:0!important;
  box-shadow:inset 0 -1px 0 rgba(255,216,135,.10)!important;
  background:transparent!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-project-visual.admin-tech-r3 > .admin-tech-portrait-r3{
  opacity:1!important;
  filter:saturate(.98) contrast(1.02)!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-project-visual.admin-tech-r3::before{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  z-index:2!important;
  pointer-events:none!important;
  background:linear-gradient(180deg,rgba(2,8,16,.08) 0 26%,rgba(2,8,16,.18) 50%,rgba(2,8,16,.44) 100%)!important;
}

/* Top daypart / RND controls read like the Crypto toolbar. */
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel button,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .source-portal,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .source-dock-refresh{
  min-height:28px!important;
  border-radius:9px!important;
  background:linear-gradient(180deg,rgba(5,17,28,.78),rgba(2,9,18,.68))!important;
  border:1px solid rgba(98,236,255,.17)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.03)!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel button[aria-pressed="true"],
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel button.is-active{
  color:#fff0c9!important;
  border-color:rgba(255,216,135,.42)!important;
  background:linear-gradient(180deg,rgba(84,66,28,.58),rgba(12,24,31,.78))!important;
  box-shadow:0 0 12px rgba(255,216,135,.10),inset 0 1px 0 rgba(255,255,255,.04)!important;
}

/* Four headline facts = one compact operator strip, equal visual weight. */
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-compact-strip{
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr))!important;
  gap:6px!important;
  padding:7px!important;
  background:linear-gradient(180deg,rgba(2,9,18,.28),rgba(2,9,18,.12))!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-compact-strip > span{
  min-height:48px!important;
  padding:8px!important;
  border-radius:10px!important;
  background:var(--tr231-card-strong)!important;
  border:1px solid rgba(255,255,255,.11)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;
}

/* Disclosure rows become clean stacked modules over the image. */
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .atlas-detail-subwindow,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .atlas-source-dock{
  margin:6px 7px!important;
  border-radius:11px!important;
  overflow:hidden!important;
  background:rgba(2,9,18,.48)!important;
  border:1px solid rgba(98,236,255,.14)!important;
  box-shadow:0 7px 16px rgba(0,0,0,.13),inset 0 1px 0 rgba(255,255,255,.018)!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .atlas-detail-subwindow > summary,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .atlas-source-dock > summary,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel details > summary{
  min-height:43px!important;
  padding:8px 10px!important;
  background:rgba(3,13,23,.72)!important;
  border:0!important;
  border-bottom:1px solid rgba(255,255,255,.055)!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel details[open] > .atlas-detail-subwindow-body,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel details[open] > .source-dock-body{
  padding:8px!important;
  background:rgba(2,9,18,.60)!important;
}

/* Inner detail cards use the same rhythm as Crypto live price rows. */
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .clean-lens-detail-grid,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-grid,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .broker-strip,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .diagnostic-strip{
  gap:6px!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .clean-lens-detail-grid > div,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-grid > div,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .broker-strip > div,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .diagnostic-strip > div{
  padding:8px!important;
  border-radius:9px!important;
  background:var(--tr231-card)!important;
  border:1px solid rgba(255,255,255,.09)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.018)!important;
}

/* Readability on very light or very dark RND portraits. */
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel :is(h2,h3,h4,h5,b,strong,span,small,p,em,i,summary,a){
  opacity:1!important;
  text-shadow:0 1px 2px rgba(0,0,0,.96),0 0 4px rgba(0,0,0,.72)!important;
}
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel small,
body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel p{
  color:#a8bbc7!important;
}

@media(min-width:1300px){
  body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-compact-strip{grid-template-columns:repeat(4,minmax(0,1fr))!important}
}
@media(max-width:760px){
  body.atlas-administrator-mirror #analyste.champagne-clean-lens #detailPanel.clean-lens-detail-panel .detail-compact-strip{grid-template-columns:1fr 1fr!important}
}
'''

def replace_once(text, pattern, repl, label):
    new, n = re.subn(pattern, repl, text, count=1, flags=re.M)
    if n != 1:
        raise SystemExit(f'{label}: expected 1 replacement, got {n}')
    return new

def set_system_tokens(text, build):
    text=replace_once(text,r'const SOURCE="\.\/views\/system\.html\?v=administrator-build-[^"]+";',f'const SOURCE="./views/system.html?v=administrator-build-{build}";','system source token')
    return text

def set_index_system_loader(text, build):
    return replace_once(text,r'<script src="\.\/js\/views\/system-presentation\.js\?v=administrator-build-[^"]+"><\/script>',f'<script src="./js/views/system-presentation.js?v=administrator-build-{build}"></script>','system loader token')

def stage230():
    if MARKET.exists(): raise SystemExit('market parity owner already exists')
    idx=INDEX.read_text(encoding='utf-8')
    sysf=SYSTEM.read_text(encoding='utf-8')
    link='  <link rel="stylesheet" href="./market-visual-master-parity.css?v=40.4.230" data-market-visual-master-parity="true" />\n'
    if 'data-market-visual-master-parity' in idx: raise SystemExit('market parity link already exists')
    idx=idx.replace('</head>',link+'</head>',1)
    idx=set_index_system_loader(idx,'40.4.230')
    sysf=set_system_tokens(sysf,'40.4.230')
    MARKET.write_text(MARKET_CSS,encoding='utf-8')
    INDEX.write_text(idx,encoding='utf-8')
    SYSTEM.write_text(sysf,encoding='utf-8')
    print('STAGE230_PASS')

def stage231():
    if not MARKET.exists(): raise SystemExit('market parity owner missing')
    if TECH.exists(): raise SystemExit('technical parity owner already exists')
    idx=INDEX.read_text(encoding='utf-8')
    sysf=SYSTEM.read_text(encoding='utf-8')
    link='  <link rel="stylesheet" href="./technical-reading-cockpit-parity.css?v=40.4.231" data-technical-reading-cockpit-parity="true" />\n'
    if 'data-technical-reading-cockpit-parity' in idx: raise SystemExit('technical parity link already exists')
    idx=idx.replace('</head>',link+'</head>',1)
    idx=set_index_system_loader(idx,'40.4.231')
    sysf=set_system_tokens(sysf,'40.4.231')
    TECH.write_text(TECH_CSS,encoding='utf-8')
    INDEX.write_text(idx,encoding='utf-8')
    SYSTEM.write_text(sysf,encoding='utf-8')
    print('STAGE231_PASS')

if len(sys.argv)!=2 or sys.argv[1] not in {'230','231'}:
    raise SystemExit('usage: patch.py 230|231')
(stage230 if sys.argv[1]=='230' else stage231)()
