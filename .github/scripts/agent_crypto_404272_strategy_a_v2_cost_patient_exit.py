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
SYSTEM = BASE / "js/views/system-presentation.js"
COORD = REPO / "coordination/inter_ai_dialogues/agent_crypto"
DRIVER = REPO / ".github/scripts/agent_crypto_release_driver.py"
GUARD = REPO / ".github/scripts/agent_crypto_version_truth_guard.py"

BUILD = "40.4.272"
PARENT = "40.4.271"
ENGINE = "38.15.11"
RELEASE = "STRATEGY A V2 · COST-AWARE ENTRY + PATIENT EXIT + OPERATOR RESULTS LOCK"
STATUS = "strategy_a_v2_cost_aware_patient_exit_operator_results_lock_404272"
OWNER = "/* 40.4.272 — STRATEGY A V2 · COST-AWARE ENTRY + PATIENT EXIT + OPERATOR RESULTS LOCK */"
ZIP_NAME = "AGENT_CRYPTO_40_4_272_STRATEGY_A_V2_COST_AWARE_PATIENT_EXIT.zip"
SHA_NAME = "AGENT_CRYPTO_40_4_272_STRATEGY_A_V2_COST_AWARE_PATIENT_EXIT_SHA256.txt"
REPORT_NAME = "AGENT_CRYPTO_40_4_272_STRATEGY_A_V2_COST_AWARE_PATIENT_EXIT_REPORT.md"


