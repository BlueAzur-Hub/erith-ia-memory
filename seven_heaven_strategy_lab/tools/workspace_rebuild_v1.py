#!/usr/bin/env python3
"""Seven Heaven Workspace Rebuild V1.

Dry-run by default. With --execute it backs up generated state, preserves verified
market-source directories byte-for-byte, resets generated records, and rebuilds
canonical profiles/StrategySpecs/PAPER runs/comparisons through the real local
HTTP server. Scientific/Research acceptance remains ephemeral by contract.
"""
from __future__ import annotations
import argparse, datetime as dt, hashlib, json, os, shutil, socket, subprocess, sys, time, urllib.error, urllib.request, zipfile
from pathlib import Path


ROOT=Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path: sys.path.insert(0,str(ROOT))
from src.historical_vault_v1 import install_year as install_historical_year
DEFAULT_PLAN=ROOT/'data'/'workspace_rebuild_plan_v1.json'
GENERATED=('profiles','strategy_specs','results','comparisons')
PRESERVED=('datasets','okx_sources','binance_monthly_sources','catalog_sources','user_profiles','user_strategy_specs')

def sha256_file(path:Path)->str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''): h.update(block)
    return h.hexdigest()

def source_inventory(workspace:Path)->dict[str,str]:
    out={}
    for name in PRESERVED:
        root=workspace/name
        if not root.exists(): continue
        for p in sorted(root.rglob('*')):
            if p.is_file(): out[p.relative_to(workspace).as_posix()]=sha256_file(p)
    return out

def generated_inventory(workspace:Path)->dict[str,list[str]]:
    return {name:sorted(p.name for p in (workspace/name).glob('*.json')) if (workspace/name).exists() else [] for name in GENERATED}

def load_plan(path:Path)->dict:
    plan=json.loads(path.read_text(encoding='utf-8'))
    if plan.get('schema')!='seven.workspace.rebuild.plan.v1': raise SystemExit('Plan de rebuild incompatible')
    return plan

def free_port()->int:
    with socket.socket(socket.AF_INET,socket.SOCK_STREAM) as s:
        s.bind(('127.0.0.1',0)); return int(s.getsockname()[1])

def api(port:int,path:str,body=None,timeout=180):
    headers={'Host':f'127.0.0.1:{port}'}; data=None
    if body is not None:
        headers['Content-Type']='application/json'; data=json.dumps(body).encode('utf-8')
    request=urllib.request.Request(f'http://127.0.0.1:{port}{path}',headers=headers,data=data,method='GET' if body is None else 'POST')
    try:
        with urllib.request.urlopen(request,timeout=timeout) as response: return json.load(response)
    except urllib.error.HTTPError as exc:
        detail=exc.read().decode('utf-8','replace')
        raise RuntimeError(f'{path}: HTTP {exc.code}: {detail}') from exc

