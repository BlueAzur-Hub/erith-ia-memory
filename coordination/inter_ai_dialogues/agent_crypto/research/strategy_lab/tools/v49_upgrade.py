from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[6]
LAB=ROOT/"seven_heaven_strategy_lab"

ENTRIES=[
("BTC","bitcoin",2024,13,"bitcoin-2024-span13-5add63d3d29bd8a8ef80b6ec16f288fe36de5c9db0ff8d8119bcd732129f9ef5.json.gz",8784,320402,"5add63d3d29bd8a8ef80b6ec16f288fe36de5c9db0ff8d8119bcd732129f9ef5"),
("BTC","bitcoin",2025,13,"bitcoin-2025-span13-291bc87ca5aace394fde51a43edc7f5fdb25da1213fd8343b19ff154ff370d0f.json.gz",8760,324884,"291bc87ca5aace394fde51a43edc7f5fdb25da1213fd8343b19ff154ff370d0f"),
("ETH","ethereum",2024,13,"ethereum-2024-span13-12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e.json.gz",8784,301413,"12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e"),
("ETH","ethereum",2025,13,"ethereum-2025-span13-a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6.json.gz",8760,305182,"a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6"),
("BNB","binancecoin",2024,12,"binancecoin-2024-span12-71f3bdf96f2cbcf5b5cf7bf8d748305e65348cc6156bb8e31246377cfe2d96ab.json.gz",8784,251600,"71f3bdf96f2cbcf5b5cf7bf8d748305e65348cc6156bb8e31246377cfe2d96ab"),
("BNB","binancecoin",2025,12,"binancecoin-2025-span12-d375d3e3998eb7a026ab3c63251af0cfea2b711b68fd3bd91da081a356ea1101.json.gz",8760,273245,"d375d3e3998eb7a026ab3c63251af0cfea2b711b68fd3bd91da081a356ea1101"),
("XRP","ripple",2024,11,"ripple-2024-span11-08b34cc0934cccca851e4040bf552cb30250d96947001a2eff19b87f95bcd983.json.gz",8784,252676,"08b34cc0934cccca851e4040bf552cb30250d96947001a2eff19b87f95bcd983"),
("XRP","ripple",2025,11,"ripple-2025-span11-7844ff01623f7ed959f4bd87e782504a448ad6de863f64964bcdc594539391dd.json.gz",8760,278235,"7844ff01623f7ed959f4bd87e782504a448ad6de863f64964bcdc594539391dd"),
("SOL","solana",2024,5,"solana-2024-span5-6001789aadec0df0153e076c2dd0f652250c7123afac5757e257a730af3a9b59.json.gz",8784,275206,"6001789aadec0df0153e076c2dd0f652250c7123afac5757e257a730af3a9b59"),
("SOL","solana",2025,5,"solana-2025-span5-f3be42dcc50d4ff898a835128dbaa47a0e79a0a7501ca1f222c6eb92e0031da3.json.gz",8760,278574,"f3be42dcc50d4ff898a835128dbaa47a0e79a0a7501ca1f222c6eb92e0031da3"),
]

def replace(path,old,new):
    p=LAB/path
    s=p.read_text(encoding="utf-8")
    if old not in s:
        raise SystemExit(f"Expected marker missing in {path}: {old[:80]}")
    p.write_text(s.replace(old,new),encoding="utf-8")

