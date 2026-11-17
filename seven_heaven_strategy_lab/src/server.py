"""Loopback-only local UI and API; no account access or trade endpoints."""
from __future__ import annotations
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import threading
import uuid
from urllib.parse import parse_qs, urlsplit

from src.engine import LabError, load_bars, options
from src.strategy_spec import (
    build_strategy_spec, explain_strategy_spec, strategy_spec_to_params, validate_strategy_spec,
)
from src.source_catalog import build_catalog
from src.strategy_atlas import catalog as strategy_atlas_catalog
from src.strategy_knowledge import catalog as strategy_knowledge_catalog, article as strategy_knowledge_article
from src.catalog_source_v48 import (CatalogSourceError, list_sources as catalog_registered_sources, read_source as read_catalog_registered_source)
from src.observatory import TIMEFRAMES, compare, run_one, run_with_diagnostics
from src.microscope import build_microscope, ALLOWED_WINDOWS
from src.robustness import study as study_robustness
from src.filter_research import study as study_filter_research
from src.forensics import diagnose as diagnose_paper_trades
from src.okx_public import (
    PublicMarketError, ALLOWED_SPOT, ALLOWED_DAYS, collect as collect_okx, list_sources as okx_sources,
    read_source as read_okx_source,
)
from src.binance_monthly_source_v46 import (
    MonthlySourceError,
    SOURCE_ID as BINANCE_MONTHLY_SOURCE_ID,
    install as install_binance_monthly,
    list_sources as binance_monthly_sources,
    read_source as read_binance_monthly_source,
)
from src.reference_data import CSV_NAME, SourceError, dataset_status, install_reference
from src.historical_vault_v1 import HistoricalVaultError, vault_status as historical_vault_status, install_year as install_historical_year

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "web"
WORKSPACE = Path(os.environ.get("SEVEN_LAB_WORKSPACE", str(ROOT / "workspace"))).resolve()
IMPORT_LOCK = threading.Lock()
STATIC = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/index.html": ("index.html", "text/html; charset=utf-8"),
    "/app.js": ("app.js", "text/javascript; charset=utf-8"),
    "/microscope.js": ("microscope.js", "text/javascript; charset=utf-8"),
    "/forensics.js": ("forensics.js", "text/javascript; charset=utf-8"),
    "/strategy_research.js": ("strategy_research.js", "text/javascript; charset=utf-8"),
    "/lab-help-layer.js": ("lab-help-layer.js", "text/javascript; charset=utf-8"),
    "/historical-vault.js": ("historical-vault.js", "text/javascript; charset=utf-8"),
    "/styles.css": ("styles.css", "text/css; charset=utf-8"),
}



def _public_error_message(exc: Exception) -> str:
    """Keep the canonical engine untouched while presenting quote-agnostic errors."""
    return (str(exc)
            .replace("Capital USDT", "Capital (devise de cotation)")
            .replace("DCA montant USDT", "DCA montant (devise de cotation)"))


def _source_warnings(source: dict) -> list[str]:
    """Human warnings bound to the resolved source, never to a stale default pair."""
    kind=source.get("source_kind")
    identity=f"{source.get('exchange','Source')} · {source.get('pair','paire inconnue')}"
    if kind=="BINANCE_MONTHLY_CERTIFIED":
        provenance=identity+" · archive mensuelle publique certifiée par checksum"
    elif kind=="OKX_PUBLIC_ARCHIVE":
        provenance=identity+" · bougies publiques clôturées, empreinte SHA-256 locale"
    elif kind=="CATALOG_REGISTERED_V1":
        provenance=identity+" · source cataloguée locale vérifiée, empreinte SHA-256"
    elif kind=="LEGACY_BINANCE_V1_V2":
        provenance=identity+" · archive de référence locale vérifiée"
    else:
        provenance=identity+" · source locale vérifiée"
    return [
        provenance,
        "Aucun carnet d'ordres historique, position de file ou remplissage réel garanti",
        "Frais et glissement configurés = hypothèses PAPER, pas frais historiques certifiés",
        "Fills fictifs à l'ouverture de la bougie suivante ; zéro ordre réel",
    ]

