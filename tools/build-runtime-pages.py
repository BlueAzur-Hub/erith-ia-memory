#!/usr/bin/env python3
"""GitHub Pages frontend only; cold data served via public Raw GitHub."""
import argparse,json,os,re,shutil,subprocess
from html.parser import HTMLParser
from pathlib import Path
ROOT={"index.html","app.js","style.css",".nojekyll"}
EXT={".html",".htm",".css",".js",".mjs",".json",".svg",".ico",".webmanifest",".woff",".woff2",".ttf",".png",".jpg",".jpeg",".gif",".webp",".avif",".md",".txt",".xml"}
OLD=re.compile(r"^public/agent_crypto_erith_ia/administrator/index-\d+(?:\.\d+)+\.html$",re.I)
RAW="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/"
BUDGET=180000000
ROUTER="public/agent_crypto_erith_ia/web/vault-data-router.js"
REQUIRED=("index.html","public/agent_crypto_erith_ia/administrator/index.html",
"public/agent_crypto_erith_ia/trader/trading-desk.html",
"public/agent_crypto_erith_ia/administrator/historical-vault.html",
"public/agent_crypto_erith_ia/trader/historical-inventory.html",
"public/agent_crypto_erith_ia/trader/source-catalogue.html",
"public/agent_crypto_erith_ia/trader/verified-reader.html",
"public/agent_crypto_erith_ia/laboratoire/cas-ecole-concrete.md",ROUTER)
def include(n):
 if n in ROOT:return True
 if not n.startswith("public/") or "/data/" in n or "/downloads/" in n or "/releases/" in n or OLD.fullmatch(n):return False
 return Path(n).suffix.lower() in EXT
def transform(n,b):
 if Path(n).suffix.lower() not in {".html",".htm",".css",".js",".mjs"}:return b
 t=b.decode("utf-8")
 for prefix in ("../../../../assets/images/","../../../assets/images/","../../assets/images/"):
  t=t.replace(prefix,RAW+"assets/images/")
 if n.startswith("public/agent_crypto_erith_ia/") and n.endswith(".html"):
  rel=os.path.relpath(ROUTER,start=str(Path(n).parent)).replace(os.sep,"/")
  tag='<script src="'+rel+'" data-erith-vault-data-router="true"></script>'
  if re.search(r"<head\b[^>]*>",t,re.I):
   t=re.sub(r"(<head\b[^>]*>)",lambda m:m.group(1)+"\n"+tag,t,count=1,flags=re.I)
  elif re.search(r"<html\b|<!doctype",t,re.I):raise ValueError("Full HTML page missing head: "+n)
 return t.encode("utf-8")
class Refs(HTMLParser):
 def __init__(self):super().__init__();self.urls=[]
 def handle_starttag(self,tag,attrs):
  k={"script":"src","link":"href","img":"src","iframe":"src","source":"src"}.get(tag)
  if k:
   u=dict(attrs).get(k)
   if u:self.urls.append(u)
def build(src,dst):
 src,dst=Path(src).resolve(),Path(dst).resolve()
 if src==dst or not src.is_dir() or (dst.exists() and any(dst.iterdir())):raise ValueError("Unsafe build destination")
 paths=subprocess.check_output(["git","-C",str(src),"ls-files","-z"]).split(b"\0")
 selected=[];size=0;excluded=0;excluded_bytes=0
 for part in paths:
  if not part:continue
  n=part.decode("utf-8");f=src/n
  if ".." in Path(n).parts or f.is_symlink() or not f.is_file():continue
  b=f.stat().st_size
  if include(n):selected.append((n,f));size+=b
  else:excluded+=1;excluded_bytes+=b
 if size>BUDGET:raise ValueError("Runtime too large: "+str(size))
 for n,f in selected:
  out=dst/n;out.parent.mkdir(parents=True,exist_ok=True)
  if f.suffix.lower() in {".html",".htm",".css",".js",".mjs"}:out.write_bytes(transform(n,f.read_bytes()))
  else:shutil.copyfile(f,out)
 (dst/".nojekyll").touch()
 missing=[p for p in REQUIRED if not (dst/p).is_file()]
 for n in ("index.html","public/agent_crypto_erith_ia/administrator/index.html","public/agent_crypto_erith_ia/trader/trading-desk.html"):
  p=dst/n
  if not p.exists():continue
  h=Refs();h.feed(p.read_text(encoding="utf-8"))
  for url in h.urls:
   u=url.split("?")[0].split("#")[0]
   if not u or u.startswith(("https://","http://","//","/","data:")):continue
   target=(p.parent/u).resolve()
   if dst not in target.parents or not target.is_file():missing.append(n+" -> "+u)
 if missing:raise ValueError("Missing references: "+repr(missing[:25]))
 if list(dst.rglob("*.json.gz")) or list(dst.rglob("*.jsonl")):raise ValueError("Cold archive leaked into Pages")
 report={"schema":"aerith.crypto.pages.runtime-only.v1","runtime_files":len(selected),
 "runtime_source_bytes":size,"vault_excluded_files":excluded,"vault_excluded_bytes":excluded_bytes,
 "historical_data_in_pages":False,"images_externalized_to_raw":True,
 "router":ROUTER,"source":RAW,"real_orders":False,"firefox_verified":False}
 (dst/"runtime-publication.json").write_text(json.dumps(report,indent=2)+"\n")
 return report
if __name__=="__main__":
 a=argparse.ArgumentParser();a.add_argument("--source",default=".");a.add_argument("--destination",default="_runtime_pages")
 v=a.parse_args();print(json.dumps(build(v.source,v.destination),indent=2))