bundle=LAB/"data"/"historical_bundle_v3"
bundle.mkdir(parents=True,exist_ok=True)
manifest={
 "schema":"seven.strategy_lab.historical_bundle.v2",
 "source":"BlueAzur-Hub/erith-ia-memory calendar_year_hourly_shards",
 "source_index_path":"public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json",
 "pair_quote":"USDT","timeframe":"1h","paper_only":True,
 "datasets":[{"symbol":s,"asset_id":aid,"year":y,"source_span":sp,"filename":fn,"rows":rows,"bytes":size,"sha256":sha}
             for s,aid,y,sp,fn,rows,size,sha in ENTRIES],
}
(bundle/"MANIFEST.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
(bundle/"SHA256SUMS.txt").write_text("".join(f"{sha}  {fn}\n" for s,aid,y,sp,fn,rows,size,sha in ENTRIES),encoding="utf-8")

(LAB/"src"/"historical_bundle_v3.py").write_text(r'''"""Historical Bundle V3 — five-asset annual archive for Strategy Lab V4.9.

The bundle freezes ten verified Binance Spot calendar years: BTC, ETH, BNB, XRP
and SOL for 2024 and 2025. Each 1h shard was derived from canonical monthly 1m
archives and is revalidated locally before it can enter the Source Catalog.
No account access, private key, live endpoint or real order is involved.
"""
from __future__ import annotations
from datetime import datetime, timezone
import calendar, csv, gzip, hashlib, io, json, math, os, shutil, uuid
from pathlib import Path

from src.engine import LabError
from src.catalog_source_v48 import read_source as read_catalog_source

ROOT=Path(__file__).resolve().parents[1]
BUNDLE_ROOT=ROOT/'data'/'historical_bundle_v3'
MANIFEST_PATH=BUNDLE_ROOT/'MANIFEST.json'
CATALOG_ROOT='catalog_sources'
RESERVE_BYTES=2_500_000_000
WRITE_BUDGET_BYTES=20_000_000
SCHEMA='seven.strategy_lab.historical_bundle.v2'
SHARD_SCHEMA='aerith.public.ohlcv.calendar-year-hourly-shard.v1'
COLUMNS=['open_time_ms','open','high','low','close','base_volume','quote_volume','trade_count']

class HistoricalBundleError(LabError): pass

def _manifest()->dict:
    try: raw=json.loads(MANIFEST_PATH.read_text(encoding='utf-8'))
    except (OSError,ValueError,TypeError) as exc: raise HistoricalBundleError('Historical Bundle V3 : manifeste absent ou illisible') from exc
    if (raw.get('schema')!=SCHEMA or raw.get('pair_quote')!='USDT' or raw.get('timeframe')!='1h' or
        raw.get('paper_only') is not True or not isinstance(raw.get('datasets'),list)):
        raise HistoricalBundleError('Historical Bundle V3 : manifeste incompatible')
    seen=set()
    for d in raw['datasets']:
        key=(d.get('symbol'),d.get('year'))
        if key in seen: raise HistoricalBundleError('Historical Bundle V3 : dataset dupliqué')
        seen.add(key)
    return raw

def _entry(symbol:str,year:int):
    symbol=str(symbol or '').upper()
    if type(year) is not int: return None
    matches=[d for d in _manifest()['datasets'] if d.get('symbol')==symbol and d.get('year')==year]
    return matches[0] if len(matches)==1 else None

def available(symbol:str,year:int)->bool:
    return _entry(symbol,year) is not None

def _file_for(entry:dict)->Path:
    name=entry.get('filename')
    if not isinstance(name,str) or Path(name).name!=name or not name.endswith('.json.gz'):
        raise HistoricalBundleError('Historical Bundle V3 : nom de shard invalide')
    p=BUNDLE_ROOT/name
    if not p.is_file(): raise HistoricalBundleError('Historical Bundle V3 : shard annuel introuvable')
    if type(entry.get('bytes')) is int and p.stat().st_size!=entry['bytes']:
        raise HistoricalBundleError('Historical Bundle V3 : taille du shard annuel non conforme')
    return p

def _atomic(path:Path,payload:bytes):
    path.parent.mkdir(parents=True,exist_ok=True)
    tmp=path.with_name('.'+path.name+'.'+uuid.uuid4().hex+'.tmp')
    try:
        tmp.write_bytes(payload); os.replace(tmp,path)
    finally: tmp.unlink(missing_ok=True)

def _validate(entry:dict):
    p=_file_for(entry); payload=p.read_bytes(); observed=hashlib.sha256(payload).hexdigest()
    if observed!=entry.get('sha256'): raise HistoricalBundleError('Historical Bundle V3 : SHA-256 du shard annuel non conforme')
    try:
        with gzip.open(io.BytesIO(payload),'rt',encoding='utf-8') as fh: shard=json.load(fh)
    except (OSError,ValueError,TypeError,UnicodeDecodeError) as exc: raise HistoricalBundleError('Historical Bundle V3 : shard gzip/json invalide') from exc
    symbol=entry['symbol']; pair=symbol+'USDT'; year=entry['year']; expected_rows=(366 if calendar.isleap(year) else 365)*24
    if (shard.get('schema')!=SHARD_SCHEMA or shard.get('asset_id')!=entry.get('asset_id') or shard.get('pair')!=pair or
        shard.get('quote')!='USDT' or shard.get('year')!=year or shard.get('contiguous_span')!=entry.get('source_span') or
        shard.get('interval')!='1h' or shard.get('columns')!=COLUMNS or len(shard.get('series',[]))!=expected_rows or
        entry.get('rows')!=expected_rows or shard.get('is_live') is not False):
        raise HistoricalBundleError('Historical Bundle V3 : identité ou dimensions du shard incompatibles')
    expected_native=expected_rows*60
    if shard.get('native_1m_count')!=expected_native:
        raise HistoricalBundleError('Historical Bundle V3 : couverture 1m source incomplète')
    months=shard.get('source_months')
    expected_months=[f'{year}-{m:02d}' for m in range(1,13)]
    if (not isinstance(months,list) or len(months)!=12 or [x.get('month') for x in months]!=expected_months or
        any(not isinstance(x.get('source_zip_sha256'),str) or len(x['source_zip_sha256'])!=64 for x in months)):
        raise HistoricalBundleError('Historical Bundle V3 : provenance mensuelle incomplète')
    series=shard['series']; bars=[]; last=None
    first_expected=int(datetime(year,1,1,tzinfo=timezone.utc).timestamp())
    for row in series:
        if not isinstance(row,list) or len(row)!=8: raise HistoricalBundleError('Historical Bundle V3 : ligne OHLCV invalide')
        ms=row[0]
        if type(ms) is not int or ms%1000: raise HistoricalBundleError('Historical Bundle V3 : horodatage invalide')
        ts=ms//1000
        if last is None and ts!=first_expected: raise HistoricalBundleError('Historical Bundle V3 : début annuel incorrect')
        if last is not None and ts!=last+3600: raise HistoricalBundleError('Historical Bundle V3 : discontinuité horaire')
        try: o,h,l,c,v=[float(row[x]) for x in (1,2,3,4,5)]
        except (TypeError,ValueError,OverflowError) as exc: raise HistoricalBundleError('Historical Bundle V3 : OHLCV non numérique') from exc
        if not all(math.isfinite(x) for x in (o,h,l,c,v)) or min(o,h,l,c)<=0 or v<0 or not l<=min(o,c)<=max(o,c)<=h:
            raise HistoricalBundleError('Historical Bundle V3 : OHLCV incohérent')
        bars.append((ts,o,h,l,c,v)); last=ts
    if last!=int(datetime(year+1,1,1,tzinfo=timezone.utc).timestamp())-3600:
        raise HistoricalBundleError('Historical Bundle V3 : fin annuelle incorrecte')
    return shard,bars,observed

def _csv_bytes(bars)->bytes:
    sio=io.StringIO(newline=''); w=csv.writer(sio,lineterminator='\n'); w.writerow(['timestamp','open','high','low','close','volume'])
    for row in bars: w.writerow(row)
    return sio.getvalue().encode('utf-8')

def install_from_bundle(workspace:Path,symbol:str,year:int,source_id:str)->dict:
    entry=_entry(symbol,year)
    if entry is None: raise HistoricalBundleError('Historical Bundle V3 : année absente du bundle local')
    workspace=Path(workspace).resolve(); workspace.mkdir(parents=True,exist_ok=True)
    if shutil.disk_usage(workspace).free < RESERVE_BYTES + WRITE_BUDGET_BYTES:
        raise HistoricalBundleError('Historical Bundle V3 : réserve locale de 2,5 Go protégée')
    try:
        manifest,_=read_catalog_source(workspace,source_id); return manifest
    except Exception: pass
    shard,bars,shard_sha=_validate(entry)
    payload=_csv_bytes(bars); csv_sha=hashlib.sha256(payload).hexdigest()
    manifest={
      'schema':'seven.source_catalog.dataset.v1','id':source_id,'exchange':'Binance Spot',
      'pair':symbol+'/USDT','base':symbol,'quote':'USDT','source_timeframe':'1h','available_timeframes':['1h','4h'],
      'rows':len(bars),'first_utc':datetime.fromtimestamp(bars[0][0],timezone.utc).isoformat(),
      'last_utc':datetime.fromtimestamp(bars[-1][0],timezone.utc).isoformat(),
      'close_boundary_utc':datetime(year+1,1,1,tzinfo=timezone.utc).isoformat(),
      'stored_csv_sha256':csv_sha,
      'certification':'SEVEN_VERIFIED_ANNUAL_SHARD_SHA256_MONTHLY_PROVENANCE',
      'historical_vault':{
        'schema':'seven.historical_vault.installed_year.v3','year':year,'asset_id':shard.get('asset_id'),
        'pair_compact':shard.get('pair'),'annual_shard_sha256':shard_sha,'annual_shard_schema':shard.get('schema'),
        'source_span':shard.get('contiguous_span'),'source':shard.get('source'),'source_native_timeframe':'1m','stored_timeframe':'1h',
        'native_1m_count':shard.get('native_1m_count'),'source_months':shard.get('source_months'),
        'bundle_schema':SCHEMA,'bundle_path':'data/historical_bundle_v3','bundle_filename':entry.get('filename'),
        'raw_1m_archives_retained':False,
      },
      'safety':{'orders_real':0,'account_reads':0,'private_keys':False,'public_data_only':True,'paper_only':True},
    }
    folder=workspace/CATALOG_ROOT/source_id
    _atomic(folder/'bars.csv',payload)
    _atomic(folder/'manifest.json',(json.dumps(manifest,ensure_ascii=False,indent=2,allow_nan=False)+'\n').encode('utf-8'))
    try:
        accepted,loaded=read_catalog_source(workspace,source_id)
        if len(loaded)!=len(bars): raise HistoricalBundleError('Historical Bundle V3 : relecture du catalogue incomplète')
        return accepted
    except Exception:
        for n in ('manifest.json','bars.csv'): (folder/n).unlink(missing_ok=True)
        try: folder.rmdir()
        except OSError: pass
        raise
''',encoding="utf-8")

replace(Path("src/historical_vault_v1.py"),
        "from src.historical_bundle_v2 import available as historical_bundle_available, install_from_bundle",
        "from src.historical_bundle_v3 import available as historical_bundle_available, install_from_bundle")
replace(Path("src/historical_vault_v1.py"),
        "Seven-Heaven-Strategy-Lab/4.8 Historical-Vault-V1",
        "Seven-Heaven-Strategy-Lab/4.9 Historical-Vault-V1")
replace(Path("src/historical_vault_v1.py"),
        """# V2 first uses a frozen annual bundle already verified in the shared Seven
    # archive. This avoids 24 redundant monthly downloads for BTC/ETH while
    # preserving exact SHA/provenance checks. Other assets keep the explicit
    # Binance Public Data V1 path until their bundles are added.""",
        """# V3 first uses the frozen five-asset annual bundle verified in the shared Seven
    # archive. This avoids redundant monthly downloads for all ten canonical
    # 2024/2025 asset-years while preserving exact SHA/provenance checks. The
    # Binance Public Data V1 path remains as a bounded fallback.""")

snap_path=LAB/"data"/"historical_vault_v1.json"
snap=json.loads(snap_path.read_text(encoding="utf-8"))
snap["install_contract"]["note"]="Manual UI installation remains explicit. Canonical rebuilds may install the shipped BTC/ETH/BNB/XRP/SOL 2024-2025 verified annual bundle automatically; the Binance Public Data path remains a bounded fallback."
snap_path.write_text(json.dumps(snap,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

plan_path=LAB/"data"/"workspace_rebuild_plan_v1.json"
plan=json.loads(plan_path.read_text(encoding="utf-8"))
plan["name"]="V4.9 canonical development workspace · Historical Vault V3 five assets 2024-2025"
assets=["BTC","ETH","BNB","XRP","SOL"]; years=[2024,2025]
for sym in assets:
    for year in years:
        sid=f"CAT_BINANCE_{sym}USDT_1H_{year}"
        if sid not in plan["required_source_ids"]: plan["required_source_ids"].append(sid)
kinds=[("EMA 10/30","EMA_CROSS"),("Bollinger 20/2","BOLLINGER"),("Donchian 55/20","DONCHIAN"),("DCA 1440m / 50","DCA")]
existing={(r["source_id"],r["kind"],r["timeframe"]) for r in plan["runs"]}
for sym in ["BNB","XRP","SOL"]:
    for year in years:
        sid=f"CAT_BINANCE_{sym}USDT_1H_{year}"
        for label,kind in kinds:
            key=(sid,kind,"1h")
            if key not in existing:
                plan["runs"].append({"name":f"CANON · {sym}/USDT Binance {year} · 1h · {label}","kind":kind,"source_id":sid,"timeframe":"1h"})
                existing.add(key)
comp={(c["source_id"],c["timeframe"]) for c in plan["comparisons"]}
for sym in ["BNB","XRP","SOL"]:
    for year in years:
        sid=f"CAT_BINANCE_{sym}USDT_1H_{year}"
        if (sid,"1h") not in comp:
            plan["comparisons"].append({"name":f"{sym}/USDT Binance {year} 1h","kind":"DONCHIAN","source_id":sid,"timeframe":"1h"})
            comp.add((sid,"1h"))
plan["historical_bundle_install"]=[{"symbol":sym,"year":year} for sym in assets for year in years]
plan_path.write_text(json.dumps(plan,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

replace(Path("src/server.py"),"SevenHeavenStrategyLab/4.7.0-rc1","SevenHeavenStrategyLab/4.9.0-dev1")
replace(Path("src/server.py"),'"version": "4.7.0-rc1"','"version": "4.9.0-dev1"')
replace(Path("src/server.py"),'"release_channel": "RC1"','"release_channel": "DEV1"')
replace(Path("src/server.py"),'"status": "LOCAL_PAPER_ONLY_RELEASE_CANDIDATE"','"status": "LOCAL_PAPER_ONLY_DEVELOPMENT"')
replace(Path("src/server.py"),'"historical_vault_v2_bundle_enabled": True,','"historical_vault_v2_bundle_enabled": True,\n                        "historical_vault_v3_bundle_enabled": True,')

replace(Path("web/app.js"),'health.version!=="4.7.0-rc1"','health.version!=="4.9.0-dev1"')
replace(Path("web/index.html"),"BUILD 4.7.0-RC1","BUILD 4.9.0-DEV1")
replace(Path("web/index.html"),"STRATEGY LAB / 04.7.0-RC1","STRATEGY LAB / 04.9.0-DEV1")
replace(Path("web/index.html"),"V4.8 · HISTORICAL VAULT V2 · LONG HISTORY / MULTI-ACTIFS","V4.9 · HISTORICAL VAULT V3 · 5 ACTIFS × 2 ANNÉES")
replace(Path("web/index.html"),"/historical-vault.js?v=v48-historical-v2-steward-v3-20261117","/historical-vault.js?v=v49-historical-v3-five-assets-20261117")
replace(Path("web/lab-help-layer.js"),'const BUILD = "V4.8-HISTORICAL-V2-STEWARD-V3";','const BUILD = "V4.9-HISTORICAL-V3-MULTI-ASSET-CORPUS-V1";')
replace(Path("web/lab-help-layer.js"),
        "Le bundle BTC/ETH est revalidé par SHA-256, schéma, provenance mensuelle et continuité 1h. Le chemin V1 refuse aussi tout mois incomplet. Aucun ordre réel n’est possible.",
        "Le bundle V3 couvre BTC/ETH/BNB/XRP/SOL 2024–2025 et est revalidé par taille, SHA-256, schéma, provenance mensuelle et continuité 1h. Le fallback V1 refuse aussi tout mois incomplet. Aucun ordre réel n’est possible.")
replace(Path("web/historical-vault.js"),
        "validation de la source annuelle vérifiée (bundle local si disponible, sinon Binance Public Data)…",
        "validation du shard annuel local V3 (fallback Binance Public Data uniquement si nécessaire)…")

(LAB/"docs"/"HISTORICAL_VAULT_V3.md").write_text("""# Historical Vault V3 — bundle canonique cinq actifs 2024–2025

V4.9 étend le bundle annuel local aux dix années-actifs longues du Top 5 de recherche : BTC, ETH, BNB, XRP et SOL, pour 2024 et 2025.

Chaque fichier `.json.gz` provient du `calendar_year_hourly_shards` public Seven et correspond au `span` canonique indiqué par `year_depth_index.json`. Le Lab contrôle avant installation : nom/taille, SHA-256, schéma, asset/pair/year/span, 12 mois de provenance, couverture native 1m attendue, continuité 1h et cohérence OHLCV.

Le chemin réseau Binance Public Data reste un fallback borné. Il n'est plus nécessaire pour le rebuild canonique des dix années 2024/2025.

Aucun compte, aucune clé API, aucun ordre réel : PAPER uniquement.
""",encoding="utf-8")

readme=LAB/"README_FR.md"
r=readme.read_text(encoding="utf-8")
head="""## V4.9.0-DEV1 — Historical Vault V3 · corpus multi-actifs 5×2

La couche scientifique installe localement les dix années longues BTC/ETH/BNB/XRP/SOL 2024–2025 depuis des shards annuels Seven vérifiés. Le rebuild canonique passe de 28 à 52 profils/StrategySpecs/simulations et de 10 à 16 comparaisons. Le moteur PAPER reste inchangé et aucun ordre réel n'existe.

Voir `docs/HISTORICAL_VAULT_V3.md`.

"""
if not r.startswith("## V4.9.0-DEV1"): readme.write_text(head+r,encoding="utf-8")

(LAB/"tests"/"test_historical_bundle_v3.py").write_text(r'''import tempfile
from pathlib import Path
from src.historical_bundle_v3 import available, install_from_bundle, _manifest
from src.historical_vault_v1 import source_id

def test_bundle_manifest_covers_five_assets_two_years():
    expected={(s,y) for s in ('BTC','ETH','BNB','XRP','SOL') for y in (2024,2025)}
    assert {(d['symbol'],d['year']) for d in _manifest()['datasets']}==expected
    for s,y in expected: assert available(s,y)
    assert not available('ADA',2024)

def test_existing_btc_shard_installs_idempotently():
    with tempfile.TemporaryDirectory() as td:
        w=Path(td); sid=source_id('BTC',2024)
        m=install_from_bundle(w,'BTC',2024,sid)
        assert m['rows']==8784 and m['pair']=='BTC/USDT'
        assert m['historical_vault']['schema']=='seven.historical_vault.installed_year.v3'
        assert m['historical_vault']['bundle_schema']=='seven.strategy_lab.historical_bundle.v2'
        assert install_from_bundle(w,'BTC',2024,sid)['stored_csv_sha256']==m['stored_csv_sha256']
''',encoding="utf-8")

(LAB/"tests"/"test_v49_bundle_all_assets_ci.py").write_text(r'''import tempfile
from pathlib import Path
import pytest
from src.historical_bundle_v3 import BUNDLE_ROOT, _manifest, install_from_bundle
from src.historical_vault_v1 import source_id

DATASETS=_manifest()['datasets']
ALL_PRESENT=all((BUNDLE_ROOT/d['filename']).is_file() for d in DATASETS)

@pytest.mark.skipif(not ALL_PRESENT, reason='CI/final package only: canonical shards injected from shared vault')
def test_all_ten_annual_shards_validate_and_install():
    with tempfile.TemporaryDirectory() as td:
        workspace=Path(td)
        for d in DATASETS:
            manifest=install_from_bundle(workspace,d['symbol'],d['year'],source_id(d['symbol'],d['year']))
            assert manifest['rows']==d['rows']
            assert manifest['historical_vault']['annual_shard_sha256']==d['sha256']
            assert manifest['historical_vault']['source_span']==d['source_span']
        assert len(list((workspace/'catalog_sources').glob('*/manifest.json')))==10
''',encoding="utf-8")

(LAB/"tests"/"test_v49_multi_asset_contract.py").write_text(r'''import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def test_v49_rebuild_plan_dimensions():
    p=json.loads((ROOT/'data'/'workspace_rebuild_plan_v1.json').read_text(encoding='utf-8'))
    assert len(p['historical_bundle_install'])==10
    assert len(p['runs'])==52
    assert len(p['comparisons'])==16
    expected={f'CAT_BINANCE_{s}USDT_1H_{y}' for s in ('BTC','ETH','BNB','XRP','SOL') for y in (2024,2025)}
    assert expected <= set(p['required_source_ids'])

def test_v49_visible_build_and_health_contract():
    html=(ROOT/'web'/'index.html').read_text(encoding='utf-8')
    js=(ROOT/'web'/'app.js').read_text(encoding='utf-8')
    server=(ROOT/'src'/'server.py').read_text(encoding='utf-8')
    assert 'BUILD 4.9.0-DEV1' in html
    assert 'health.version!=="4.9.0-dev1"' in js
    assert '"historical_vault_v3_bundle_enabled": True' in server
''',encoding="utf-8")

replace(Path("tests/test_server_v46.py"),'self.assertEqual(health["version"], "4.7.0-rc1")','self.assertEqual(health["version"], "4.9.0-dev1")')
replace(Path("tests/test_server_v46.py"),'self.assertEqual(health["release_channel"], "RC1")','self.assertEqual(health["release_channel"], "DEV1")')
replace(Path("tests/test_web_contract_v46.py"),"BUILD 4.7.0-RC1","BUILD 4.9.0-DEV1")
replace(Path("tests/test_web_contract_v46.py"),'health.version!=="4.7.0-rc1"','health.version!=="4.9.0-dev1"')
replace(Path("tests/test_observatory.py"),"SevenHeavenStrategyLab/4.7.0-rc1","SevenHeavenStrategyLab/4.9.0-dev1")
replace(Path("tests/test_historical_vault_web_v1.py"),"/historical-vault.js?v=v48-historical-v2-steward-v3-20261117","/historical-vault.js?v=v49-historical-v3-five-assets-20261117")
replace(Path("tests/test_unified_help_layer_v48.py"),
        r"V4\.8-(?:HELP-LAYER-V1-GLOBAL|KNOWLEDGE-STEP5-PASSIVE|HISTORICAL-V2-STEWARD-V3)",
        r"V4\.(?:8-(?:HELP-LAYER-V1-GLOBAL|KNOWLEDGE-STEP5-PASSIVE|HISTORICAL-V2-STEWARD-V3)|9-HISTORICAL-V3-MULTI-ASSET-CORPUS-V1)")

print("V4.9 source migration prepared")
