#!/usr/bin/env python3
"""Guard the shared Hausses/Baisses/Volumes EUR history boundary."""
from pathlib import Path
import re,subprocess
file=Path("public/agent_crypto_erith_ia/administrator/app.js")
blob=subprocess.check_output(["git","hash-object",str(file)],text=True).strip()
assert blob=="a6b8e0969406350feb870bcd4cc1d526df8292fc",blob
s=file.read_text(encoding="utf-8")
start=s.index("function atlasScannerStoredHistory(")
end=s.index("\nasync function atlasScannerYieldToUi(",start)
part=s[start:end]
assert part.count("  ].filter(Boolean);")==1
part=part.replace("  ].filter(Boolean);",
'''  ].filter(result => result && atlasHistoricalDisplayQuote(result)?.currency === "EUR");''',1)
s=s[:start]+part+s[end:]
start=s.index("async function atlasScannerFetchDirect(")
end=s.index("\nconst ATLAS_SCANNER_COLLECTOR_SCHEMA",start)
part=s[start:end]
pattern=r'(?m)^(\s*)if \(!atlasScannerSeriesCoversWindow\(result, tx\)\.ok\) \{'
def add_guard(match):
    indent=match.group(1)
    return (indent+'if (atlasHistoricalDisplayQuote(result)?.currency !== "EUR")\n'
           +indent+'  throw new Error("Scanner EUR : historique sans provenance EUR certifiee");\n'
           +match.group(0))
part,count=re.subn(pattern,add_guard,part)
assert count==3,count
s=s[:start]+part+s[end:]
file.write_text(s,encoding="utf-8",newline="\n")
print("EUR scanner quote guards=3 and cached quote gate=1")
print("blob="+subprocess.check_output(["git","hash-object",str(file)],text=True).strip())
