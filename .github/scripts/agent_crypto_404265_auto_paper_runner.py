#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

REPO = Path.cwd()
BASE = REPO / "public/agent_crypto_erith_ia/administrator"
APP = BASE / "app.js"
COORD = REPO / "coordination/inter_ai_dialogues/agent_crypto"
RELEASE_DRIVER = REPO / ".github/scripts/agent_crypto_release_driver.py"
VERSION_GUARD = REPO / ".github/scripts/agent_crypto_version_truth_guard.py"
BUILD = "40.4.265"
PARENT = "40.4.264"
ENGINE = "38.15.11"
RELEASE = "STRATEGY A · AUTO PAPER RUNNER V1 SESSION-LOCAL LOCK"
STATUS = "strategy_a_auto_paper_runner_v1_session_local_lock_404265"
OWNER = "/* 40.4.265 — STRATEGY A · AUTO PAPER RUNNER V1 SESSION-LOCAL LOCK */"
KRAKEN_MARKER = "/* 40.4.144 — KRAKEN CLI LOCAL READ-ONLY HANDSHAKE"


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(list(args), cwd=REPO, check=True, text=True)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def patch_runtime() -> None:
    build_truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(build_truth.get("build")) != PARENT:
        raise SystemExit(f"404265_FAIL: expected parent {PARENT}, found {build_truth.get('build')}")
    if str(build_truth.get("engine")) != ENGINE:
        raise SystemExit("404265_FAIL: protected Market Core identity changed")

    text = APP.read_text(encoding="utf-8")
    if OWNER in text:
        raise SystemExit("404265_FAIL: owner already present")
    if text.count(KRAKEN_MARKER) != 1:
        raise SystemExit(f"404265_FAIL: Kraken marker count={text.count(KRAKEN_MARKER)}")

    block = r'''/* 40.4.265 — STRATEGY A · AUTO PAPER RUNNER V1 SESSION-LOCAL LOCK */
/* One bounded session-local scheduler automates the already Firefox-validated
   Strategy A paper cascade. Default OFF. No persistence, fetch, WebSocket,
   Kraken order, wallet or real execution. STOP never closes an open paper fill. */
const STRATEGY_A_AUTO_STATE_404265={
  enabled:false,timer:null,phase:"OFF",cycles:0,no_trade:0,risk_rejects:0,opened:0,closed:0,
  cadence_ms:300000,min_hold_ms:300000,cooldown_until:0,last_cycle_at:null,next_cycle_at:null,
  last_action:"Auto Paper A désactivé.",last_proposal_id:null,last_executed_proposal_id:null
};
function strategyAAutoSnapshot404265(){
  const s=STRATEGY_A_AUTO_STATE_404265;
  return {build:"40.4.265",enabled:s.enabled,phase:s.phase,cycles:s.cycles,no_trade:s.no_trade,risk_rejects:s.risk_rejects,opened:s.opened,closed:s.closed,cadence_ms:s.cadence_ms,min_hold_ms:s.min_hold_ms,cooldown_until:s.cooldown_until,last_cycle_at:s.last_cycle_at,next_cycle_at:s.next_cycle_at,last_action:s.last_action,last_proposal_id:s.last_proposal_id,last_executed_proposal_id:s.last_executed_proposal_id,paper_only:true,session_local:true,default_off:true,real_orders:false,kraken_network:false,storage_write:false};
}
function strategyAAutoOpen404265(){
  try{return STRATEGY_A_PAPER_LEDGER_404263.find(row=>row?.status==="PAPER_OPEN")||null;}catch(_){return null;}
}
function strategyAAutoSchedule404265(delay=STRATEGY_A_AUTO_STATE_404265.cadence_ms){
  const s=STRATEGY_A_AUTO_STATE_404265;
  if(s.timer){clearTimeout(s.timer);s.timer=null;}
  if(!s.enabled){s.next_cycle_at=null;return;}
  const bounded=Math.max(0,Number(delay)||0);
  s.next_cycle_at=new Date(Date.now()+bounded).toISOString();
  s.timer=setTimeout(()=>{s.timer=null;strategyAAutoCycle404265("timer");},bounded);
}
function strategyAAutoStop404265(reason="Arrêt opérateur · position Paper éventuelle laissée intacte."){
  const s=STRATEGY_A_AUTO_STATE_404265;
  s.enabled=false;if(s.timer){clearTimeout(s.timer);s.timer=null;}s.next_cycle_at=null;s.phase="OFF";s.last_action=reason;
  try{renderStrategySandboxExtensions404261();}catch(_){}
  return strategyAAutoSnapshot404265();
}
function strategyAAutoStart404265(){
  const s=STRATEGY_A_AUTO_STATE_404265;let local=null;
  try{local=strategyALocalContext404261();}catch(_){}
  if(String(local?.active_workspace||"")!=="strategy_a"){
    s.enabled=false;s.phase="BLOCKED";s.last_action="Activer STRATÉGIE A avant l’Auto Paper Runner.";
    try{renderStrategySandboxExtensions404261();}catch(_){}
    return strategyAAutoSnapshot404265();
  }
  s.enabled=true;s.phase="ARMED";s.last_action="Auto Paper A armé · premier cycle immédiat · cadence 5 min.";
  strategyAAutoSchedule404265(0);
  try{renderStrategySandboxExtensions404261();}catch(_){}
  return strategyAAutoSnapshot404265();
}
function strategyAAutoCycle404265(trigger="timer"){
  const s=STRATEGY_A_AUTO_STATE_404265;if(!s.enabled)return strategyAAutoSnapshot404265();
  s.cycles+=1;s.last_cycle_at=new Date().toISOString();s.next_cycle_at=null;
  try{
    const local=strategyALocalContext404261();
    if(String(local?.active_workspace||"")!=="strategy_a"){
      s.enabled=false;s.phase="STOP_WORKSPACE";s.last_action="STOP sécurité : STRATÉGIE A n’est plus le workspace actif.";
      return strategyAAutoSnapshot404265();
    }

    const open=strategyAAutoOpen404265();
    STRATEGY_A_LAST_PROPOSAL_404261=strategyATradeProposal404261();
    const proposal=STRATEGY_A_LAST_PROPOSAL_404261;
    s.last_proposal_id=proposal?.proposal_id||null;

    if(open){
      const openedAt=Date.parse(open?.generated_at||"");
      const ageMs=Number.isFinite(openedAt)?Math.max(0,Date.now()-openedAt):0;
      const invalidated=proposal?.status!=="PROPOSED";
      if(invalidated||ageMs>=s.min_hold_ms){
        const rec=strategyAReconcile404264();
        if(rec?.status==="RECONCILED"){
          s.closed+=1;s.cooldown_until=Date.now()+s.cadence_ms;s.phase="CLOSED_COOLDOWN";
          s.last_action=`Paper clôturé · ${invalidated?"invalidation Strategy A":"horizon 5 min atteint"} · P/L net ${Number(rec?.trade?.net_pnl_eur||0).toFixed(2)} € · échantillon ${Number(rec?.metrics?.sample_size||0)}.`;
        }else{
          s.phase=String(rec?.status||"RECONCILIATION_BLOCKED");s.last_action=String(rec?.reason||"Réconciliation non disponible.");
        }
      }else{
        s.phase="MONITORING_OPEN";s.last_action=`Paper ouvert ${open.execution_id} · surveillance · ${(ageMs/60000).toFixed(1)} / 5.0 min.`;
      }
    }else if(Date.now()<s.cooldown_until){
      const left=Math.max(0,s.cooldown_until-Date.now());s.phase="COOLDOWN";s.last_action=`Cooldown après clôture · ${(left/60000).toFixed(1)} min restantes.`;
    }else if(proposal?.status!=="PROPOSED"){
      s.no_trade+=1;s.phase=proposal?.status==="REJECTED"?"SAFETY_REJECT":"NO_TRADE";s.last_action=`${proposal?.status||"NO_TRADE"} · ${proposal?.reason||"aucune raison disponible"}`;
    }else if(proposal?.proposal_id&&proposal.proposal_id===s.last_executed_proposal_id){
      s.phase="DUPLICATE_WAIT";s.last_action=`Proposition ${proposal.proposal_id} déjà exécutée dans cette session · attente du prochain état.`;
    }else{
      STRATEGY_A_LAST_RISK_404262=strategyARiskGovernor404262(proposal);
      const risk=STRATEGY_A_LAST_RISK_404262;
      if(!risk||!["ACCEPT","REDUCE"].includes(risk.decision)||!(Number(risk.authorized_notional_eur)>0)){
        s.risk_rejects+=1;s.phase="RISK_REJECT";s.last_action=`${risk?.decision||"REJECT"} · ${risk?.reason||"Risk Governor sans autorisation."}`;
      }else{
        const fill=strategyAPaperExecute404263(risk);
        if(fill?.status==="PAPER_OPEN"){
          s.opened+=1;s.last_executed_proposal_id=proposal.proposal_id;s.phase="PAPER_OPEN";
          s.last_action=`${risk.decision} ${Number(risk.authorized_notional_eur||0).toFixed(2)} € · ${fill.execution_id} ouvert · zéro réseau Kraken · surveillance 5 min.`;
        }else{
          s.phase="EXECUTION_REJECT";s.last_action=String(fill?.reason||"Paper Execution Envelope refusé.");
        }
      }
    }
  }catch(error){
    s.enabled=false;s.phase="ERROR_STOP";s.last_action=`STOP erreur Auto Paper : ${String(error?.message||error)}`;
  }finally{
    try{renderStrategySandboxExtensions404261();}catch(_){}
    if(s.enabled){
      const cooldownDelay=s.cooldown_until>Date.now()?Math.min(s.cadence_ms,Math.max(1000,s.cooldown_until-Date.now())):s.cadence_ms;
      strategyAAutoSchedule404265(cooldownDelay);
    }else{s.next_cycle_at=null;}
  }
  return strategyAAutoSnapshot404265();
}
function renderStrategyAAutoPaperRunner404265(){
  const anchor=document.getElementById("strategyAReconciliation404264");if(!anchor)return;
  let panel=document.getElementById("strategyAAutoPaperRunner404265");
  if(!panel){
    panel=document.createElement("section");panel.id="strategyAAutoPaperRunner404265";panel.setAttribute("data-auto-paper-runner-build","40.4.265");
    panel.style.cssText="margin:0 0 10px 0;border:1px solid rgba(112,214,255,.30);border-radius:12px;padding:10px 12px;background:rgba(7,28,36,.48);grid-column:1/-1;flex:1 1 100%";
    panel.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><strong>AUTO PAPER RUNNER V1 · STRATÉGIE A</strong><span style="font-size:10px;color:#8be8ff">SESSION-LOCAL · 5 MIN · DEFAULT OFF</span><span style="flex:1"></span><button type="button" class="btn small" id="strategyAAutoStart404265">ACTIVER AUTO A</button><button type="button" class="btn small" id="strategyAAutoStop404265">STOP AUTO</button></div><div id="strategyAAutoSummary404265" style="font-size:10px;color:var(--muted,#9fb0c5);margin-top:7px">OFF · activation opérateur requise · reload = OFF.</div>`;
    anchor.insertAdjacentElement("afterend",panel);
    panel.querySelector("#strategyAAutoStart404265")?.addEventListener("click",()=>strategyAAutoStart404265());
    panel.querySelector("#strategyAAutoStop404265")?.addEventListener("click",()=>strategyAAutoStop404265());
  }
  const s=STRATEGY_A_AUTO_STATE_404265,out=panel.querySelector("#strategyAAutoSummary404265"),start=panel.querySelector("#strategyAAutoStart404265"),stop=panel.querySelector("#strategyAAutoStop404265");
  if(start){start.disabled=s.enabled;start.textContent=s.enabled?"AUTO A ACTIF":"ACTIVER AUTO A";}if(stop)stop.disabled=!s.enabled;
  if(!out)return;const next=s.next_cycle_at?new Date(s.next_cycle_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"—";
  out.textContent=`${s.phase} · cycles ${s.cycles} · NO_TRADE ${s.no_trade} · risk reject ${s.risk_rejects} · ouverts ${s.opened} · clôturés ${s.closed} · prochain ${next} · ${s.last_action}`;
  out.style.color=s.phase.includes("ERROR")||s.phase.includes("STOP")||s.phase.includes("BLOCKED")?"#ff9f9f":(s.enabled?"#8be8ff":"#ffd27a");
}
try{globalThis.AgentCryptoAutoPaperRunner404265=Object.freeze({build:"40.4.265",start:strategyAAutoStart404265,stop:strategyAAutoStop404265,tick:()=>strategyAAutoCycle404265("operator_api"),state:strategyAAutoSnapshot404265,paper_only:true,session_local:true,default_off:true,cadence_ms:300000,min_hold_ms:300000,max_open_positions:1,real_orders:false,kraken_network:false,storage_write:false,new_fetch:false,new_websocket:false,new_observer:false,new_timer:true});}catch(_){}
'''

    text = text.replace(KRAKEN_MARKER, block.rstrip() + "\n\n" + KRAKEN_MARKER, 1)
    old = '  if(typeof renderStrategyAReconciliation404264==="function")renderStrategyAReconciliation404264();\n}'
    new = '  if(typeof renderStrategyAReconciliation404264==="function")renderStrategyAReconciliation404264();\n  if(typeof renderStrategyAAutoPaperRunner404265==="function")renderStrategyAAutoPaperRunner404265();\n}'
    if text.count(old) != 1:
        raise SystemExit(f"404265_FAIL: Strategy render tail count={text.count(old)}")
    text = text.replace(old, new, 1)
    APP.write_text(text, encoding="utf-8")


