#!/usr/bin/env python3
from pathlib import Path
import argparse

BASE = Path('public/agent_crypto_erith_ia/administrator')
JS = BASE / 'js/parallel-markets.js'
CSS = BASE / 'market-visual-master-parity.css'
INDEX = BASE / 'index.html'
SYSTEM = BASE / 'js/views/system-presentation.js'


def one(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {count}')
    return text.replace(old, new, 1)


def replace_function(text: str, start_sig: str, next_sig: str, replacement: str, label: str) -> str:
    start = text.find(start_sig)
    end = text.find(next_sig, start + len(start_sig))
    if start < 0 or end < 0 or end <= start:
        raise SystemExit(f'{label}: function boundary not found')
    return text[:start] + replacement.rstrip() + '\n\n' + text[end:]


def stage234():
    js = JS.read_text(encoding='utf-8')
    idx = INDEX.read_text(encoding='utf-8')
    system = SYSTEM.read_text(encoding='utf-8')

    # Preconditions: the validated .228 parallel owner is still the current functional owner.
    for marker in (
        'const BUILD = "40.4.228";',
        'const pad = {l:62,r:24,t:24,b:42}',
        'ctx.fillText("SURVOL = POINT RÉEL LE PLUS PROCHE"',
        'renderPinnedCanvasTable();',
        'historical_hover:true',
    ):
        if marker not in js:
            raise SystemExit(f'40.4.234 owner drift: missing {marker}')

    draw = r'''  function drawCanvas(series, period, accent) {
    const canvas = byId("atlasParallelLiveCanvas404170");
    if (!canvas) return;
    clearCanvasHover();
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(640, Math.round(rect.width || canvas.parentElement?.clientWidth || 980));
    const height = Math.max(340, Math.round(rect.height || canvas.parentElement?.clientHeight || 470));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,width,height);

    /* 40.4.234 — Crypto plot language only. Geometry and data semantics stay unchanged. */
    const pad = {l:62,r:24,t:24,b:42}, w = width-pad.l-pad.r, h=height-pad.t-pad.b;
    const bg = ctx.createLinearGradient(0,0,0,height);
    bg.addColorStop(0,"rgba(1,7,14,.54)");
    bg.addColorStop(1,"rgba(1,10,17,.38)");
    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    ctx.strokeStyle = "rgba(153,190,211,.14)"; ctx.lineWidth = 1;
    for (let i=0;i<=5;i++){
      const y=pad.t+(h/5)*i;
      ctx.save();
      ctx.strokeStyle = i===0 || i===5 ? "rgba(153,190,211,.17)" : "rgba(153,190,211,.11)";
      ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.restore();
    }
    for (let i=0;i<=6;i++){
      const x=pad.l+(w/6)*i;
      ctx.save();
      ctx.strokeStyle = i===0 || i===6 ? "rgba(153,190,211,.17)" : "rgba(153,190,211,.09)";
      ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,height-pad.b);ctx.stroke();ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle="rgba(208,229,239,.13)";
    ctx.strokeRect(pad.l+.5,pad.t+.5,Math.max(0,w-1),Math.max(0,h-1));
    ctx.restore();

    const all = series.flatMap(s => s.points.map(p => p.value));
    let min = Math.min(100,...all), max = Math.max(100,...all); if (!Number.isFinite(min)||!Number.isFinite(max)) return;
    const span = Math.max(.4,max-min); const visualPad = Math.max(.18,span*.10); min -= visualPad; max += visualPad;
    const times = series.flatMap(s => s.points.map(pointTimeMs).filter(Number.isFinite));
    const timeMin = times.length ? Math.min(...times) : 0;
    const timeMax = times.length ? Math.max(...times) : 1;
    const timeSpan = Math.max(1,timeMax-timeMin);
    const xFor = (point,index,count) => {
      const ms = pointTimeMs(point);
      return ms !== null ? pad.l + ((ms-timeMin)/timeSpan)*w : pad.l + (index/Math.max(1,count-1))*w;
    };

    ctx.font = "700 10px system-ui"; ctx.fillStyle = "rgba(205,222,232,.76)"; ctx.textAlign = "right";
    for (let i=0;i<=5;i++){ const v=max-(max-min)*(i/5); ctx.fillText(v.toFixed(1),pad.l-9,pad.t+(h/5)*i+4); }

    if (100>=min && 100<=max) {
      const y100=pad.t+(1-((100-min)/(max-min)))*h;
      ctx.save();
      const band=ctx.createLinearGradient(0,y100-8,0,y100+8);
      band.addColorStop(0,"rgba(238,214,142,0)");band.addColorStop(.5,"rgba(238,214,142,.055)");band.addColorStop(1,"rgba(238,214,142,0)");
      ctx.fillStyle=band;ctx.fillRect(pad.l,y100-8,w,16);
      ctx.setLineDash([6,5]); ctx.strokeStyle="rgba(244,218,145,.48)"; ctx.lineWidth=1.15;
      ctx.beginPath(); ctx.moveTo(pad.l,y100); ctx.lineTo(width-pad.r,y100); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign="left"; ctx.fillStyle="rgba(255,234,170,.90)"; ctx.font="900 9px system-ui";
      ctx.fillText("BASE 100",pad.l+7,Math.max(pad.t+10,y100-9)); ctx.restore();
    }

    series.forEach((s, idx) => {
      if (s.points.length < 2) return;
      const color = s.color || COLORS[idx % COLORS.length];
      const trace = () => {
        ctx.beginPath();
        s.points.forEach((p,i) => {
          const x = xFor(p,i,s.points.length);
          const y = pad.t + (1 - ((p.value-min)/(max-min)))*h;
          if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
      };
      ctx.save();
      ctx.globalAlpha=.16;ctx.strokeStyle=color;ctx.lineWidth=5.2;ctx.shadowColor=color;ctx.shadowBlur=8;trace();ctx.stroke();ctx.restore();
      ctx.save();
      ctx.strokeStyle=color;ctx.lineWidth=idx===0?2.7:2.25;ctx.lineJoin="round";ctx.lineCap="round";ctx.shadowColor=color;ctx.shadowBlur=2.8;trace();ctx.stroke();ctx.restore();
      const last=s.points[s.points.length-1], x=xFor(last,s.points.length-1,s.points.length), y=pad.t+(1-((last.value-min)/(max-min)))*h;
      ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=.55;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,5.2,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,y,3.2,0,Math.PI*2);ctx.fill();ctx.restore();
    });

    ctx.font = "9px system-ui"; ctx.fillStyle = "rgba(176,199,213,.67)";
    [0,.2,.4,.6,.8,1].forEach((ratio,index) => {
      const stamp = timeMin + timeSpan*ratio;
      const d = new Date(stamp);
      const label = period === "24h" ? d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : d.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year: period==="7j"||period==="30j" ? undefined : "2-digit"});
      ctx.textAlign = index===0 ? "left" : index===5 ? "right" : "center";
      ctx.fillText(label,pad.l+w*ratio,height-20);
    });
    ctx.textAlign = "left"; ctx.fillStyle = accent || "#dce5ec"; ctx.font = "900 9px system-ui"; ctx.fillText(`BASE 100 · ${period.toUpperCase()} · HISTORIQUE RÉEL`, pad.l, height-7);
    ctx.textAlign = "right"; ctx.fillStyle = "rgba(143,170,186,.82)"; ctx.font = "800 8px system-ui"; ctx.fillText("SURVOL = POINT RÉEL LE PLUS PROCHE", width-pad.r, height-7);
    state.hover = {series,period,domain:state.current,geometry:{pad,w,h,width,height,min,max,timeMin,timeMax}};
  }'''
    js = replace_function(js, '  function drawCanvas(series, period, accent) {', '  function latestValue(asset, rows) {', draw, 'drawCanvas')
    js = one(js, 'const BUILD = "40.4.228";', 'const BUILD = "40.4.234";', 'parallel module build')
    js = one(js, '    chart_table_parity:true,', '    chart_table_parity:true,\n    canvas_crypto_plot_language:true,', 'runtime plot contract')

    idx = one(idx, './js/parallel-markets.js?v=40.4.228', './js/parallel-markets.js?v=40.4.234', 'parallel JS cache token')
    idx = one(idx, './js/views/system-presentation.js?v=administrator-build-40.4.233', './js/views/system-presentation.js?v=administrator-build-40.4.234', 'System loader token')
    system = one(system, './views/system.html?v=administrator-build-40.4.233', './views/system.html?v=administrator-build-40.4.234', 'System source token')

    JS.write_text(js,encoding='utf-8'); INDEX.write_text(idx,encoding='utf-8'); SYSTEM.write_text(system,encoding='utf-8')
    print('GRAPH_CANVAS_CRYPTO_PLOT_LANGUAGE_404234_PASS')


def stage235():
    js = JS.read_text(encoding='utf-8')
    css = CSS.read_text(encoding='utf-8')
    idx = INDEX.read_text(encoding='utf-8')
    system = SYSTEM.read_text(encoding='utf-8')

    for marker in ('const BUILD = "40.4.234";', 'canvas_crypto_plot_language:true', 'atlas-parallel-chart-table-row-404206'):
        if marker not in js:
            raise SystemExit(f'40.4.235 JS owner drift: missing {marker}')
    if 'Final presentation owner for Metals + Indices + Energy + Cross.' not in css:
        raise SystemExit('40.4.235 visual owner drift')
    if '40.4.235 — PARALLEL VALUES HUD CRYPTO PANEL PARITY' in css:
        raise SystemExit('40.4.235 CSS already present')

    old_row = '<div class="atlas-parallel-chart-table-row-404206" style="--asset-color:${row.series.color}">'
    new_row = '<div class="atlas-parallel-chart-table-row-404206 ${row.change>.005?"is-up":row.change<-.005?"is-down":"is-flat"}" style="--asset-color:${row.series.color}">'
    js = one(js, old_row, new_row, 'pinned value row semantic class')
    js = one(js, 'const BUILD = "40.4.234";', 'const BUILD = "40.4.235";', 'parallel module build')
    js = one(js, '    canvas_crypto_plot_language:true,', '    canvas_crypto_plot_language:true,\n    values_hud_crypto_panel_parity:true,', 'runtime HUD contract')

    css += r'''

/* =========================================================
   40.4.235 — PARALLEL VALUES HUD CRYPTO PANEL PARITY
   Existing .206 pinned values table remains the only HUD owner.
   Presentation only: no geometry, data, source, period, history or math change.
   ========================================================= */
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-404206{
  border-color:color-mix(in srgb,var(--cyclic-market-accent,#9eddea) 44%,rgba(255,255,255,.10))!important;
  background:linear-gradient(150deg,rgba(3,12,22,.965),rgba(4,18,28,.935))!important;
  box-shadow:0 18px 42px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.035),inset 0 0 28px color-mix(in srgb,var(--cyclic-market-accent,#9eddea) 4%,transparent)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-404206>header{
  min-height:35px!important;padding-bottom:7px!important;margin-bottom:2px!important;
  border-bottom:1px solid rgba(255,255,255,.08)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-404206>header b{
  font-size:12px!important;color:#fff0c9!important;text-shadow:0 1px 2px rgba(0,0,0,.45)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-404206>header strong{
  padding:4px 7px!important;border-radius:999px!important;border:1px solid rgba(98,236,255,.16)!important;background:rgba(98,236,255,.045)!important;color:#b8eef5!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206{
  position:relative!important;min-height:42px!important;padding:6px 4px 6px 7px!important;
  border-top:1px solid rgba(255,255,255,.06)!important;
  background:linear-gradient(90deg,color-mix(in srgb,var(--asset-color,#dce5ec) 4.5%,transparent),transparent 48%)!important;
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206::before{
  content:"";position:absolute;left:-12px;top:7px;bottom:7px;width:3px;border-radius:3px;background:var(--asset-color,#dce5ec);box-shadow:0 0 9px color-mix(in srgb,var(--asset-color,#dce5ec) 48%,transparent);
}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206>i{width:9px!important;height:9px!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206>span b{font-size:11px!important;color:#f2f7fa!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206>span small{font-size:8px!important;color:#8aa2b1!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206>strong{font-size:11px!important;color:#edf5f8!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206>em{padding:3px 6px!important;border-radius:999px!important;border:1px solid rgba(255,255,255,.08)!important;background:rgba(255,255,255,.025)!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206.is-up>em{color:#78efbd!important;border-color:rgba(90,238,180,.20)!important;background:rgba(48,190,137,.08)!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206.is-down>em{color:#ff9fac!important;border-color:rgba(255,113,136,.20)!important;background:rgba(205,57,82,.08)!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-row-404206.is-flat>em{color:#b7c5cd!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-404206>footer{padding-top:8px!important;color:#849cac!important}
html[data-cyclic-market-mode="parallel"] .atlas-parallel-chart-table-404206>footer b{color:color-mix(in srgb,var(--cyclic-market-accent,#74e5ef) 72%,#fff0c9)!important}
'''

    idx = one(idx, './js/parallel-markets.js?v=40.4.234', './js/parallel-markets.js?v=40.4.235', 'parallel JS cache token')
    idx = one(idx, './market-visual-master-parity.css?v=40.4.230', './market-visual-master-parity.css?v=40.4.235', 'visual master CSS cache token')
    idx = one(idx, './js/views/system-presentation.js?v=administrator-build-40.4.234', './js/views/system-presentation.js?v=administrator-build-40.4.235', 'System loader token')
    system = one(system, './views/system.html?v=administrator-build-40.4.234', './views/system.html?v=administrator-build-40.4.235', 'System source token')

    JS.write_text(js,encoding='utf-8'); CSS.write_text(css,encoding='utf-8'); INDEX.write_text(idx,encoding='utf-8'); SYSTEM.write_text(system,encoding='utf-8')
    print('GRAPH_VALUES_HUD_CRYPTO_PANEL_PARITY_404235_PASS')


if __name__ == '__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('--stage',choices=['234','235'],required=True); args=ap.parse_args()
    stage234() if args.stage=='234' else stage235()
