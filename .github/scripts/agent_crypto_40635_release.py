from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
CSS = ROOT / 'admin-ribbons.css'
INDEX = ROOT / 'index.html'
BUILD = ROOT / 'build.json'
ADMIN_VERSION = ROOT / 'administrator-version.json'
VERSION = ROOT / 'version.json'
AETHER_JS = ROOT / 'js/aether.js'
ASSET = ROOT / 'assets/aether/aether-observatory-background-406032.webp'
RELEASE_MD = ROOT / 'RELEASE_40_6_35.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_35_AETHER_LIVE_EMBROIDERY_BACKGROUND_FIRST_UI_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.34'
BUILD_NO = '40.6.35'
ENGINE = '38.15.11'
RELEASE = 'AETHER OBSERVATORY · LIVE EMBROIDERY · BACKGROUND-FIRST UI'
STATUS = 'aether_observatory_live_embroidery_background_first_ui_406035'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
AETHER_SHA = '2620262676958c0e4c10f6f70427f353624e35cf6ed2794bea32a33bb13cf87d'
PARENT_MARKER = '/* 40.6.34 — AETHER SINGLE STAGE 16:9 · CODE-ONLY LOCK */'
MARKER = '/* 40.6.35 — AETHER LIVE EMBROIDERY · BACKGROUND-FIRST UI */'


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def require(ok, message):
    if not ok:
        raise SystemExit(message)


truth = json.loads(BUILD.read_text(encoding='utf-8'))
require(truth.get('build') == PARENT, f'parent build drift: {truth.get("build")}')
require(truth.get('engine') == ENGINE, 'Market Core drift')
require(sha256(AETHER_JS) == AETHER_SHA, 'Aether runtime drift')
require(sha256(ASSET) == ASSET_SHA, 'exact artwork drift')

css_text = CSS.read_text(encoding='utf-8').rstrip()
require(PARENT_MARKER in css_text, '40.6.34 stage lock missing')
require(MARKER not in css_text, '40.6.35 marker already present')