def write_release_identity() -> None:
    contract = {
        "scope": "strategy_a_auto_paper_runner_v1",
        "mode": "session_local_paper_automation",
        "default_enabled": False,
        "operator_start_required": True,
        "operator_kill_switch": True,
        "stop_closes_open_paper": False,
        "cadence_ms": 300000,
        "minimum_hold_ms": 300000,
        "max_open_positions": 1,
        "duplicate_proposal_guard": True,
        "workspace_guard": "strategy_a_only",
        "persistence": False,
        "new_timer": True,
        "new_fetch": False,
        "new_websocket": False,
        "new_observer": False,
        "real_orders": False,
        "kraken_network": False,
        "kraken_orders": False,
        "credentials": False,
        "wallet": False,
        "withdrawals": False,
        "market_core_changed": False,
        "atlas_pipeline_changed": False,
        "oracle_engine_changed": False,
        "learning_changed": False,
        "graph_changed": False,
        "technical_reading_changed": False,
    }
    contract_path = Path("/tmp/contract_404265.json")
    contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    run(
        "python", str(RELEASE_DRIVER),
        "--build", BUILD,
        "--parent", PARENT,
        "--release", RELEASE,
        "--status", STATUS,
        "--contract-key", "strategy_a_auto_paper_runner_404265",
        "--contract-json", str(contract_path),
        "--lineage-note", "40.4.265 Strategy A Auto Paper Runner V1: explicit operator-armed 5 min session-local paper cascade; one open fill max; STOP gate; zero Kraken network; Market Core protected",
    )


