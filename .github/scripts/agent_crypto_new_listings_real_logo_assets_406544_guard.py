#!/usr/bin/env python3
from pathlib import Path
import json, struct, sys, zlib

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
registry=json.loads((admin/"data/new-listings-identities.json").read_text(encoding="utf-8"))
owner=(admin/"js/new-listings-native-category.js").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
errors=[]

def need(ok,msg):
    if not ok: errors.append(msg)

def u32(data,off): return struct.unpack(">I",data[off:off+4])[0]

def validate_png(path,label):
    need(path.exists(),f"{label}: file missing")
    if not path.exists(): return
    raw=path.read_bytes()
    need(raw.startswith(b"\x89PNG\r\n\x1a\n"),f"{label}: signature")
    if not raw.startswith(b"\x89PNG"): return
    pos=8; chunks=[]; saw_iend=False
    while pos+12<=len(raw):
        length=u32(raw,pos); pos+=4
        typ=raw[pos:pos+4]; pos+=4
        if pos+length+4>len(raw):
            errors.append(f"{label}: truncated")
            return
        payload=raw[pos:pos+length]; pos+=length
        stored=u32(raw,pos); pos+=4
        actual=zlib.crc32(typ+payload)&0xffffffff
        name=typ.decode("ascii","replace")
        chunks.append(name)
        need(stored==actual,f"{label}: {name} CRC")
        if name=="IEND":
            saw_iend=True
            break
    need(chunks and chunks[0]=="IHDR",f"{label}: IHDR")
    need("IDAT" in chunks,f"{label}: IDAT")
    need(saw_iend,f"{label}: IEND")
    if len(raw)>=24:
        need(u32(raw,16)==32 and u32(raw,20)==32,f"{label}: expected 32x32")

need(registry.get("version")=="40.6.544","registry version")
ids=registry.get("identities") or {}
expected={
 "concrete":"concrete.png",
 "magic-hash":"magic-hash.png",
 "marscat-token":"marscat-token.png",
 "pons":"pons.png",
 "canopy":"canopy.png",
}
for cg,file in expected.items():
    row=ids.get(cg) or {}
    image=str(row.get("image") or "")
    need(image==f"./assets/crypto/new-listings/{file}",f"{cg}: registry path")
    need("base64" not in image.lower(),f"{cg}: base64 survived")
    need(row.get("logoStorage")=="github-binary-asset",f"{cg}: storage owner")
    validate_png(admin/"assets/crypto/new-listings"/file,cg)

need('const MODULE_VERSION="40.6.544";' in owner,"module version")
need('loading="eager"' in owner,"eager logo load")
need('fetchpriority="high"' in owner,"logo fetch priority")
need('loading="lazy"' not in owner,"lazy logo render survived")
need('decoding="async"' not in owner,"async decode survived")
need("identity_binary_logo_assets:true" in owner,"binary logo contract")
need(build.get("build")=="40.6.544","build truth")
need(build.get("market_core")=="38.15.11","Market Core")
scope=build.get("new_listings_real_logo_assets_406544") or {}
need(scope.get("registry_embedded_base64") is False,"base64 flag")
need(scope.get("github_binary_assets") is True,"binary asset flag")
need(scope.get("discovery_changed") is False,"discovery changed")

if errors:
    print("NEW_LISTINGS_REAL_LOGO_ASSETS_406544_GUARD_FAIL")
    for e in errors: print(" -",e)
    sys.exit(1)
print("NEW_LISTINGS_REAL_LOGO_ASSETS_406544_GUARD_PASS")
print(" binary_png_assets=5")
print(" registry_base64=0")
print(" dynamic_discovery=preserved")
print(" market_core=38.15.11")
