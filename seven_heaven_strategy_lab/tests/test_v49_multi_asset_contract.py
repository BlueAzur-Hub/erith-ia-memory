import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def test_v49_rebuild_plan_dimensions():
    p=json.loads((ROOT/'data'/'workspace_rebuild_plan_v1.json').read_text(encoding='utf-8'))
    assert len(p['historical_bundle_install'])==10
    assert len(p['runs'])==52
    assert len(p['comparisons'])==16
    expected={f'CAT_BINANCE_{s}USDT_1H_{y}' for s in ('BTC','ETH','BNB','XRP','SOL') for y in (2024,2025)}
    assert expected <= set(p['required_source_ids'])

def test_v49_visible_build_and_health_contract():
    html=(ROOT/'web'/'index.html').read_text(encoding='utf-8')
    js=(ROOT/'web'/'app.js').read_text(encoding='utf-8')
    server=(ROOT/'src'/'server.py').read_text(encoding='utf-8')
    assert 'BUILD 4.9.0-DEV1' in html
    assert 'health.version!=="4.9.0-dev1"' in js
    assert '"historical_vault_v3_bundle_enabled": True' in server