CANONICAL_MANIFEST_NAME = "CANONICAL_REBUILD_MANIFEST.json"
USER_PROFILE_DIR = "user_profiles"
USER_STRATEGY_SPEC_DIR = "user_strategy_specs"

def _workspace_is_managed() -> bool:
    return (WORKSPACE / CANONICAL_MANIFEST_NAME).is_file()

def _workspace_write_mode() -> str:
    return os.environ.get("SEVEN_LAB_WORKSPACE_WRITE_MODE", "explore").strip().lower()

def _workspace_can_persist() -> bool:
    return (not _workspace_is_managed()) or _workspace_write_mode() == "canonical"

def _workspace_status() -> dict:
    managed = _workspace_is_managed()
    manifest = None
    if managed:
        try:
            manifest = json.loads((WORKSPACE / CANONICAL_MANIFEST_NAME).read_text(encoding="utf-8"))
        except (OSError, ValueError, TypeError):
            manifest = None
    generated = manifest.get("generated", {}) if isinstance(manifest, dict) else {}
    return {
        "managed": managed,
        "write_mode": _workspace_write_mode(),
        "ui_persistence_allowed": _workspace_can_persist(),
        "manual_configuration_persistence_allowed": True,
        "manual_results_persistence_allowed": _workspace_can_persist(),
        "canonical_schema": manifest.get("schema") if isinstance(manifest, dict) else None,
        "canonical_created_utc": manifest.get("created_utc") if isinstance(manifest, dict) else None,
        "canonical_counts": {
            "profiles": len(generated.get("profiles", [])) if isinstance(generated, dict) else 0,
            "strategy_specs": len(generated.get("strategy_specs", [])) if isinstance(generated, dict) else 0,
            "runs": len(generated.get("runs", [])) if isinstance(generated, dict) else 0,
            "comparisons": len(generated.get("comparisons", [])) if isinstance(generated, dict) else 0,
        },
        "user_counts": {
            "profiles": len(list((WORKSPACE/USER_PROFILE_DIR).glob("*.json"))) if (WORKSPACE/USER_PROFILE_DIR).is_dir() else 0,
            "strategy_specs": len(list((WORKSPACE/USER_STRATEGY_SPEC_DIR).glob("*.json"))) if (WORKSPACE/USER_STRATEGY_SPEC_DIR).is_dir() else 0,
        },
    }

def _managed_write_guard(action: str):
    if _workspace_is_managed() and not _workspace_can_persist():
        raise LabError(
            "Workspace canonique géré par Seven : " + action +
            " est désactivée en mode exploration. Le rebuild canonique est la seule écriture de référence."
        )

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
                 "available_timeframes": list(TIMEFRAMES),
                 "source_kind": "LEGACY_BINANCE_V1_V2"},
                load_bars(WORKSPACE / "datasets" / CSV_NAME))
    if not isinstance(source_id, str):
        raise PublicMarketError("Identifiant de source incorrect")
    if source_id == BINANCE_MONTHLY_SOURCE_ID:
        manifest, bars = read_binance_monthly_source(WORKSPACE, source_id)
        return ({"id": manifest["id"], "pair": manifest["pair"],
                 "base": manifest["base"], "quote": manifest["quote"],
                 "exchange": manifest["exchange"], "source_timeframe": "1h",
                 "sha256": manifest["stored_csv_sha256"],
                 "source_archive_sha256": manifest["archive_sha256_observed"],
                 "label": "Binance Spot BTC/USDT · janvier 2020 · mois certifié",
                 "available_timeframes": manifest["available_timeframes"],
                 "close_boundary_utc": manifest["close_boundary_utc"],
                 "source_kind": "BINANCE_MONTHLY_CERTIFIED"}, bars)
    if source_id.startswith("CAT_"):
        manifest,bars=read_catalog_registered_source(WORKSPACE,source_id)
        return ({"id":manifest["id"],"pair":manifest["pair"],"base":manifest["base"],"quote":manifest["quote"],
                 "exchange":manifest["exchange"],"source_timeframe":manifest["source_timeframe"],"sha256":manifest["sha256"],
                 "label":manifest["exchange"]+" "+manifest["pair"]+" · source cataloguée certifiée",
                 "available_timeframes":manifest["available_timeframes"],"close_boundary_utc":manifest.get("close_boundary_utc"),
                 "certification":manifest.get("certification"),"source_kind":"CATALOG_REGISTERED_V1"},bars)
    manifest, bars = read_okx_source(WORKSPACE, source_id)
    return ({"id": manifest["id"], "pair": manifest["pair"],
             "base": manifest["base"], "quote": manifest["quote"],
             "exchange": "OKX Spot", "source_timeframe": "1h",
             "sha256": manifest["sha256"],
             "label": manifest["exchange"] + " " + manifest["pair"] +
                      f" · {manifest['rows']} bougies horaires clôturées",
             "available_timeframes": manifest["available_timeframes"],
             "close_boundary_utc": manifest["close_boundary_utc"],
             "source_kind": "OKX_PUBLIC_ARCHIVE"}, bars)


