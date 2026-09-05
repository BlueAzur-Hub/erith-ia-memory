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
INDEX = BASE / "index.html"
SYSTEM_PRESENTATION = BASE / "js/views/system-presentation.js"
COORD = REPO / "coordination/inter_ai_dialogues/agent_crypto"
RELEASE_DRIVER = REPO / ".github/scripts/agent_crypto_release_driver.py"
VERSION_GUARD = REPO / ".github/scripts/agent_crypto_version_truth_guard.py"

BUILD = "40.4.271"
PARENT = "40.4.270"
ENGINE = "38.15.11"
RELEASE = "STRATEGY A · RE-ENTRY COOLDOWN + FRESH-SIGNAL LOCK"
STATUS = "strategy_a_reentry_cooldown_fresh_signal_lock_404271"
OWNER = "/* 40.4.271 — STRATEGY A · RE-ENTRY COOLDOWN + FRESH-SIGNAL LOCK */"
ZIP_NAME = "AGENT_CRYPTO_40_4_271_STRATEGY_A_REENTRY_COOLDOWN_FRESH_SIGNAL.zip"
SHA_NAME = "AGENT_CRYPTO_40_4_271_STRATEGY_A_REENTRY_COOLDOWN_FRESH_SIGNAL_SHA256.txt"
REPORT_NAME = "AGENT_CRYPTO_40_4_271_STRATEGY_A_REENTRY_COOLDOWN_FRESH_SIGNAL_REPORT.md"


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(list(args), cwd=REPO, check=True, text=True)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sync_system_tokens() -> None:
    index = INDEX.read_text(encoding="utf-8")
    old = f"./js/views/system-presentation.js?v=administrator-build-{PARENT}"
    new = f"./js/views/system-presentation.js?v=administrator-build-{BUILD}"
    if old in index:
        if index.count(old) != 1:
            raise SystemExit(f"404271_FAIL: index System token count={index.count(old)}")
        INDEX.write_text(index.replace(old, new, 1), encoding="utf-8")

    text = SYSTEM_PRESENTATION.read_text(encoding="utf-8")
    old_source = f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";'
    new_source = f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";'
    if old_source in text:
        if text.count(old_source) != 1:
            raise SystemExit(f"404271_FAIL: System SOURCE token count={text.count(old_source)}")
        SYSTEM_PRESENTATION.write_text(text.replace(old_source, new_source, 1), encoding="utf-8")


