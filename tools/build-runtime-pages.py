#!/usr/bin/env python3
"""GitHub Pages frontend only; cold data served via public Raw GitHub."""
import argparse,json,os,re,shutil,subprocess
from html.parser import HTMLParser
from pathlib import Path
# Publish the existing shared site and its sibling projects; archive data stay outside Pages.
SCOPE="public/agent_crypto_erith_ia/"
MANIFEST=SCOPE+"runtime-publication.json"
EXT={".html",".htm",".css",".js",".mjs",".json",".svg",".ico",".webmanifest",".woff",".woff2",".ttf",".png",".jpg",".jpeg",".gif",".webp",".avif",".md",".txt",".xml"}
OLD=re.compile(r"^public/agent_crypto_erith_ia/administrator/index-\d+(?:\.\d+)+\.html$",re.I)
RAW="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/"
IMAGE_RAW_ROOT="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/"
BUDGET=360000000
SHARED_ROOT={"index.html","app.js","style.css"}
SHARED_PUBLIC={"public/index.html","public/app.js","public/style.css"}
SHARED_PREFIXES=("assets/","public/lego/","public/liora-jardin-reves-doux/","public/charlene_salon/","public/memory_cards/")
CRYPTO_EXTERNAL_IMAGES=("assets/images/technical-reading/","assets/images/visual/")
SEVEN_PORTABLE="assets/SEVEN_PORTABLE_TERMINAL/"
EXTERNAL_IMAGE_EXT={".png",".jpg",".jpeg",".webp",".gif",".avif",".svg"}
SHARED_REQUIRED=("index.html","app.js","style.css","public/index.html",
                 "public/lego/rising-phoenix/index.html",
                 "public/liora-jardin-reves-doux/index.html")
SHARED_EXT=EXT|{".pdf",".zip"}

ROUTER="public/agent_crypto_erith_ia/web/vault-data-router.js"
REQUIRED=("public/agent_crypto_erith_ia/administrator/index.html",
"public/agent_crypto_erith_ia/trader/trading-desk.html",
"public/agent_crypto_erith_ia/administrator/historical-vault.html",
"public/agent_crypto_erith_ia/trader/historical-inventory.html",
"public/agent_crypto_erith_ia/trader/source-catalogue.html",
"public/agent_crypto_erith_ia/trader/verified-reader.html",
"public/agent_crypto_erith_ia/laboratoire/cas-ecole-concrete.md",ROUTER)
def include(n):
 if n.startswith(SCOPE):
  if "/data/" in n or "/downloads/" in n or "/releases/" in n or OLD.fullmatch(n):return False
  return Path(n).suffix.lower() in EXT
 # Do not accidentally publish private, coordination, historical ZIP or any unknown repo root.
 if n in SHARED_ROOT or n in SHARED_PUBLIC:return True
 if n.startswith(CRYPTO_EXTERNAL_IMAGES):return False
 if n.startswith(SEVEN_PORTABLE) and Path(n).suffix.lower() in EXTERNAL_IMAGE_EXT:return False
 if n.startswith(SHARED_PREFIXES):
  return Path(n).suffix.lower() in SHARED_EXT
 if n.startswith("public/") and n.count("/")==1 and Path(n).suffix.lower() in EXT:return True
 return False
def image_raw_base(image_ref):
 if image_ref!="main" and not re.fullmatch(r"[0-9a-f]{40}",image_ref):raise ValueError("Invalid image source revision")
 return IMAGE_RAW_ROOT+image_ref+"/"