def _sources_catalog() -> dict:
    """Build Source Catalog v1 from verified local namespaces only."""
    okx = okx_sources(WORKSPACE)
    entries = []
    status = dataset_status(WORKSPACE)
    if status.get("available"):
        entries.append({
            "id": status["id"], "source_kind": "LEGACY_BINANCE_V1_V2",
            "exchange": "Binance Spot", "pair": "BTC/USDT", "base": "BTC", "quote": "USDT",
            "source_timeframe": "1m", "available_timeframes": list(TIMEFRAMES),
            "rows": status.get("rows", 44640), "sha256": status["data_sha256"],
            "certification": "SHA256_REFERENCE_ARCHIVE",
        })
    entries.extend({**source, "source_kind": "BINANCE_MONTHLY_CERTIFIED", "source_timeframe": source.get("bar", "1h")}
                   for source in binance_monthly_sources(WORKSPACE))
    entries.extend({**source, "source_kind": "OKX_PUBLIC_ARCHIVE", "source_timeframe": source.get("bar", "1h"),
                    "exchange": source.get("exchange", "OKX Spot")} for source in okx["sources"])
    entries.extend(catalog_registered_sources(WORKSPACE))
    result = build_catalog(entries, free_bytes=okx["free_bytes"], reserve_bytes=okx["reserve_bytes"])
    result.update({
        "public_connected": True,
        "binance_monthly_pilot": {"id": BINANCE_MONTHLY_SOURCE_ID, "pair": "BTC/USDT", "bar": "1h",
                                  "year": 2020, "month": 1,
                                  "installed": any(x["source_id"] == BINANCE_MONTHLY_SOURCE_ID for x in result["sources"])},
    })
    return result


def _strategy_spec_folders():
    folders=[("canonical",WORKSPACE/"strategy_specs")]
    if _workspace_is_managed(): folders.append(("user",WORKSPACE/USER_STRATEGY_SPEC_DIR))
    return folders

def _list_strategy_specs() -> list:
    records=[]
    files=[]
    for namespace,folder in _strategy_spec_folders():
        if folder.is_dir():
            files.extend((f.stat().st_mtime,namespace,f) for f in folder.glob("*.json"))
    for _,namespace,file in sorted(files,key=lambda x:x[0],reverse=True)[:150]:
        try:
            spec=validate_strategy_spec(json.loads(file.read_text(encoding="utf-8")))
            records.append({"id":spec["id"],"name":spec["name"],"kind":spec["strategy"]["kind"],
                            "timeframe":spec["market"]["timeframe"],"source_id":spec["market"]["source_id"],
                            "fingerprint_sha256":spec["fingerprint_sha256"],"namespace":namespace,
                            "explanation":explain_strategy_spec(spec)})
        except (OSError,ValueError,KeyError,TypeError,LabError):
            continue
    return records

