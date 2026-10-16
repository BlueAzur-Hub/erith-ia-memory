#!/usr/bin/env python3
"""Windows GUI preview from the exact R19Y1 GitHub archive, never live account data."""
from __future__ import annotations
import ast, hashlib, importlib.util, io, json, os, pathlib, shutil, subprocess, tempfile, zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ARCHIVES = HERE.parent
ORIGINAL = ARCHIVES / "AGENT_CRYPTO_YOHAN_OPERATOR_CONTROL_R19Y1_BRIDGE_1_9_13_BACKEND_1_4_4_OKX_LOCAL_TRANSPORT.zip"
PIN = "d1b9c7191144157eec45404657d259c48ee6741a4b9c37c75a07deb50f8ad998"
EXE = "ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_GUI_NO_CONSOLE.exe"
BUNDLE = "ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_COMPLETE_SOURCES.zip"
PROOF = "ERITH_IA_OPERATOR_CLIENT_AUTH_PREVIEW_SHA256.txt"
VERSION = "2.3.2OperatorClient"
blob = ORIGINAL.read_bytes()
if hashlib.sha256(blob).hexdigest() != PIN:
    raise SystemExit("STOP: historical ZIP does not match pinned SHA")
spec=importlib.util.spec_from_file_location("operator_auth",HERE/"build_operator_client.py")
auth=importlib.util.module_from_spec(spec)
spec.loader.exec_module(auth)
patched=auth.build(blob)
with zipfile.ZipFile(io.BytesIO(blob)) as original:
    entries={f.filename:original.read(f.filename) for f in original.infolist() if not f.is_dir()
        and not f.filename.startswith("source/") and not f.filename.startswith("bridge/data/")
        and not f.filename.lower().endswith(".exe") and f.filename not in ("README_YOHAN_R19Y1.txt","SHA256SUMS.txt")}
    go=original.read("source/main.go").decode("utf-8")
entries.update(patched)
if entries["bridge/bridge.py"].count(b'"/okx/account"') != 0:
    raise SystemExit("STOP: this build must not contain private account routes")
# Update the account-registration helper to honor the new minimum and profile name.
account=entries["bridge/create_operator_account.py"].decode("utf-8")
account=account.replace("Yohan Operator Bridge","Operator Client Bridge")
account=account.replace("(6+ caracteres)","(12+ caracteres)").replace("if len(secret)<6:","if len(secret)<12:")
entries["bridge/create_operator_account.py"]=account.encode("utf-8")
# The legacy history in the original archive stays untouched; this is a new edition.
ollama=entries.pop("bridge/CONFIGURE_YOHAN_OLLAMA.bat")
entries["bridge/CONFIGURE_OLLAMA.bat"]=ollama
legacy=entries.pop("bridge/README_YOHAN_OPERATOR_R19Y1.md")
entries["bridge/README_OPERATOR_ORIGIN.md"]=legacy
for path in list(entries):
    if path.endswith((".bat",".cmd",".md",".txt")):
        txt=entries[path].decode("utf-8")
        txt=(txt.replace("CONFIGURE_YOHAN_OLLAMA.bat","CONFIGURE_OLLAMA.bat")
               .replace("YohanOperatorBridge","OperatorClientBridge")
               .replace("YOHAN OPERATOR","OPERATOR CLIENT")
               .replace("Yohan Operator","Operator Client")
               .replace("Yohan","client").replace("YOHAN","OPERATOR CLIENT"))
        entries[path]=txt.encode("utf-8")
def replace_one(old: str,new: str):
    global go
    if go.count(old)!=1: raise RuntimeError("STOP: changed Go source anchor: "+old[:72])
    go=go.replace(old,new,1)
replace_one('appVersion       = "2.3.2R19Y1"','appVersion       = "'+VERSION+'"')
replace_one('interfaceBuild   = "40.6.509 · Yohan Operator"','interfaceBuild   = "40.6.640 · Operator Client"')
replace_one('interfaceURL     = "https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/yohan.html"',
            'interfaceURL     = "https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/index.html"')
replace_one('windowClass = "ERITH_YOHAN_OPERATOR_BRIDGE_DESKTOP_2_3_2R19Y1"',
            'windowClass = "ERITH_OPERATOR_CLIENT_DESKTOP"')
replace_one('windowTitle = "Yohan Operator Control · Agent-Crypto · 2.3.2R19Y1"',
            'windowTitle = "ERITH.IA Operator Client · Aether Control"')
replace_one('Local\\\\ERITH_YOHAN_OPERATOR_BRIDGE_R19Y1','Local\\\\ERITH_OPERATOR_CLIENT_BRIDGE')
go=(go.replace("YohanOperatorBridge","OperatorClientBridge")
      .replace("YOHAN OPERATOR","OPERATOR CLIENT")
      .replace("Yohan Operator","Operator Client")
      .replace("Yohan","Client").replace("YOHAN","OPERATOR CLIENT"))
if "Yohan" in go or "yohan.html" in go:
    raise SystemExit("STOP: old site/profile remains in new Control Center")
