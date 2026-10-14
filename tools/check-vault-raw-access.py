#!/usr/bin/env python3
"""Probe live public Raw delivery from GitHub Actions, before a Pages cutover."""
import argparse,json,urllib.request
ORIGIN="https://blueazur-hub.github.io"
ROOT="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/"
SOURCES=[
 "public/agent_crypto_erith_ia/data/crypto/latest.json",
 "public/agent_crypto_erith_ia/data/historical_archive_prototype/compact_v1/index.json",
 "public/agent_crypto_erith_ia/data/oracle_evidence/manifest.json"]
def fetch(path,revision,max_bytes):
 url=ROOT+revision+"/"+path
 request=urllib.request.Request(url,headers={"Origin":ORIGIN,"Accept":"application/json"})
 with urllib.request.urlopen(request,timeout=25)as f:
  if f.status!=200:raise RuntimeError("HTTP "+str(f.status)+" "+path)
  cors=f.headers.get("Access-Control-Allow-Origin")
  if cors not in ("*",ORIGIN):raise RuntimeError("CORS missing for "+path+": "+str(cors))
  content=f.read(max_bytes+1)
  if len(content)>max_bytes or len(content)==0:raise RuntimeError("Bad size "+path)
  if path.endswith(".json"):
   value=json.loads(content.decode("utf-8"))
   if not isinstance(value,(dict,list)):raise RuntimeError("Unexpected JSON "+path)
  if path.endswith(".png")and content[:8]!=b"\x89PNG\r\n\x1a\n":
   raise RuntimeError("PNG header mismatch "+path)
 return {"path":path,"bytes":len(content),"cors":cors}
if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("--image-ref",required=True);args=p.parse_args()
 results=[fetch(n,"main",3_000_000) for n in SOURCES]
 results.append(fetch("assets/images/technical-reading/technical-random-01.png",args.image_ref,7_000_000))
 print(json.dumps({"source":"GitHub Raw","all_read_only":True,"checks":results},indent=2))
