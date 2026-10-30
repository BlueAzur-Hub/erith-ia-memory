#!/usr/bin/env python3
"""One-shot SHA guarded 40.6.710 -> 40.6.711 upgrade; release only after tests."""
from pathlib import Path
import hashlib
R=Path("public/agent_crypto_erith_ia")
A=R/"administrator/app.js"
I=R/"administrator/index.html"
B=R/"administrator/build.json"
N=R/"administrator/js/graph-native-usd-406520.js"
T=R/"tools"
old_sha={
 A:"13744cd712fc2787335169449a06946e87a80318",
 I:"c42c9c1c9c339896baa845df628c0c1679ee2750",
 B:"06c1afa27a7f111d94c3ccfd15d6a53b6dcf901c",
 N:"88fa3eb2acea988613283bf5b5019870303418a7",
 T/"verify_administrator_annual_usd_integrity.cjs":"c9091f3823131d7cd12ab6b75fe731b8e233a9dc",
 T/"verify_administrator_canonical_top5_integrity.cjs":"7974e2124189f85ac96a2f406f64066d4ff9912a",
 T/"verify_administrator_top5_restore.cjs":"f6e89c37848898d36e180c8736bdf3e1f5b0247a"
}
def blob(p):
 data=p.read_bytes()
 return hashlib.sha1(("blob "+str(len(data))+"\0").encode()+data).hexdigest()
for p,h in old_sha.items():
 if not p.is_file() or blob(p)!=h:
  raise RuntimeError(f"STOP: upstream changed {p}: expected {h}; got {blob(p) if p.is_file() else 'MISSING'}")
def replace_once(text,old,new,context):
 count=text.count(old)
 if count!=1:raise RuntimeError(f"STOP: {context}: anchor count {count}")
 return text.replace(old,new,1)
a=A.read_text(encoding="utf-8")
a=replace_once(a,"const ATLAS_NETWORK_PRIORITY = Object.freeze({",'''// Chart traffic has two bounded lanes; Market / spot / source share one lane.
// This prevents Market refreshes from starving graph acquisitions while keeping
// CoinGecko concurrency strictly limited and preserving existing rate spacing.
const ATLAS_NETWORK_MAX_CHART = 2;
const ATLAS_NETWORK_MAX_OTHER = 1;
const ATLAS_NETWORK_PRIORITY = Object.freeze({''',"network lanes")
start=a.index("function atlasNetworkPump() {")
end=a.index("function atlasAcquireNetwork(",start)
a=a[:start]+'''function atlasNetworkPump() {
  const governor = state.networkGovernor;
  if (!governor || !Array.isArray(governor.active) || !governor.queue.length) return;
  // Reserved non-chart capacity keeps long chart fetches from blocking Livecheck.
  governor.queue.sort((a, b) =>
    (ATLAS_NETWORK_PRIORITY[a.kind] || 99) - (ATLAS_NETWORK_PRIORITY[b.kind] || 99)
    || a.createdAt - b.createdAt
  );
  while (governor.queue.length) {
    const activeCharts = governor.active.filter(slot => slot.kind === "chart").length;
    const activeOther = governor.active.length - activeCharts;
    const index = governor.queue.findIndex(job => job.cancelled
      || (job.kind === "chart" ? activeCharts < ATLAS_NETWORK_MAX_CHART
        : activeOther < ATLAS_NETWORK_MAX_OTHER));
    if (index < 0) return;
    const [job] = governor.queue.splice(index, 1);
    if (!job || job.cancelled) continue;
    const token = job.kind + ":" + (++governor.sequence);
    governor.active.push({ token, kind: job.kind, startedAt: Date.now() });
    job.cleanup();
    job.resolve(token);
  }
}

'''+a[end:]
a=replace_once(a,'''function atlasReleaseNetwork(token) {
  const governor = state.networkGovernor;
  if (!governor?.active || governor.active.token !== token) return;
  governor.active = null;
  queueMicrotask(atlasNetworkPump);
}

function atlasNetworkBusy() {
  return !!state.networkGovernor?.active || !!state.networkGovernor?.queue?.length;
}''','''function atlasReleaseNetwork(token) {
  const governor = state.networkGovernor;
  if (!Array.isArray(governor?.active)) return;
  const index = governor.active.findIndex(slot => slot.token === token);
  if (index < 0) return;
  governor.active.splice(index, 1);
  queueMicrotask(atlasNetworkPump);
}

function atlasNetworkBusy() {
  return !!state.networkGovernor?.active?.length || !!state.networkGovernor?.queue?.length;
}''',"network release")
a=replace_once(a,'''state.networkGovernor = {
  active: null,
  queue: [],''','''state.networkGovernor = {
  active: [],
  queue: [],''',"network initialization")
a=replace_once(a,'''  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    networkToken = await atlasAcquireNetwork("chart", signal, ATLAS_NETWORK_WAIT_TIMEOUT_MS);
    const response = await fetch(url, { cache: "no-store", signal: controller.signal, headers: { accept: "application/json" } });''','''  let timer = null;
  try {
    networkToken = await atlasAcquireNetwork("chart", signal, ATLAS_NETWORK_WAIT_TIMEOUT_MS);
    if (signal?.aborted) throw atlasChartAbortError();
    // Give the request its FULL HTTP timeout after queue acquisition, not before.
    timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    const response = await fetch(url, { cache: "no-store", signal: controller.signal, headers: { accept: "application/json" } });''',"network wait timeout")
A.write_text(a,encoding="utf-8")
n=N.read_text(encoding="utf-8")
n=replace_once(n,'async function cmp(c,p,opt={}){try{','''async function cmp(c,p,opt={}){
  if(opt.signal?.aborted)throw Object.assign(new Error("Requête annulée"),{name:"AbortError"});
  // Only an integrity-verified and still-fresh native USD series may bypass HTTP.
  const cached=atlasGetStoredChartResult(c,p,"coingecko","USD");
  if(historicalUsdCertified(cached)&&!(typeof atlasChartNeedsRefresh==="function"&&atlasChartNeedsRefresh(cached,p)))
    return{coin:c,result:cached,attempts:0,source:"coingecko-usd-cache-fresh-first"};
  try{''',"native USD cache-first")
N.write_text(n,encoding="utf-8")
i=I.read_text(encoding="utf-8")
if i.count("40.6.710")!=14:raise RuntimeError("index version count changed")
I.write_text(i.replace("40.6.710","40.6.711"),encoding="utf-8")
b=B.read_text(encoding="utf-8")
if b.count("40.6.710")!=3:raise RuntimeError("build version count changed")
b=b.replace("40.6.710","40.6.711")
b=replace_once(b,'"parent_build": "40.6.709"','"parent_build": "40.6.710"',"build parent")
b=replace_once(b,'ANNUAL USD RETRY CORRECTNESS AND RETAINED HISTORICAL CURRENCY LABEL — CANDIDATE','BOUNDED NETWORK LANES AND CERTIFIED USD CACHE FIRST — CANDIDATE',"build release")
B.write_text(b,encoding="utf-8")
for f in ["verify_administrator_annual_usd_integrity.cjs","verify_administrator_canonical_top5_integrity.cjs","verify_administrator_top5_restore.cjs"]:
 p=T/f
 t=p.read_text(encoding="utf-8")
 if "40.6.710" not in t:raise RuntimeError("missing build assertion in "+f)
 p.write_text(t.replace("40.6.710","40.6.711"),encoding="utf-8")
print("OK: 40.6.711 patched from verified 40.6.710; 7 existing files updated")