def validate() -> None:
    run("node", "--check", str(APP))
    run("node", "--check", str(BASE / "js/app.js"))
    run("python", str(VERSION_GUARD), "--expected-build", BUILD, "--expected-release", RELEASE)
    app = APP.read_text(encoding="utf-8")
    if app.count(OWNER) != 1:
        raise SystemExit(f"404265_FAIL: owner count={app.count(OWNER)}")
    if app.count("renderStrategyAAutoPaperRunner404265();") != 1:
        raise SystemExit("404265_FAIL: render owner not wired exactly once")
    block = app.split(OWNER, 1)[1].split(KRAKEN_MARKER, 1)[0]
    for forbidden in ("fetch(", "new WebSocket", "indexedDB.", "localStorage."):
        if forbidden in block:
            raise SystemExit(f"404265_FAIL: forbidden owner token {forbidden}")
    if block.count("setTimeout(") != 1:
        raise SystemExit("404265_FAIL: expected one bounded scheduler timer")
    for required in ("max_open_positions:1", "default_off:true", "kraken_network:false", "strategyAAutoStop404265"):
        if required not in block:
            raise SystemExit(f"404265_FAIL: missing safety marker {required}")
    build_truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if build_truth.get("build") != BUILD or build_truth.get("engine") != ENGINE:
        raise SystemExit("404265_FAIL: build/engine truth mismatch")


