#!/usr/bin/env python3
"""Static/no-network proof for Agent-Crypto 40.6.480 CoinGecko Demo auth."""
from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / "public" / "agent_crypto_erith_ia" / "tools"
sys.path.insert(0, str(TOOLS))

import collect_public_crypto as base  # noqa: E402
import collect_public_crypto_rank_complete as rank  # noqa: E402


class FakeResponse:
    status_code = 200

    def raise_for_status(self) -> None:
        return None

    def json(self):
        return [{"id": "ethereum", "market_cap_rank": 2, "current_price": 1.0}]


class FakeSession:
    def __init__(self):
        self.calls = []

    def get(self, url, **kwargs):
        self.calls.append((url, kwargs))
        return FakeResponse()


def require(condition: bool, label: str) -> None:
    if not condition:
        raise AssertionError(label)


def main() -> int:
    old = os.environ.get(base.COINGECKO_DEMO_API_KEY_ENV)
    try:
        os.environ.pop(base.COINGECKO_DEMO_API_KEY_ENV, None)
        try:
            base.coingecko_demo_headers()
        except RuntimeError as exc:
            require("COINGECKO_DEMO_API_KEY" in str(exc), "missing-secret error must name secret")
        else:
            raise AssertionError("missing secret must fail closed before network")

        test_secret = "demo-test-secret-not-real"
        os.environ[base.COINGECKO_DEMO_API_KEY_ENV] = test_secret
        headers = base.coingecko_demo_headers()
        require(headers == {"x-cg-demo-api-key": test_secret}, "Demo header contract")

        session = base.build_session()
        require("x-cg-demo-api-key" not in {k.lower(): v for k, v in session.headers.items()}, "secret must not live in global session headers")

        fake = FakeSession()
        rows = base.fetch_coingecko(fake, 1)
        require(isinstance(rows, list) and len(rows) == 1, "canonical fetch returns list")
        require(len(fake.calls) == 1, "canonical fetch exactly one request in harness")
        require(fake.calls[0][1].get("headers") == {"x-cg-demo-api-key": test_secret}, "canonical CoinGecko request authenticated")

        rank.ORIGINAL_FETCH = lambda _session, _timeout: [
            {"id": "bitcoin", "market_cap_rank": 1, "current_price": 1.0}
        ]
        fallback = FakeSession()
        rank.fetch_coingecko_rank_complete(fallback, 1)
        require(len(fallback.calls) == 1, "rank fallback exactly one request in harness")
        require(fallback.calls[0][1].get("headers") == {"x-cg-demo-api-key": test_secret}, "rank fallback authenticated")

        status = base.build_status(
            status="degraded",
            started_at="2026-09-30T00:00:00.000Z",
            latest=None,
            error="synthetic harness failure",
            preserved=False,
        )
        security = status.get("security") or {}
        require(security.get("api_key_required") is True, "status declares key required")
        require(security.get("api_key_present_in_public_files") is False, "status forbids public key value")
        require(security.get("api_key_value_logged") is False, "status forbids key logging")
        require(security.get("api_key_transport") == "x-cg-demo-api-key header", "status declares header transport")

        serialized = repr(status)
        require(test_secret not in serialized, "secret must never enter public status payload")

        print("40.6.480 PUBLIC CRYPTO DEMO AUTH HARNESS PASS")
        return 0
    finally:
        if old is None:
            os.environ.pop(base.COINGECKO_DEMO_API_KEY_ENV, None)
        else:
            os.environ[base.COINGECKO_DEMO_API_KEY_ENV] = old


if __name__ == "__main__":
    raise SystemExit(main())
