#!/usr/bin/env python3
from pathlib import Path
import subprocess

script=Path('.github/scripts/_tmp_agent_crypto_404221_release_v2.py')
text=script.read_text(encoding='utf-8')
old='''        if "views/system.html" not in files:\n            fail("40.4.221 System source escaped version manifest hash authority")'''
new='''        if "views/system.html" not in (manifest.get("files") or {}):\n            fail("40.4.221 System source escaped version manifest hash authority")'''
if text.count(old)!=1:
    raise SystemExit(f'STOP runner expected one guard fix target, got {text.count(old)}')
text=text.replace(old,new,1)
needle="TMP_FILES=[\n"
addition="TMP_FILES=[\n REPO/'.github/scripts/_tmp_agent_crypto_404221_runner.py',\n"
if text.count(needle)!=1:
    raise SystemExit(f'STOP runner TMP_FILES anchor count={text.count(needle)}')
text=text.replace(needle,addition,1)
script.write_text(text,encoding='utf-8')
subprocess.run(['python',str(script)],check=True)
