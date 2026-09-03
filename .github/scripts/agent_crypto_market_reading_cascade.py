#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, json, re, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('public/agent_crypto_erith_ia/administrator')
DATA = Path('public/agent_crypto_erith_ia/data')
ENGINE = '38.15.11'
RELEASES = {
    '40.4.199': 'MARKET READING DEPTH FOUNDATION · METALS DEEP READING · LAZY TEXT',
    '40.4.200': 'INDICES DEEP READING · MULTI-HORIZON EXPLAINABLE TEXT · LAZY',
    '40.4.201': 'ENERGY DEEP READING · OIL GAS SEPARATION · LAZY',
    '40.4.202': 'CROSS-MARKET LONG MEMORY · COMMON-DATE CORRELATION · LAZY',
    '40.4.203': 'HISTORICAL MATH CORE · MARKET READING DEPTH · EXPLAINABLE MEASURES',
}

def read(path: Path) -> str:
    return path.read_text(encoding='utf-8')

def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding='utf-8')

def replace_regex(text: str, pattern: str, repl: str, label: str, flags=0) -> str:
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'cascade patch failed {label}: {count}')
    return out

def previous_build(build: str) -> str:
    a,b,c = [int(x) for x in build.split('.')]
    return f'{a}.{b}.{c-1}'