def patch_runtime() -> None:
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("build")) != PARENT:
        raise SystemExit(f"404271_FAIL: expected parent {PARENT}, found {truth.get('build')}")
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404271_FAIL: protected Market Core identity changed")

    text = APP.read_text(encoding="utf-8")
    if OWNER in text:
        raise SystemExit("404271_FAIL: owner already present")

    cycle_marker = 'function strategyAAutoCycle404265(trigger="timer"){' 
    if text.count(cycle_marker) != 1:
        raise SystemExit(f"404271_FAIL: auto cycle marker count={text.count(cycle_marker)}")

    helper = r'''/* 40.4.271 — STRATEGY A · RE-ENTRY COOLDOWN + FRESH-SIGNAL LOCK */
/* Session-local anti-overtrading guard for the existing Auto Paper Runner.
   A closed paper trade now starts a 15-minute re-entry cooldown. After cooldown,
   a MIXTE signal must be materially fresher than the signal that opened the prior
   trade: Oracle direction improves by >= +3 points OR BTC 24h improves by >= +0.05
   percentage point. A canonical HAUSSIER regime may re-enter after cooldown.
   No Market Core, Oracle model, Risk Governor, Paper pricing, Kraken/network,
   persistence, wallet or real-order owner is added. */
const STRATEGY_A_REENTRY_POLICY_404271=Object.freeze({cooldown_ms:900000,min_direction_improvement:3,min_btc24_improvement_pct:0.05,bullish_regime_can_reenter_after_cooldown:true});
function strategyAReentrySignal404271(proposal){
  const direction=Number(proposal?.oracle?.direction_score),btc24=Number(proposal?.market?.change_24h_pct),confidence=Number(proposal?.oracle?.confidence);
  return {proposal_id:String(proposal?.proposal_id||""),captured_at:new Date().toISOString(),regime:String(proposal?.oracle?.regime||"UNKNOWN"),direction_score:Number.isFinite(direction)?direction:null,btc_24h_pct:Number.isFinite(btc24)?btc24:null,oracle_confidence:Number.isFinite(confidence)?confidence:null};
}
function strategyAReentryFresh404271(proposal){
  const s=STRATEGY_A_AUTO_STATE_404265,last=s.last_closed_signal_404271||null,current=strategyAReentrySignal404271(proposal);
  if(!last)return {eligible:true,reason:"FIRST_ENTRY",current,last:null,direction_improvement:null,btc24_improvement:null};
  const regime=String(current.regime||"").toUpperCase(),bullish=/HAUSSI/.test(regime)&&!/BAISS/.test(regime);
  const dirDelta=Number.isFinite(Number(current.direction_score))&&Number.isFinite(Number(last.direction_score))?Number(current.direction_score)-Number(last.direction_score):null;
  const btcDelta=Number.isFinite(Number(current.btc_24h_pct))&&Number.isFinite(Number(last.btc_24h_pct))?Number(current.btc_24h_pct)-Number(last.btc_24h_pct):null;
  const directionFresh=Number.isFinite(dirDelta)&&dirDelta>=STRATEGY_A_REENTRY_POLICY_404271.min_direction_improvement;
  const btcFresh=Number.isFinite(btcDelta)&&btcDelta>=STRATEGY_A_REENTRY_POLICY_404271.min_btc24_improvement_pct;
  return {eligible:bullish||directionFresh||btcFresh,reason:bullish?"BULLISH_REGIME":directionFresh?"DIRECTION_IMPROVED":btcFresh?"BTC24_IMPROVED":"STALE_MIXED_SIGNAL",current,last,direction_improvement:dirDelta,btc24_improvement:btcDelta,direction_fresh:directionFresh,btc24_fresh:btcFresh,bullish};
}
try{globalThis.AgentCryptoStrategyAReentryGuard404271=Object.freeze({build:"40.4.271",policy:STRATEGY_A_REENTRY_POLICY_404271,evaluate:strategyAReentryFresh404271,state:()=>({last_entry_signal:STRATEGY_A_AUTO_STATE_404265.last_entry_signal_404271||null,last_closed_signal:STRATEGY_A_AUTO_STATE_404265.last_closed_signal_404271||null,reentry_waits:Number(STRATEGY_A_AUTO_STATE_404265.reentry_waits_404271||0),cooldown_until:STRATEGY_A_AUTO_STATE_404265.cooldown_until||0}),paper_only:true,session_local:true,auto_runner_logic_changed:true,new_timer:false,new_fetch:false,new_websocket:false,new_observer:false,storage_write:false,real_orders:false,kraken_network:false});}catch(_){}
'''
    text = text.replace(cycle_marker, helper + "\n" + cycle_marker, 1)

    old_close = '          s.closed+=1;s.cooldown_until=Date.now()+s.cadence_ms;s.phase="CLOSED_COOLDOWN";'
    new_close = '          s.closed+=1;s.last_closed_signal_404271=s.last_entry_signal_404271||null;s.last_entry_signal_404271=null;s.cooldown_until=Date.now()+STRATEGY_A_REENTRY_POLICY_404271.cooldown_ms;s.phase="CLOSED_REENTRY_COOLDOWN";'
    if text.count(old_close) != 1:
        raise SystemExit(f"404271_FAIL: close/cooldown owner count={text.count(old_close)}")
    text = text.replace(old_close, new_close, 1)

    old_cooldown = '      const left=Math.max(0,s.cooldown_until-Date.now());s.phase="COOLDOWN";s.last_action=`Cooldown après clôture · ${(left/60000).toFixed(1)} min restantes.`;'
    new_cooldown = '      const left=Math.max(0,s.cooldown_until-Date.now());s.phase="REENTRY_COOLDOWN";s.last_action=`Pause anti-surtrading après clôture · ${(left/60000).toFixed(1)} min restantes sur 15 min.`;'
    if text.count(old_cooldown) != 1:
        raise SystemExit(f"404271_FAIL: cooldown display owner count={text.count(old_cooldown)}")
    text = text.replace(old_cooldown, new_cooldown, 1)

    old_branch = '''    }else if(proposal?.status!=="PROPOSED"){
      s.no_trade+=1;s.phase=proposal?.status==="REJECTED"?"SAFETY_REJECT":"NO_TRADE";s.last_action=`${proposal?.status||"NO_TRADE"} · ${proposal?.reason||"aucune raison disponible"}`;
    }else if(proposal?.proposal_id&&proposal.proposal_id===s.last_executed_proposal_id){'''
    new_branch = '''    }else if(proposal?.status!=="PROPOSED"){
      s.no_trade+=1;s.phase=proposal?.status==="REJECTED"?"SAFETY_REJECT":"NO_TRADE";s.last_action=`${proposal?.status||"NO_TRADE"} · ${proposal?.reason||"aucune raison disponible"}`;
    }else if(!strategyAReentryFresh404271(proposal).eligible){
      const fresh=strategyAReentryFresh404271(proposal);s.reentry_waits_404271=Number(s.reentry_waits_404271||0)+1;s.phase="STALE_SIGNAL_WAIT";
      const d=Number.isFinite(fresh.direction_improvement)?`${fresh.direction_improvement>=0?"+":""}${fresh.direction_improvement.toFixed(1)}`:"—",b=Number.isFinite(fresh.btc24_improvement)?`${fresh.btc24_improvement>=0?"+":""}${fresh.btc24_improvement.toFixed(2)}`:"—";
      s.last_action=`Réentrée bloquée : signal MIXTE pas assez neuf · Δ direction ${d} pt (seuil +${STRATEGY_A_REENTRY_POLICY_404271.min_direction_improvement}) · Δ BTC24 ${b} pt (seuil +${STRATEGY_A_REENTRY_POLICY_404271.min_btc24_improvement_pct.toFixed(2)}).`;
    }else if(proposal?.proposal_id&&proposal.proposal_id===s.last_executed_proposal_id){'''
    if text.count(old_branch) != 1:
        raise SystemExit(f"404271_FAIL: proposal/reentry branch count={text.count(old_branch)}")
    text = text.replace(old_branch, new_branch, 1)

    old_open = '          s.opened+=1;s.last_executed_proposal_id=proposal.proposal_id;s.phase="PAPER_OPEN";'
    new_open = '          s.opened+=1;s.last_executed_proposal_id=proposal.proposal_id;s.last_entry_signal_404271=strategyAReentrySignal404271(proposal);s.phase="PAPER_OPEN";'
    if text.count(old_open) != 1:
        raise SystemExit(f"404271_FAIL: paper open owner count={text.count(old_open)}")
    text = text.replace(old_open, new_open, 1)

    old_phase = '  if(phase.includes("COOLDOWN"))return {label:"PAUSE",reason:String(s.last_action||"Pause de sécurité après trade Paper.")};'
    new_phase = '  if(phase.includes("COOLDOWN"))return {label:"PAUSE RÉENTRÉE",reason:String(s.last_action||"Pause anti-surtrading après trade Paper.")};\n  if(phase==="STALE_SIGNAL_WAIT")return {label:"ATTENTE NOUVEAU SIGNAL",reason:String(s.last_action||"Le signal doit évoluer avant une nouvelle entrée Paper.")};'
    if text.count(old_phase) != 1:
        raise SystemExit(f"404271_FAIL: visual cooldown phase count={text.count(old_phase)}")
    text = text.replace(old_phase, new_phase, 1)

    APP.write_text(text, encoding="utf-8")