def _load_strategy_spec(spec_id: str) -> dict:
    if not isinstance(spec_id,str) or not re.fullmatch(r"[0-9a-f]{32}",spec_id): raise LabError("StrategySpec : identifiant non autorisé")
    for _,folder in _strategy_spec_folders():
        file=folder/(spec_id+".json")
        if not file.is_file(): continue
        spec=validate_strategy_spec(json.loads(file.read_text(encoding="utf-8")))
        if spec["id"]!=spec_id: raise LabError("StrategySpec : identifiant incohérent")
        return spec
    raise LabError("StrategySpec introuvable")

def _profile_folders():
    folders=[("canonical",WORKSPACE/"profiles")]
    if _workspace_is_managed(): folders.append(("user",WORKSPACE/USER_PROFILE_DIR))
    return folders

def _list_profiles() -> list:
    rows=[]
    files=[]
    for namespace,folder in _profile_folders():
        if folder.is_dir(): files.extend((f.stat().st_mtime,namespace,f) for f in folder.glob("*.json"))
    for _,namespace,file in sorted(files,key=lambda x:x[0],reverse=True)[:150]:
        try:
            data=json.loads(file.read_text(encoding="utf-8")); data["namespace"]=namespace; rows.append(data)
        except (OSError,ValueError,KeyError,TypeError): continue
    return rows

def _manual_profile_folder()->Path:
    return WORKSPACE/(USER_PROFILE_DIR if _workspace_is_managed() and _workspace_write_mode()!="canonical" else "profiles")