def patch_parallel(build: str, level: int) -> None:
    path = BASE / 'js/parallel-markets.js'
    text = read(path)
    text = replace_regex(text, r'const BUILD = "40\.4\.\d+";', f'const BUILD = "{build}";', 'parallel BUILD')
    text = replace_regex(text, r'const DEPTH_LEVEL = \d+;', f'const DEPTH_LEVEL = {level};', 'parallel DEPTH_LEVEL')
    if 'historyBase: "../data/cross_market/history"' not in text:
        old = '"cross-market": Object.freeze({ label: "CROSS", title: "Cross-Market Observatory", path: "../data/cross_market/market.json", expected: 5, accent: "#dce5ec", source: "Archives canoniques", defaultPeriod: "90j", base100Only: true, depthAt: 192 })'
        new = '"cross-market": Object.freeze({ label: "CROSS", title: "Cross-Market Observatory", path: "../data/cross_market/market.json", historyBase: "../data/cross_market/history", expected: 5, accent: "#dce5ec", source: "Archives canoniques", defaultPeriod: "90j", base100Only: true, depthAt: 192 })'
        if old not in text: raise SystemExit('cross config anchor missing')
        text = text.replace(old,new,1)
    if 'function longDomainEnabled(domain)' not in text:
        anchor = '  function isLongPeriod(period) { return LONG_PERIODS.includes(period); }\n'
        insert = anchor + '  function longDomainEnabled(domain) { return domain === "indices" || domain === "energy" || (DEPTH_LEVEL >= 202 && domain === "cross-market"); }\n'
        if anchor not in text: raise SystemExit('longDomain anchor missing')
        text = text.replace(anchor,insert,1)
    text = text.replace('if (!LONG_PERIODS.includes(period) || !["indices", "energy"].includes(domain)) return;', 'if (!LONG_PERIODS.includes(period) || !longDomainEnabled(domain)) return;')
    text = text.replace('if (!cfg?.historyBase || !["indices", "energy"].includes(domain) || !isLongPeriod(period)) return Promise.reject(new Error("historique long non activé pour ce domaine"));', 'if (!cfg?.historyBase || !longDomainEnabled(domain) || !isLongPeriod(period)) return Promise.reject(new Error("historique long non activé pour ce domaine"));')
    text = text.replace('const available = domain === "indices" || domain === "energy";', 'const available = longDomainEnabled(domain);')
    text = text.replace('historical_domains:Object.freeze({indices:true,energy:true,"cross-market":false}),', 'historical_domains:Object.freeze({indices:true,energy:true,"cross-market":DEPTH_LEVEL>=202}),')
    old_schema = '    const expectedSchema = domain === "energy"\n      ? "agent_crypto_commodity_historical_depth_v1"\n      : "agent_crypto_historical_depth_v1";'
    new_schema = '    const expectedSchema = domain === "cross-market"\n      ? "agent_crypto_cross_historical_depth_v1"\n      : domain === "energy"\n        ? "agent_crypto_commodity_historical_depth_v1"\n        : "agent_crypto_historical_depth_v1";'
    if old_schema in text:
        text = text.replace(old_schema,new_schema,1)
    if 'function measuredSnapshot404199' not in text:
        anchor = '  globalThis.ErithParallelMarketsRuntime = Object.freeze({\n'
        block = r'''  function measuredSnapshot404199(domain, requestedPeriod=null) {
    const cfg = CONFIG[domain];
    if (!cfg || !ACTIVE.has(domain)) return { loaded:false, domain, period:requestedPeriod || null, reason:"domain_inactive" };
    const period = requestedPeriod || state.period.get(domain) || cfg.defaultPeriod;
    const payload = payloadForPeriod(domain, period);
    if (!payload) return { loaded:false, domain, period, long:isLongPeriod(period), reason:isLongPeriod(period)?"not_loaded":"payload_unavailable" };
    const assets=[];
    for (const asset of payload.assets || []) {
      const rows=pickSeries(asset,period,domain==="cross-market");
      if(rows.length<2) continue;
      const metric=metrics(rows);
      assets.push({
        asset_id:safeText(asset.asset_id||asset.symbol), name:safeText(asset.name||asset.label||asset.symbol), symbol:safeText(asset.symbol||asset.name),
        provider_symbol:safeText(asset.provider_symbol||asset.symbol), currency:safeText(asset.currency||asset.unit||""), instrument_type:safeText(asset.instrument_type||""),
        metric:{change:metric.change,volatility:metric.volatility,drawdown:metric.drawdown,amplitude:metric.amplitude},
        series:rows.map(row=>({time:row.time,close:row.close})), points:rows.length
      });
    }
    return {loaded:true,domain,period,long:isLongPeriod(period),source:safeText(payload.source||cfg.source),resolution:safeText(payload.resolution||""),generated_at:payload.generated_at||null,assets_count:assets.length,expected:cfg.expected,assets};
  }

  async function ensureHistorical404199(domain, period) {
    if (!longDomainEnabled(domain) || !isLongPeriod(period)) return measuredSnapshot404199(domain,period);
    await loadHistorical(domain,period);
    return measuredSnapshot404199(domain,period);
  }

'''
        if anchor not in text: raise SystemExit('parallel runtime anchor missing')
        text = text.replace(anchor,block+anchor,1)
        text = text.replace('    refresh:domain=>{state.data.delete(domain);for(const key of [...state.history.keys()]) if(key.startsWith(`${domain}:`)) state.history.delete(key);return sync(domain);}', '    snapshot:measuredSnapshot404199,\n    ensureHistorical:ensureHistorical404199,\n    refresh:domain=>{state.data.delete(domain);for(const key of [...state.history.keys()]) if(key.startsWith(`${domain}:`)) state.history.delete(key);return sync(domain);}',1)
    write(path,text)

def patch_reading_module(build: str, level: int) -> None:
    path = BASE / 'js/market-reading-depth.js'
    text=read(path)
    text=replace_regex(text,r'const BUILD = "40\.4\.\d+";',f'const BUILD = "{build}";','reading BUILD')
    text=replace_regex(text,r'const DEPTH_LEVEL = \d+;',f'const DEPTH_LEVEL = {level};','reading DEPTH')
    if 'json:new Map()' not in text:
        text=text.replace('const state = {domain:"crypto", open:false, metals:new Map(), pending:new Map(), requestedPeriod:null};','const state = {domain:"crypto", open:false, metals:new Map(), json:new Map(), pending:new Map(), requestedPeriod:null};',1)
        text=text.replace('    if(state.pending.has(key)) return state.pending.get(key);\n    const promise=fetch(', '    if(state.json.has(key)) return Promise.resolve(state.json.get(key));\n    if(state.pending.has(key)) return state.pending.get(key);\n    const promise=fetch(',1)
        text=text.replace('return r.json();}).finally(()=>state.pending.delete(key));', 'return r.json();}).then(payload=>{state.json.set(key,payload);return payload;}).finally(()=>state.pending.delete(key));',1)
    write(path,text)