def write_release_identity() -> None:
    contract = {
        "scope": "strategy_a_reentry_cooldown_fresh_signal_guard",
        "strategy": "STRATEGY_A_V1",
        "mode": "session_local_paper_anti_overtrading",
        "reentry_cooldown_ms": 900000,
        "minimum_hold_ms_preserved": 300000,
        "fresh_signal_after_cooldown": {
            "mixed_regime": True,
            "min_direction_improvement_points": 3,
            "min_btc24_improvement_percentage_points": 0.05,
            "bullish_regime_can_reenter_after_cooldown": True,
        },
        "duplicate_proposal_guard_preserved": True,
        "max_open_positions_preserved": 1,
        "risk_governor_changed": False,
        "paper_execution_changed": False,
        "reconciliation_math_changed": False,
        "entry_gate_404270_changed": False,
        "auto_runner_logic_changed": True,
        "market_core_changed": False,
        "oracle_engine_changed": False,
        "atlas_pipeline_changed": False,
        "persistence": False,
        "new_timer": False,
        "new_fetch": False,
        "new_websocket": False,
        "new_observer": False,
        "real_orders": False,
        "kraken_network": False,
        "kraken_orders": False,
        "credentials": False,
        "wallet": False,
        "withdrawals": False,
    }
    contract_path = Path("/tmp/contract_404271.json")
    contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    run(
        "python", str(RELEASE_DRIVER),
        "--build", BUILD,
        "--parent", PARENT,
        "--release", RELEASE,
        "--status", STATUS,
        "--contract-key", "strategy_a_reentry_cooldown_fresh_signal_404271",
        "--contract-json", str(contract_path),
        "--lineage-note", "40.4.271 Strategy A anti-overtrading: after each closed Paper trade, 15-minute re-entry cooldown; MIXTE re-entry then requires direction improvement >= +3 points or BTC 24h improvement >= +0.05 percentage point versus prior entry signal; HAUSSIER may re-enter after cooldown; existing Risk Governor/Paper/Reconciliation owners preserved; zero Kraken network; Market Core protected",
    )


