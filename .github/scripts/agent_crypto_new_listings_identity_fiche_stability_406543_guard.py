#!/usr/bin/env python3
from pathlib import Path
import base64, binascii, json, struct, sys, zlib

root=Path(__file__).resolve().parents[2]
admin=root/"public/agent_crypto_erith_ia/administrator"
registry_path=admin/"data/new-listings-identities.json"
registry=json.loads(registry_path.read_text(encoding="utf-8"))
owner=(admin/"js/new-listings-native-category.js").read_text(encoding="utf-8")
fiche_portal=(admin/"js/aether-role-visibility.js").read_text(encoding="utf-8")
build=json.loads((admin/"build.json").read_text(encoding="utf-8"))
html=(admin/"index.html").read_text(encoding="utf-8")

errors=[]
def need(ok,msg):
    if not ok:
        errors.append(msg)

def u32(data,offset):
    return struct.unpack(">I",data[offset:offset+4])[0]

def validate_png_data_url(value,label):
    prefix="data:image/png;base64,"
    need(isinstance(value,str) and value.startswith(prefix),f"{label}: PNG data URL missing")
    if not isinstance(value,str) or not value.startswith(prefix):
        return
    try:
        raw=base64.b64decode(value[len(prefix):],validate=True)
    except (binascii.Error,ValueError) as exc:
        errors.append(f"{label}: invalid base64: {exc}")
        return
    need(raw.startswith(b"\x89PNG\r\n\x1a\n"),f"{label}: PNG signature invalid")
    if len(raw)<33 or not raw.startswith(b"\x89PNG"):
        return
    pos=8
    chunks=[]
    saw_iend=False
    while pos+12<=len(raw):
        length=u32(raw,pos); pos+=4
        chunk_type=raw[pos:pos+4]; pos+=4
        if pos+length+4>len(raw):
            errors.append(f"{label}: truncated {chunk_type!r}")
            return
        payload=raw[pos:pos+length]; pos+=length
        stored=u32(raw,pos); pos+=4
        actual=zlib.crc32(chunk_type+payload)&0xffffffff
        name=chunk_type.decode("ascii","replace")
        chunks.append(name)
        if stored!=actual:
            errors.append(f"{label}: {name} CRC mismatch")
        if name=="IEND":
            saw_iend=True
            break
    need(chunks and chunks[0]=="IHDR",f"{label}: IHDR missing")
    need("IDAT" in chunks,f"{label}: IDAT missing")
    need(saw_iend,f"{label}: IEND missing")
    if len(raw)>=24:
        width=u32(raw,16); height=u32(raw,20)
        need(width==32 and height==32,f"{label}: expected 32x32, got {width}x{height}")

need(registry.get("schema")=="agent_crypto_new_listings_identity_registry_v1","registry schema")
need(registry.get("version")=="40.6.543","registry version")
ids=registry.get("identities") or {}
expected={"concrete":"CT","magic-hash":"MHA","marscat-token":"MCAT","pons":"PONS","canopy":"CNPY"}
need(set(ids)==set(expected),"registry identity set")
for cg,symbol in expected.items():
    row=ids.get(cg) or {}
    need(row.get("symbol")==symbol,f"{cg}: symbol mismatch")
    need(row.get("coingeckoId")==cg,f"{cg}: CoinGecko id mismatch")
    need(row.get("verified") is True,f"{cg}: verified flag")
    validate_png_data_url(row.get("image"),cg)

need('const MODULE_VERSION="40.6.543";' in owner,"New Listings owner version")
need('IDENTITY_REGISTRY_URL="./data/new-listings-identities.json"' in owner,"GitHub identity registry owner")
need("identity_github_registry_primary:true" in owner,"GitHub registry primary contract")
need("fetchCoinGeckoIdentityFallback" not in owner,"individual identity retry storm returned")
need("IDENTITY_FALLBACK_RETRY_DELAYS" not in owner,"individual retry delays returned")

need('const BUILD = "40.6.543 R6";' in fiche_portal,"Fiche portal build")
need('const MODE_SELECTOR = "[data-market-card-mode]";' in fiche_portal,"Fiche mode selector")
need("function dockedFiche" in fiche_portal,"dock-aware predicate")
need('grid?.classList?.contains("market-card-dock-active")' in fiche_portal,"dock-active guard")
need('document.getElementById(DOCK_HOST_ID)' in fiche_portal,"dock host guard")
need('mode === "dock"' in fiche_portal and 'mode === "floating"' in fiche_portal,"native mode handling")
need('strategy: "floating-body-tail-portal-with-native-dock-respect"' in fiche_portal,"dock-aware strategy")
need("dock_aware: true" in fiche_portal,"dock-aware public contract")
need("mode_click_non_destructive: true" in fiche_portal,"mode click safety contract")

need(build.get("build")=="40.6.543","build truth")
need(build.get("parent_build")=="40.6.542","parent truth")
need(build.get("release")=="NEW LISTINGS · VALID LOGOS + FICHE DOCK STABILITY","release truth")
need(build.get("market_core")=="38.15.11","Market Core version")
need(build.get("market_core_modified") is False,"Market Core modified")
scope=build.get("new_listings_identity_fiche_stability_406543") or {}
need(scope.get("enabled") is True,"scope enabled")
need(scope.get("discovery_changed") is False,"discovery changed")
need(scope.get("price_pipeline_changed") is False,"price pipeline changed")
need(scope.get("graph_owner_changed") is False,"graph owner changed")
need(scope.get("storage_write") is False,"storage write")

need("Build 40.6.543 · Administrator" in html,"index build badge")
need((admin/"index-40.6.543.html").exists(),"versioned index")

if errors:
    print("NEW_LISTINGS_IDENTITY_FICHE_STABILITY_406543_GUARD_FAIL")
    for error in errors:
        print(" -",error)
    sys.exit(1)

print("NEW_LISTINGS_IDENTITY_FICHE_STABILITY_406543_GUARD_PASS")
print(" logos=5 valid PNG CRC")
print(" identity_owner=GitHub static registry")
print(" fiche_floating=preserved")
print(" fiche_lateral=dock-aware")
print(" individual_retry_storm=absent")
print(" market_core=38.15.11")
