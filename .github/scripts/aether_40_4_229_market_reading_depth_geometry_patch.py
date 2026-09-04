from pathlib import Path

base = Path('public/agent_crypto_erith_ia/administrator')
css_p = base / 'market-reading-depth.css'
js_p = base / 'js/market-reading-depth.js'
idx_p = base / 'index.html'
sys_p = base / 'js/views/system-presentation.js'

css = css_p.read_text(encoding='utf-8')
js = js_p.read_text(encoding='utf-8')
idx = idx_p.read_text(encoding='utf-8')
system = sys_p.read_text(encoding='utf-8')

def one(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {count}')
    return text.replace(old, new, 1)

# Build/cache identity only; runtime semantics stay unchanged.
js = one(js, 'const BUILD = "40.4.209";', 'const BUILD = "40.4.229";', 'reading depth BUILD')
idx = one(idx, '<link rel="stylesheet" href="./market-reading-depth.css?v=40.4.210" />', '<link rel="stylesheet" href="./market-reading-depth.css?v=40.4.229" />', 'reading depth css token')
idx = one(idx, '<script src="./js/market-reading-depth.js?v=administrator-build-40.4.210"></script>', '<script src="./js/market-reading-depth.js?v=administrator-build-40.4.229"></script>', 'reading depth js token')
idx = one(idx, '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.228"></script>', '<script src="./js/views/system-presentation.js?v=administrator-build-40.4.229"></script>', 'system presentation loader token')
system = one(system, 'const SOURCE="./views/system.html?v=administrator-build-40.4.228";', 'const SOURCE="./views/system.html?v=administrator-build-40.4.229";', 'system presentation source token')

marker = '40.4.229 — MARKET READING DEPTH VIEWPORT GEOMETRY LOCK'
if marker in css:
    raise SystemExit('40.4.229 CSS already present')

css += r'''

/* =========================================================
   40.4.229 — MARKET READING DEPTH VIEWPORT GEOMETRY LOCK
   Reproduced regression: paired detail cards were stretched by CSS Grid to the
   height of their tallest neighbour and the expanded Reading Depth body could
   exceed the useful viewport. Geometry only: no renderer/data/history/window
   manager/Market Core ownership change.
   ========================================================= */
#atlasMarketReadingDepth404199{
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
}

#atlasMarketReadingDepth404199 .atlas-market-reading-body-404199{
  align-items:start!important;
  align-content:start!important;
  grid-auto-rows:max-content!important;
  min-height:0!important;
  height:auto!important;
  max-height:min(620px,62vh)!important;
  overflow:auto!important;
  overscroll-behavior:contain;
  scrollbar-width:thin;
}

#atlasMarketReadingDepth404199 .atlas-market-reading-body-404199 > *{
  min-width:0!important;
  max-width:100%!important;
}

#atlasMarketReadingDepth404199 .atlas-reading-detail-404199,
#atlasMarketReadingDepth404199 .atlas-reading-hero-404199{
  align-self:start!important;
  min-height:0!important;
  height:auto!important;
  max-height:none!important;
}

#atlasMarketReadingDepth404199 .atlas-reading-table-wrap-404199{
  min-height:0!important;
  max-width:100%!important;
}

@media (min-width:1101px) and (max-height:900px){
  #atlasMarketReadingDepth404199 .atlas-market-reading-body-404199{
    max-height:54vh!important;
  }
}

@media (max-width:1100px){
  #atlasMarketReadingDepth404199 .atlas-market-reading-body-404199{
    max-height:min(560px,60vh)!important;
  }
}
'''

css_p.write_text(css, encoding='utf-8')
js_p.write_text(js, encoding='utf-8')
idx_p.write_text(idx, encoding='utf-8')
sys_p.write_text(system, encoding='utf-8')
print('MARKET_READING_DEPTH_GEOMETRY_PATCH_PASS')
