#!/usr/bin/env python3
"""Agent-Crypto 40.6.483 — trusted loopback Oracle Evidence cold-ingest Bridge."""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from copy import deepcopy
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import PurePosixPath

BUILD = "40.6.483"
HOST = "127.0.0.1"
DEFAULT_PORT = 8791
DEFAULT_REPOSITORY = "BlueAzur-Hub/erith-ia-memory"
DEFAULT_BRANCH = "main"
COLD_ROOT = "public/agent_crypto_erith_ia/data/oracle_evidence"
MANIFEST_PATH = f"{COLD_ROOT}/manifest.json"
BUNDLE_SCHEMA = "agent_crypto_oracle_evidence_transport_bundle_v1"
CHUNK_SCHEMA = "agent_crypto_oracle_evidence_cold_chunk_v1"
MANIFEST_SCHEMA = "agent_crypto_oracle_evidence_cold_archive_manifest_v1"
MAX_ROWS = 1000
MAX_BODY_BYTES = 32 * 1024 * 1024
PATH_RE = re.compile(r"^\d{4}/\d{2}/\d{2}/evidence-\d+-\d+-\d+\.jsonl$")
LOCAL_ORIGIN_RE = re.compile(r"^http://(?:127\.0\.0\.1|localhost)(?::\d+)?$")
PAGES_ORIGIN = "https://blueazur-hub.github.io"


class BridgeError(RuntimeError):
    pass


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def json_lines(text: str) -> list[dict]:
    rows = []
    for number, line in enumerate(text.splitlines(), start=1):
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise BridgeError(f"JSONL invalide ligne {number}: {exc.msg}") from exc
        if not isinstance(value, dict):
            raise BridgeError(f"JSONL ligne {number}: objet attendu")
        rows.append(value)
    return rows


def safe_relative_path(value: str) -> str:
    path = str(value or "")
    p = PurePosixPath(path)
    if p.is_absolute() or ".." in p.parts or not PATH_RE.fullmatch(path):
        raise BridgeError("relative_path froid invalide")
    return path


def tuple_mark(t0, ident):
    return (int(t0), str(ident or ""))


def validate_bundle(bundle: dict) -> dict:
    if not isinstance(bundle, dict) or bundle.get("schema") != BUNDLE_SCHEMA:
        raise BridgeError("schema bundle invalide")
    if str(bundle.get("build")) not in {"40.6.482", "40.6.483"}:
        raise BridgeError("build bundle non autorisé")
    chunk = bundle.get("chunk")
    if not isinstance(chunk, dict) or chunk.get("schema") != CHUNK_SCHEMA:
        raise BridgeError("schema chunk invalide")
    if chunk.get("payload_format") != "jsonl":
        raise BridgeError("payload_format doit être jsonl")
    relative = safe_relative_path(chunk.get("relative_path"))
    jsonl = bundle.get("jsonl")
    if not isinstance(jsonl, str) or not jsonl:
        raise BridgeError("payload JSONL absent")
    rows = json_lines(jsonl)
    expected_count = int(chunk.get("row_count") or 0)
    if expected_count < 1 or expected_count > MAX_ROWS or len(rows) != expected_count:
        raise BridgeError("row_count invalide")
    digest = sha256_text(jsonl)
    if digest != str(chunk.get("sha256") or ""):
        raise BridgeError("SHA-256 bundle invalide")
    first, last = rows[0], rows[-1]
    if int(first.get("t0") or 0) != int(chunk.get("first_t0") or 0):
        raise BridgeError("first_t0 incohérent")
    if int(last.get("t0") or 0) != int(chunk.get("last_t0") or 0):
        raise BridgeError("last_t0 incohérent")
    if str(first.get("id") or "") != str(chunk.get("first_id") or ""):
        raise BridgeError("first_id incohérent")
    if str(last.get("id") or "") != str(chunk.get("last_id") or ""):
        raise BridgeError("last_id incohérent")
    wm = chunk.get("watermark_after") or {}
    if tuple_mark(wm.get("t0") or 0, wm.get("id")) != tuple_mark(last.get("t0") or 0, last.get("id")):
        raise BridgeError("watermark_after incohérent")
    if chunk.get("local_rows_deleted") is not False or chunk.get("local_retention_allowed") is not False:
        raise BridgeError("verrou local du chunk invalide")
    if bundle.get("browser_github_write") is not False or bundle.get("github_token_embedded") is not False:
        raise BridgeError("verrou navigateur du bundle invalide")
    if bundle.get("local_delete_authorized") is not False:
        raise BridgeError("suppression locale interdite")
    for index, row in enumerate(rows, start=1):
        if row.get("schema") != "atlas.oracle.evidence.v1":
            raise BridgeError(f"Evidence ligne {index}: schema inattendu")
        if not str(row.get("id") or "") or not int(row.get("t0") or 0):
            raise BridgeError(f"Evidence ligne {index}: id/t0 absent")
    return {
        "relative_path": relative,
        "row_count": expected_count,
        "sha256": digest,
        "jsonl": jsonl,
        "rows": rows,
        "chunk": deepcopy(chunk),
    }


