"""Reproducible, non-production Operator Client authentication stage.

Only builds from the exact verified R19Y1 archive. This stage does not
install, start, configure OKX, trade, or read any private exchange account.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import io
import json
from pathlib import Path
import re
import secrets
import zipfile

ARCHIVE_SHA256 = "d1b9c7191144157eec45404657d259c48ee6741a4b9c37c75a07deb50f8ad998"
BRIDGE_SHA256 = "944b2f34d570cfd17a438e08479735a9f62b282b94874e7b1647d522c563b662"


def exactly_once(code: str, before: str, after: str) -> str:
    if code.count(before) != 1:
        raise ValueError("STOP: source anchor changed: " + repr(before[:55]))
    return code.replace(before, after, 1)


def build(archive: bytes) -> dict[str, bytes]:
    if len(archive) > 15_000_000 or hashlib.sha256(archive).hexdigest() != ARCHIVE_SHA256:
        raise ValueError("STOP: R19Y1 ZIP SHA mismatch")
    with zipfile.ZipFile(io.BytesIO(archive)) as zip_file:
        names = zip_file.namelist()
        if len(names) > 500 or any(n.startswith("/") or ".." in Path(n).parts for n in names):
            raise ValueError("STOP: unexpected archive members")
        original = zip_file.read("bridge/bridge.py")
        config_bytes = zip_file.read("bridge/bridge_config.json")
    if hashlib.sha256(original).hexdigest() != BRIDGE_SHA256:
        raise ValueError("STOP: R19Y1 Bridge source SHA mismatch")
    code = original.decode("utf-8")

    # Fresh Operator Client: never inherit Yoann's or the Owner's trust account.
    if code.count("YohanOperatorBridge") != 2:
        raise ValueError("STOP: unexpected historic workspace references")
    code = code.replace("YohanOperatorBridge", "OperatorClientBridge")
    start = code.index("def auth_migrate_legacy_if_needed() -> bool:")
    end = code.index("def auth_state_read() -> dict[str, Any] | None:", start)
    code = code[:start] + '''def auth_migrate_legacy_if_needed() -> bool:
    """Never import a prior operator/owner verifier to this new client."""
    return False


''' + code[end:]
    code = exactly_once(
        code,
        'return bool(isinstance(state, dict) and state.get("schema") == "atlas_bridge_auth_v1" and str(state.get("salt") or "").strip() and str(state.get("verifier") or "").strip())',
        'return bool(isinstance(state, dict) and state.get("schema") == "atlas_bridge_auth_v1" and state.get("role") == "operator" and re.fullmatch(r"[a-f0-9]{32}", str(state.get("principal_id") or "")) and str(state.get("salt") or "").strip() and str(state.get("verifier") or "").strip())',
    )
    code = exactly_once(code, "if len(secret) < 6 or len(secret) > 256:",
                        "if len(secret) < 12 or len(secret) > 256:")
    code = exactly_once(code, '"role": "operator",\n        "created_at": utc_now(),',
                        '"role": "operator",\n        "principal_id": secrets.token_hex(16),\n        "created_at": utc_now(),')

    start = code.index('def auth_session_create(role: str = "operator") -> dict[str, Any]:')
    end = code.index("def auth_session_get(token: str)", start)
    code = code[:start] + '''def auth_session_create(role: str = "operator") -> dict[str, Any]:
    if role != "operator":
        raise ValueError("Owner cannot be created by an Operator Client.")
    state = auth_state_read()
    if not state or not _auth_state_valid(state):
        raise ValueError("Operator Client account not configured.")
    token = secrets.token_urlsafe(36)
    expires = time.time() + AUTH_SESSION_TTL_SECONDS
    row = {
        "role": "operator",
        "principal_id": state["principal_id"],
        "created_at": time.time(),
        "expires_at": expires,
    }
    with AUTH_SESSIONS_LOCK:
        AUTH_SESSIONS[token] = row
    return {
        "token": token,
        "role": "operator",
        "expires_at": datetime.fromtimestamp(expires, timezone.utc).isoformat(),
        "capabilities": capabilities_for_role("operator"),
    }


''' + code[end:]
    match = re.search(r'CAPABILITY_POLICY = \{\n(?:.*\n)+?\}\nROUTE_CAPABILITY = ', code)
    if not match or '"owner":' not in match.group(0):
        raise ValueError("STOP: R19Y1 capability map changed")
    code = code[:match.start()] + '''CAPABILITY_POLICY = {
    "operator": frozenset({"history.read", "scanner.read", "atlas.run", "aerith.run", "chat.run", "security.read"}),
    "reader": frozenset({"history.read", "scanner.read"}),
}
ROUTE_CAPABILITY = ''' + code[match.end():]
    code = exactly_once(code,
                        'AUTH_PRIVILEGED_GET = {"/profiles",',
                        'AUTH_PRIVILEGED_GET = {"/operator/client/status", "/profiles",')
    code = exactly_once(code,
                        'ROUTE_CAPABILITY = {\n    "/profiles":',
                        'ROUTE_CAPABILITY = {\n    "/operator/client/status": "security.read",\n    "/profiles":')
    code = exactly_once(code,
                        '        if route == "/capabilities":\n',
                        '''        if route == "/operator/client/status":
            self.send_json(200, {
                "ok": True,
                "profile": "operator-client",
                "role": "operator",
                "principal_initialized": bool(privileged_session.get("principal_id")),
                "independent_trust": True,
                "okx_private_read_enabled": False,
                "trading_write_enabled": False,
                "bridge_reference": "1.9.13",
                "stage": "authentication-only",
            })
            return

        if route == "/capabilities":
''')
    code = code.replace("Yohan Operator", "Operator Client")
    code = code.replace("YOHAN OPERATOR", "OPERATOR CLIENT")
    code = code.replace("PC Yohan", "PC client")
    code = code.replace("Authentification Administrator Bridge requise.",
                        "Authentification Operator Client requise.")
    ast.parse(code)
    if '"okx.account.read"' in code or '"order.submit"' in code:
        raise ValueError("STOP: no private OKX routes allowed in this stage")
    config = json.loads(config_bytes)
    if config.get("host") not in ("127.0.0.1", "localhost") or config.get("port") != 8787:
        raise ValueError("STOP: local-only settings changed")
    config["operator_client_stage"] = {
        "mode": "authentication-only",
        "okx_private_read_enabled": False,
        "trading_write_enabled": False,
        "source_sha256": BRIDGE_SHA256,
    }
    if "capability_policy" in config:
        config["capability_policy"] = {
            "operator": sorted(("history.read", "scanner.read", "atlas.run", "aerith.run", "chat.run", "security.read")),
            "reader": ["history.read", "scanner.read"],
        }
    return {
        "bridge/bridge.py": code.encode("utf-8"),
        "bridge/bridge_config.json": (json.dumps(config, ensure_ascii=False, indent=2) + "\n").encode("utf-8"),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reference", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    destination = Path(args.output)
    if destination.exists() and any(destination.iterdir()):
        raise SystemExit("STOP: output directory must be empty")
    staged = build(Path(args.reference).read_bytes())
    for name, value in staged.items():
        output = destination / name
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(value)
    print("PASS: Operator Client authentication stage generated; NOT INSTALLABLE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
