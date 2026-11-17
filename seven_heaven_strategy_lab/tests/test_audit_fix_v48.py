from pathlib import Path
import hashlib

from src import server
from src.observatory import NAMES

ROOT=Path(__file__).resolve().parents[1]
CANONICAL_ENGINE_SHA="f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2"

def test_engine_remains_canonical():
    assert hashlib.sha256((ROOT/"src/engine.py").read_bytes()).hexdigest()==CANONICAL_ENGINE_SHA

def test_public_errors_are_quote_agnostic_without_engine_patch():
    assert "USDT" not in server._public_error_message(ValueError("Capital USDT: valeur hors limites"))
    assert "devise de cotation" in server._public_error_message(ValueError("DCA montant USDT: valeur hors limites"))

def test_cash_engine_label_is_generic_until_source_layer_binds_quote():
    assert NAMES["CASH"] == "Conservation cash"

def test_web_cash_label_is_dynamic():
    app=(ROOT/"web/app.js").read_text(encoding="utf-8")
    assert 'CASH:"Conserver les USDT"' not in app
    assert 'quote?"Conserver les "+quote:"Conserver le cash"' in app

def test_server_warnings_are_source_bound_and_origin_uses_runtime_port():
    source={"exchange":"OKX Spot","pair":"BTC/USDC","source_kind":"OKX_PUBLIC_ARCHIVE"}
    warnings=server._source_warnings(source)
    assert "BTC/USDC" in warnings[0] and "OKX Spot" in warnings[0]
    text=(ROOT/"src/server.py").read_text(encoding="utf-8")
    assert 'getattr(self.server, "server_port", 8777)' in text
