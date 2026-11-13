"""Loopback-only local UI and API; no account access or trade endpoints."""
from __future__ import annotations
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import threading
import uuid
from urllib.parse import urlsplit

from src.engine import LabError, load_bars, options
from src.observatory import TIMEFRAMES, compare, run_one, run_with_diagnostics
from src.okx_public import (
    PublicMarketError, ALLOWED_SPOT, ALLOWED_DAYS, collect as collect_okx, list_sources as okx_sources,
    read_source as read_okx_source,
)
from src.reference_data import CSV_NAME, SourceError, dataset_status, install_reference

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
WORKSPACE = Path(os.environ.get("SEVEN_LAB_WORKSPACE", str(ROOT / "workspace"))).resolve()
IMPORT_LOCK = threading.Lock()
STATIC = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/app.js": ("app.js", "text/javascript; charset=utf-8"),
    "/styles.css": ("styles.css", "text/css; charset=utf-8"),
}


def _atomic_json(path: Path, data: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name("." + path.name + "." + uuid.uuid4().hex + ".tmp")
    try:
        tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False, allow_nan=False) + "\n", encoding="utf-8")
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)


def _resolve_source(source_id: str | None):
    if source_id in (None, "", "BINANCE_BTCUSDT_2026_01_1M"):
        status = dataset_status(WORKSPACE)
        if not status["available"]:
            raise LabError("Charge d'abord l'archive Binance vérifiée")
        return ({"id": status["id"], "pair": "BTC/USDT", "base": "BTC",
                 "quote": "USDT", "exchange": "Binance Spot",
                 "source_timeframe": "1m", "sha256": status["data_sha256"],
                 "label": "Binance Spot BTC/USDT · janvier 2026",
                 "available_timeframes": list(TIMEFRAMES)},
                load_bars(WORKSPACE / "datasets" / CSV_NAME))
    if not isinstance(source_id, str):
        raise PublicMarketError("Identifiant de source incorrect")
    manifest, bars = read_okx_source(WORKSPACE, source_id)
    return ({"id": manifest["id"], "pair": manifest["pair"],
             "base": manifest["base"], "quote": manifest["quote"],
             "exchange": "OKX Spot", "source_timeframe": "1h",
             "sha256": manifest["sha256"],
             "label": manifest["exchange"] + " " + manifest["pair"] +
                      f" · {manifest['rows']} bougies horaires clôturées",
             "available_timeframes": manifest["available_timeframes"],
             "close_boundary_utc": manifest["close_boundary_utc"]}, bars)


def _list_records(category: str) -> list:
    folder = WORKSPACE / category
    if not folder.is_dir():
        return []
    records = []
    for file in sorted(folder.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)[:50]:
        try:
            data = json.loads(file.read_text(encoding="utf-8"))
            if category == "results":
                data = {"id": data["id"], "created_utc": data["created_utc"],
                        "kind": data["run"]["params"]["kind"],
                        "results": data["run"]["results"],
                        "pair": data["run"]["data"]["pair"],
                        "timeframe": data["run"]["data"].get("timeframe", "1m"),
                        "source": data.get("source", {"id":"BINANCE_BTCUSDT_2026_01_1M",
                                                      "pair":"BTC/USDT","quote":"USDT"})}
            if category == "comparisons":
                data = {"id": data["id"], "created_utc": data["created_utc"],
                        "timeframe": data["comparison"]["timeframe"],
                        "rows": data["comparison"]["rows"],
                        "source": data.get("source", {"id":"BINANCE_BTCUSDT_2026_01_1M",
                                                      "pair":"BTC/USDT","quote":"USDT"})}
            records.append(data)
        except (OSError, ValueError, KeyError, TypeError):
            continue
    return records


