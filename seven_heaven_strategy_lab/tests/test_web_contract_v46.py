"""Static browser contract checks for the dependency-free V4.6 cockpit."""
from __future__ import annotations

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parents[1]


class _Ids(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key == "id" and value:
                self.ids.append(value)


class WebContractV46(unittest.TestCase):
    def test_all_literal_dom_lookups_exist_and_ids_are_unique(self):
        html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        parser = _Ids()
        parser.feed(html)
        counts = Counter(parser.ids)
        self.assertEqual([key for key, count in counts.items() if count > 1], [])
        scripts = "\n".join(
            (ROOT / "web" / name).read_text(encoding="utf-8")
            for name in ("app.js", "microscope.js", "forensics.js", "strategy_research.js")
        )
        requested = set(re.findall(r'\$\("([A-Za-z0-9_-]+)"\)', scripts))
        self.assertEqual(sorted(requested - set(parser.ids)), [])

    def test_build_and_v462_source_contract_are_visible(self):
        html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        app = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        research = (ROOT / "web" / "strategy_research.js").read_text(encoding="utf-8")
        self.assertIn("BUILD 4.9.0-DEV1", html)
        self.assertIn('id="binance-monthly-import"', html)
        self.assertIn('value="DONCHIAN"', html)
        self.assertIn('id="donchian-fields"', html)
        self.assertIn('name="donchian_entry"', html)
        self.assertIn('name="donchian_exit"', html)
        for dom_id in ("summary-asset-icon", "summary-market", "summary-exchange",
                       "summary-window", "summary-window-range", "summary-coverage",
                       "summary-resolution", "summary-integrity", "summary-provenance"):
            self.assertIn(f'id="{dom_id}"', html)
        self.assertIn('/api/binance-monthly-import', app)
        self.assertIn('/api/sources', app)
        self.assertIn('renderSourceSummary(source,id)', app)
        self.assertIn('health.version!=="4.9.0-dev1"', app)
        self.assertIn("EXPLICIT_NO_TRADE_WARMUP", research)

    def test_source_change_resets_every_source_bound_analysis(self):
        app = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        match = re.search(
            r"if\(id!==selectedSourceId\)\s*\{(.*?)\n\s*\}",
            app,
            flags=re.S,
        )
        self.assertIsNotNone(match)
        reset_block = match.group(1)
        for required in (
            "lastRenderedReport=null",
            "resetScientific();",
            "window.AetherFilterStudio.reset();",
            "window.AetherMicroscope.clear();",
            "window.AetherForensics.clear();",
            '$("result").hidden=true',
            '$("comparison-result").hidden=true',
        ):
            self.assertIn(required, reset_block)

    def test_active_source_cards_are_not_frozen_on_legacy_bitcoin(self):
        html = (ROOT / "web" / "index.html").read_text(encoding="utf-8")
        app = (ROOT / "web" / "app.js").read_text(encoding="utf-8")
        match = re.search(
            r'<div class="source-layout">(.*?)</div>\s*<div class="source-bottom">',
            html,
            flags=re.S,
        )
        self.assertIsNotNone(match)
        source_cards = match.group(1)
        self.assertNotIn("Bitcoin · BTC/USDT", source_cards)
        self.assertNotIn("Janvier 2026", source_cards)
        self.assertIn('monthly=source.source_kind==="BINANCE_MONTHLY_CERTIFIED"', app)
        self.assertIn('$("summary-market").textContent=assetName(source.base)+" · "+source.pair', app)
        self.assertIn('$("dataset-badge").textContent="OKX · SHA-256 ✓"', app)


if __name__ == "__main__":
    unittest.main()
