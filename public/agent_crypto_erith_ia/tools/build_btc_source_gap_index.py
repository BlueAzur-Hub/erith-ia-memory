#!/usr/bin/env python3
"""Rebuild BTC source-gap evidence from immutable GitHub Releases, not counters.

Only original Binance ZIPs previously admitted against official CHECKSUM.
Release metadata SHA256 protects every manifest and binary pointer.
No Trading, Interface or browser-storage writes. No synthetic candles.
"""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import subprocess
import tempfile

REPO='BlueAzur-Hub/erith-ia-memory'
TAG=re.compile(r'^btc-spot-native-gap-(20\d{2}-(?:0[1-9]|1[0-2]))$')
DIGEST=re.compile(r'^sha256:[a-f0-9]{64}$')
MAX_PAGES=100
MAX_RECORDS=180


def require(ok,msg):
    if not ok:raise ValueError(msg)


def utc(ms):
    require(isinstance(ms,int) and ms>=0,'Invalid UTC millisecond source')
    return datetime.fromtimestamp(ms/1000,tz=timezone.utc).isoformat().replace('+00:00','Z')


def source_releases(releases):
    out={}
    for record in releases:
        tag=record.get('tag_name','')
        hit=TAG.fullmatch(tag)
        if not hit or record.get('draft'):continue
        month=hit.group(1)
        require(month not in out,'Duplicate native gap month Release')
        out[month]=record
    require(0<len(out)<=MAX_RECORDS,'No source gaps or excessive Release inventory')
    return out