css_patch = r'''

/* 40.6.35 — AETHER LIVE EMBROIDERY · BACKGROUND-FIRST UI */
/*
   Paid artwork = visible cockpit. HTML = changing truth only.
   The 40.6.34 single 16:9 stage stays the sole coordinate system.
   Baked sample values are retired with small local masks; cards/icons/ornament remain artwork-owned.
*/
@media (min-width:901px){
  /* Glance is transparent data embroidery, not a second dashboard skin. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article,
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article{
    border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;
    backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding:0!important;overflow:visible!important;
    pointer-events:none!important;color:#f4f8ff!important;
  }

  /* Artwork already owns semantic headings. Keep them in DOM but visually suppress duplicates. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article > span,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > span,
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article > span{
    position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;
    overflow:hidden!important;clip:rect(0 0 0 0)!important;clip-path:inset(50%)!important;white-space:nowrap!important;border:0!important;
  }

  /* Live value typography is limited to glance owners only. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article > b,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > b,
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article > b{
    position:absolute!important;z-index:4!important;display:block!important;margin:0!important;color:#f5f8ff!important;
    font-size:clamp(10px,.84vw,13.4px)!important;line-height:1.22!important;font-weight:780!important;letter-spacing:0!important;
    text-shadow:0 1px 2px rgba(0,0,0,.95),0 0 7px rgba(66,185,255,.24)!important;
    overflow:hidden!important;text-overflow:ellipsis!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > small{
    position:absolute!important;z-index:4!important;display:block!important;margin:0!important;color:#65efc5!important;
    font-size:clamp(8.3px,.64vw,10.2px)!important;line-height:1.16!important;font-weight:760!important;
    text-shadow:0 1px 2px rgba(0,0,0,.95)!important;overflow:hidden!important;
  }

  /* Exact 16:9 artwork anchors. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="convergence"]){left:37.55%!important;top:5.00%!important;width:25.25%!important;height:14.80%!important}
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="divergence"]){left:64.70%!important;top:15.25%!important;width:23.95%!important;height:15.25%!important}
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"]){left:65.25%!important;top:32.05%!important;width:24.05%!important;height:21.55%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="system"]){left:11.25%!important;top:15.15%!important;width:24.15%!important;height:15.35%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="sources"]){left:11.25%!important;top:32.80%!important;width:23.35%!important;height:16.10%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"]){left:11.45%!important;top:53.10%!important;width:23.05%!important;height:22.75%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="oracle"]){left:24.30%!important;top:78.05%!important;width:22.10%!important;height:13.25%!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]{left:65.20%!important;top:56.35%!important;width:23.50%!important;height:19.55%!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030]{left:52.85%!important;top:78.05%!important;width:22.20%!important;height:13.25%!important;display:block!important}

  /* Shared micro-mask language. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="convergence"])::before,
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="divergence"])::before,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="system"])::before,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="sources"])::before,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="oracle"])::before,
  #atlasAetherStatusPanel4084 [data-aether-weather-406030]::before{
    content:""!important;position:absolute!important;z-index:2!important;border-radius:9px!important;
    background:linear-gradient(90deg,rgba(2,12,28,.97),rgba(2,12,28,.90) 72%,rgba(2,12,28,.22))!important;
    box-shadow:0 0 18px rgba(0,0,0,.18)!important;pointer-events:none!important;
  }

  /* Convergence — preserve left icon + right signal bars. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="convergence"])::before{left:27%!important;right:14%!important;top:22%!important;bottom:16%!important}
  #atlasAetherStatusPanel4084 [data-aether-row-4084="convergence"]{left:29%!important;top:28%!important;width:55%!important;height:58%!important;font-size:clamp(11px,.97vw,15px)!important;line-height:1.18!important}

  /* Divergence — preserve violet icon + right signal bars. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="divergence"])::before{left:28%!important;right:14%!important;top:24%!important;bottom:14%!important}
  #atlasAetherStatusPanel4084 [data-aether-row-4084="divergence"]{left:30%!important;top:29%!important;width:55%!important;height:58%!important;font-size:clamp(10.4px,.88vw,13.6px)!important;line-height:1.22!important}

  /* System — preserve gear + yellow load motif. */
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="system"])::before{left:28%!important;right:14%!important;top:27%!important;bottom:18%!important}
  #atlasAetherStatusPanel4084 [data-aether-row-4084="system"]{left:30%!important;top:31%!important;width:55%!important;height:52%!important;font-size:clamp(10.5px,.90vw,14px)!important;line-height:1.28!important}

  /* Sources — preserve book/check iconography. */
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="sources"])::before{left:29%!important;right:8%!important;top:28%!important;bottom:19%!important}
  #atlasAetherStatusPanel4084 [data-aether-row-4084="sources"]{left:31%!important;top:33%!important;width:61%!important;height:50%!important;font-size:clamp(10px,.85vw,13.2px)!important;line-height:1.25!important}

  /* Atlas — retire baked correlations with two small masks, preserve globe/card ornament. */
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"])::before,
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"])::after{
    content:""!important;position:absolute!important;z-index:2!important;pointer-events:none!important;border-radius:9px!important;
    background:rgba(2,12,28,.94)!important;box-shadow:0 0 16px rgba(0,0,0,.16)!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"])::before{left:29%!important;right:7%!important;top:18%!important;height:29%!important}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"])::after{left:12%!important;right:7%!important;top:52%!important;bottom:11%!important;background:linear-gradient(90deg,rgba(2,12,28,.96),rgba(2,12,28,.91) 76%,rgba(2,12,28,.38))!important}
  #atlasAetherStatusPanel4084 [data-aether-row-4084="atlas"]{left:31%!important;top:21%!important;width:61%!important;height:27%!important;font-size:clamp(9.7px,.79vw,12.4px)!important;line-height:1.20!important}
  #atlasAetherStatusPanel4084 [data-aether-row-4084="atlas_auto"]{left:14%!important;top:59%!important;width:77%!important;height:27%!important;color:#63efc2!important;font-size:clamp(8.4px,.67vw,10.4px)!important;line-height:1.18!important}

  /* Market — retire baked breadth and static asset-price row separately; preserve icon + sparkline. */
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"])::before,
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"])::after{
    content:""!important;position:absolute!important;z-index:2!important;pointer-events:none!important;border-radius:9px!important;background:rgba(2,12,28,.95)!important;box-shadow:0 0 18px rgba(0,0,0,.17)!important;
  }
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"])::before{left:29%!important;right:15%!important;top:17%!important;height:36%!important}
  #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"])::after{left:6%!important;right:5%!important;top:61%!important;bottom:8%!important;background:linear-gradient(90deg,rgba(2,12,28,.97),rgba(2,12,28,.92) 82%,rgba(2,12,28,.45))!important}
  #atlasAetherStatusPanel4084 [data-aether-row-4084="market"]{left:31%!important;top:21%!important;width:53%!important;height:33%!important;font-size:clamp(10px,.84vw,13px)!important;line-height:1.22!important}

  /* Oracle — preserve gold icon and right signal bars. */
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="oracle"])::before{left:30%!important;right:17%!important;top:24%!important;bottom:17%!important;background:linear-gradient(90deg,rgba(8,15,27,.97),rgba(8,15,27,.88) 76%,rgba(8,15,27,.20))!important}
  #atlasAetherStatusPanel4084 [data-aether-row-4084="oracle"]{left:32%!important;top:30%!important;width:52%!important;height:52%!important;color:#ffe080!important;font-size:clamp(9.8px,.81vw,12.8px)!important;line-height:1.20!important}

  /* Weather — preserve cloud icon left + rain glyph right. */
  #atlasAetherStatusPanel4084 [data-aether-weather-406030]::before{left:29%!important;right:15%!important;top:20%!important;bottom:12%!important;background:linear-gradient(90deg,rgba(3,14,29,.97),rgba(3,14,29,.90) 80%,rgba(3,14,29,.18))!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030] > b{left:31%!important;top:25%!important;width:55%!important;height:44%!important;white-space:pre-line!important;font-size:clamp(8.8px,.70vw,10.9px)!important;line-height:1.17!important;color:#f4f8ff!important}
  #atlasAetherStatusPanel4084 [data-aether-weather-406030] > small{position:absolute!important;z-index:4!important;left:31%!important;top:70%!important;width:56%!important;height:20%!important;margin:0!important;color:#8ddfff!important;font-size:clamp(7.7px,.60vw,9.2px)!important;line-height:1.12!important;font-weight:720!important;text-shadow:0 1px 2px rgba(0,0,0,.95)!important;overflow:hidden!important}

  /* Events — preserve violet icon/title and replace only baked sample event rows. */
  #atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]::before,
  #atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]::after{
    content:""!important;position:absolute!important;z-index:2!important;pointer-events:none!important;border-radius:8px!important;background:rgba(2,12,28,.94)!important;box-shadow:0 0 16px rgba(0,0,0,.16)!important;
  }
  #atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]::before{left:26%!important;right:5%!important;top:28%!important;height:47%!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]::after{left:20%!important;right:6%!important;top:79%!important;bottom:7%!important;background:linear-gradient(90deg,rgba(2,12,28,.95),rgba(2,12,28,.80),rgba(2,12,28,.12))!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028]{position:absolute!important;z-index:4!important;left:28%!important;right:6%!important;top:31%!important;height:42%!important;display:grid!important;gap:2px!important;margin:0!important;overflow:hidden!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028] .aether-timeline-row-406027{display:grid!important;grid-template-columns:48px 43px minmax(0,1fr)!important;gap:4px!important;align-items:center!important;padding:1px 2px!important;background:transparent!important;border:0!important;border-radius:0!important;font-size:clamp(7.8px,.61vw,9.4px)!important;line-height:1.12!important;color:#d7eaff!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028] .aether-timeline-level-406027{display:none!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028] .aether-timeline-time-406027{color:#a7d9ff!important;font-variant-numeric:tabular-nums!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028] .aether-timeline-type-406027{color:#eef6ff!important;font-size:inherit!important}
  #atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028] .aether-timeline-detail-406027{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#dceaff!important;font-size:inherit!important}

  /* Center: preserve lotus/rings; replace only changing attention/readout lanes. */
  #atlasAetherStatusPanel4084 [data-aether-level-406030]{left:50%!important;top:46.25%!important;width:21.5%!important;height:9.8%!important;transform:translate(-50%,-50%)!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;text-align:center!important}
  #atlasAetherStatusPanel4084 [data-aether-level-406030]::before{content:""!important;position:absolute!important;z-index:2!important;left:10%!important;right:10%!important;top:13%!important;bottom:9%!important;border-radius:14px!important;background:linear-gradient(90deg,rgba(2,11,27,.28),rgba(2,11,27,.97) 24%,rgba(2,11,27,.97) 76%,rgba(2,11,27,.28))!important;box-shadow:0 0 20px rgba(0,0,0,.18)!important}
  #atlasAetherStatusPanel4084 [data-aether-level-406030]::after{content:none!important;display:none!important}
  #atlasAetherStatusPanel4084 [data-aether-level-406030] [data-aether-row-4084="level"]{left:11%!important;top:24%!important;width:78%!important;height:63%!important;z-index:4!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;color:#ffd66d!important;font-size:clamp(10px,.90vw,13.8px)!important;line-height:1.13!important;font-weight:880!important;text-transform:none!important;text-shadow:0 0 10px rgba(255,200,74,.30),0 1px 2px rgba(0,0,0,.95)!important}

  #atlasAetherStatusPanel4084 [data-aether-action-406030]{left:50%!important;top:64.1%!important;width:31.8%!important;height:13.9%!important;transform:translate(-50%,-50%)!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;text-align:center!important}
  #atlasAetherStatusPanel4084 [data-aether-action-406030]::before{content:""!important;position:absolute!important;z-index:2!important;left:8%!important;right:8%!important;top:3%!important;bottom:5%!important;border-radius:12px!important;background:linear-gradient(90deg,rgba(2,11,27,.24),rgba(2,11,27,.95) 19%,rgba(2,11,27,.95) 81%,rgba(2,11,27,.24))!important;box-shadow:0 0 18px rgba(0,0,0,.17)!important}
  #atlasAetherStatusPanel4084 [data-aether-action-406030] > b{left:10%!important;top:12%!important;width:80%!important;height:45%!important;z-index:4!important;display:flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;color:#f4e4a0!important;font-size:clamp(8.8px,.70vw,10.8px)!important;line-height:1.17!important;font-weight:790!important}
  #atlasAetherStatusPanel4084 [data-aether-action-406030] > small{position:absolute!important;left:12%!important;top:58%!important;width:76%!important;height:32%!important;z-index:4!important;margin:0!important;display:block!important;color:#8eeaff!important;font-size:clamp(7.7px,.60vw,9.2px)!important;line-height:1.12!important;font-weight:720!important;text-shadow:0 1px 2px rgba(0,0,0,.95)!important;overflow:hidden!important}

  /* Controls dissolve into the artwork. */
  #atlasAetherStatusPanel4084 [data-aether-close-4084]{right:.7%!important;top:1.1%!important;width:29px!important;height:29px!important;color:#bdeeff!important;background:rgba(2,12,25,.58)!important;border:1px solid rgba(92,216,255,.38)!important;box-shadow:none!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important;opacity:.76!important}
  #atlasAetherStatusPanel4084 [data-aether-close-4084]:hover,#atlasAetherStatusPanel4084 [data-aether-close-4084]:focus-visible{opacity:1!important;background:rgba(2,12,25,.90)!important}
  #atlasAetherStatusPanel4084 .aether-focus-toolbar-406030{right:1.35%!important;bottom:1.35%!important;z-index:50!important;display:flex!important;justify-content:flex-end!important;padding:0!important;gap:4px!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  #atlasAetherStatusPanel4084 .aether-focus-toolbar-406030 > div{display:flex!important;gap:4px!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-button-406030]{min-height:25px!important;padding:4px 8px!important;border-radius:8px!important;border:1px solid rgba(91,210,255,.27)!important;background:rgba(2,12,25,.66)!important;color:#d8efff!important;font-size:9.5px!important;line-height:1!important;box-shadow:none!important;backdrop-filter:blur(2px)!important;-webkit-backdrop-filter:blur(2px)!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-button-406030][aria-pressed="true"]{border-color:rgba(91,238,225,.64)!important;background:rgba(4,45,55,.78)!important;color:#a9fff1!important}

  /* History / Details are separate bounded modes and retain normal document flow. */
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"],#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="details"]{pointer-events:auto!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="details"] .aether-details-grid-406030 article{position:static!important;transform:none!important;width:auto!important;height:auto!important;margin:0!important;padding:9px!important;border:1px solid rgba(81,210,255,.26)!important;border-radius:12px!important;background:rgba(4,20,38,.82)!important;overflow:hidden!important;pointer-events:auto!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="details"] .aether-details-grid-406030 article > b{position:static!important;display:block!important;width:auto!important;height:auto!important;margin-top:5px!important;color:#f3f8ff!important;font-size:11px!important;line-height:1.25!important;text-shadow:none!important;overflow:visible!important}
}
'''

