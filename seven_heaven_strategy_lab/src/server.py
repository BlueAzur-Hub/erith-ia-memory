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
                        "timeframe": data["run"]["data"].get("timeframe", "1m")}
            if category == "comparisons":
                data = {"id": data["id"], "created_utc": data["created_utc"],
                        "timeframe": data["comparison"]["timeframe"],
                        "rows": data["comparison"]["rows"]}
            records.append(data)
        except (OSError, ValueError, KeyError, TypeError):
            continue
    return records


class Handler(BaseHTTPRequestHandler):
    server_version = "SevenHeavenStrategyLab/2.0"

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
            self._send({"name": "Seven Heaven Strategy Lab", "version": "2.0.0",
                        "status": "LOCAL_PAPER_ONLY", "live_trading": False,
                        "timeframes": list(TIMEFRAMES), "comparisons_enabled": True,
                        "source": "SHA-verified Binance BTCUSDT January 2026",
                        "engines": {"internal_paper": True, "freqtrade": False, "hummingbot": False}})
        elif path == "/api/datasets":
            self._send({"datasets": [dataset_status(WORKSPACE)]})
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
        if path not in ("/api/import-reference", "/api/run", "/api/compare", "/api/profiles"):
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
                from datetime import datetime, timezone
                saved = {"id": uuid.uuid4().hex,
                         "created_utc": datetime.now(timezone.utc).isoformat(),
                         "name": name.strip(), "params": config}
                _atomic_json(WORKSPACE / "profiles" / (saved["id"] + ".json"), saved)
                self._send({"profile": saved}, 201)
            else:
                if not dataset_status(WORKSPACE)["available"]:
                    raise LabError("Charge d'abord l'archive historique vérifiée")
                historical = load_bars(WORKSPACE / "datasets" / CSV_NAME)
                requested = data.get("params", {})
                from datetime import datetime, timezone
                metadata = {"id": uuid.uuid4().hex,
                            "created_utc": datetime.now(timezone.utc).isoformat(),
                            "source_sha256": dataset_status(WORKSPACE)["data_sha256"]}
                if path == "/api/compare":
                    record = {**metadata, "comparison": compare(historical, requested)}
                    _atomic_json(WORKSPACE / "comparisons" / (record["id"] + ".json"), record)
                    self._send({"report": record}, 201)
                else:
                    result, counterfactual = run_with_diagnostics(historical, requested)
                    baselines = {}
                    for kind in ("HOLD_50", "CASH"):
                        if result["params"]["kind"] == kind:
                            baselines[kind] = result["results"]
                        else:
                            baselines[kind] = run_one(historical, {
                                **result["params"], "timeframe": result["data"]["timeframe"]
                            }, kind=kind)["results"]
                    record = {**metadata, "run": result,
                              "baselines": baselines, "counterfactual": counterfactual}
                    _atomic_json(WORKSPACE / "results" / (record["id"] + ".json"), record)
                    self._send({"report": record}, 201)
        except (LabError, SourceError, ValueError, OverflowError) as exc:
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