class Handler(BaseHTTPRequestHandler):
    server_version = "SevenHeavenStrategyLab/4.0"

    def _headers(self, status, mime, size):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(size))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; "
                         "script-src 'self'; style-src 'self'; connect-src 'self'; "
                         "img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
        self.end_headers()

    def _send(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self._headers(status, "application/json; charset=utf-8", len(body))
        self.wfile.write(body)

    def _safe_origin(self):
        host = self.headers.get("Host", "")
        if host not in ("127.0.0.1:8777", "localhost:8777"):
            self._send({"error": "Accès local uniquement"}, 403)
            return False
        origin = self.headers.get("Origin")
        if origin and origin not in ("http://127.0.0.1:8777", "http://localhost:8777"):
            self._send({"error": "Origine refusée"}, 403)
            return False
        return True

    def do_GET(self):
        if not self._safe_origin():
            return
        path = urlsplit(self.path).path
        if path in STATIC:
            name, mime = STATIC[path]
            try:
                blob = (WEB / name).read_bytes()
            except OSError:
                self._send({"error": "Page indisponible"}, 500)
                return
            self._headers(200, mime, len(blob))
            self.wfile.write(blob)
            return
        if path == "/api/health":
            self._send({"name": "Seven Heaven Strategy Lab", "version": "4.0.0",
                        "status": "LOCAL_PAPER_ONLY", "live_trading": False,
                        "timeframes": list(TIMEFRAMES), "comparisons_enabled": True,
                        "public_okx_enabled": True,
                        "public_pairs": list(ALLOWED_SPOT),
                        "public_history_days": list(ALLOWED_DAYS),
                        "strategy_creator_enabled": True,
                        "custom_rule_entry": ["EMA_CROSS_UP", "PRICE_ABOVE_EMA"],
                        "custom_rule_filters": ["NONE", "RSI_BELOW", "VOLUME_ABOVE"],
                        "source": "SHA-verified Binance BTCUSDT January 2026",
                        "engines": {"internal_paper": True, "freqtrade": False, "hummingbot": False}})
        elif path == "/api/datasets":
            self._send({"datasets": [dataset_status(WORKSPACE)]})
        elif path == "/api/okx-sources":
            self._send(okx_sources(WORKSPACE))
        elif path == "/api/profiles":
            self._send({"profiles": _list_records("profiles")})
        elif path == "/api/results":
            self._send({"runs": _list_records("results")})
        elif path == "/api/comparisons":
            self._send({"comparisons": _list_records("comparisons")})
        elif re.fullmatch(r"/api/results/[0-9a-f]{32}", path):
            file = WORKSPACE / "results" / (path.rsplit("/", 1)[-1] + ".json")
            if not file.is_file():
                self._send({"error": "Résultat introuvable"}, 404)
            else:
                self._send(json.loads(file.read_text(encoding="utf-8")))
        elif re.fullmatch(r"/api/comparisons/[0-9a-f]{32}", path):
            file = WORKSPACE / "comparisons" / (path.rsplit("/", 1)[-1] + ".json")
            if not file.is_file():
                self._send({"error": "Comparaison introuvable"}, 404)
            else:
                self._send(json.loads(file.read_text(encoding="utf-8")))
        else:
            self._send({"error": "Page introuvable"}, 404)

    def do_POST(self):
        if not self._safe_origin():
            return
        path = urlsplit(self.path).path
        if path not in ("/api/import-reference", "/api/okx-import", "/api/run", "/api/compare", "/api/profiles"):
            self._send({"error": "Action interdite"}, 404)
            return
        if self.headers.get("Content-Type", "").split(";")[0].strip().lower() != "application/json":
            self._send({"error": "JSON requis"}, 415)
            return
        try:
            length = int(self.headers.get("Content-Length", "-1"))
            if not 0 < length <= 16000:
                self._send({"error": "Requête trop grande ou vide"}, 413)
                return
            data = json.loads(self.rfile.read(length).decode("utf-8"))
            if not isinstance(data, dict):
                raise LabError("Objet JSON attendu")
            if path == "/api/import-reference":
                # Blocking only one explicit public release download at a time.
                with IMPORT_LOCK:
                    self._send({"dataset": install_reference(WORKSPACE)})
            elif path == "/api/okx-import":
                with IMPORT_LOCK:
                    self._send({"source": collect_okx(WORKSPACE, data.get("pair"),
                        days=data.get("days",10), end_date=data.get("end_date"))}, 201)
            elif path == "/api/profiles":
                name = data.get("name", "")
                if not isinstance(name, str) or not 1 <= len(name.strip()) <= 64:
                    raise LabError("Nom de profil : 1 à 64 caractères")
                if any(ord(c) < 32 for c in name):
                    raise LabError("Nom de profil invalide")
                requested = data.get("params")
                config = options(requested)
                timeframe = requested.get("timeframe", "1m")
                if timeframe not in TIMEFRAMES:
                    raise LabError("Période de bougies inconnue")
                config["timeframe"] = timeframe
                source, _ = _resolve_source(requested.get("source_id"))
                if timeframe not in source["available_timeframes"]:
                    raise LabError("Ce timeframe n'existe pas pour cette source")
                config["source_id"] = source["id"]
                from datetime import datetime, timezone
                saved = {"id": uuid.uuid4().hex,
                         "created_utc": datetime.now(timezone.utc).isoformat(),
                         "name": name.strip(), "params": config}
                _atomic_json(WORKSPACE / "profiles" / (saved["id"] + ".json"), saved)
                self._send({"profile": saved}, 201)
            else:
                requested = data.get("params", {})
                if not isinstance(requested, dict):
                    raise LabError("Paramètres PAPER non valides")
                source, historical = _resolve_source(requested.get("source_id"))
                timeframe = requested.get("timeframe", "1m")
                if timeframe not in source["available_timeframes"]:
                    raise LabError("Le timeframe " + str(timeframe) + " est indisponible pour " + source["label"])
                base_tf = source["source_timeframe"]
                from datetime import datetime, timezone
                metadata = {"id": uuid.uuid4().hex,
                            "created_utc": datetime.now(timezone.utc).isoformat(),
                            "source_sha256": source["sha256"],
                            "source": source}
                if path == "/api/compare":
                    comparison = compare(historical, requested, source_timeframe=base_tf,
                                         source_label=source["label"])
                    comparison["params"]["source_id"] = source["id"]
                    comparison["asset_units"] = {"base": source["base"], "quote": source["quote"]}
                    for row in comparison["rows"]:
                        row["base_inventory"] = row["base_inventory_btc"]
                        row["fees_paid_quote"] = row["fees_paid_usdt"]
                        row["cash_quote"] = row["cash_final"]
                    # Human strategy labels must follow the actual underlying and
                    # quote asset, never label USDC/ETH simulations as BTC/USDT.
                    for row in comparison["rows"]:
                        if row["kind"] == "CASH":
                            row["label"] = "Conservation " + source["quote"]
                        elif row["kind"] == "HOLD_50":
                            row["label"] = "Buy & Hold 50 % " + source["base"]
                        elif row["kind"] == "HOLD_100":
                            row["label"] = "Buy & Hold 100 % " + source["base"]
                    if base_tf == "1h":
                        comparison["warnings"] = [
                            w.replace("0.10% OKX Taker is a scenario, not historical Binance realized fees",
                                      "0.10% observed OKX taker is a model assumption; historical fee not verified")
                            for w in comparison["warnings"]]
                    record = {**metadata, "comparison": comparison}
                    _atomic_json(WORKSPACE / "comparisons" / (record["id"] + ".json"), record)
                    self._send({"report": record}, 201)
                else:
                    result, counterfactual = run_with_diagnostics(historical, requested,
                                                                  source_timeframe=base_tf)
                    result["data"]["pair"] = source["pair"]
                    result["data"]["base"] = source["base"]
                    result["data"]["quote"] = source["quote"]
                    result["data"]["exchange"] = source["exchange"]
                    result["data"]["source_id"] = source["id"]
                    result["data"]["source_sha256"] = source["sha256"]
                    result["results"]["asset_units"] = {"base": source["base"], "quote": source["quote"]}
                    result["results"]["base_inventory"] = result["results"]["base_inventory_btc"]
                    result["results"]["fees_paid_quote"] = result["results"]["fees_paid_usdt"]
                    result["results"]["inventory_marked_quote"] = result["results"]["inventory_marked_usdt"]
                    result["results"]["cash_quote"] = result["results"]["cash_final"]
                    result["params"]["source_id"] = source["id"]
                    if base_tf == "1h":
                        result["warnings"] = [
                            "OKX public Spot CLOSED hourly candles, no historical order book or full fill proof",
                            "Instrument lot/tick/min size retrieved but not applied to this legacy internal PAPER engine",
                            "Same observed 0.10% taker fees across venues/dates are an assumed scenario",
                            "Next-bar-open hypothetical fills; slippage fixed; zero real orders"]
                    baselines = {}
                    for kind in ("HOLD_50", "CASH"):
                        if result["params"]["kind"] == kind:
                            baselines[kind] = result["results"]
                        else:
                            baselines[kind] = run_one(historical, {
                                **result["params"], "timeframe": result["data"]["timeframe"]
                            }, kind=kind, source_timeframe=base_tf)["results"]
                    record = {**metadata, "run": result,
                              "baselines": baselines, "counterfactual": counterfactual}
                    _atomic_json(WORKSPACE / "results" / (record["id"] + ".json"), record)
                    self._send({"report": record}, 201)
        except (LabError, SourceError, PublicMarketError, ValueError, OverflowError) as exc:
            self._send({"error": str(exc)}, 400)
        except (TimeoutError, OSError) as exc:
            self._send({"error": "Échec d'accès aux fichiers ou au téléchargement : " + str(exc)}, 503)
        except Exception:
            self.log_error("Unhandled error while executing safe research action")
            self._send({"error": "Échec interne du laboratoire ; aucun ordre n'a été envoyé"}, 500)


def main():
    host = os.environ.get("SEVEN_LAB_HOST", "127.0.0.1")
    port = int(os.environ.get("SEVEN_LAB_PORT", "8777"))
    WORKSPACE.mkdir(parents=True, exist_ok=True)
    with ThreadingHTTPServer((host, port), Handler) as server:
        print(f"Seven Heaven Strategy Lab | PAPER uniquement | http://127.0.0.1:{port}", flush=True)
        if os.environ.get("SEVEN_LAB_OPEN_BROWSER") == "1":
            import webbrowser
            if not webbrowser.open(f"http://127.0.0.1:{port}/"):
                print("Ouvre le laboratoire dans Firefox : http://127.0.0.1:8777", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()