ast.parse(entries["bridge/bridge.py"].decode("utf-8"))
ast.parse(entries["backend/private_backend.py"].decode("utf-8"))
config=json.loads(entries["bridge/bridge_config.json"])
if config.get("host")!="127.0.0.1" or config.get("port")!=8787 or config["security"].get("allow_exchange_actions") is not False:
    raise SystemExit("STOP: unexpected network or exchange security config")
if "/okx/account" in entries["bridge/bridge.py"].decode("utf-8"):
    raise SystemExit("STOP: only market-public access is included")
def zip_bytes(files: dict[str,bytes]) -> bytes:
    target=io.BytesIO()
    with zipfile.ZipFile(target,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=8) as z:
        for name,data in sorted(files.items()):
            if name.startswith("/") or ".." in pathlib.PurePosixPath(name).parts or "\\" in name:
                raise ValueError("STOP: unsafe path "+name)
            info=zipfile.ZipInfo(name,date_time=(2026,10,16,12,0,0))
            info.compress_type=zipfile.ZIP_DEFLATED
            info.external_attr=0o644<<16
            z.writestr(info,data)
    return target.getvalue()
payload=zip_bytes(entries)
readme="""# ERITH.IA Operator Client — préversion d'authentification Windows

* Bridge 1.9.13 / Backend 1.4.4, Interface + Trader 40.6.640.
* L'EXE GUI et le dossier source complet sont inclus dans le ZIP.
* Le Control Center et le Bridge possèdent une configuration locale Operator indépendante ; aucun accès Owner.
* Python 3 est nécessaire aux services. Ollama est facultatif et n'est pas fourni.
* Les ports 8787 et 8790 doivent être libres. Ne pas installer à la place du Bridge Administrator R22.
* Aucune clé OKX, aucun compte personnel, aucun ordre réel et aucun bot ne sont inclus/activés.
* Cette préversion nécessite encore une recette réelle dans Windows et Firefox avant une utilisation quotidienne.
* Le ZIP historique R19Y1 a été vérifié par son empreinte SHA-256 puis transformé pour ce build.
* Sources modifiables sous bridge/, backend/ et source/. Le module source/payload.zip doit être reconstruit avant chaque compilation.
* Le poste du titulaire produit un dossier de confiance neuf. Ne jamais recopier les fichiers DPAPI/trust d'un autre ordinateur.
"""
with tempfile.TemporaryDirectory(prefix="erith_operator_") as tmp:
    root=Path(tmp)/"bundle"
    root.mkdir()
    for name,data in entries.items():
        file=root/name
        file.parent.mkdir(parents=True,exist_ok=True)
        file.write_bytes(data)
    code=root/"source"
    code.mkdir()
    (code/"main.go").write_text(go,encoding="utf-8")
    (code/"payload.zip").write_bytes(payload)
    (code/"BUILD_WINDOWS.ps1").write_text("$ErrorActionPreference='Stop'\n$env:GOOS='windows'\n$env:GOARCH='amd64'\n$env:CGO_ENABLED='0'\ngo build -trimpath -ldflags '-H windowsgui -s -w' -o ../"+EXE+" main.go\n",encoding="utf-8")
    (root/"README.md").write_text(readme,encoding="utf-8")
    (root/"portable.flag").touch()
    outfile=root/EXE
    environment=dict(os.environ,GOOS="windows",GOARCH="amd64",CGO_ENABLED="0",GOPROXY="off",GOTOOLCHAIN="local")
    subprocess.run(["go","build","-trimpath","-ldflags=-H windowsgui -s -w","-o",str(outfile),"main.go"],cwd=code,check=True,env=environment,timeout=180)
    if not outfile.read_bytes().startswith(b"MZ"):
        raise RuntimeError("STOP: Go Windows PE build missing")
    with zipfile.ZipFile(io.BytesIO(payload)) as z:
        for name,raw in entries.items():
            if z.read(name)!=raw: raise RuntimeError("STOP: payload mismatch: "+name)
    manifest={
        "product":"ERITH.IA Operator Client","status":"AUTH_PREVIEW_NOT_PRODUCTION",
        "pinned_r19y1_zip_sha256":PIN,"go_windows":"amd64 GUI",
        "app_version":VERSION,"bridge_version":"1.9.13","backend_version":"1.4.4","trader_build":"40.6.640",
        "okx_private_read":False,"order_submit":False,"bots":False,
        "exe_sha256":hashlib.sha256(outfile.read_bytes()).hexdigest(),
        "payload_sha256":hashlib.sha256(payload).hexdigest()}
    (root/"RELEASE_MANIFEST.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    dest=ARCHIVES/BUNDLE
    with zipfile.ZipFile(dest,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=7) as zipout:
        for p in sorted(root.rglob("*")):
            if p.is_file():zipout.write(p,p.relative_to(root).as_posix())
    shutil.copy2(outfile,ARCHIVES/EXE)
    (ARCHIVES/PROOF).write_text(
        manifest["exe_sha256"]+"  "+EXE+"\n"+hashlib.sha256(dest.read_bytes()).hexdigest()+"  "+BUNDLE+"\n",
        encoding="ascii")
    print(json.dumps({"status":"PASS","exe_bytes":outfile.stat().st_size,"zip_bytes":dest.stat().st_size,
        "exe_sha256":manifest["exe_sha256"],"zip_sha256":hashlib.sha256(dest.read_bytes()).hexdigest()},indent=2))