def validate_manifest(manifest: dict) -> dict:
    if not isinstance(manifest, dict) or manifest.get("schema") != MANIFEST_SCHEMA:
        raise BridgeError("manifest froid invalide")
    if manifest.get("local_retention_allowed") is not False:
        raise BridgeError("local_retention_allowed doit rester false")
    if manifest.get("github_token_in_browser") is not False:
        raise BridgeError("github_token_in_browser doit rester false")
    if manifest.get("browser_github_write") is not False:
        raise BridgeError("browser_github_write doit rester false")
    if not isinstance(manifest.get("chunks"), list):
        raise BridgeError("manifest chunks invalide")
    return manifest


def build_pending_manifest(manifest: dict, validated: dict) -> tuple[dict, bool]:
    out = deepcopy(validate_manifest(manifest))
    rel = validated["relative_path"]
    digest = validated["sha256"]
    existing = next((x for x in out["chunks"] if x.get("relative_path") == rel), None)
    if existing:
        if str(existing.get("sha256") or "") != digest or int(existing.get("row_count") or 0) != validated["row_count"]:
            raise BridgeError("collision de chunk froid")
        return out, False
    current_wm = out.get("watermark")
    first_mark = tuple_mark(validated["chunk"]["first_t0"], validated["chunk"]["first_id"])
    if current_wm and first_mark <= tuple_mark(current_wm.get("t0") or 0, current_wm.get("id")):
        raise BridgeError("lot antérieur ou égal au watermark froid courant")
    entry = deepcopy(validated["chunk"])
    entry.update({
        "status": "WRITTEN_PENDING_VERIFY",
        "written_at": utc_now(),
        "verified_at": None,
        "write_commit": None,
        "verification": {
            "read_back": False,
            "sha256": False,
            "row_count": False,
            "json_parse": False,
            "manifest_commit": False,
        },
    })
    out["build"] = BUILD
    out["chunks"].append(entry)
    out["local_retention_allowed"] = False
    out["local_delete_requires_verified_cold_copy"] = True
    out["github_token_in_browser"] = False
    out["browser_github_write"] = False
    out["transport"] = {
        "status": "ACTIVE_SAFE_BRIDGE",
        "owner": "public/agent_crypto_erith_ia/tools/oracle_evidence_cold_bridge.py",
        "endpoint": f"http://{HOST}:{DEFAULT_PORT}/api/oracle-evidence/cold-ingest",
        "operator_triggered": True,
        "automatic_upload": False,
    }
    return out, True