def start_server(workspace:Path):
    port=free_port(); env=os.environ.copy(); env.update(SEVEN_LAB_WORKSPACE=str(workspace),SEVEN_LAB_HOST='127.0.0.1',SEVEN_LAB_PORT=str(port),SEVEN_LAB_OPEN_BROWSER='0',SEVEN_LAB_WORKSPACE_WRITE_MODE='canonical')
    proc=subprocess.Popen([sys.executable,'-m','src.server'],cwd=ROOT,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
    deadline=time.time()+20
    while time.time()<deadline:
        if proc.poll() is not None:
            output=proc.stdout.read() if proc.stdout else ''
            raise RuntimeError('Serveur Lab arrêté pendant le rebuild:\n'+output)
        try:
            health=api(port,'/api/health',timeout=2)
            if health.get('live_trading') is False: return proc,port,health
        except Exception: time.sleep(.15)
    proc.terminate(); raise RuntimeError('Serveur Lab indisponible pour le rebuild')

def stop_server(proc):
    if proc.poll() is None:
        proc.terminate()
        try: proc.wait(timeout=5)
        except subprocess.TimeoutExpired: proc.kill(); proc.wait(timeout=5)

def params(plan,scenario):
    result=dict(plan['defaults']); result.update(kind=scenario['kind'],source_id=scenario['source_id'],timeframe=scenario['timeframe']); return result

def backup_generated(workspace:Path)->Path:
    backup_root=workspace.parent/'workspace_rebuild_backups'; backup_root.mkdir(parents=True,exist_ok=True)
    stamp=dt.datetime.now(dt.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    target=backup_root/f'generated-state-before-rebuild-{stamp}.zip'
    manifest={'created_utc':dt.datetime.now(dt.timezone.utc).isoformat(),'workspace':workspace.name,'generated_inventory':generated_inventory(workspace),'source_inventory_sha256':source_inventory(workspace)}
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        z.writestr('BACKUP_MANIFEST.json',json.dumps(manifest,ensure_ascii=False,indent=2))
        for name in GENERATED:
            root=workspace/name
            if root.exists():
                for p in sorted(root.rglob('*')):
                    if p.is_file(): z.write(p,p.relative_to(workspace).as_posix())
        for name in ('CANONICAL_REBUILD_MANIFEST.json','CANONICAL_EPHEMERAL_ACCEPTANCE.json'):
            p=workspace/name
            if p.is_file(): z.write(p,p.name)
    return target

def reset_generated(workspace:Path):
    for name in GENERATED:
        p=workspace/name
        if p.exists(): shutil.rmtree(p)
        p.mkdir(parents=True,exist_ok=True)
    for name in ('CANONICAL_REBUILD_MANIFEST.json','CANONICAL_EPHEMERAL_ACCEPTANCE.json'):
        (workspace/name).unlink(missing_ok=True)

def install_required_historical_bundle(workspace:Path,plan:dict)->list[dict]:
    installed=[]
    for item in plan.get('historical_bundle_install',[]):
        installed.append(install_historical_year(workspace,item['symbol'],int(item['year'])))
    return installed

def rebuild(workspace:Path,plan:dict,port:int)->dict:
    catalog=api(port,'/api/sources'); available={s['source_id'] for s in catalog.get('sources',[])}
    missing=set(plan['required_source_ids'])-available
    if missing: raise RuntimeError('Sources requises absentes/non vérifiables: '+', '.join(sorted(missing)))
    profiles=[]; specs=[]; runs=[]; comparisons=[]
    for scenario in plan['runs']:
        p=params(plan,scenario)
        profiles.append(api(port,'/api/profiles',{'name':scenario['name'],'params':p})['profile'])
        specs.append(api(port,'/api/strategy-specs',{'name':scenario['name'],'params':p})['strategy_spec'])
        runs.append(api(port,'/api/run',{'params':p})['report'])
    for scenario in plan['comparisons']:
        comparisons.append(api(port,'/api/compare',{'params':params(plan,scenario)})['report'])
    return {'profiles':profiles,'strategy_specs':specs,'runs':runs,'comparisons':comparisons,'source_catalog_count':catalog['count']}

def run_ephemeral(plan:dict,port:int)->dict:
    base=dict(plan['defaults']); ep=plan['ephemeral_acceptance']; base.update(source_id=ep['source_id'],timeframe=ep['timeframe'])
    out={'robustness':{}}
    for kind in ep['robustness_kinds']:
        p=dict(base,kind=kind); r=api(port,'/api/robustness',{'params':p})['research']; s=r['summary']
        out['robustness'][kind]={'holdout_windows':s['holdout_windows'],'mean_holdout_return_pct':s['mean_holdout_return_pct'],'worst_holdout_return_pct':s['worst_holdout_return_pct']}
    p=dict(base,kind=ep['filter_study_kind']); r=api(port,'/api/filters-study',{'params':p})['research']
    out['filter_study']={'kind':ep['filter_study_kind'],'variants':r['summary']['variants_compared'],'verification_windows':r['summary']['verification_windows']}
    return out

def summarize(records:dict)->dict:
    return {
      'profiles':[{'id':x['id'],'name':x['name'],'params':x['params']} for x in records['profiles']],
      'strategy_specs':[{'id':x['id'],'name':x['name'],'fingerprint_sha256':x['fingerprint_sha256']} for x in records['strategy_specs']],
      'runs':[{'id':x['id'],'created_utc':x['created_utc'],'source_id':x['source']['id'],'kind':x['run']['params']['kind'],'timeframe':x['run']['data']['timeframe'],'return_pct':x['run']['results']['return_pct'],'equity_final':x['run']['results']['equity_final'],'max_drawdown_pct':x['run']['results']['max_drawdown_pct'],'fees_paid_quote':x['run']['results']['fees_paid_quote'],'fills':x['run']['results']['hypothetical_fills']} for x in records['runs']],
      'comparisons':[{'id':x['id'],'created_utc':x['created_utc'],'source_id':x['source']['id'],'timeframe':x['comparison']['timeframe'],'rows':[{'kind':r['kind'],'return_pct':r['return_pct'],'equity_final':r['equity_final'],'max_drawdown_pct':r['max_drawdown_pct'],'fees_paid_quote':r['fees_paid_quote'],'fills':r['hypothetical_fills']} for r in x['comparison']['rows']]} for x in records['comparisons']]
    }

def main():
    parser=argparse.ArgumentParser(description='Reset/rebuild canonique du workspace Seven Heaven. Dry-run par défaut.')
    parser.add_argument('--workspace',type=Path,default=ROOT/'workspace')
    parser.add_argument('--plan',type=Path,default=DEFAULT_PLAN)
    parser.add_argument('--execute',action='store_true',help='Autorise sauvegarde + reset + rebuild')
    args=parser.parse_args(); workspace=args.workspace.resolve(); workspace.mkdir(parents=True,exist_ok=True); plan=load_plan(args.plan.resolve())
    pre_install_sources=source_inventory(workspace); before_generated=generated_inventory(workspace)
    proc=None
    try:
        historical_installed=install_required_historical_bundle(workspace,plan) if args.execute else []
        before_sources=source_inventory(workspace)
        proc,port,health=start_server(workspace)
        catalog=api(port,'/api/sources'); available={x['source_id'] for x in catalog.get('sources',[])}
        projected={f"CAT_BINANCE_{str(x['symbol']).upper()}USDT_1H_{int(x['year'])}" for x in plan.get('historical_bundle_install',[])}
        missing=set(plan['required_source_ids'])-(available | (projected if not args.execute else set()))
        report={'mode':'EXECUTE' if args.execute else 'DRY_RUN','workspace':str(workspace),'source_files_before_bundle':len(pre_install_sources),'source_files_after_bundle':len(before_sources),'historical_source_files_added':len(set(before_sources)-set(pre_install_sources)),'source_catalog_count':catalog.get('count',0),'generated_before':{k:len(v) for k,v in before_generated.items()},'required_sources_missing':sorted(missing),'planned_profiles':len(plan['runs']),'planned_runs':len(plan['runs']),'planned_strategy_specs':len(plan['runs']),'planned_comparisons':len(plan['comparisons']),'historical_bundle_install_count':len(plan.get('historical_bundle_install',[])),'historical_bundle_installed':[x.get('id') for x in historical_installed]}
        print(json.dumps(report,ensure_ascii=False,indent=2))
        if missing: raise RuntimeError('Rebuild refusé: source(s) requise(s) absente(s)')
        if not args.execute:
            print('DRY-RUN uniquement. Ajoute --execute pour modifier ce workspace.'); return 0
        backup=backup_generated(workspace); reset_generated(workspace)
        generated_before_ephemeral=None
        records=rebuild(workspace,plan,port)
        generated_before_ephemeral=generated_inventory(workspace)
        ephemeral=run_ephemeral(plan,port)
        generated_after_ephemeral=generated_inventory(workspace)
        if generated_before_ephemeral!=generated_after_ephemeral: raise RuntimeError('Scientific/Research a écrit un fichier alors que le contrat exige un calcul éphémère')
        after_sources=source_inventory(workspace)
        if before_sources!=after_sources: raise RuntimeError('Une source vérifiée a été modifiée pendant le rebuild')
        manifest={'schema':'seven.workspace.canonical_rebuild.v1','created_utc':dt.datetime.now(dt.timezone.utc).isoformat(),'plan_schema':plan['schema'],'plan_name':plan['name'],'backup_zip':str(backup.relative_to(workspace.parent)),'source_files_preserved':len(after_sources),'source_catalog_count':records['source_catalog_count'],'generated':summarize(records)}
        (workspace/'CANONICAL_REBUILD_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
        (workspace/'CANONICAL_EPHEMERAL_ACCEPTANCE.json').write_text(json.dumps(ephemeral,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps({'status':'REBUILD_OK','backup':str(backup),'generated_after':{k:len(v) for k,v in generated_inventory(workspace).items()},'sources_preserved':before_sources==after_sources},ensure_ascii=False,indent=2)); return 0
    finally:
        if proc is not None: stop_server(proc)

if __name__=='__main__': raise SystemExit(main())