def run(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(list(args), cwd=REPO, check=True, text=True)


def patch_runtime() -> None:
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("build")) != PARENT:
        raise SystemExit(f"404272_FAIL: expected parent {PARENT}, found {truth.get('build')}")
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404272_FAIL: protected Market Core identity changed")

    text = APP.read_text(encoding="utf-8")
    if OWNER in text:
        raise SystemExit("404272_FAIL: owner already present")

    cycle = 'function strategyAAutoCycle404265(trigger="timer"){'
    if text.count(cycle) != 1:
        raise SystemExit(f"404272_FAIL: auto cycle marker count={text.count(cycle)}")

    helper = r'''/* 40.4.272 — STRATEGY A V2 · COST-AWARE ENTRY + PATIENT EXIT + OPERATOR RESULTS LOCK */
/* Paper-only V2 learned from the first 10 closed 40.4.271 trades.
   Existing Market Core, Oracle model, Risk Governor, Paper fill, reconciliation,
   Kraken isolation and real-order locks remain unchanged. */
const STRATEGY_A_V2_POLICY_404272=Object.freeze({
  absolute_min_expected_move_pct:0.80,
  safety_margin_over_cost_pct:0.20,
  max_hold_ms:3600000,
  first_review_ms:300000
});
function strategyARoundTripCosts404272(){
  let entry={buy_fee_pct:0.25,entry_impact_pct:0.05},exit={sell_fee_pct:0.25,exit_impact_pct:0.05};
  try{entry=strategyAPaperCostAssumptions404263()||entry;}catch(_){}
  try{exit=strategyAPaperExitCosts404264()||exit;}catch(_){}
  const buyFee=Number(entry?.buy_fee_pct)||0,entryImpact=Number(entry?.entry_impact_pct)||0,sellFee=Number(exit?.sell_fee_pct)||0,exitImpact=Number(exit?.exit_impact_pct)||0;
  const total=buyFee+entryImpact+sellFee+exitImpact;
  return {buy_fee_pct:buyFee,entry_impact_pct:entryImpact,sell_fee_pct:sellFee,exit_impact_pct:exitImpact,total_pct:total,required_move_pct:Math.max(STRATEGY_A_V2_POLICY_404272.absolute_min_expected_move_pct,total+STRATEGY_A_V2_POLICY_404272.safety_margin_over_cost_pct)};
}
function strategyAOracleUpsideEnvelope404272(){
  try{
    const body=String(document?.body?.innerText||"").replace(/\u00a0/g," ");
    const match=body.match(/Oracle hausse[\s\S]{0,180}?enveloppe\s*\+?([0-9]+(?:[.,][0-9]+)?)\s*%/i);
    if(match){const value=Number(String(match[1]).replace(",","."));if(Number.isFinite(value))return {available:true,value_pct:value,source:"existing Oracle hausse envelope UI"};}
  }catch(_){}
  return {available:false,value_pct:null,source:"Oracle upside envelope unavailable"};
}
function strategyACostGate404272(proposal){
  const costs=strategyARoundTripCosts404272(),up=strategyAOracleUpsideEnvelope404272();
  const eligible=proposal?.status==="PROPOSED"&&up.available&&Number(up.value_pct)>=Number(costs.required_move_pct);
  return {eligible,proposal_status:String(proposal?.status||"UNKNOWN"),expected_move_pct:up.value_pct,expected_source:up.source,costs,reason:!up.available?"ORACLE_ENVELOPE_UNAVAILABLE":eligible?"EXPECTED_MOVE_COVERS_COSTS":"EXPECTED_MOVE_BELOW_COST_FLOOR"};
}
function strategyAPatientExit404272(open,proposal,ageMs){
  const invalidated=proposal?.status!=="PROPOSED";
  const costs=strategyARoundTripCosts404272();
  if(invalidated)return {should_close:true,reason:"invalidation Strategy A",gross_move_pct:null,required_move_pct:costs.required_move_pct};
  const btc=strategyABtcContext404261(),current=Number(btc?.price_eur),entry=Number(open?.reference_price_eur);
  const grossMove=Number.isFinite(current)&&current>0&&Number.isFinite(entry)&&entry>0?(current-entry)/entry*100:null;
  if(ageMs<STRATEGY_A_V2_POLICY_404272.first_review_ms)return {should_close:false,reason:"premier contrôle à 5 min",gross_move_pct:grossMove,required_move_pct:costs.required_move_pct};
  if(Number.isFinite(grossMove)&&grossMove>=costs.required_move_pct)return {should_close:true,reason:`objectif brut ${grossMove.toFixed(2)} % >= seuil coûts+marge ${costs.required_move_pct.toFixed(2)} %`,gross_move_pct:grossMove,required_move_pct:costs.required_move_pct};
  if(ageMs>=STRATEGY_A_V2_POLICY_404272.max_hold_ms)return {should_close:true,reason:"plafond Paper 60 min atteint",gross_move_pct:grossMove,required_move_pct:costs.required_move_pct};
  return {should_close:false,reason:`patient exit · brut ${Number.isFinite(grossMove)?grossMove.toFixed(2):"—"} % / objectif ${costs.required_move_pct.toFixed(2)} %`,gross_move_pct:grossMove,required_move_pct:costs.required_move_pct};
}
function strategyAExportTrades404272(){
  let rows=[];try{rows=AgentCryptoPaperMetrics404264.closed()||[];}catch(_){}
  const payload={schema:"agent_crypto_strategy_a_trade_export_v2",build:"40.4.272",exported_at:new Date().toISOString(),paper_only:true,trades:rows};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=`STRATEGY_A_TRADES_40_4_272_${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return rows.length;
}
try{globalThis.AgentCryptoStrategyAV2404272=Object.freeze({build:"40.4.272",policy:STRATEGY_A_V2_POLICY_404272,costs:strategyARoundTripCosts404272,cost_gate:strategyACostGate404272,patient_exit:strategyAPatientExit404272,export_trades:strategyAExportTrades404272,paper_only:true,real_orders:false,kraken_network:false,market_core_changed:false,risk_governor_changed:false,reconciliation_math_changed:false});}catch(_){}
'''
    text = text.replace(cycle, helper + "\n" + cycle, 1)

    old_exit = '      if(invalidated||ageMs>=s.min_hold_ms){'
    new_exit = '      const exitV2=strategyAPatientExit404272(open,proposal,ageMs);\n      if(exitV2.should_close){'
    if text.count(old_exit) != 1:
        raise SystemExit(f"404272_FAIL: patient-exit condition count={text.count(old_exit)}")
    text = text.replace(old_exit, new_exit, 1)

    old_reason = '${invalidated?"invalidation Strategy A":"horizon 5 min atteint"}'
    if text.count(old_reason) != 1:
        raise SystemExit(f"404272_FAIL: legacy close reason count={text.count(old_reason)}")
    text = text.replace(old_reason, '${exitV2.reason}', 1)

    old_monitor = 's.phase="MONITORING_OPEN";s.last_action=`Paper ouvert ${open.execution_id} · surveillance · ${(ageMs/60000).toFixed(1)} / 5.0 min.`;'
    new_monitor = 's.phase="MONITORING_OPEN";s.last_action=`Paper ouvert ${open.execution_id} · ${(ageMs/60000).toFixed(1)} min · ${exitV2.reason}.`;'
    if text.count(old_monitor) != 1:
        raise SystemExit(f"404272_FAIL: monitoring owner count={text.count(old_monitor)}")
    text = text.replace(old_monitor, new_monitor, 1)

    duplicate = '    }else if(proposal?.proposal_id&&proposal.proposal_id===s.last_executed_proposal_id){'
    cost_branch = '''    }else if(!strategyACostGate404272(proposal).eligible){
      const cg=strategyACostGate404272(proposal);s.no_trade+=1;s.phase="COST_GATE_WAIT";
      const exp=Number.isFinite(Number(cg.expected_move_pct))?`+${Number(cg.expected_move_pct).toFixed(2)} %`:"indisponible";
      s.last_action=`Coût d'abord : potentiel Oracle ${exp} · seuil ${Number(cg.costs.required_move_pct).toFixed(2)} % (coûts ${Number(cg.costs.total_pct).toFixed(2)} % + marge). Aucun trade Paper.`;
    }else if(proposal?.proposal_id&&proposal.proposal_id===s.last_executed_proposal_id){'''
    if text.count(duplicate) != 1:
        raise SystemExit(f"404272_FAIL: duplicate branch count={text.count(duplicate)}")
    text = text.replace(duplicate, cost_branch, 1)

    stale = '  if(phase==="STALE_SIGNAL_WAIT")return {label:"ATTENTE NOUVEAU SIGNAL",reason:String(s.last_action||"Le signal doit évoluer avant une nouvelle entrée Paper.")};'
    stale_new = stale + '\n  if(phase==="COST_GATE_WAIT")return {label:"ATTENTE MOUVEMENT RENTABLE",reason:String(s.last_action||"Le potentiel estimé doit couvrir les coûts Paper et une marge de sécurité.")};'
    if text.count(stale) != 1:
        raise SystemExit(f"404272_FAIL: visual stale mapping count={text.count(stale)}")
    text = text.replace(stale, stale_new, 1)

    if text.count('  tech.open=false;') != 1:
        raise SystemExit(f"404272_FAIL: technical disclosure reset count={text.count('  tech.open=false;')}")
    text = text.replace('  tech.open=false;', '  /* 40.4.272 · preserve operator-open technical disclosure across rerenders. */', 1)

    old_metrics = '''  const sample=Number(metrics?.sample_size||0),pnl=Number(metrics?.cumulative_net_pnl_eur||0),fees=Number(metrics?.total_fees_eur||0);
  set("strategyAVisualMetrics404269",`${sample} trade${sample===1?"":"s"} · P/L ${pnl.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} € · frais ${fees.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} €`);'''
    new_metrics = '''  const sample=Number(metrics?.sample_size||0),pnl=Number(metrics?.cumulative_net_pnl_eur||0),fees=Number(metrics?.total_fees_eur||0),impact=Number(metrics?.estimated_total_impact_eur||0),wins=Number(metrics?.wins||0),losses=Number(metrics?.losses||0),gross=pnl+fees+impact;
  const euro=v=>Number(v||0).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2});
  set("strategyAVisualMetrics404269",`TRADES ${sample} · GAGNANTS ${wins} · PERDANTS ${losses} · BRUT ${gross>=0?"+":""}${euro(gross)} € · FRAIS -${euro(fees)} € · IMPACT -${euro(impact)} € · NET ${pnl>=0?"+":""}${euro(pnl)} €`);
  const metricsEl=document.getElementById("strategyAVisualMetrics404269");if(metricsEl){metricsEl.style.fontSize="12px";metricsEl.style.fontWeight="900";metricsEl.style.lineHeight="1.45";metricsEl.style.color="#eaf5fa";metricsEl.style.whiteSpace="normal";}
  let exportBtn=document.getElementById("strategyAExportTrades404272");if(!exportBtn){exportBtn=document.createElement("button");exportBtn.type="button";exportBtn.className="btn small";exportBtn.id="strategyAExportTrades404272";exportBtn.textContent="TÉLÉCHARGER JOURNAL TRADES";exportBtn.addEventListener("click",()=>strategyAExportTrades404272());const actions=document.querySelector("#strategyAVisualConsole404269 .avc-actions-404269");const stop=document.getElementById("strategyAVisualStop404269");if(actions)actions.insertBefore(exportBtn,stop||null);}'''
    if text.count(old_metrics) != 1:
        raise SystemExit(f"404272_FAIL: visible metrics owner count={text.count(old_metrics)}")
    text = text.replace(old_metrics, new_metrics, 1)

    APP.write_text(text, encoding="utf-8")


