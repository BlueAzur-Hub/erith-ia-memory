from pathlib import Path

p=Path('public/agent_crypto_erith_ia/administrator/js/parallel-markets.js')
s=p.read_text(encoding='utf-8')
old='    drawCanvas(series, period, cfg.accent);\n    renderPinnedCanvasTable();'
new='    drawCanvas(series, period, cfg.accent);\n    emptyCanvasOverlay();'
count=s.count(old)
if count != 1:
    raise SystemExit(f'40.4.237 prepatch: expected 1 post-draw pinned HUD call, got {count}')
p.write_text(s.replace(old,new,1),encoding='utf-8')
print('PINNED_HUD_POST_DRAW_PREPATCH_PASS')