def build_verified_manifest(manifest: dict, validated: dict, write_commit: str) -> dict:
    out = deepcopy(validate_manifest(manifest))
    rel = validated["relative_path"]
    entry = next((x for x in out["chunks"] if x.get("relative_path") == rel), None)
    if not entry:
        raise BridgeError("chunk absent du manifest après écriture")
    if str(entry.get("sha256") or "") != validated["sha256"]:
        raise BridgeError("SHA manifest/chunk divergent")
    entry["status"] = "VERIFIED"
    entry["verified_at"] = utc_now()
    entry["write_commit"] = str(write_commit)
    entry["verification"] = {
        "read_back": True,
        "sha256": True,
        "row_count": True,
        "json_parse": True,
        "manifest_commit": True,
    }
    verified = [x for x in out["chunks"] if str(x.get("status") or "").upper() == "VERIFIED"]
    out["archived_rows"] = sum(int(x.get("row_count") or 0) for x in verified)
    out["watermark"] = deepcopy(entry.get("watermark_after"))
    out["local_retention_allowed"] = False
    out["local_delete_requires_verified_cold_copy"] = True
    out["github_token_in_browser"] = False
    out["browser_github_write"] = False
    out["transport"] = {
        "status": "ACTIVE_SAFE_BRIDGE",
        "owner": "public/agent_crypto_erith_ia/tools/oracle_evidence_cold_bridge.py",
        "endpoint": f"http://{HOST}:{DEFAULT_PORT}/api/oracle-evidence/cold-ingest",
        "operator_triggered": True,
        "automatic_upload": False,
    }
    out["verification"] = {
        "required": ["read_back", "sha256", "row_count", "json_parse", "manifest_commit"],
        "verified_chunks": len(verified),
        "last_verified_at": entry["verified_at"],
    }
    out["build"] = BUILD
    return out


def verify_readback(text: str, validated: dict) -> dict:
    rows = json_lines(text)
    digest = sha256_text(text)
    if digest != validated["sha256"] or len(rows) != validated["row_count"]:
        raise BridgeError("relecture froide divergente")
    return {"sha256": digest, "row_count": len(rows), "json_parse": True}


def resolve_token() -> tuple[str | None, str]:
    for name in ("ERITH_GITHUB_TOKEN", "GITHUB_TOKEN"):
        value = os.environ.get(name)
        if value:
            return value.strip(), "env:" + name
    try:
        proc = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, timeout=8, check=False)
        token = (proc.stdout or "").strip()
        if proc.returncode == 0 and token:
            return token, "gh-cli"
    except (OSError, subprocess.SubprocessError):
        pass
    return None, "none"


class GitHubClient:
    def __init__(self, repository: str, branch: str, token: str):
        self.repository = repository
        self.branch = branch
        self.token = token
        self.api = "https://api.github.com"

    def request(self, method: str, path: str, payload=None):
        url = self.api + path
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=body, method=method)
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Authorization", "Bearer " + self.token)
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        req.add_header("User-Agent", "Agent-Crypto-Oracle-Evidence-Bridge-40.6.483")
        if body is not None:
            req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                raw = response.read()
                return json.loads(raw.decode("utf-8")) if raw else {}
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")[:800]
            raise BridgeError("GitHub HTTP %s: %s" % (exc.code, detail)) from exc

    def head_sha(self) -> str:
        data = self.request("GET", "/repos/%s/git/ref/heads/%s" % (self.repository, urllib.parse.quote(self.branch, safe="")))
        return str(data["object"]["sha"])

    def commit_tree_sha(self, commit_sha: str) -> str:
        data = self.request("GET", "/repos/%s/git/commits/%s" % (self.repository, commit_sha))
        return str(data["tree"]["sha"])

    def read_text(self, path: str, ref: str) -> str:
        q = urllib.parse.urlencode({"ref": ref})
        data = self.request("GET", "/repos/%s/contents/%s?%s" % (self.repository, urllib.parse.quote(path, safe="/"), q))
        if data.get("encoding") != "base64":
            raise BridgeError("encodage GitHub inattendu")
        return base64.b64decode(data["content"]).decode("utf-8")

    def create_blob(self, content: str) -> str:
        data = self.request("POST", "/repos/%s/git/blobs" % self.repository, {"content": content, "encoding": "utf-8"})
        return str(data["sha"])

    def commit_files(self, parent_sha: str, files: dict[str, str], message: str) -> str:
        current = self.head_sha()
        if current != parent_sha:
            raise BridgeError("main a bougé : arrêt fail-closed, relancer l'ingestion")
        base_tree = self.commit_tree_sha(parent_sha)
        tree_entries = []
        for path, content in files.items():
            blob = self.create_blob(content)
            tree_entries.append({"path": path, "mode": "100644", "type": "blob", "sha": blob})
        tree = self.request("POST", "/repos/%s/git/trees" % self.repository, {"base_tree": base_tree, "tree": tree_entries})
        commit = self.request("POST", "/repos/%s/git/commits" % self.repository, {
            "message": message,
            "tree": tree["sha"],
            "parents": [parent_sha],
        })
        sha = str(commit["sha"])
        self.request("PATCH", "/repos/%s/git/refs/heads/%s" % (self.repository, urllib.parse.quote(self.branch, safe="")), {
            "sha": sha,
            "force": False,
        })
        return sha