def sync_tokens() -> None:
    idx = INDEX.read_text(encoding="utf-8")
    old = f'./js/views/system-presentation.js?v=administrator-build-{PARENT}'
    new = f'./js/views/system-presentation.js?v=administrator-build-{BUILD}'
    if old in idx:
        INDEX.write_text(idx.replace(old, new, 1), encoding="utf-8")
    sys = SYSTEM.read_text(encoding="utf-8")
    old_source = f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";'
    new_source = f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";'
    if old_source in sys:
        SYSTEM.write_text(sys.replace(old_source, new_source, 1), encoding="utf-8")


def write_release_identity() -> None:
    contract = {
        "scope": "strategy_a_v2_cost_aware_entry_patient_exit_operator_results",
        "strategy": "STRATEGY_A_V2",
        "mode": "session_local_paper_cost_aware",
        "entry_cost_gate": {
            "round_trip_cost_from_existing_simulation_fields": True,
            "absolute_min_expected_move_pct": 0.80,
            "safety_margin_over_cost_pct": 0.20,
            "missing_oracle_envelope_blocks_entry": True,
        },
        "exit_policy": {
            "first_review_ms": 300000,
            "automatic_close_at_5m": False,
            "max_hold_ms": 3600000,
            "proposal_invalidation_closes": True,
            "cost_covered_target_closes": True,
        },
        "operator_results": {
            "visible_gross_fees_impact_net": True,
            "trade_export_button": True,
            "technical_details_state_preserved": True,
        },
        "risk_governor_changed": False,
        "paper_pricing_changed": False,
        "reconciliation_math_changed": False,
        "entry_gate_404270_preserved": True,
        "reentry_guard_404271_preserved": True,
        "market_core_changed": False,
        "oracle_engine_changed": False,
        "atlas_pipeline_changed": False,
        "new_fetch": False,
        "new_websocket": False,
        "new_observer": False,
        "new_timer": False,
        "storage_write": False,
        "real_orders": False,
        "kraken_network": False,
        "credentials": False,
        "wallet": False,
        "withdrawals": False,
    }
    path = Path("/tmp/contract_404272.json")
    path.write_text(json.dumps(contract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    run(
        "python", str(DRIVER),
        "--build", BUILD,
        "--parent", PARENT,
        "--release", RELEASE,
        "--status", STATUS,
        "--contract-key", "strategy_a_v2_cost_aware_patient_exit_404272",
        "--contract-json", str(path),
        "--lineage-note", "40.4.272 Strategy A V2: cost-aware entry gate from existing Paper fee/impact assumptions plus Oracle upside envelope; 5 min is first review rather than forced close; 60 min Paper ceiling; visible gross/fees/impact/net and one-click trade export; technical disclosure state preserved; Market Core 38.15.11 protected; zero Kraken network or real orders",
    )


def validate() -> None:
    run("node", "--check", str(APP))
    run("node", "--check", str(BASE / "js/app.js"))
    run("python", str(GUARD), "--expected-build", BUILD, "--expected-release", RELEASE)
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404272_FAIL: Market Core changed")
    text = APP.read_text(encoding="utf-8")
    for marker in (
        OWNER,
        "STRATEGY_A_V2_POLICY_404272",
        "strategyACostGate404272",
        "strategyAPatientExit404272",
        "COST_GATE_WAIT",
        "ATTENTE MOUVEMENT RENTABLE",
        "TÉLÉCHARGER JOURNAL TRADES",
        "preserve operator-open technical disclosure",
    ):
        if marker not in text:
            raise SystemExit("404272_FAIL missing " + marker)
    if 'if(invalidated||ageMs>=s.min_hold_ms)' in text:
        raise SystemExit("404272_FAIL: legacy forced-5m exit remains")
    if '  tech.open=false;' in text:
        raise SystemExit("404272_FAIL: technical disclosure reset remains")


def package() -> None:
    COORD.mkdir(parents=True, exist_ok=True)
    report = COORD / REPORT_NAME
    report.write_text(
        f"""# Agent-Crypto {BUILD} — Strategy A V2

## Release
{RELEASE}

## Evidence that motivated V2
Operator-exported 40.4.271 sample: 10 closed BTC Paper trades, gross reference-price movement approximately +0.1139 EUR in aggregate, simulated fees approximately 2.4959 EUR, simulated entry/exit impact approximately 0.4986 EUR, net approximately -2.8806 EUR. Six of ten reference-price moves were positive, but the largest observed gross move was only about +0.1310%, far below the ~0.60% simulated round-trip cost.

## Changes
- Cost-aware entry gate reads existing Simulation buy/sell fee and entry/exit impact assumptions.
- Required upside = max(0.80%, round-trip cost + 0.20 percentage point safety margin).
- Uses the existing Oracle hausse envelope; if unavailable, entry is blocked rather than guessed.
- 5 minutes becomes the first Paper review point, not an automatic exit.
- A Paper position closes on Strategy A invalidation, when gross move reaches the cost-aware target after first review, or at a 60-minute Paper ceiling.
- Large visible operator result: trades, wins, losses, gross, fees, impact, net.
- One-click JSON trade journal export.
- Technical details disclosure no longer snaps shut on every rerender.

## Safety
Paper only. No real orders. No Kraken network. No credentials. No wallet. No withdrawal. Risk Governor and reconciliation math unchanged. Market Core remains {ENGINE}.
""",
        encoding="utf-8",
    )
    zip_path = COORD / ZIP_NAME
    members = [
        BASE / "app.js",
        BASE / "index.html",
        BASE / "build.json",
        BASE / "version.json",
        BASE / "administrator-version.json",
        BASE / "js/views/system-presentation.js",
        report,
    ]
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in members:
            if path.exists():
                zf.write(path, path.relative_to(REPO))
    digest = hashlib.sha256(zip_path.read_bytes()).hexdigest()
    (COORD / SHA_NAME).write_text(f"{digest}  {ZIP_NAME}\n", encoding="utf-8")
    print("ZIP_SHA256", digest)


def main() -> None:
    patch_runtime()
    sync_tokens()
    write_release_identity()
    validate()
    package()


if __name__ == "__main__":
    main()
