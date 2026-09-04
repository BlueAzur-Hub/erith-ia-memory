#!/usr/bin/env python3
from pathlib import Path
import json, sys

BASE=Path('public/agent_crypto_erith_ia/administrator')
MANIFEST=BASE/'version.json'
MAP={
  '230':'market-visual-master-parity.css',
  '231':'technical-reading-cockpit-parity.css',
}
if len(sys.argv)!=2 or sys.argv[1] not in MAP:
    raise SystemExit('usage: manifest_hash_arm.py 230|231')
rel=MAP[sys.argv[1]]
payload=BASE/rel
if not payload.is_file():
    raise SystemExit(f'missing payload: {rel}')
data=json.loads(MANIFEST.read_text(encoding='utf-8'))
files=data.get('files')
if not isinstance(files,dict):
    raise SystemExit('version.json files map missing')
files[rel]='PENDING_RELEASE_DRIVER_HASH'
MANIFEST.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'HASH_AUTHORITY_ARM_PASS {rel}')