def ingest_bundle(bundle: dict, repository: str, branch: str, token: str) -> dict:
    validated = validate_bundle(bundle)
    client = GitHubClient(repository, branch, token)
    head = client.head_sha()
    manifest = validate_manifest(json.loads(client.read_text(MANIFEST_PATH, head)))
    existing = next((x for x in manifest["chunks"] if x.get("relative_path") == validated["relative_path"]), None)

    if existing and str(existing.get("status") or "").upper() == "VERIFIED":
        if str(existing.get("sha256") or "") != validated["sha256"]:
            raise BridgeError("chunk VERIFIED existant avec SHA différent")
        text = client.read_text(COLD_ROOT + "/" + validated["relative_path"], head)
        verify_readback(text, validated)
        return {
            "status": "VERIFIED",
            "idempotent": True,
            "relative_path": validated["relative_path"],
            "sha256": validated["sha256"],
            "row_count": validated["row_count"],
            "write_commit": str(existing.get("write_commit") or ""),
            "verify_commit": head,
        }

    pending, is_new = build_pending_manifest(manifest, validated)
    if is_new:
        write_commit = client.commit_files(
            head,
            {
                COLD_ROOT + "/" + validated["relative_path"]: validated["jsonl"],
                MANIFEST_PATH: json.dumps(pending, indent=2, ensure_ascii=False) + "\n",
            },
            "feat(agent-crypto): ingest Oracle Evidence cold chunk 40.6.483",
        )
    else:
        write_commit = head

    readback = client.read_text(COLD_ROOT + "/" + validated["relative_path"], write_commit)
    proof = verify_readback(readback, validated)
    written_manifest = validate_manifest(json.loads(client.read_text(MANIFEST_PATH, write_commit)))
    verified_manifest = build_verified_manifest(written_manifest, validated, write_commit)

    verify_commit = client.commit_files(
        write_commit,
        {MANIFEST_PATH: json.dumps(verified_manifest, indent=2, ensure_ascii=False) + "\n"},
        "chore(agent-crypto): mark Oracle Evidence cold chunk VERIFIED",
    )
    final_manifest = validate_manifest(json.loads(client.read_text(MANIFEST_PATH, verify_commit)))
    final_entry = next((x for x in final_manifest["chunks"] if x.get("relative_path") == validated["relative_path"]), None)
    if not final_entry or str(final_entry.get("status") or "").upper() != "VERIFIED":
        raise BridgeError("manifest final non VERIFIED")

    return {
        "status": "VERIFIED",
        "idempotent": False,
        "relative_path": validated["relative_path"],
        "sha256": proof["sha256"],
        "row_count": proof["row_count"],
        "write_commit": write_commit,
        "verify_commit": verify_commit,
    }


def origin_allowed(origin: str | None) -> bool:
    if not origin:
        return True
    return origin == PAGES_ORIGIN or bool(LOCAL_ORIGIN_RE.fullmatch(origin))


