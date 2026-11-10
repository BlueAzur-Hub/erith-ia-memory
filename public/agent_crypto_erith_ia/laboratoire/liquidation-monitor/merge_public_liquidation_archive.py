#!/usr/bin/env python3
"""Merge concurrent GitHub Actions public BTC liquidations without losing events.

Only the allowlisted observed event files, coverage run ledger and latest status may
be merged. No access to account, Trader, Bridge or historical market owners.
"""
from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

DATE_RE=re.compile(r'^\d{4}-\d{2}-\d{2}\.jsonl$')
PROVIDERS={'bybit','binance','okx'}

class ArchiveError(ValueError):pass


def rows(path,key,kind):
    if not path.exists(): return {}
    result={}
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.strip():continue
        try: d=json.loads(line)
        except ValueError:raise ArchiveError('invalid archival jsonl') from None
        if not isinstance(d,dict) or not isinstance(d.get(key),str) or not d[key]:
            raise ArchiveError(f'missing {key}')
        if d.get('orders_enabled') is not False:
            raise ArchiveError('orders not allowed in public archive')
        if kind=='event':
            if d.get('provider') not in PROVIDERS or d.get('venue_market')!='DERIVATIVES' or d.get('causal_claim') is not False:
                raise ArchiveError('unexpected event source/schema')
        elif not isinstance(d.get('health'),list):
            raise ArchiveError('invalid connection ledger')
        prior=result.get(d[key])
        if prior is not None and prior!=d:raise ArchiveError('conflicting rows for same key')
        result[d[key]]=d
    return result


def merge(incoming,destination):
    incoming=Path(incoming);destination=Path(destination)
    if not incoming.exists():raise ArchiveError('incoming staging folder is missing')
    allowed=[]
    for file in incoming.rglob('*'):
        if not file.is_file():continue
        rel=file.relative_to(incoming)
        ok=(len(rel.parts)==1 and (DATE_RE.fullmatch(rel.name) or rel.name=='status.json')) or \
           (len(rel.parts)==2 and rel.parts[0]=='run-ledger' and DATE_RE.fullmatch(rel.name))
        if not ok:raise ArchiveError('unexpected staged path: '+str(rel))
        allowed.append(rel)
    pending={}
    added={}
    for rel in sorted(allowed):
        src=incoming/rel;dst=destination/rel
        if rel.name=='status.json':
            status=json.loads(src.read_text(encoding='utf-8'))
            if status.get('schema')!='seven.crypto.public-liquidation-witness.v1' or status.get('orders_enabled') is not False:
                raise ArchiveError('invalid collector status')
            old=json.loads(dst.read_text(encoding='utf-8')) if dst.exists() else None
            if old and str(old.get('updated_at_utc',''))>str(status.get('updated_at_utc','')):
                continue
            pending[dst]=json.dumps(status,sort_keys=True,ensure_ascii=False,indent=2)+'\n'
            continue
        is_run=rel.parts[0]=='run-ledger'
        key='run_key' if is_run else 'event_key'
        kind='run' if is_run else 'event'
        old=rows(dst,key,kind)
        new=rows(src,key,kind)
        for k,v in new.items():
            if k in old and old[k]!=v:raise ArchiveError(f'conflicting immutable {kind} entry {k}')
        merged={**old,**new}
        sort_key=('started_at_utc','run_key') if is_run else ('event_ts_ms','event_key')
        try: values=sorted(merged.values(),key=lambda d:(d.get(sort_key[0],''),d[sort_key[1]]))
        except (KeyError,TypeError):raise ArchiveError('archive sort fields invalid') from None
        pending[dst]=''.join(json.dumps(row,sort_keys=True,ensure_ascii=False,separators=(',',':'))+'\n' for row in values)
        added[str(rel)]=len(merged)-len(old)
    # All staged files have been validated before the first write.
    for path,value in pending.items():
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(value,encoding='utf-8')
    return {'merged_files':len(pending),'new_rows_by_file':added,'orders_enabled':False}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--incoming',type=Path,required=True)
    parser.add_argument('--dest',type=Path,required=True)
    args=parser.parse_args()
    print(json.dumps(merge(args.incoming,args.dest),ensure_ascii=False))

if __name__=='__main__':main()
