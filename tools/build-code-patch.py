#!/usr/bin/env python3
"""Small CLEAN_UPLOAD from changed runtime code only; never bundle the vault."""
import argparse, hashlib, json, subprocess, zipfile
from pathlib import Path

LIMIT=1_000_000
RUNTIME=("administrator","trader","web","operator")
EXT={".html",".css",".js",".mjs",".json"}
ROOT={"index.html","app.js","style.css"}

def include(path):
    p=Path(path)
    if not path or path.startswith("/") or ".." in p.parts or "\\" in path:
        return False
    if path in ROOT:return True
    a=p.parts
    return (len(a)>=4 and a[:2]==("public","agent_crypto_erith_ia")
            and a[2] in RUNTIME and p.suffix.lower() in EXT
            and not(p.name.startswith("index-") and p.suffix.lower()==".html")
            and not set(a).intersection({"downloads","releases","archives"}))

def pack(base,head,output):
    paths=subprocess.check_output(["git","diff","--name-only","-z","--no-renames",base,head]).split(b"\0")
    changed=sorted({b.decode("utf-8") for b in paths if b})
    files=[];deleted=[];external=[];ignored=[]
    for name in changed:
        f=Path(name)
        if include(name):
            if f.is_file():files.append((name,f.read_bytes()))
            else:deleted.append(name)
        elif f.suffix.lower() in {".png",".jpg",".jpeg",".webp",".avif"}:
            external.append(name)
        else:ignored.append(name)
    metadata={"schema":"agent.crypto.clean-upload.v1","base":base,"head":head,
              "files":[{"path":p,"size":len(c),"sha256":hashlib.sha256(c).hexdigest()} for p,c in files],
              "deleted_runtime_files":deleted,
              "external_asset_changes":external,
              "self_contained":not bool(external),
              "excluded_non_runtime_files":len(ignored),
              "note":"Code-only patch. Image relocations need separate Git delivery. Vault unchanged. This is NOT a Pages artifact."}
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(output,"w",zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,content in files:z.writestr(name,content)
        z.writestr("CLEAN_UPLOAD_MANIFEST.json",json.dumps(metadata,indent=2,ensure_ascii=False)+"\n")
    if output.stat().st_size>LIMIT:
        n=output.stat().st_size;output.unlink()
        raise RuntimeError(f"Routine patch too large: {n} bytes > {LIMIT}. Review and split.")
    (output.parent/(output.name+".sha256")).write_text(hashlib.sha256(output.read_bytes()).hexdigest()+"  "+output.name+"\n")
    summary={"patch_bytes":output.stat().st_size,"runtime_files":len(files),
             "deleted_files":len(deleted),"external_asset_changes":len(external),
             "ignored":len(ignored),"self_contained":metadata["self_contained"]}
    print(json.dumps(summary,indent=2))
    return summary

if __name__=="__main__":
    ap=argparse.ArgumentParser();ap.add_argument("--base",required=True);ap.add_argument("--head",required=True)
    ap.add_argument("--output",default="out/AGENT_CRYPTO_CLEAN_UPLOAD.zip")
    args=ap.parse_args();pack(args.base,args.head,args.output)