class Handler(BaseHTTPRequestHandler):
    server_version = "ErithOracleEvidenceBridge/40.6.483"

    def log_message(self, fmt, *args):
        sys.stderr.write("[bridge] " + (fmt % args) + "\n")

    def cors(self):
        origin = self.headers.get("Origin")
        if origin_allowed(origin) and origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Erith-Bridge-Intent")
        self.send_header("Cache-Control", "no-store")

    def send_json(self, status: int, payload: dict):
        raw = (json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8")
        self.send_response(status)
        self.cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        if not origin_allowed(self.headers.get("Origin")):
            self.send_json(403, {"error": "origin refusée"})
            return
        self.send_response(204)
        self.cors()
        self.end_headers()

    def do_GET(self):
        if self.path != "/api/oracle-evidence/health":
            self.send_json(404, {"error": "route inconnue"})
            return
        if not origin_allowed(self.headers.get("Origin")):
            self.send_json(403, {"error": "origin refusée"})
            return
        token, source = resolve_token()
        self.send_json(200, {
            "schema": "agent_crypto_oracle_evidence_bridge_health_v1",
            "build": BUILD,
            "status": "ready" if token else "needs_github_token",
            "github_auth_configured": bool(token),
            "auth_source": source,
            "repository": self.server.repository,
            "branch": self.server.branch,
            "owner": "oracle_evidence_cold_bridge.py",
            "loopback_only": True,
            "automatic_upload": False,
            "local_delete_api": False,
        })

    def do_POST(self):
        if self.path != "/api/oracle-evidence/cold-ingest":
            self.send_json(404, {"error": "route inconnue"})
            return
        if not origin_allowed(self.headers.get("Origin")):
            self.send_json(403, {"error": "origin refusée"})
            return
        if self.headers.get("X-Erith-Bridge-Intent") != "oracle-evidence-cold-ingest":
            self.send_json(403, {"error": "intention Bridge absente"})
            return
        try:
            length = int(self.headers.get("Content-Length") or "0")
        except ValueError:
            length = 0
        if length < 1 or length > MAX_BODY_BYTES:
            self.send_json(413, {"error": "taille bundle refusée"})
            return
        token, _source = resolve_token()
        if not token:
            self.send_json(503, {"error": "auth GitHub locale absente"})
            return
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            result = ingest_bundle(payload, self.server.repository, self.server.branch, token)
            self.send_json(200, result)
        except (BridgeError, json.JSONDecodeError, UnicodeDecodeError) as exc:
            self.send_json(400, {"error": str(exc)})
        except Exception as exc:
            self.send_json(500, {"error": "Bridge interne: " + type(exc).__name__})


def serve(repository: str, branch: str, port: int):
    if not (1 <= int(port) <= 65535):
        raise BridgeError("port invalide")
    server = ThreadingHTTPServer((HOST, int(port)), Handler)
    server.repository = repository
    server.branch = branch
    print("Agent-Crypto Oracle Evidence Bridge " + BUILD)
    print("Loopback: http://%s:%s" % (HOST, port))
    print("Repository: %s · branch %s" % (repository, branch))
    token, source = resolve_token()
    print("GitHub auth: %s (%s)" % ("READY" if token else "MISSING", source))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


def main():
    parser = argparse.ArgumentParser(description="Agent-Crypto Oracle Evidence safe cold-ingest Bridge")
    parser.add_argument("--repository", default=os.environ.get("ERITH_GITHUB_REPOSITORY", DEFAULT_REPOSITORY))
    parser.add_argument("--branch", default=os.environ.get("ERITH_GITHUB_BRANCH", DEFAULT_BRANCH))
    sub = parser.add_subparsers(dest="command", required=True)
    p_validate = sub.add_parser("validate-bundle")
    p_validate.add_argument("bundle")
    p_ingest = sub.add_parser("ingest")
    p_ingest.add_argument("bundle")
    p_serve = sub.add_parser("serve")
    p_serve.add_argument("--port", type=int, default=DEFAULT_PORT)
    args = parser.parse_args()

    if args.command == "validate-bundle":
        with open(args.bundle, "r", encoding="utf-8") as handle:
            bundle = json.load(handle)
        proof = validate_bundle(bundle)
        print(json.dumps({k: proof[k] for k in ("relative_path", "row_count", "sha256")}, indent=2))
        return 0

    if args.command == "ingest":
        token, source = resolve_token()
        if not token:
            raise BridgeError("auth GitHub locale absente (ERITH_GITHUB_TOKEN, GITHUB_TOKEN ou gh auth)")
        with open(args.bundle, "r", encoding="utf-8") as handle:
            bundle = json.load(handle)
        result = ingest_bundle(bundle, args.repository, args.branch, token)
        result["auth_source"] = source
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0

    serve(args.repository, args.branch, args.port)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except BridgeError as exc:
        print("ERROR: " + str(exc), file=sys.stderr)
        raise SystemExit(2)