def build(releases,load_manifest):
    entries=source_releases(releases)
    periods=[]
    proofs=[]
    for month,release in sorted(entries.items()):
        tag=release['tag_name']
        names={f'BTCUSDT-1m-{month}'+end for end in
               ('.zip','.zip.CHECKSUM','.sqlite','.json')}
        assets=release.get('assets')
        require(isinstance(assets,list) and len(assets)==4 and
                {a.get('name') for a in assets}==names,
                'Source Release is not the exact immutable four-file archive')
        by_name={a['name']:a for a in assets}
        for name,a in by_name.items():
            require(DIGEST.fullmatch(a.get('digest','')) is not None and
                    isinstance(a.get('size'),int) and a['size']>0,
                    'Source Release asset has no SHA-256 and size')
        manifest_file=f'BTCUSDT-1m-{month}.json'
        raw=load_manifest(tag,manifest_file)
        source_json=by_name[manifest_file]
        require(len(raw)==source_json['size'] and
                'sha256:'+hashlib.sha256(raw).hexdigest()==source_json['digest'],
                'Immutable Release manifest digest mismatch')
        j=json.loads(raw)
        require(j.get('schema')=='seven.btc.native.source-quality.v1' and
                j.get('month')==month and j.get('pair')=='BTCUSDT' and
                j.get('quote')=='USDT' and j.get('interval')=='1m' and
                j.get('canonical_import') is False and
                j.get('synthetic_rows')==0,
                'Source qualification or BTC exchange identity incorrect')
        require(j.get('status') in ('source_verified_gaps',
                'source_with_gaps_and_close_time_anomaly'),
                'Unrecognized partial source quality status')
        good,miss,total=(j.get('native_rows'),j.get('missing_minutes'),
                         j.get('expected_minutes'))
        require(all(isinstance(x,int) for x in (good,miss,total)) and
                good>0 and miss>0 and good+miss==total,
                'Source month not a genuine qualified partial')
        require(by_name[f'BTCUSDT-1m-{month}.zip']['digest']==
                'sha256:'+j['source_zip_sha256'] and
                by_name[f'BTCUSDT-1m-{month}.sqlite']['digest']==
                'sha256:'+j['sqlite_sha256'],
                'Source raw ZIP or SQLite digest different from manifest')
        gaps=[]
        for g in j.get('gaps',[]):
            start,end,n=g.get('start_ms'),g.get('end_ms_exclusive'),g.get('minutes')
            require(all(isinstance(v,int) for v in (start,end,n)) and
                    end>start and (end-start)==n*60000 and n>0,
                    'Invalid source-gap time interval')
            gaps.append({'start_utc':utc(start),'end_exclusive_utc':utc(end),
                         'missing_minutes':n,'start_ms':start,'end_ms_exclusive':end})
        require(sum(v['missing_minutes'] for v in gaps)==miss,
                'Calendar gaps differ from source manifest')
        anomalies=j.get('close_time_anomalies',[])
        require(isinstance(anomalies,list) and len(anomalies)<=2 and
                j.get('close_time_anomaly_count',0)==len(anomalies),
                'Unqualified source close-time anomaly')
        for x in anomalies:
            require(isinstance(x.get('open_time_ms'),int) and
                    isinstance(x.get('source_close_time_ms'),int) and
                    x['source_close_time_ms']-x['open_time_ms']==x['offset_from_open_ms'],
                    'Malformed preserved source close-time')
        filemap={kind:{'name':name,'bytes':by_name[name]['size'],
                       'sha256':by_name[name]['digest'][7:]}
                 for kind,name in {
                    'archive':f'BTCUSDT-1m-{month}.zip',
                    'checksum':f'BTCUSDT-1m-{month}.zip.CHECKSUM',
                    'sqlite':f'BTCUSDT-1m-{month}.sqlite',
                    'manifest':manifest_file}.items()}
        periods.append({'month':month,'status':j['status'],
            'native_rows':good,'expected_calendar_minutes':total,
            'missing_calendar_minutes':miss,'gaps':gaps,
            'close_time_anomaly_count':len(anomalies),
            'close_time_anomalies':anomalies,
            'first_open_utc':utc(j['first_open_ms']),
            'last_open_utc':utc(j['last_open_ms']),
            'source_zip_sha256':j['source_zip_sha256'],
            'release_tag':tag,
            'release_url':f'https://github.com/{REPO}/releases/tag/{tag}',
            'files':filemap,'can_extend_strict_contiguous_year_views':False})
        proofs.append(month+':'+source_json['digest'])
    return {'schema':'seven.btc.verified-gap-months.v1',
            'scope':'independent_source_qualified_months_not_in_strict_full_month_catalog',
            'asset_id':'bitcoin','symbol':'BTC','venue':'Binance Spot',
            'pair':'BTCUSDT','quote':'USDT','resolution':'1m','is_live':False,
            'can_extend_strict_contiguous_year_views':False,
            'can_be_queried_as_source_rows':True,
            'synthetic_candles':0,
            'source_release_count':len(periods),
            'verified_native_rows':sum(r['native_rows'] for r in periods),
            'missing_calendar_minutes':sum(r['missing_calendar_minutes'] for r in periods),
            'release_manifest_set_sha256':hashlib.sha256(
                '\n'.join(proofs).encode()).hexdigest(),
            'full_month_catalog':'../top250_history_catalog/index.json',
            'note':'Original ZIP + verified source-manifest proofs. Gap-month candle rows stay separate from complete-month catalog; do not interpolate, double-count or claim all-time coverage.',
            'months':periods}


def github_releases():
    rows=[]
    for page in range(1,MAX_PAGES+1):
        cp=subprocess.run(['gh','api',f'repos/{REPO}/releases?per_page=100&page={page}'],
                          check=True,capture_output=True,text=True,timeout=90)
        batch=json.loads(cp.stdout)
        require(isinstance(batch,list) and len(batch)<=100,'Release API response malformed')
        rows.extend(batch)
        if len(batch)<100:break
    else:raise ValueError('Release pagination exhausted')
    return rows


def main():
    p=argparse.ArgumentParser()
    p.add_argument('--output',type=Path,required=True)
    args=p.parse_args()
    releases=github_releases()
    with tempfile.TemporaryDirectory(prefix='btc-gap-index-') as temp:
        root=Path(temp)
        def obtain(tag,name):
            folder=root/tag;folder.mkdir(exist_ok=True)
            subprocess.run(['gh','release','download',tag,'--pattern',name,'--dir',str(folder)],
                           check=True,timeout=90)
            return (folder/name).read_bytes()
        index=build(releases,obtain)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(index,indent=2,ensure_ascii=False)+'\n')
    print('BTC GAP SOURCE INDEX '+json.dumps({
        'months':index['source_release_count'],
        'native_rows':index['verified_native_rows'],
        'missing_minutes':index['missing_calendar_minutes'],
        'source_set_sha256':index['release_manifest_set_sha256']},sort_keys=True),flush=True)


if __name__=='__main__':
    main()
