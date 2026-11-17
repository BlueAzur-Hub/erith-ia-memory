import tempfile
from pathlib import Path
from src.historical_bundle_v3 import available, install_from_bundle, _manifest
from src.historical_vault_v1 import source_id

def test_bundle_manifest_covers_five_assets_two_years():
    expected={(s,y) for s in ('BTC','ETH','BNB','XRP','SOL') for y in (2024,2025)}
    assert {(d['symbol'],d['year']) for d in _manifest()['datasets']}==expected
    for s,y in expected: assert available(s,y)
    assert not available('ADA',2024)

def test_existing_btc_shard_installs_idempotently():
    with tempfile.TemporaryDirectory() as td:
        w=Path(td); sid=source_id('BTC',2024)
        m=install_from_bundle(w,'BTC',2024,sid)
        assert m['rows']==8784 and m['pair']=='BTC/USDT'
        assert m['historical_vault']['schema']=='seven.historical_vault.installed_year.v3'
        assert m['historical_vault']['bundle_schema']=='seven.strategy_lab.historical_bundle.v2'
        assert install_from_bundle(w,'BTC',2024,sid)['stored_csv_sha256']==m['stored_csv_sha256']