def build_zip() -> tuple[Path, Path, str, list[str]]:
    COORD.mkdir(parents=True, exist_ok=True)
    zip_path = COORD / "AGENT_CRYPTO_40_4_265_STRATEGY_A_AUTO_PAPER_RUNNER_V1.zip"
    sha_path = COORD / "AGENT_CRYPTO_40_4_265_STRATEGY_A_AUTO_PAPER_RUNNER_V1_SHA256.txt"
    changed = subprocess.check_output(
        ["git", "diff", "--name-only", "HEAD", "--", "public/agent_crypto_erith_ia/administrator"],
        cwd=REPO, text=True,
    ).splitlines()
    if not changed:
        raise SystemExit("404265_FAIL: no Administrator release files changed")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel in changed:
            path = REPO / rel
            if path.is_file():
                zf.write(path, rel)
        zf.writestr(
            "RELEASE_40.4.265.txt",
            "Agent-Crypto 40.4.265 — Strategy A Auto Paper Runner V1\n"
            "Parent: 40.4.264\n"
            "Market Core: 38.15.11 protected\n"
            "Mode: session-local PAPER only; explicit operator start; cadence/hold 5 min; one open fill max; STOP gate; zero Kraken network.\n"
            "Firefox validation required.\n",
        )
    digest = sha256(zip_path)
    sha_path.write_text(f"{digest}  {zip_path.name}\n", encoding="utf-8")
    return zip_path, sha_path, digest, changed


def main() -> int:
    patch_runtime()
    write_release_identity()
    validate()
    zip_path, sha_path, digest, changed = build_zip()
    print(json.dumps({
        "ok": True,
        "build": BUILD,
        "parent": PARENT,
        "release": RELEASE,
        "zip": str(zip_path),
        "sha256": digest,
        "changed_files": changed,
        "market_core": ENGINE,
        "firefox_validation_required": True,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