CSS.write_text(css_text + css_patch.rstrip() + '\n', encoding='utf-8')

index = INDEX.read_text(encoding='utf-8')
for old, new in [
    ('content="40.6.34"', 'content="40.6.35"'),
    ('AETHER OBSERVATORY · SINGLE STAGE 16:9 · CODE-ONLY LOCK', RELEASE),
    ('market-core-v2.0-alpha-build-40.6.34', 'market-core-v2.0-alpha-build-40.6.35'),
    ('Build 40.6.34 · Administrator', 'Build 40.6.35 · Administrator'),
    ('admin-ribbons.css?v=administrator-build-40.6.34', 'admin-ribbons.css?v=administrator-build-40.6.35'),
]:
    require(old in index, f'index token missing: {old}')
    index = index.replace(old, new)
INDEX.write_text(index, encoding='utf-8')

now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
for path in (BUILD, ADMIN_VERSION, VERSION):
    data = json.loads(path.read_text(encoding='utf-8'))
    require(data.get('build') == PARENT, f'{path.name}: parent build drift')
    data['build'] = BUILD_NO
    data['release'] = RELEASE
    data['status'] = STATUS
    data['parent_build'] = PARENT
    if 'asset_token' in data:
        data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.35'
    if 'administrator_build' in data:
        data['administrator_build'] = BUILD_NO
    if 'build_label' in data:
        data['build_label'] = 'Build 40.6.35'
    if 'release_status' in data:
        data['release_status'] = RELEASE
    if 'timestamp' in data:
        data['timestamp'] = now
    if 'prepared_at' in data:
        data['prepared_at'] = now
    if 'published_at' in data:
        data['published_at'] = now
    if isinstance(data.get('current_version_truth'), dict):
        data['current_version_truth']['loaded_build'] = BUILD_NO
    data['cascade_40_6_35'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'scope': 'presentation_only',
        'single_stage_406034_preserved': True,
        'background_first_ui': True,
        'live_values_only_on_glance': True,
        'replacement_card_skin_retired': True,
        'local_baked_value_masks_only': True,
        'exact_artwork_preserved': True,
        'image_generation': False,
        'svg_replacement': False,
        'aether_runtime_modified': False,
        'market_core_modified': False,
        'window_manager_modified': False,
        'new_timer': False,
        'new_observer': False,
        'new_network_owner': False,
        'new_storage_owner': False,
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

RELEASE_MD.write_text(f'''# Agent-Crypto 40.6.35 — AETHER OBSERVATORY · LIVE EMBROIDERY · BACKGROUND-FIRST UI

Parent: **{PARENT}**  
Market Core: **{ENGINE} — protected**  
Generated: **{now}**

## Intent
The Observatory artwork is the cockpit itself. CSS must not redraw its cards. Live HTML is embroidered into the artwork: only changing values replace baked sample values.

## Correction
- Preserves the 40.6.34 single 16:9 stage.
- Removes replacement-card backgrounds, borders, shadows and blur from Glance.
- Keeps artwork card shells, icons, lotus, globe, orbital rings and ornament visible.
- Uses local masks only over stale baked sample values.
- Places live Convergence, Divergence, Market, System, Sources, Atlas, Oracle, Weather and Events in their painted lanes.
- Keeps central live Attention/watch values over the existing central composition.
- Keeps History and Details as bounded interactive modes.
- No generated image and no SVG replacement.

## Protected
- `js/aether.js` byte-for-byte unchanged.
- Exact selected Observatory artwork byte-for-byte unchanged.
- Market Core 38.15.11 unchanged.
- Graphique, Lecture Technique, Oracle runtime, Chronos, Version Truth, Window Manager, Paper/Safety and Parker untouched.
- No timer, observer, storage, fetch or network owner added.

## Firefox acceptance
Ctrl+F5 → Aether Attention → inspect the nine painted cards and center. Only live values should be newly drawn. Then test Historique → Détails → Vue → close.
''', encoding='utf-8')

require(sha256(AETHER_JS) == AETHER_SHA, 'Aether runtime changed')
require(sha256(ASSET) == ASSET_SHA, 'artwork changed')
final_css = CSS.read_text(encoding='utf-8')
require(PARENT_MARKER in final_css, '40.6.34 stage marker lost')
require(MARKER in final_css, '40.6.35 CSS marker missing')
final_index = INDEX.read_text(encoding='utf-8')
require('content="40.6.35"' in final_index, 'index build token missing')
require('admin-ribbons.css?v=administrator-build-40.6.35' in final_index, 'CSS cache token missing')
for path in (BUILD, ADMIN_VERSION, VERSION):
    data = json.loads(path.read_text(encoding='utf-8'))
    require(data.get('build') == BUILD_NO, f'{path.name}: build update failed')
    require(data.get('engine', ENGINE) == ENGINE, f'{path.name}: engine drift')

subprocess.run(['node', '--check', str(AETHER_JS)], check=True)
subprocess.run(['git', 'diff', '--check'], check=True)

ZIP.parent.mkdir(parents=True, exist_ok=True)
if ZIP.exists():
    ZIP.unlink()
files = {
    'administrator/admin-ribbons.css': CSS,
    'administrator/index.html': INDEX,
    'administrator/build.json': BUILD,
    'administrator/administrator-version.json': ADMIN_VERSION,
    'administrator/version.json': VERSION,
    'administrator/RELEASE_40_6_35.md': RELEASE_MD,
    'administrator/assets/aether/aether-observatory-background-406032.webp': ASSET,
}
with zipfile.ZipFile(ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for arcname, src in files.items():
        zf.write(src, arcname)
with zipfile.ZipFile(ZIP) as zf:
    packed = [n for n in zf.namelist() if not n.endswith('/')]
    require(len(packed) == 7, f'ZIP file-count gate failed: {packed}')
    require(zf.testzip() is None, 'ZIP integrity gate failed')

zip_sha = sha256(ZIP)
SHA.write_text(f'{zip_sha}  {ZIP.name}\n', encoding='utf-8')
print(f'{BUILD_NO} prepared: {RELEASE}')
print(f'Aether runtime SHA preserved: {sha256(AETHER_JS)}')
print(f'Artwork SHA preserved: {sha256(ASSET)}')
print(f'ZIP SHA256: {zip_sha}')
