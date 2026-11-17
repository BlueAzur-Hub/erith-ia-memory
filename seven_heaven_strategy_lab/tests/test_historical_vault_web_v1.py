from pathlib import Path
import hashlib

ROOT=Path(__file__).resolve().parents[1]

def test_historical_vault_web_contract():
    html=(ROOT/'web/index.html').read_text(encoding='utf-8')
    js=(ROOT/'web/historical-vault.js').read_text(encoding='utf-8')
    app=(ROOT/'web/app.js').read_text(encoding='utf-8')
    helpjs=(ROOT/'web/lab-help-layer.js').read_text(encoding='utf-8')
    assert 'id="historical-vault"' in html
    assert 'href="#historical-vault"' in html
    assert '/historical-vault.js?v=v49-historical-v3-five-assets-20261117' in html
    assert '/api/historical-vault' in js and '/api/historical-vault-install' in js
    assert 'INDEXÉ ≠ INSTALLÉ' in html
    assert 'seven-historical-source-installed' in js and 'seven-historical-source-installed' in app
    assert 'key:"historical-vault"' in helpjs
    assert 'key:"historical-install"' in helpjs


def test_engine_remains_canonical_after_historical_vault():
    engine=(ROOT/'src/engine.py').read_bytes()
    assert hashlib.sha256(engine).hexdigest() == 'f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2'