def ensure_index_assets(index: str, build: str) -> str:
    if 'market-reading-depth.css' not in index:
        anchor = re.search(r'  <link rel="stylesheet" href="\./parallel-markets\.css\?v=[^"]+" />\n',index)
        if not anchor: raise SystemExit('parallel css link missing')
        insert = anchor.group(0) + f'  <link rel="stylesheet" href="./market-reading-depth.css?v={build}" />\n'
        index = index.replace(anchor.group(0),insert,1)
    else:
        index=replace_regex(index,r'(<link rel="stylesheet" href="\./market-reading-depth\.css\?v=)[^"]+(" />)',rf'\g<1>{build}\2','reading css cache')
    if 'js/market-reading-depth.js' not in index:
        if '</body>' not in index: raise SystemExit('body close missing')
        index=index.replace('</body>',f'  <script src="./js/market-reading-depth.js?v=administrator-build-{build}"></script>\n</body>',1)
    else:
        index=replace_regex(index,r'(src="\./js/market-reading-depth\.js\?v=administrator-build-)[^"]+("\s*></script>)',rf'\g<1>{build}\2','reading js cache')
    return index

def patch_identity(build: str, release: str) -> None:
    prev=previous_build(build)
    index_path=BASE/'index.html'; root_path=BASE/'app.js'; admin_path=BASE/'js/app.js'; stack_path=BASE/'js/market-stack.js'
    index=read(index_path)
    index=ensure_index_assets(index,build)
    index=replace_regex(index,r'(<meta name="atlas-build" content=")[^"]+(" />)',rf'\g<1>{build}\2','meta atlas')
    index=replace_regex(index,r'(<meta name="administrator-build" content=")[^"]+(" />)',rf'\g<1>{build}\2','meta admin')
    index=replace_regex(index,r'(<meta name="administrator-release" content=")[^"]+(" />)',rf'\g<1>{release}\2','meta release')
    index=replace_regex(index,r'(<meta name="atlas-asset-token" content=")[^"]+(" />)',rf'\g<1>market-core-v2.0-alpha-build-{build}\2','meta token')
    index=replace_regex(index,r'<title>Agent-Crypto @erith\.IA — Build [^ ]+ · Administrator</title>',f'<title>Agent-Crypto @erith.IA — Build {build} · Administrator</title>','title')
    index=replace_regex(index,r'(src="\./app\.js\?v=administrator-build-)[^"]+("\s*></script>)',rf'\g<1>{build}\2','root cache')
    index=replace_regex(index,r'(src="\./js/app\.js\?v=administrator-build-)[^"]+("\s*></script>)',rf'\g<1>{build}\2','admin cache')
    index=replace_regex(index,r'(href="\./parallel-markets\.css\?v=)[^"]+(" />)',rf'\g<1>{build}\2','parallel css cache')
    index=replace_regex(index,r'(id="footerRelease"[^>]*>[^<]*Market Core · Build )[^ ]+( · Version : Parker Lewis Can\'t Lose</span>)',rf'\g<1>{build}\2','footer')
    write(index_path,index)
    root=read(root_path)
    root=replace_regex(root,r'const ATLAS_BUILD = "40\.4\.\d+";',f'const ATLAS_BUILD = "{build}";','root build')
    write(root_path,root)
    admin=read(admin_path)
    admin=replace_regex(admin,r'const ADMIN_BUILD = "40\.4\.\d+";',f'const ADMIN_BUILD = "{build}";','admin build')
    admin=replace_regex(admin,r'const ADMIN_RELEASE = "[^"]+";',f'const ADMIN_RELEASE = "{release}";','admin release')
    write(admin_path,admin)
    stack=read(stack_path)
    stack=replace_regex(stack,r'const BUILD = "40\.4\.\d+";',f'const BUILD = "{build}";','stack build')
    write(stack_path,stack)
    manifest_path=BASE/'version.json'; mirror_path=BASE/'administrator-version.json'; build_path=BASE/'build.json'
    manifest=json.loads(read(manifest_path)); mirror=json.loads(read(mirror_path)); bjson=json.loads(read(build_path))
    token=f'market-core-v2.0-alpha-build-{build}'
    manifest['build']=build; manifest['release']=release; manifest['asset_token']=token; manifest['parent_build']=prev
    if isinstance(manifest.get('status'),dict): manifest['status']['release']=release
    bjson['build']=build; bjson['release']=release; bjson['published']=True
    if isinstance(bjson.get('engine'),dict): bjson['engine']['reference_build']=ENGINE
    mirror['build']=build; mirror['global_versioning']=build; mirror['release']=release; mirror['asset_token']=token; mirror['parent_build']=prev
    write(build_path,json.dumps(bjson,ensure_ascii=False,indent=2)+'\n')
    write(mirror_path,json.dumps(mirror,ensure_ascii=False,indent=2)+'\n')
    files=manifest.get('files')
    if not isinstance(files,dict) or not files: raise SystemExit('version manifest files missing')
    files.setdefault('js/market-reading-depth.js','')
    files.setdefault('market-reading-depth.css','')
    for rel in list(files):
        p=BASE/rel
        if not p.is_file(): raise SystemExit(f'hash target missing {rel}')
        files[rel]=hashlib.sha256(p.read_bytes()).hexdigest()
    write(manifest_path,json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

def yahoo_chart(symbol: str, interval: str, range_: str) -> list[dict]:
    params=urllib.parse.urlencode({'range':range_,'interval':interval,'events':'history','includeAdjustedClose':'true'})
    headers={'User-Agent':'Mozilla/5.0 Agent-Crypto Historical Collector'}
    last_err=None
    for host in ('query1.finance.yahoo.com','query2.finance.yahoo.com'):
        url=f'https://{host}/v8/finance/chart/{urllib.parse.quote(symbol,safe="")}?{params}'
        for attempt in range(3):
            try:
                req=urllib.request.Request(url,headers=headers)
                with urllib.request.urlopen(req,timeout=30) as r: payload=json.load(r)
                result=(payload.get('chart') or {}).get('result') or []
                if not result: raise RuntimeError((payload.get('chart') or {}).get('error') or 'empty yahoo result')
                item=result[0]; stamps=item.get('timestamp') or []; quote=((item.get('indicators') or {}).get('quote') or [{}])[0]
                out=[]
                for i,ts in enumerate(stamps):
                    close=(quote.get('close') or [None]*len(stamps))[i]
                    if close is None: continue
                    dt=datetime.fromtimestamp(ts,tz=timezone.utc)
                    def q(name):
                        arr=quote.get(name) or []
                        return arr[i] if i < len(arr) else None
                    out.append({'time':dt.isoformat().replace('+00:00','Z'),'date':dt.date().isoformat(),'open':q('open'),'high':q('high'),'low':q('low'),'close':close,'volume':q('volume')})
                if len(out)<20: raise RuntimeError(f'insufficient yahoo rows {len(out)}')
                return out
            except Exception as exc:
                last_err=exc; time.sleep(1.2*(attempt+1))
    raise RuntimeError(f'Yahoo BTC history failed: {last_err}')

def pick_asset(payload: dict, provider_symbol: str) -> dict:
    for asset in payload.get('assets') or []:
        if str(asset.get('provider_symbol') or asset.get('symbol')) == provider_symbol:
            return asset
    raise RuntimeError(f'asset {provider_symbol} missing')

def trim_years(rows: list[dict], years: int) -> list[dict]:
    if not rows: return []
    last=datetime.fromisoformat(rows[-1]['time'].replace('Z','+00:00')).timestamp()
    cut=last-years*365.2425*86400
    return [r for r in rows if datetime.fromisoformat(r['time'].replace('Z','+00:00')).timestamp()>=cut]

def build_cross_history(build: str) -> None:
    outdir=DATA/'cross_market/history'; outdir.mkdir(parents=True,exist_ok=True)
    btc_week=yahoo_chart('BTC-USD','1wk','10y')
    btc_max=yahoo_chart('BTC-USD','1mo','max')
    for period in ('5a','10a','max'):
        metals=json.loads(read(DATA/f'metals/history_long/{period}.json'))
        indices=json.loads(read(DATA/f'indices/history/{period}.json'))
        energy=json.loads(read(DATA/f'energy/history/{period}.json'))
        rows_btc=btc_max if period=='max' else (trim_years(btc_week,5) if period=='5a' else btc_week)
        resolution='1mo' if period=='max' else '1wk'
        local=[
            ('btc','Bitcoin','BTC','BTC-USD','USD','crypto_spot',rows_btc,{'id':'yahoo_finance','name':'Yahoo Finance','provider_symbol':'BTC-USD'}),
            ('gold','Or','XAU','GC=F','USD','future_continuous',pick_asset(metals,'GC=F').get('history_points') or [],pick_asset(metals,'GC=F').get('source')),
            ('sp500','S&P 500','S&P500','^GSPC','USD','cash_index',pick_asset(indices,'^GSPC').get('history_points') or [],pick_asset(indices,'^GSPC').get('source')),
            ('brent','Brent','BRENT','BZ=F','USD','future_continuous',pick_asset(energy,'BZ=F').get('history_points') or [],pick_asset(energy,'BZ=F').get('source')),
            ('copper','Cuivre','HG','HG=F','USD','future_continuous',pick_asset(metals,'HG=F').get('history_points') or [],pick_asset(metals,'HG=F').get('source')),
        ]
        assets=[]
        for aid,name,symbol,provider,currency,itype,rows,source in local:
            if len(rows)<20: raise RuntimeError(f'{period} {provider} insufficient rows {len(rows)}')
            assets.append({'asset_id':aid,'name':name,'symbol':symbol,'provider_symbol':provider,'currency':currency,'instrument_type':itype,'source':source,'history_points':rows})
        payload={
            'schema':'agent_crypto_cross_historical_depth_v1','build':build,'domain':'cross-market','status':'ready','horizon':period,'resolution':resolution,
            'generated_at':datetime.now(timezone.utc).isoformat().replace('+00:00','Z'),'source':'Canonical long archives + Yahoo Finance BTC-USD',
            'source_note':'Mixed-instrument cross-market memory. Futures remain futures; S&P 500 is a cash index; BTC is BTC-USD spot history.',
            'assets_expected':5,'assets_count':5,'assets':assets,
            'integrity':{'lazy_browser_load_required':True,'boot_payload_forbidden':True,'common_date_alignment_required':True,'correlation_causality_forbidden':True,'mixed_instrument_semantics_explicit':True,'orders_allowed':False,'prediction_allowed':False}
        }
        write(outdir/f'{period}.json',json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
    status={'schema':'agent_crypto_cross_historical_depth_status_v1','build':build,'status':'ready','horizons':['5a','10a','max'],'lazy_browser_load_required':True,'generated_at':datetime.now(timezone.utc).isoformat().replace('+00:00','Z')}
    write(outdir/'status.json',json.dumps(status,ensure_ascii=False,indent=2)+'\n')

def validate_local(build: str, release: str, level: int) -> None:
    index=read(BASE/'index.html'); pm=read(BASE/'js/parallel-markets.js'); rd=read(BASE/'js/market-reading-depth.js')
    assert f'content="{build}"' in index
    assert f'const BUILD = "{build}";' in pm
    assert f'const DEPTH_LEVEL = {level};' in pm
    assert f'const BUILD = "{build}";' in rd
    assert f'const DEPTH_LEVEL = {level};' in rd
    assert 'market-reading-depth.css' in index and 'market-reading-depth.js' in index
    assert ENGINE in index
    if level>=202:
        for p in ('5a','10a','max'):
            obj=json.loads(read(DATA/f'cross_market/history/{p}.json'))
            assert obj['schema']=='agent_crypto_cross_historical_depth_v1' and obj['assets_count']==5

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--build',required=True); args=ap.parse_args()
    build=args.build
    if build not in RELEASES: raise SystemExit(f'unsupported build {build}')
    level=int(build.split('.')[-1]); release=RELEASES[build]
    patch_parallel(build,level)
    patch_reading_module(build,level)
    if level==202: build_cross_history(build)
    patch_identity(build,release)
    validate_local(build,release,level)
    print(json.dumps({'ok':True,'build':build,'release':release,'level':level},ensure_ascii=False))

if __name__=='__main__': main()