def transform(n,b,image_ref="main",external_images=()):
 if Path(n).suffix.lower() not in {".html",".htm",".css",".js",".mjs"}:return b
 t=b.decode("utf-8")
 image_base=image_raw_base(image_ref)
 if n.startswith(SEVEN_PORTABLE) and external_images:
  # Literals in scripts, HTML and CSS point to immutable public original images.
  # Base path is computed relative to each real source file, never by basename alone.
  parent=Path(n).parent
  rewrites=[]
  for filename in external_images:
   rel=os.path.relpath(filename,start=str(parent)).replace(os.sep,"/")
   rewrites.append((rel,image_base+filename))
  for rel,url in sorted(rewrites,key=lambda pair:len(pair[0]),reverse=True):
   t=t.replace(rel,url)

 for prefix in ("../../../../assets/images/","../../../assets/images/","../../assets/images/"):
  t=t.replace(prefix,image_base+"assets/images/")
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
def build(src,dst,image_ref="main"):
 image_raw_base(image_ref)
 src,dst=Path(src).resolve(),Path(dst).resolve()
 if src==dst or not src.is_dir() or (dst.exists() and any(dst.iterdir())):raise ValueError("Unsafe build destination")
 paths=subprocess.check_output(["git","-C",str(src),"ls-files","-z"]).split(b"\0")
 external_images=tuple(p.decode("utf-8") for p in paths if p and p.decode("utf-8").startswith(SEVEN_PORTABLE) and Path(p.decode("utf-8")).suffix.lower() in EXTERNAL_IMAGE_EXT)
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
  if f.suffix.lower() in {".html",".htm",".css",".js",".mjs"}:out.write_bytes(transform(n,f.read_bytes(),image_ref=image_ref,external_images=external_images))
  else:shutil.copyfile(f,out)
 (dst/".nojekyll").touch()
 missing=[p for p in REQUIRED+SHARED_REQUIRED if not (dst/p).is_file()]
 for n in ("index.html","public/lego/rising-phoenix/index.html",
           "public/liora-jardin-reves-doux/index.html",
           "public/agent_crypto_erith_ia/administrator/index.html",
           "public/agent_crypto_erith_ia/trader/trading-desk.html"):
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
 # Publication includes the existing root and sibling pages; never a data vault or build artefact.
 invalid=[p.relative_to(dst).as_posix() for p in dst.rglob("*") if p.is_file()
          and p.relative_to(dst).as_posix()!=".nojekyll"
          and not include(p.relative_to(dst).as_posix())]
 if invalid:raise ValueError("Out-of-scope files in Pages: "+repr(invalid[:10]))
 report={"schema":"aerith.crypto.pages.multisite.v1","publication_scope":"shared-root+public-projects+agent-crypto",
 "scope_strict":True,"protected_sites":list(SHARED_REQUIRED),
 "runtime_files":len(selected),
 "runtime_source_bytes":size,"vault_excluded_files":excluded,"vault_excluded_bytes":excluded_bytes,
 "historical_data_in_pages":False,"images_externalized_to_raw":True,"image_source_revision":image_ref,
 "router":ROUTER,"source":RAW,"real_orders":False,"firefox_verified":False}
 (dst/MANIFEST).write_text(json.dumps(report,indent=2)+"\n")
 return report
def plan(src):
 """Read Git tree names only; never hydrate data or binary images for a PR."""
 src=Path(src).resolve()
 rows=subprocess.check_output(["git","-C",str(src),"ls-tree","-r","HEAD"]).decode("utf-8").splitlines()
 selected=set();excluded_count=0;groups={"crypto":0,"shared":0}
 for row in rows:
  if "\t" not in row:continue
  header,n=row.split("\t",1)
  fields=header.split()
  if len(fields)!=3 or fields[1]!="blob" or fields[0]=="120000":continue
  if include(n):
   selected.add(n)
   groups["crypto" if n.startswith(SCOPE) else "shared"]+=1
  else:excluded_count+=1
 missing=[n for n in REQUIRED+SHARED_REQUIRED if n not in selected]
 if missing:raise ValueError("Required Pages routes missing: "+repr(missing))
 return {"schema":"aerith.crypto.pages.multisite.plan.v1",
         "source_bytes":None,"budget_verified":False,
         "file_count":len(selected),"group_file_count":groups,
         "excluded_file_count":excluded_count,
         "required_routes":list(REQUIRED+SHARED_REQUIRED),
         "cold_vault_included":False,"selection_complete":True}

if __name__=="__main__":
 a=argparse.ArgumentParser();a.add_argument("--source",default=".");a.add_argument("--destination",default="_runtime_pages")
 a.add_argument("--image-ref",default="main",help="main in production, PR commit SHA for pre-merge preview")
 a.add_argument("--plan-only",action="store_true",help="read git metadata only; no sources, media or vault hydrated")
 v=a.parse_args();print(json.dumps(plan(v.source) if v.plan_only else build(v.source,v.destination,image_ref=v.image_ref),indent=2))