def validate() -> None:
    text = APP.read_text(encoding="utf-8")
    required = (
        OWNER,
        "STRATEGY_A_REENTRY_POLICY_404271",
        "strategyAReentryFresh404271",
        "AgentCryptoStrategyAReentryGuard404271",
        "cooldown_ms:900000",
        "min_direction_improvement:3",
        "min_btc24_improvement_pct:0.05",
        "CLOSED_REENTRY_COOLDOWN",
        "STALE_SIGNAL_WAIT",
        "ATTENTE NOUVEAU SIGNAL",
        "strategyAMeasuredMixedBias404270",
        "AgentCryptoAutoPaperRunner404265",
    )
    missing = [marker for marker in required if marker not in text]
    if missing:
        raise SystemExit("404271_FAIL: missing runtime markers: " + ", ".join(missing))
    if 's.closed+=1;s.cooldown_until=Date.now()+s.cadence_ms;s.phase="CLOSED_COOLDOWN";' in text:
        raise SystemExit("404271_FAIL: legacy one-cadence close cooldown still present")
    helper_block = text[text.index(OWNER):text.index(cycle_marker := 'function strategyAAutoCycle404265(trigger="timer"){', text.index(OWNER))]
    for forbidden in ("fetch(", "new WebSocket(", "new MutationObserver(", "new IntersectionObserver(", "localStorage.setItem(", "indexedDB.open("):
        if forbidden in helper_block:
            raise SystemExit(f"404271_FAIL: forbidden side effect in re-entry helper: {forbidden}")
    run("node", "--check", str(APP))
    run("node", "--check", str(BASE / "js/app.js"))
    run("python", str(VERSION_GUARD), "--expected-build", BUILD, "--expected-release", RELEASE)
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404271_FAIL: Market Core changed after release driver")


def package() -> tuple[Path, Path, Path]:
    COORD.mkdir(parents=True, exist_ok=True)
    zip_path = COORD / ZIP_NAME
    sha_path = COORD / SHA_NAME
    report_path = COORD / REPORT_NAME
    members = [
        BASE / "app.js",
        BASE / "build.json",
        BASE / "administrator-version.json",
        BASE / "index.html",
        BASE / "js/app.js",
        BASE / "js/views/system-presentation.js",
    ]
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in members:
            zf.write(path, path.relative_to(REPO))
    digest = sha256(zip_path)
    sha_path.write_text(f"{digest}  {zip_path.name}\n", encoding="utf-8")
    report_path.write_text(
        "# Agent-Crypto 40.4.271 — Strategy A Re-entry Guard\n\n"
        "- Parent: 40.4.270\n"
        "- Market Core: 38.15.11 (protected)\n"
        "- Paper-only, session-local\n"
        "- Re-entry cooldown after close: 15 minutes\n"
        "- MIXTE fresh-signal rule after cooldown: direction +3 points OR BTC 24h +0.05 percentage point versus prior entry\n"
        "- HAUSSIER may re-enter after cooldown\n"
        "- Existing Risk Governor, Paper execution and reconciliation math unchanged\n"
        "- No Kraken network, credentials, wallet, persistence or real orders\n"
        f"- ZIP SHA-256: `{digest}`\n",
        encoding="utf-8",
    )
    print(f"404271_ZIP={zip_path}")
    print(f"404271_SHA256={digest}")
    return zip_path, sha_path, report_path


def main() -> None:
    sync_system_tokens()
    patch_runtime()
    write_release_identity()
    validate()
    package()
    print("404271_REENTRY_COOLDOWN_FRESH_SIGNAL_PASS")


if __name__ == "__main__":
    main()
