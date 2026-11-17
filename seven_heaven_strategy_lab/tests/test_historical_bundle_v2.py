from pathlib import Path
import tempfile
from src.historical_bundle_v2 import available, install_from_bundle
from src.catalog_source_v48 import read_source


def test_bundle_has_four_expected_years():
    assert available('BTC',2024) and available('BTC',2025)
    assert available('ETH',2024) and available('ETH',2025)
    assert not available('SOL',2024)


def test_install_btc_2024_is_verified_and_idempotent():
    with tempfile.TemporaryDirectory() as td:
        w=Path(td); sid='CAT_BINANCE_BTCUSDT_1H_2024'
        m=install_from_bundle(w,'BTC',2024,sid)
        assert m['rows']==8784 and m['pair']=='BTC/USDT'
        assert m['historical_vault']['annual_shard_sha256']=='5add63d3d29bd8a8ef80b6ec16f288fe36de5c9db0ff8d8119bcd732129f9ef5'
        m2,bars=read_source(w,sid)
        assert len(bars)==8784 and m2['stored_csv_sha256']==m['stored_csv_sha256']
        assert install_from_bundle(w,'BTC',2024,sid)['stored_csv_sha256']==m['stored_csv_sha256']