def _manual_strategy_spec_folder()->Path:
    return WORKSPACE/(USER_STRATEGY_SPEC_DIR if _workspace_is_managed() and _workspace_write_mode()!="canonical" else "strategy_specs")


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
    server_version = "SevenHeavenStrategyLab/4.9.0-dev1"

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
        port = int(getattr(self.server, "server_port", 8777))
        allowed_hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
        host = self.headers.get("Host", "")
        if host not in allowed_hosts:
            self._send({"error": "Accès local uniquement"}, 403)
            return False
        origin = self.headers.get("Origin")
        allowed_origins = {f"http://127.0.0.1:{port}", f"http://localhost:{port}"}
        if origin and origin not in allowed_origins:
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
            self._send({"name": "Seven Heaven Strategy Lab", "version": "4.9.0-dev1",
                        "release_channel": "DEV1",
                        "status": "LOCAL_PAPER_ONLY_DEVELOPMENT", "live_trading": False,
                        "timeframes": list(TIMEFRAMES), "comparisons_enabled": True,
                        "public_okx_enabled": True,
                        "public_pairs": list(ALLOWED_SPOT),
                        "public_history_days": list(ALLOWED_DAYS),
                        "strategy_creator_enabled": True,
                        "strategy_spec_v1_enabled": True,
                        "strategy_spec_external_engine_required": False,
                        "source_catalog_v1_enabled": True,
                        "strategy_atlas_v1_enabled": True,
                        "guided_workflow_v1_enabled": True,
                        "strategy_knowledge_v1_enabled": True,
                        "historical_vault_v1_enabled": True,
                        "historical_vault_v2_bundle_enabled": True,
                        "historical_vault_v3_bundle_enabled": True,
                        "workspace_steward_v3_enabled": True,
                        "market_microscope_enabled": True,
                        "walk_forward_research_enabled": True,
                        "paper_trade_forensics_enabled": True,
                        "controlled_filter_research_enabled": True,
                        "certified_binance_monthly_enabled": True,
                        "explicit_no_trade_warmup_enabled": True,
                        "native_donchian_enabled": True,
                        "market_microscope_windows": list(ALLOWED_WINDOWS),
                        "custom_rule_entry": ["EMA_CROSS_UP", "PRICE_ABOVE_EMA"],
                        "custom_rule_filters": ["NONE", "RSI_BELOW", "VOLUME_ABOVE"],
                        "source": "catalogue local de sources vérifiées",
                        "workspace": _workspace_status(),
                        "engines": {"internal_paper": True, "freqtrade": False, "hummingbot": False}})
        elif path == "/api/datasets":
            self._send({"datasets": [dataset_status(WORKSPACE)]})
        elif path == "/api/okx-sources":
            self._send(okx_sources(WORKSPACE))
        elif path == "/api/sources":
            self._send(_sources_catalog())
        elif path == "/api/historical-vault":
            self._send(historical_vault_status(WORKSPACE))
        elif path == "/api/strategy-atlas":
            self._send(strategy_atlas_catalog())
        elif path == "/api/strategy-knowledge":
            self._send(strategy_knowledge_catalog())
        elif re.fullmatch(r"/api/strategy-knowledge/[a-z0-9_-]+", path):
            try:
                self._send(strategy_knowledge_article(path.rsplit("/",1)[-1]))
            except KeyError:
                self._send({"error":"Fiche de connaissance introuvable"},404)
        elif path == "/api/strategy-specs":
            self._send({"strategy_specs": _list_strategy_specs()})
        elif re.fullmatch(r"/api/strategy-specs/[0-9a-f]{32}", path):
            try:
                spec=_load_strategy_spec(path.rsplit("/",1)[-1])
                self._send({"strategy_spec":spec,"params":strategy_spec_to_params(spec),"explanation":explain_strategy_spec(spec)})
            except (LabError,ValueError,TypeError,OSError) as exc:
                self._send({"error":str(exc)},404)
        elif path == "/api/trade-forensics":
            # Postmortem only; exact saved result + same SHA-verified candles.
            # Replay causes without changing prior JSON or touching exchange APIs.
            try:
                query=parse_qs(urlsplit(self.path).query,keep_blank_values=True)
                if set(query)!={"run_id"} or len(query["run_id"])!=1:
                    raise LabError("Un identifiant de simulation est requis")
                run_id=query["run_id"][0]
                if not re.fullmatch(r"[0-9a-f]{32}",run_id):
                    raise LabError("Identifiant du rapport non autorisé")
                file=WORKSPACE/"results"/(run_id+".json")
                if not file.is_file():
                    self._send({"error":"Rapport PAPER introuvable"},404)
                    return
                record=json.loads(file.read_text(encoding="utf-8"))
                if record.get("id")!=run_id:
                    raise LabError("Identifiant du rapport incompatible")
                source_id=record.get("run",{}).get("data",{}).get("source_id")
                if not source_id and isinstance(record.get("source"),dict):
                    source_id=record["source"].get("id")
                if not source_id:
                    raise LabError("Ancien rapport sans provenance fiable")
                source,bars=_resolve_source(source_id)
                outcome=diagnose_paper_trades(record,bars,source)
                self._send({"forensics":outcome})
            except (LabError,SourceError,PublicMarketError,ValueError,TypeError,OSError) as exc:
                self._send({"error":str(exc)},400)
        elif path == "/api/microscope":
            # Read-only viewport of an existing PAPER report. Never fetches live
            # exchange prices or runs a new simulation to fill chart gaps.
            try:
                query = parse_qs(urlsplit(self.path).query, keep_blank_values=True)
                if not set(query).issubset({"run_id", "limit", "start_index"}):
                    raise LabError("Paramètres microscope non autorisés")
                if any(len(values) != 1 for values in query.values()):
                    raise LabError("Paramètres microscope ambigus")
                run_id = (query.get("run_id") or [""])[0]
                if not re.fullmatch(r"[0-9a-f]{32}", run_id):
                    raise LabError("Identifiant de simulation invalide")
                limit_raw = (query.get("limit") or ["120"])[0]
                if not re.fullmatch(r"(60|90|120|180)", limit_raw):
                    raise LabError("Fenêtre du microscope incorrecte")
                start_raw = (query.get("start_index") or [None])[0]
                if start_raw is not None and not re.fullmatch(r"(0|[1-9][0-9]{0,6})", start_raw):
                    raise LabError("Position du microscope invalide")
                file = WORKSPACE / "results" / (run_id + ".json")
                if not file.is_file():
                    self._send({"error": "Rapport local introuvable"}, 404)
                    return
                record = json.loads(file.read_text(encoding="utf-8"))
                if record.get("id") != run_id:
                    raise LabError("Identifiant du rapport incohérent")
                source_id = record.get("run", {}).get("data", {}).get("source_id")
                if source_id is None and isinstance(record.get("source"), dict):
                    source_id = record["source"].get("id")
                if not source_id:
                    raise LabError("Rapport ancien sans provenance exploitable pour le microscope")
                source, bars = _resolve_source(source_id)
                data = build_microscope(
                    bars, record, source,
                    limit=int(limit_raw),
                    start_index=int(start_raw) if start_raw is not None else None,
                )
                self._send({"microscope": data})
            except (LabError, SourceError, PublicMarketError, ValueError, TypeError, OSError) as exc:
                self._send({"error": _public_error_message(exc)}, 400)
        elif path == "/api/profiles":
            self._send({"profiles": _list_profiles()})
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
        if path not in ("/api/import-reference", "/api/binance-monthly-import", "/api/okx-import", "/api/historical-vault-install", "/api/run", "/api/compare", "/api/profiles", "/api/robustness", "/api/filters-study", "/api/strategy-specs", "/api/strategy-spec-run"):
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
            elif path == "/api/binance-monthly-import":
                if data:
                    raise MonthlySourceError("L'import pilote V4.6 n'accepte aucun paramètre libre")
                with IMPORT_LOCK:
                    self._send({"source": install_binance_monthly(WORKSPACE)}, 201)
            elif path == "/api/okx-import":
                with IMPORT_LOCK:
                    self._send({"source": collect_okx(WORKSPACE, data.get("pair"),
                        days=data.get("days",10), end_date=data.get("end_date"))}, 201)
            elif path == "/api/historical-vault-install":
                symbol=data.get("symbol"); year=data.get("year")
                if not isinstance(symbol,str) or type(year) is not int:
                    raise HistoricalVaultError("Historical Vault : actif et année requis")
                with IMPORT_LOCK:
                    source=install_historical_year(WORKSPACE,symbol,year)
                self._send({"source":source,"vault":historical_vault_status(WORKSPACE)},201)
            elif path == "/api/filters-study":
                # Scientific train-only experiment, memory-only, no USB files
                # or account endpoints. Always verify source SHA via resolver.
                requested=data.get("params", {})
                if not isinstance(requested,dict):
                    raise LabError("Paramètres d'étude des filtres invalides")
                source,historical=_resolve_source(requested.get("source_id"))
                study=study_filter_research(historical,requested,source)
                self._send({"research":study},200)
            elif path == "/api/robustness":
                # Fully ephemeral PAPER analysis: no proliferating JSON files on
                # the user's USB, no account keys and no trading endpoints.
                requested = data.get("params", {})
                if not isinstance(requested, dict):
                    raise LabError("Paramètres de recherche incorrects")
                source, historical = _resolve_source(requested.get("source_id"))
                report = study_robustness(historical, requested, source)
                self._send({"research": report}, 200)
            elif path == "/api/strategy-specs":
                name=data.get("name",""); requested=data.get("params")
                if not isinstance(requested,dict): raise LabError("StrategySpec : paramètres manquants")
                source,_=_resolve_source(requested.get("source_id"))
                timeframe=requested.get("timeframe","1m")
                if timeframe not in source["available_timeframes"]: raise LabError("StrategySpec : timeframe indisponible pour cette source")
                spec=build_strategy_spec(name,{**requested,"source_id":source["id"],"timeframe":timeframe},spec_id=uuid.uuid4().hex)
                _atomic_json(_manual_strategy_spec_folder()/(spec["id"]+".json"),spec)
                self._send({"strategy_spec":spec,"params":strategy_spec_to_params(spec),"explanation":explain_strategy_spec(spec)},201)
            elif path == "/api/strategy-spec-run":
                spec=_load_strategy_spec(data.get("strategy_spec_id")); requested=strategy_spec_to_params(spec)
                source,historical=_resolve_source(requested.get("source_id")); timeframe=requested["timeframe"]
                if timeframe not in source["available_timeframes"]: raise LabError("StrategySpec : timeframe indisponible pour cette source")
                run,counterfactual=run_with_diagnostics(historical,requested,source_timeframe=source["source_timeframe"])
                run["data"].update({"pair":source["pair"],"base":source["base"],"quote":source["quote"],"exchange":source["exchange"],
                                    "source_id":source["id"],"source_sha256":source["sha256"]})
                run["params"]["source_id"]=source["id"]
                run["results"]["asset_units"]={"base":source["base"],"quote":source["quote"]}
                run["results"]["base_inventory"]=run["results"]["base_inventory_btc"]
                run["results"]["fees_paid_quote"]=run["results"]["fees_paid_usdt"]
                run["results"]["inventory_marked_quote"]=run["results"]["inventory_marked_usdt"]
                run["results"]["cash_quote"]=run["results"]["cash_final"]
                run["warnings"]=_source_warnings(source)
                baselines={}
                for kind in ("HOLD_50","CASH"):
                    baselines[kind]=run["results"] if run["params"]["kind"]==kind else run_one(historical,{**run["params"],"timeframe":run["data"]["timeframe"]},kind=kind,source_timeframe=source["source_timeframe"])["results"]
                from datetime import datetime,timezone
                report={"id":uuid.uuid4().hex,"created_utc":datetime.now(timezone.utc).isoformat(),"source_sha256":source["sha256"],
                        "source":source,"strategy_spec_id":spec["id"],"strategy_spec_fingerprint_sha256":spec["fingerprint_sha256"],
                        "strategy_spec_name":spec["name"],"run":run,"baselines":baselines,"counterfactual":counterfactual,
                        "explanation":explain_strategy_spec(spec),"safety":{"paper_only":True,"orders_real":0}}
                persisted=_workspace_can_persist()
                if persisted:
                    _atomic_json(WORKSPACE/"results"/(report["id"]+".json"),report)
                report["workspace_persistence"]={"persisted":persisted,"managed":_workspace_is_managed(),"mode":_workspace_write_mode()}
                self._send({"report":report},201)
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
                _atomic_json(_manual_profile_folder() / (saved["id"] + ".json"), saved)
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
                    comparison["warnings"].insert(0, _source_warnings(source)[0])
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
                                      "Configured fees are a PAPER assumption; historical realized fees are not verified")
                            for w in comparison["warnings"]]
                    record = {**metadata, "comparison": comparison}
                    persisted=_workspace_can_persist()
                    if persisted:
                        _atomic_json(WORKSPACE / "comparisons" / (record["id"] + ".json"), record)
                    record["workspace_persistence"]={"persisted":persisted,"managed":_workspace_is_managed(),"mode":_workspace_write_mode()}
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
                    result["warnings"] = _source_warnings(source)
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
                    persisted=_workspace_can_persist()
                    if persisted:
                        _atomic_json(WORKSPACE / "results" / (record["id"] + ".json"), record)
                    record["workspace_persistence"]={"persisted":persisted,"managed":_workspace_is_managed(),"mode":_workspace_write_mode()}
                    self._send({"report": record}, 201)
        except (LabError, SourceError, PublicMarketError, CatalogSourceError, HistoricalVaultError, ValueError, OverflowError) as exc:
            self._send({"error": _public_error_message(exc)}, 400)
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
                print(f"Ouvre le laboratoire dans Firefox : http://127.0.0.1:{port}", flush=True)
        server.serve_forever()


if __name__ == "__main__":
    main()
