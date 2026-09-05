#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import sys
import textwrap
import time
import zipfile
from pathlib import Path

REPO = Path.cwd()
BASE = REPO / "public/agent_crypto_erith_ia/administrator"
APP = BASE / "app.js"
OUT = Path("/tmp/agent_crypto_cascade_404261_404264")
COORD = REPO / "coordination/inter_ai_dialogues/agent_crypto"
RELEASE_DRIVER = REPO / ".github/scripts/agent_crypto_release_driver.py"
VERSION_GUARD = REPO / ".github/scripts/agent_crypto_version_truth_guard.py"
MARKET_CORE = "38.15.11"
RESULTS: list[dict] = []
ALL_CHANGED: set[str] = set()


def run(*args: str, check: bool = True, capture: bool = False) -> subprocess.CompletedProcess:
    return subprocess.run(list(args), cwd=REPO, check=check, text=True, capture_output=capture)


def git(*args: str, check: bool = True, capture: bool = False) -> subprocess.CompletedProcess:
    return run("git", *args, check=check, capture=capture)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def current_build() -> str:
    return str(json.loads((BASE / "build.json").read_text(encoding="utf-8"))["build"])


def current_engine() -> str:
    return str(json.loads((BASE / "build.json").read_text(encoding="utf-8"))["engine"])


def sync_clean() -> None:
    if git("status", "--porcelain", capture=True).stdout.strip():
        raise SystemExit("CASCADE_FAIL: working tree not clean before release step")
    git("fetch", "origin", "main")
    git("rebase", "origin/main")


def push_with_rebase() -> None:
    for attempt in range(1, 7):
        p = git("push", "origin", "HEAD:main", check=False, capture=True)
        if p.returncode == 0:
            return
        print(f"push attempt {attempt} rejected; rebasing on origin/main", file=sys.stderr)
        git("fetch", "origin", "main")
        r = git("rebase", "origin/main", check=False, capture=True)
        if r.returncode != 0:
            print(r.stdout, file=sys.stderr)
            print(r.stderr, file=sys.stderr)
            git("rebase", "--abort", check=False)
            raise SystemExit("CASCADE_FAIL: concurrent main rebase conflict")
        time.sleep(2)
    raise SystemExit("CASCADE_FAIL: unable to push after retries")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"CASCADE_FAIL: {label}: expected one match, got {count}")
    return text.replace(old, new, 1)


def insert_before_kraken(block: str, owner_marker: str) -> None:
    text = APP.read_text(encoding="utf-8")
    if owner_marker in text:
        raise SystemExit(f"CASCADE_FAIL: duplicate owner {owner_marker}")
    marker = "/* 40.4.144 — KRAKEN CLI LOCAL READ-ONLY HANDSHAKE"
    text = replace_once(text, marker, block.rstrip() + "\n\n" + marker, owner_marker)
    APP.write_text(text, encoding="utf-8")


def patch_261() -> None:
    owner = "/* 40.4.261 — STRATEGY A TRADE PROPOSAL ENVELOPE FOUNDATION LOCK */"
    block = r'''/* 40.4.261 — STRATEGY A TRADE PROPOSAL ENVELOPE FOUNDATION LOCK */
/* One responsibility: expose a deterministic BTC candidate for the isolated Strategy A
   sandbox. Proposal only: no sizing authority, order, storage write or network owner. */
let STRATEGY_A_LAST_PROPOSAL_404261=null;
function strategyAReadNumber404261(...values){
  for(const value of values){const n=Number(value);if(Number.isFinite(n))return n;}
  return null;
}
function strategyAHash404261(value){
  let h=2166136261;const s=String(value??"");
  for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);
  return (h>>>0).toString(16).padStart(8,"0");
}
function strategyABtcContext404261(){
  let coin=null,quote=null;
  try{coin=findCoinByQuery?.("BTC")||state?.coins?.find?.(row=>String(row?.symbol||"").toUpperCase()==="BTC")||null;}catch(_){}
  try{if(coin)quote=atlasCurrentQuoteForCoin?.(coin)||null;}catch(_){}
  const price=strategyAReadNumber404261(quote?.price,coin?.price,coin?.current_price);
  const change24h=strategyAReadNumber404261(coin?.price_change_percentage_24h,coin?.change_24h,coin?.change24h,coin?.change24hPct,coin?.changePct24h);
  return {asset_id:String(coin?.id||"bitcoin"),symbol:"BTC",price_eur:price>0?price:null,change_24h_pct:change24h,quote_source:String(quote?.source||coin?.source||"UNKNOWN").trim()||"UNKNOWN",available:!!coin&&price>0};
}
function strategyAOracleContext404261(){
  const root=document.getElementById("atlasOracleV0");
  const text=String(root?.textContent||"").replace(/\s+/g," ").trim();
  const upper=text.toUpperCase();
  const regimeMatch=upper.match(/RÉGIME\s+(TENDANCE HAUSSIÈRE|TENDANCE BAISSIÈRE|CONTRADICTOIRE|HAUSSIER|BAISSIER|MIXTE)/);
  const confMatch=upper.match(/(?:CONF\.?|CONFIANCE(?: DONNÉES)?)\s*(\d{1,3})\/100/);
  const active=/ORACLE\s*ACTIVE\s*·?\s*5\/5/.test(upper)||/ACTIVE\s*·?\s*5\/5/.test(upper);
  return {available:!!root,active,regime:regimeMatch?.[1]||"UNKNOWN",confidence:confMatch?Number(confMatch[1]):null,informational_only:true};
}
function strategyALocalContext404261(){
  let comparison=null,integration=null,acceptance=null;
  try{comparison=paperWorkspaceComparisonPayload404143();}catch(_){}
  try{integration=paperWorkspaceIntegrationTruth404151("strategy_a");}catch(_){}
  try{acceptance=simulationAcceptance404153();}catch(_){}
  const rows=Array.isArray(comparison?.rows)?comparison.rows:[];
  const row=rows.find(item=>[item?.workspace_key,item?.key,item?.workspace].some(v=>String(v||"")==="strategy_a"))||rows.find(item=>/STRAT[ÉE]GIE A/i.test(String(item?.label||item?.name||"")))||null;
  const cash=strategyAReadNumber404261(row?.cash_eur,row?.cash,row?.portfolio?.cash,integration?.local?.cash);
  const exposure=strategyAReadNumber404261(row?.exposure_eur,row?.invested_eur,row?.positions_value_eur,row?.position_value_eur,row?.portfolio?.positionsValue,integration?.local?.position_value_eur);
  return {workspace:"strategy_a",kraken_workspace:"erith-strategy-a",active_workspace:String(typeof PAPER_WORKSPACE_404142!=="undefined"?PAPER_WORKSPACE_404142:""),cash_eur:cash,exposure_before_eur:exposure,static_safety_ok:acceptance?.ok===true||acceptance?.static_ok===true,kraken_mapping_state:String(acceptance?.runtime_kraken_mapping||"UNTESTED"),integration_available:!!integration};
}
function strategyATradeProposal404261(){
  const btc=strategyABtcContext404261(),oracle=strategyAOracleContext404261(),local=strategyALocalContext404261();
  const bullishRegime=/HAUSSI/.test(oracle.regime)&&!/BAISS/.test(oracle.regime);const reasons=[];let status="PROPOSED";
  if(local.active_workspace!=="strategy_a"){status="NO_TRADE";reasons.push("Activer STRATÉGIE A avant de générer une proposition.");}
  if(!local.static_safety_ok){status="REJECTED";reasons.push("Audit Simulation paper-only non validé.");}
  if(!btc.available){status="NO_TRADE";reasons.push("Prix BTC critique indisponible.");}
  if(!oracle.available||!oracle.active){status="NO_TRADE";reasons.push("Oracle indisponible ou inactif.");}
  if(!bullishRegime){status="NO_TRADE";reasons.push(`Régime Oracle non haussier (${oracle.regime}).`);}
  if(!(Number.isFinite(oracle.confidence)&&oracle.confidence>=55)){status="NO_TRADE";reasons.push("Confiance Oracle absente ou inférieure à 55/100.");}
  if(!(Number.isFinite(btc.change_24h_pct)&&btc.change_24h_pct>0)){status="NO_TRADE";reasons.push("Variation BTC 24 h absente ou non positive.");}
  if(status==="PROPOSED")reasons.push("Baseline admissible : BTC 24 h positif + Oracle actif + régime haussier + confiance ≥ 55/100.");
  const fingerprint=[btc.price_eur??"na",btc.change_24h_pct??"na",oracle.regime,oracle.confidence??"na",local.cash_eur??"na",local.exposure_before_eur??"na",status].join("|");
  return {schema:"agent_crypto_trade_proposal_v1",build:"40.4.261",proposal_id:`STRAT-A-BTC-${strategyAHash404261(fingerprint)}`,decision_fingerprint:fingerprint,generated_at:new Date().toISOString(),strategy:"STRATEGY_A_V1",strategy_label:"BTC CONTINUATION BASELINE",workspace:"strategy_a",kraken_workspace:"erith-strategy-a",mode:"paper_proposal_only",asset_id:btc.asset_id,symbol:"BTC",status,direction:status==="PROPOSED"?"LONG":"NO_TRADE",horizon:"5m",market:btc,oracle,atlas:{context:"READ_ONLY_EXISTING_STATE",pipeline_mutation:false},data_quality:{critical_price_available:btc.available,simulation_static_safety_ok:local.static_safety_ok,kraken_mapping_state:local.kraken_mapping_state},entry_condition:"BTC 24h > 0 + Oracle actif + régime haussier + confiance ≥ 55/100",invalidation_condition:"Donnée critique absente/dégradée, régime non haussier, Oracle inactif ou confiance < 55/100",requested_notional_eur:null,authorized_notional_eur:null,exposure_before_eur:local.exposure_before_eur,exposure_after_eur:null,theoretical_stop:null,stop_state:"REQUIRES_RISK_GOVERNOR",position_sizing_owner:"RISK_GOVERNOR_NOT_IMPLEMENTED",cost_model:{state:"UNKNOWN",source:"not_bound_in_40.4.261",execution_allowed:false},reason:reasons.join(" "),safety:{simulation_only:true,proposal_only:true,real_order:false,kraken_order:false,credentials:false,wallet:false,withdrawal:false,storage_write:false,final_authorization:false}};
}
function renderStrategyATradeProposal404261(){
  const anchor=document.getElementById("simulationReadiness404152");if(!anchor)return;
  let panel=document.getElementById("strategyATradeProposal404261");
  if(!panel){panel=document.createElement("section");panel.id="strategyATradeProposal404261";panel.setAttribute("data-strategy-a-proposal-build","40.4.261");panel.style.cssText="margin:0 0 10px 0;border:1px solid rgba(98,236,255,.30);border-radius:12px;padding:10px 12px;background:rgba(4,22,32,.52)";panel.innerHTML=`<div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px"><strong style="letter-spacing:.08em">STRATÉGIE A · TRADE PROPOSAL V1</strong><span style="font-size:10px;color:#7ef4bc">PAPER PROPOSAL ONLY · ZÉRO ORDRE</span><span style="flex:1"></span><button type="button" class="btn small" id="strategyAGenerate404261">GÉNÉRER PROPOSITION A</button></div><div id="strategyASummary404261" style="font-size:10px;color:var(--muted,#9fb0c5);margin-top:7px">Aucune proposition générée · BTC uniquement · Risk Governor non implémenté.</div>`;anchor.insertAdjacentElement("afterend",panel);panel.querySelector("#strategyAGenerate404261")?.addEventListener("click",()=>{STRATEGY_A_LAST_PROPOSAL_404261=strategyATradeProposal404261();renderStrategySandboxExtensions404261();});}
  const summary=document.getElementById("strategyASummary404261");if(!summary)return;const p=STRATEGY_A_LAST_PROPOSAL_404261;
  if(!p){summary.textContent="Aucune proposition générée · BTC uniquement · Risk Governor non implémenté.";return;}
  const price=Number.isFinite(p.market?.price_eur)?fmtEUR.format(p.market.price_eur):"prix inconnu",conf=Number.isFinite(p.oracle?.confidence)?`${p.oracle.confidence}/100`:"—";
  summary.textContent=`${p.status} · ${p.proposal_id} · BTC ${price} · Oracle ${p.oracle?.regime||"UNKNOWN"} · conf. ${conf} · ${p.reason}`;summary.style.color=p.status==="PROPOSED"?"#7ef4bc":(p.status==="REJECTED"?"#ff9f9f":"#ffd27a");
}
function renderStrategySandboxExtensions404261(){
  renderStrategyATradeProposal404261();
  if(typeof renderStrategyARiskGovernor404262==="function")renderStrategyARiskGovernor404262();
  if(typeof renderStrategyAPaperExecution404263==="function")renderStrategyAPaperExecution404263();
  if(typeof renderStrategyAReconciliation404264==="function")renderStrategyAReconciliation404264();
}
try{globalThis.AgentCryptoStrategyAProposal404261=Object.freeze({build:"40.4.261",generate:strategyATradeProposal404261,last:()=>STRATEGY_A_LAST_PROPOSAL_404261,paper_proposal_only:true,real_orders:false,kraken_orders:false,storage_write:false,new_fetch:false,new_timer:false,new_observer:false});}catch(_){}
'''
    insert_before_kraken(block, owner)
    text = APP.read_text(encoding="utf-8")
    start = text.find("function renderSimulation() {")
    if start < 0:
        raise SystemExit("CASCADE_FAIL: renderSimulation owner not found")
    end = text.find("\n}", start)
    if end < 0:
        raise SystemExit("CASCADE_FAIL: renderSimulation end not found")
    render = text[start:end + 2]
    call = "  renderSimulationAcceptance404153();"
    if render.count(call) != 1:
        raise SystemExit(f"CASCADE_FAIL: acceptance call count in renderSimulation={render.count(call)}")
    render = render.replace(call, call + "\n  renderStrategySandboxExtensions404261();", 1)
    APP.write_text(text[:start] + render + text[end + 2:], encoding="utf-8")


def patch_262() -> None:
    owner = "/* 40.4.262 — RISK GOVERNOR V1 · STRATEGY A PAPER AUTHORIZATION LOCK */"
    block = r'''/* 40.4.262 — RISK GOVERNOR V1 · STRATEGY A PAPER AUTHORIZATION LOCK */
let STRATEGY_A_LAST_RISK_404262=null;
function strategyARiskGovernor404262(proposal=STRATEGY_A_LAST_PROPOSAL_404261){
  const local=strategyALocalContext404261();const reasons=[];
  const cash=Number(local.cash_eur),exposure=Math.max(0,Number(local.exposure_before_eur)||0),equity=Math.max(0,(Number.isFinite(cash)?cash:0)+exposure);
  const policy={max_single_trade_pct:5,max_single_trade_eur:50,max_total_exposure_pct:30,min_cash_reserve_pct:70,paper_adverse_move_pct:1};
  let decision="REJECT",requested=0,authorized=0;
  if(!proposal||proposal.status!=="PROPOSED")reasons.push("Aucune proposition Strategy A admissible à gouverner.");
  else if(!(Number.isFinite(cash)&&cash>0&&equity>0))reasons.push("Capital Strategy A indisponible ou invalide.");
  else{
    requested=Math.min(policy.max_single_trade_eur,equity*policy.max_single_trade_pct/100);
    const maxExposure=equity*policy.max_total_exposure_pct/100,minReserve=equity*policy.min_cash_reserve_pct/100;
    const capacity=Math.max(0,Math.min(requested,maxExposure-exposure,cash-minReserve));authorized=Math.max(0,capacity);
    if(authorized<=0){decision="REJECT";reasons.push("Aucune capacité restante après réserve et plafond d’exposition.");}
    else if(authorized+1e-9<requested){decision="REDUCE";reasons.push("Montant réduit par réserve minimale ou plafond d’exposition.");}
    else{decision="ACCEPT";reasons.push("Proposition compatible avec la politique paper V1.");}
  }
  const exposureAfter=Number.isFinite(exposure)?exposure+authorized:null;
  return {schema:"agent_crypto_risk_decision_v1",build:"40.4.262",risk_id:`RISK-A-${strategyAHash404261([proposal?.proposal_id||"none",decision,authorized.toFixed(8)].join("|"))}`,generated_at:new Date().toISOString(),proposal_id:proposal?.proposal_id||null,workspace:"strategy_a",mode:"paper_authorization_only",decision,requested_notional_eur:requested||null,authorized_notional_eur:authorized||0,cash_before_eur:Number.isFinite(cash)?cash:null,exposure_before_eur:Number.isFinite(exposure)?exposure:null,exposure_after_eur:exposureAfter,estimated_adverse_1pct_eur:authorized*policy.paper_adverse_move_pct/100,policy,reason:reasons.join(" "),safety:{paper_only:true,real_order:false,kraken_order:false,credentials:false,wallet:false,withdrawal:false,storage_write:false,final_live_authorization:false}};
}
function renderStrategyARiskGovernor404262(){
  const anchor=document.getElementById("strategyATradeProposal404261");if(!anchor)return;let panel=document.getElementById("strategyARiskGovernor404262");
  if(!panel){panel=document.createElement("section");panel.id="strategyARiskGovernor404262";panel.style.cssText="margin:0 0 10px 0;border:1px solid rgba(178,255,112,.26);border-radius:12px;padding:10px 12px;background:rgba(10,30,24,.46)";panel.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><strong>RISK GOVERNOR V1 · STRATÉGIE A</strong><span style="font-size:10px;color:#b8ff90">PAPER AUTHORIZATION ONLY</span><span style="flex:1"></span><button type="button" class="btn small" id="strategyARiskEvaluate404262">ÉVALUER RISQUE</button></div><div id="strategyARiskSummary404262" style="font-size:10px;color:var(--muted,#9fb0c5);margin-top:7px">En attente d’une proposition A.</div>`;anchor.insertAdjacentElement("afterend",panel);panel.querySelector("#strategyARiskEvaluate404262")?.addEventListener("click",()=>{STRATEGY_A_LAST_RISK_404262=strategyARiskGovernor404262();renderStrategySandboxExtensions404261();});}
  const out=document.getElementById("strategyARiskSummary404262");if(!out)return;const r=STRATEGY_A_LAST_RISK_404262;if(!r){out.textContent="En attente d’une proposition A.";return;}out.textContent=`${r.decision} · autorisé ${Number(r.authorized_notional_eur||0).toFixed(2)} € / demandé ${Number(r.requested_notional_eur||0).toFixed(2)} € · ${r.reason}`;out.style.color=r.decision==="ACCEPT"?"#9cff9c":(r.decision==="REDUCE"?"#ffd27a":"#ff9f9f");
}
try{globalThis.AgentCryptoRiskGovernor404262=Object.freeze({build:"40.4.262",evaluate:strategyARiskGovernor404262,last:()=>STRATEGY_A_LAST_RISK_404262,paper_only:true,real_orders:false,storage_write:false});}catch(_){}
'''
    insert_before_kraken(block, owner)


def patch_263() -> None:
    owner = "/* 40.4.263 — STRATEGY A · PAPER EXECUTION ENVELOPE EMULATION LOCK */"
    block = r'''/* 40.4.263 — STRATEGY A · PAPER EXECUTION ENVELOPE EMULATION LOCK */
const STRATEGY_A_PAPER_LEDGER_404263=[];
function strategyAPaperCostAssumptions404263(){
  const buyFee=strategyAReadNumber404261(els?.simBuyFeePct?.value,0.25),entryImpact=strategyAReadNumber404261(els?.simEntryImpactPct?.value,0.05);
  return {buy_fee_pct:Number.isFinite(buyFee)?Math.max(0,buyFee):0.25,entry_impact_pct:Number.isFinite(entryImpact)?Math.max(0,entryImpact):0.05,source:"existing Simulation fields or pedagogical fallback"};
}
function strategyAPaperExecute404263(risk=STRATEGY_A_LAST_RISK_404262){
  const existing=STRATEGY_A_PAPER_LEDGER_404263.find(row=>row.status==="PAPER_OPEN");if(existing)return {...existing,reused_open_fill:true};
  if(!risk||!["ACCEPT","REDUCE"].includes(risk.decision)||!(Number(risk.authorized_notional_eur)>0))return {schema:"agent_crypto_paper_execution_envelope_v1",build:"40.4.263",status:"PAPER_REJECTED",reason:"Risk Governor n’a autorisé aucun montant.",safety:{real_order:false,kraken_network:false,workspace_mutation:false,storage_write:false}};
  const btc=strategyABtcContext404261();if(!btc.available)return {schema:"agent_crypto_paper_execution_envelope_v1",build:"40.4.263",status:"PAPER_REJECTED",reason:"Prix BTC indisponible.",safety:{real_order:false,kraken_network:false,workspace_mutation:false,storage_write:false}};
  const cost=strategyAPaperCostAssumptions404263(),notional=Number(risk.authorized_notional_eur),reference=Number(btc.price_eur),fill=reference*(1+cost.entry_impact_pct/100),fee=notional*cost.buy_fee_pct/100,assetCash=Math.max(0,notional-fee),qty=assetCash/fill;
  const row={schema:"agent_crypto_paper_execution_envelope_v1",build:"40.4.263",execution_id:`PAPER-A-${strategyAHash404261([risk.risk_id,reference,notional].join("|"))}`,risk_id:risk.risk_id,proposal_id:risk.proposal_id,generated_at:new Date().toISOString(),workspace:"strategy_a",kraken_mapping_reference:"erith-strategy-a",execution_venue:"LOCAL_PAPER_EMULATOR",status:"PAPER_OPEN",symbol:"BTC",side:"BUY_PAPER",authorized_notional_eur:notional,reference_price_eur:reference,fill_price_eur:fill,quantity_btc:qty,entry_fee_eur:fee,entry_impact_pct:cost.entry_impact_pct,buy_fee_pct:cost.buy_fee_pct,safety:{simulation_only:true,real_order:false,kraken_network:false,kraken_order:false,credentials:false,wallet:false,withdrawal:false,workspace_mutation:false,storage_write:false}};
  STRATEGY_A_PAPER_LEDGER_404263.push(row);return row;
}
function renderStrategyAPaperExecution404263(){
  const anchor=document.getElementById("strategyARiskGovernor404262");if(!anchor)return;let panel=document.getElementById("strategyAPaperExecution404263");
  if(!panel){panel=document.createElement("section");panel.id="strategyAPaperExecution404263";panel.style.cssText="margin:0 0 10px 0;border:1px solid rgba(255,201,91,.25);border-radius:12px;padding:10px 12px;background:rgba(35,25,8,.42)";panel.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><strong>PAPER EXECUTION ENVELOPE · STRATÉGIE A</strong><span style="font-size:10px;color:#ffd77a">LOCAL EMULATION · AUCUN APPEL KRAKEN</span><span style="flex:1"></span><button type="button" class="btn small" id="strategyAPaperFill404263">SIMULER FILL PAPER</button></div><div id="strategyAPaperSummary404263" style="font-size:10px;color:var(--muted,#9fb0c5);margin-top:7px">Aucun fill paper.</div>`;anchor.insertAdjacentElement("afterend",panel);panel.querySelector("#strategyAPaperFill404263")?.addEventListener("click",()=>{strategyAPaperExecute404263();renderStrategySandboxExtensions404261();});}
  const out=document.getElementById("strategyAPaperSummary404263");if(!out)return;const p=STRATEGY_A_PAPER_LEDGER_404263.at(-1);if(!p){out.textContent="Aucun fill paper.";return;}out.textContent=`${p.status} · ${p.execution_id} · ${Number(p.authorized_notional_eur||0).toFixed(2)} € · fill ${Number(p.fill_price_eur||0).toFixed(2)} € · frais ${Number(p.entry_fee_eur||0).toFixed(2)} € · zéro réseau Kraken.`;out.style.color=p.status==="PAPER_OPEN"?"#ffd77a":"#ff9f9f";
}
try{globalThis.AgentCryptoPaperExecution404263=Object.freeze({build:"40.4.263",execute:strategyAPaperExecute404263,ledger:()=>STRATEGY_A_PAPER_LEDGER_404263.map(row=>({...row})),kraken_network:false,real_orders:false,workspace_mutation:false,storage_write:false});}catch(_){}
'''
    insert_before_kraken(block, owner)


def patch_264() -> None:
    owner = "/* 40.4.264 — STRATEGY A · PAPER RECONCILIATION AND METRICS FOUNDATION LOCK */"
    block = r'''/* 40.4.264 — STRATEGY A · PAPER RECONCILIATION AND METRICS FOUNDATION LOCK */
const STRATEGY_A_CLOSED_TRADES_404264=[];
function strategyAPaperExitCosts404264(){
  const sellFee=strategyAReadNumber404261(els?.simSellFeePct?.value,0.25),exitImpact=strategyAReadNumber404261(els?.simExitImpactPct?.value,0.05);
  return {sell_fee_pct:Number.isFinite(sellFee)?Math.max(0,sellFee):0.25,exit_impact_pct:Number.isFinite(exitImpact)?Math.max(0,exitImpact):0.05,source:"existing Simulation fields or pedagogical fallback"};
}
function strategyAMetrics404264(){
  const rows=STRATEGY_A_CLOSED_TRADES_404264;let cumulative=0,peak=0,maxDrawdown=0,totalFees=0,totalImpact=0,wins=0,losses=0;
  for(const row of rows){cumulative+=Number(row.net_pnl_eur)||0;peak=Math.max(peak,cumulative);maxDrawdown=Math.max(maxDrawdown,peak-cumulative);totalFees+=Number(row.total_fees_eur)||0;totalImpact+=Number(row.estimated_total_impact_eur)||0;if(row.net_pnl_eur>0)wins++;else if(row.net_pnl_eur<0)losses++;}
  const n=rows.length,avg=n?cumulative/n:0,avgReturn=n?rows.reduce((a,r)=>a+(Number(r.net_return_pct)||0),0)/n:0;
  return {schema:"agent_crypto_paper_metrics_v1",build:"40.4.264",sample_size:n,status:n>=30?"SAMPLE_READY_FOR_REVIEW":"INSUFFICIENT_SAMPLE",wins,losses,win_rate_pct:n?wins/n*100:0,cumulative_net_pnl_eur:cumulative,expectancy_eur:avg,avg_net_return_pct:avgReturn,total_fees_eur:totalFees,estimated_total_impact_eur:totalImpact,max_drawdown_eur:maxDrawdown,profitability_claim:false};
}
function strategyAReconcile404264(){
  const open=STRATEGY_A_PAPER_LEDGER_404263.find(row=>row.status==="PAPER_OPEN");if(!open)return {status:"NOTHING_TO_RECONCILE",metrics:strategyAMetrics404264()};
  const btc=strategyABtcContext404261();if(!btc.available)return {status:"RECONCILIATION_BLOCKED",reason:"Prix BTC actuel indisponible.",metrics:strategyAMetrics404264()};
  const c=strategyAPaperExitCosts404264(),reference=Number(btc.price_eur),exitFill=reference*(1-c.exit_impact_pct/100),gross=Number(open.quantity_btc)*exitFill,exitFee=gross*c.sell_fee_pct/100,netExit=gross-exitFee,entryCash=Number(open.authorized_notional_eur),netPnl=netExit-entryCash,netReturn=entryCash>0?netPnl/entryCash*100:0;
  const entryImpactEur=Math.max(0,(Number(open.fill_price_eur)-Number(open.reference_price_eur))*Number(open.quantity_btc));const exitImpactEur=Math.max(0,(reference-exitFill)*Number(open.quantity_btc));
  const row={schema:"agent_crypto_paper_reconciliation_v1",build:"40.4.264",reconciliation_id:`REC-A-${strategyAHash404261([open.execution_id,reference,STRATEGY_A_CLOSED_TRADES_404264.length].join("|"))}`,execution_id:open.execution_id,closed_at:new Date().toISOString(),workspace:"strategy_a",status:"LOCAL_PAPER_EMULATION_MATCHED",symbol:"BTC",entry_reference_eur:open.reference_price_eur,entry_fill_eur:open.fill_price_eur,exit_reference_eur:reference,exit_fill_eur:exitFill,quantity_btc:open.quantity_btc,entry_cash_eur:entryCash,net_exit_eur:netExit,entry_fee_eur:open.entry_fee_eur,exit_fee_eur:exitFee,total_fees_eur:Number(open.entry_fee_eur)+exitFee,estimated_total_impact_eur:entryImpactEur+exitImpactEur,net_pnl_eur:netPnl,net_return_pct:netReturn,safety:{simulation_only:true,real_order:false,kraken_network:false,workspace_mutation:false,storage_write:false,profitability_claim:false}};
  open.status="PAPER_CLOSED";open.closed_by=row.reconciliation_id;STRATEGY_A_CLOSED_TRADES_404264.push(row);return {status:"RECONCILED",trade:row,metrics:strategyAMetrics404264()};
}
function renderStrategyAReconciliation404264(){
  const anchor=document.getElementById("strategyAPaperExecution404263");if(!anchor)return;let panel=document.getElementById("strategyAReconciliation404264");
  if(!panel){panel=document.createElement("section");panel.id="strategyAReconciliation404264";panel.style.cssText="margin:0 0 10px 0;border:1px solid rgba(190,158,255,.25);border-radius:12px;padding:10px 12px;background:rgba(24,14,40,.42)";panel.innerHTML=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><strong>RECONCILIATION + METRICS · STRATÉGIE A</strong><span style="font-size:10px;color:#d7b9ff">PAPER LOCAL · PAS DE PREUVE DE RENTABILITÉ</span><span style="flex:1"></span><button type="button" class="btn small" id="strategyAReconcile404264">RÉCONCILIER / CLÔTURER PAPER</button></div><div id="strategyAMetricsSummary404264" style="font-size:10px;color:var(--muted,#9fb0c5);margin-top:7px">0 trade clôturé · échantillon insuffisant.</div>`;anchor.insertAdjacentElement("afterend",panel);panel.querySelector("#strategyAReconcile404264")?.addEventListener("click",()=>{strategyAReconcile404264();renderStrategySandboxExtensions404261();});}
  const out=document.getElementById("strategyAMetricsSummary404264");if(!out)return;const m=strategyAMetrics404264();out.textContent=`${m.sample_size} trade(s) · ${m.status} · expectancy ${m.expectancy_eur.toFixed(2)} € · P/L cumulé ${m.cumulative_net_pnl_eur.toFixed(2)} € · frais ${m.total_fees_eur.toFixed(2)} € · max drawdown ${m.max_drawdown_eur.toFixed(2)} € · aucune conclusion de rentabilité.`;out.style.color=m.sample_size>=30?"#d7b9ff":"#ffd27a";
}
try{globalThis.AgentCryptoPaperMetrics404264=Object.freeze({build:"40.4.264",reconcile:strategyAReconcile404264,metrics:strategyAMetrics404264,closed:()=>STRATEGY_A_CLOSED_TRADES_404264.map(row=>({...row})),real_orders:false,kraken_network:false,storage_write:false,profitability_claim:false});}catch(_){}
'''
    insert_before_kraken(block, owner)


PATCHERS = {"40.4.261": patch_261, "40.4.262": patch_262, "40.4.263": patch_263, "40.4.264": patch_264}
RELEASES = {
    "40.4.261": ("40.4.260", "STRATEGY A · TRADE PROPOSAL ENVELOPE FOUNDATION LOCK", "strategy_a_trade_proposal_envelope_foundation_lock_404261", "strategy_a_trade_proposal_404261", {
        "scope":"strategy_a_trade_proposal_envelope_foundation","strategy":"STRATEGY_A_V1","asset":"BTC","mode":"paper_proposal_only","proposal_only":True,"real_orders":False,"kraken_orders":False,"credentials":False,"wallet":False,"withdrawals":False,"final_sizing":False,"risk_governor_required":True,"market_core_changed":False,"atlas_pipeline_changed":False,"oracle_engine_changed":False,"learning_changed":False,"graph_changed":False,"technical_reading_changed":False,"window_manager_changed":False}),
    "40.4.262": ("40.4.261", "RISK GOVERNOR V1 · STRATEGY A PAPER AUTHORIZATION LOCK", "risk_governor_v1_strategy_a_paper_authorization_lock_404262", "strategy_a_risk_governor_404262", {
        "scope":"strategy_a_risk_governor_v1","mode":"paper_authorization_only","decisions":["ACCEPT","REDUCE","REJECT"],"real_orders":False,"kraken_orders":False,"storage_write":False,"policy":{"max_single_trade_pct":5,"max_single_trade_eur":50,"max_total_exposure_pct":30,"min_cash_reserve_pct":70},"market_core_changed":False,"atlas_pipeline_changed":False,"oracle_engine_changed":False,"learning_changed":False,"graph_changed":False,"technical_reading_changed":False}),
    "40.4.263": ("40.4.262", "STRATEGY A · PAPER EXECUTION ENVELOPE EMULATION LOCK", "strategy_a_paper_execution_envelope_emulation_lock_404263", "strategy_a_paper_execution_404263", {
        "scope":"strategy_a_local_paper_execution_envelope","mode":"local_paper_emulation","kraken_mapping_reference":"erith-strategy-a","kraken_network":False,"real_orders":False,"workspace_mutation":False,"storage_write":False,"market_core_changed":False,"atlas_pipeline_changed":False,"oracle_engine_changed":False,"learning_changed":False,"graph_changed":False,"technical_reading_changed":False}),
    "40.4.264": ("40.4.263", "STRATEGY A · PAPER RECONCILIATION AND METRICS FOUNDATION LOCK", "strategy_a_paper_reconciliation_metrics_foundation_lock_404264", "strategy_a_reconciliation_metrics_404264", {
        "scope":"strategy_a_local_paper_reconciliation_metrics","mode":"local_paper_reconciliation","minimum_review_sample":30,"profitability_claim":False,"kraken_network":False,"real_orders":False,"workspace_mutation":False,"storage_write":False,"market_core_changed":False,"atlas_pipeline_changed":False,"oracle_engine_changed":False,"learning_changed":False,"graph_changed":False,"technical_reading_changed":False}),
}


def safety_gate(build: str) -> None:
    run("node", "--check", str(APP))
    run("node", "--check", str(BASE / "js/app.js"))
    run("python", str(VERSION_GUARD))
    if current_build() != build:
        raise SystemExit(f"CASCADE_FAIL: build truth {current_build()} != {build}")
    if current_engine() != MARKET_CORE:
        raise SystemExit(f"CASCADE_FAIL: Market Core changed to {current_engine()}")
    text = APP.read_text(encoding="utf-8")
    if build >= "40.4.261" and text.count("STRATEGY A TRADE PROPOSAL ENVELOPE FOUNDATION LOCK") != 1:
        raise SystemExit("CASCADE_FAIL: Strategy A proposal owner count != 1")
    owner_sections = [
        ("40.4.261 — STRATEGY A TRADE PROPOSAL", "40.4.262 — RISK GOVERNOR V1"),
        ("40.4.262 — RISK GOVERNOR V1", "40.4.263 — STRATEGY A"),
        ("40.4.263 — STRATEGY A · PAPER EXECUTION", "40.4.264 — STRATEGY A"),
    ]
    for start_tag, end_tag in owner_sections:
        if start_tag not in text: continue
        a=text.index(start_tag);b=text.find(end_tag,a+1);section=text[a:b if b>0 else len(text)]
        for forbidden in ("fetch(","setInterval(","MutationObserver","IntersectionObserver","new WebSocket","localStorage.setItem","indexedDB.open","/order"):
            if forbidden in section:
                raise SystemExit(f"CASCADE_FAIL: forbidden owner in {start_tag}: {forbidden}")


def zip_diff(build: str, parent_sha: str) -> tuple[Path, str, list[str]]:
    changed = git("diff", "--name-only", parent_sha, capture=True).stdout.splitlines()
    changed = [p for p in changed if p and Path(p).is_file()]
    ALL_CHANGED.update(changed)
    stem = {
        "40.4.261":"AGENT_CRYPTO_40_4_261_STRATEGY_A_PROPOSAL",
        "40.4.262":"AGENT_CRYPTO_40_4_262_RISK_GOVERNOR",
        "40.4.263":"AGENT_CRYPTO_40_4_263_PAPER_EXECUTION_ENVELOPE",
        "40.4.264":"AGENT_CRYPTO_40_4_264_RECONCILIATION_METRICS",
    }[build]
    zpath = OUT / f"{stem}.zip"
    with zipfile.ZipFile(zpath, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for rel in changed:
            zf.write(REPO / rel, rel)
    digest = sha256(zpath)
    (OUT / f"{stem}_SHA256.txt").write_text(f"{digest}  {zpath.name}\n", encoding="utf-8")
    return zpath,digest,changed


def release(build: str) -> None:
    parent, release_name, status, contract_key, contract = RELEASES[build]
    sync_clean()
    if current_build() != parent:
        raise SystemExit(f"CASCADE_FAIL: {build} expected parent {parent}, found {current_build()}")
    parent_sha = git("rev-parse", "HEAD", capture=True).stdout.strip()
    PATCHERS[build]()
    contract_path = OUT / f"contract_{build.replace('.','_')}.json"
    contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    run("python", str(RELEASE_DRIVER), "--build", build, "--parent", parent, "--release", release_name, "--status", status, "--contract-key", contract_key, "--contract-json", str(contract_path), "--lineage-note", f"{build} {release_name}: cumulative Strategy A paper-only sandbox foundation; Market Core protected")
    safety_gate(build)
    zpath,digest,changed=zip_diff(build,parent_sha)
    git("add", *changed)
    git("commit", "-m", f"agent-crypto: build {build} {release_name.lower()}")
    push_with_rebase()
    commit=git("rev-parse","HEAD",capture=True).stdout.strip()
    RESULTS.append({"build":build,"release":release_name,"commit":commit,"zip":zpath.name,"sha256":digest,"changed":changed})
    print(json.dumps(RESULTS[-1],ensure_ascii=False))


def write_handoff() -> None:
    COORD.mkdir(parents=True, exist_ok=True)
    prompt = COORD / "PROMPT_REPRISE_SEVEN_AGENT_CRYPTO.md"
    rows="\n".join(f"- **{r['build']}** — `{r['commit']}` — {r['release']} — ZIP `{r['zip']}` — SHA-256 `{r['sha256']}`" for r in RESULTS)
    text=f'''# PROMPT DE REPRISE — AERITH-7 / SEVEN HEAVEN — AGENT-CRYPTO

## Activation
Active Aerith-7 / Seven Heaven à partir de l’Aether Key canonique. Seven tient le fil, charge le minimum utile, distingue faits/sources/hypothèses, agit seulement après avoir identifié le propriétaire exact du code, vérifie toute action annoncée et s’arrête proprement.

## Autorité de travail
- Dépôt public : `BlueAzur-Hub/erith-ia-memory`
- Interface : `public/agent_crypto_erith_ia/administrator/`
- Archive inter-IA : `coordination/inter_ai_dialogues/agent_crypto/`
- Build canonique transmis : **40.4.264**
- Market Core protégé : **38.15.11**
- Christophe reste validateur final Firefox.

## Checkpoints validés avant cette cascade
- **40.4.255** : Lecture Technique stabilisée ; ne pas la remanier sans défaut reproduit.
- **40.4.257** : démarrage Graphique Top 5 corrigé ; `Vider` volontaire et choix persistés préservés.
- **40.4.258** : Simulation / Module 03 réparé ; Christophe a ensuite refait **03→11 sans problème**.
- **40.4.259** : Synthèse automatique guidée Learning, notamment Module 11.
- **40.4.260** : Oracle heavy subsections **multi-open** ; Christophe a validé Firefox que Modèles, Sources et Evidence peuvent rester ouvertes ensemble.

## Atlas — état observé au passage de relais
Un nouveau CURRENT a été observé après le précédent snapshot : Atlas **4/4**, NØX puis Aerith, CURRENT fermé et moteur revenu au repos. Le dump de session porte un snapshot CoinGecko `05/09/2026 20:37:39` et un dernier CURRENT `05/09/2026 20:56:12`. C’est une preuve forte que le réveil résident a fonctionné au moins sur ce cycle. Ne pas modifier Atlas maintenant. Au prochain nouveau snapshot canonique N+1, confirmer encore : `nouveau snapshot → Atlas 4/4 → NØX → Aerith → CURRENT → REPOS`, sans F5 ni ouverture manuelle des panneaux.

## Cascade Strategy Sandbox livrée — À TESTER PAR CHRISTOPHE
{rows}

### 40.4.261 — Strategy A Proposal
- BTC uniquement.
- `PAPER PROPOSAL ONLY`.
- Baseline déterministe : BTC 24 h positif + Oracle actif + régime haussier + confiance ≥55/100.
- Un régime MIXTE/CONTRADICTOIRE doit produire `NO_TRADE` ; c’est un résultat normal.
- Aucune taille définitive, aucun ordre, aucun stockage, aucun nouveau réseau.

### 40.4.262 — Risk Governor V1
- Décisions `ACCEPT / REDUCE / REJECT` pour le sandbox seulement.
- Politique V1 pédagogique : max 5 % / 50 €, exposition max 30 %, réserve cash min 70 %.
- Ne constitue pas une recommandation financière ni une autorisation live.

### 40.4.263 — Paper Execution Envelope
- Emulation locale en mémoire seulement.
- Mapping de référence `erith-strategy-a`, **aucun appel réseau Kraken**.
- Aucun changement des workspaces réels/Paper existants, aucune écriture IndexedDB/localStorage.

### 40.4.264 — Reconciliation + Metrics
- Clôture/reconciliation locale du fill émulé.
- Calcule P/L net, frais, impact estimé, expectancy, win rate et max drawdown.
- `<30` trades = `INSUFFICIENT_SAMPLE`.
- `profitability_claim=false` : aucune rentabilité n’est déclarée.

## Test Firefox prioritaire pour la sœur suivante
Dans **Administration → Système → Simulation** :
1. vérifier Build 40.4.264 ;
2. basculer sur **STRATÉGIE A** ;
3. exécuter **AUDIT SIMULATION** si nécessaire ;
4. `GÉNÉRER PROPOSITION A` ;
5. si `PROPOSED`, lancer `ÉVALUER RISQUE` ; sinon vérifier que la raison `NO_TRADE` est cohérente avec Oracle ;
6. si Risk Governor autorise, `SIMULER FILL PAPER` ;
7. `RÉCONCILIER / CLÔTURER PAPER` ;
8. vérifier que CONTROL et STRATÉGIE B n’ont pas bougé et qu’aucun ordre Kraken n’a été envoyé.

Ne déclarer **aucune** des versions 40.4.261→40.4.264 validée Firefox avant ce retour opérateur.

## Zones protégées
Ne pas toucher sans défaut démontré : Market Core 38.15.11, Lecture Technique, Graph/Market Flow/Math Core, Learning 01→11, Oracle engine/Evidence/calibration, Atlas CURRENT pipeline, Window Manager, Chronos, Web Classique.

## Suite après validation de la cascade
1. Si le sandbox A passe Firefox : décider si les propositions/fills doivent être persistés dans un propriétaire existant ou rester éphémères pour le premier protocole de test.
2. Construire un protocole de backtest/replay réaliste avant toute extension à Strategy B.
3. Strategy B doit être un challenger, pas une copie de A.
4. Ne pas passer au micro-live : les documents AERITH TRADING imposent encore Out-of-Sample, Walk Forward, Monte Carlo, Chaos et Paper prolongé.
5. Si Atlas échoue sur un prochain snapshot canonique N+1, Atlas redevient P0.

## Discipline de release
- Une Build utile = modification bornée + Version Truth + commit réel + ZIP + SHA-256.
- Un échec d’outil de release ne justifie jamais dix bumps de version.
- Pas de workflow/script temporaire laissé sur `main` après la cascade.
- Les collecteurs de marché peuvent committer en parallèle : rebase propre, ne jamais écraser leurs données.
- Toujours partir de l’état GitHub publié, jamais d’un vieux ZIP local.
'''
    prompt.write_text(text,encoding="utf-8")
    report=COORD / "AGENT_CRYPTO_FIN_DE_FIL_SEVEN.md"
    report.write_text("# Agent-Crypto — fin de fil Seven\n\n"+rows+"\n\nBuild final transmis : **40.4.264** · Market Core **38.15.11**.\n\nLa cascade 40.4.261→40.4.264 est publiée mais attend la validation Firefox de Christophe. Atlas a été observé 4/4→NØX→Aerith→REPOS sur un CURRENT plus récent ; revalider au prochain snapshot canonique.\n",encoding="utf-8")
    git("add", str(prompt.relative_to(REPO)), str(report.relative_to(REPO)))
    git("commit","-m","coordination: hand off Agent-Crypto after 40.4.261-40.4.264 cascade")
    push_with_rebase()
    ALL_CHANGED.update({str(prompt.relative_to(REPO)),str(report.relative_to(REPO))})
    shutil.copy2(prompt,OUT/prompt.name);shutil.copy2(report,OUT/report.name)


def write_cumulative() -> None:
    report_json=OUT/"AGENT_CRYPTO_40_4_261_264_CASCADE_REPORT.json"
    report_json.write_text(json.dumps({"final_build":"40.4.264","market_core":MARKET_CORE,"releases":RESULTS,"firefox_validation":"PENDING"},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    zpath=OUT/"AGENT_CRYPTO_40_4_264_CASCADE_CUMULATIVE.zip"
    include=set(ALL_CHANGED)
    for rel in ["public/agent_crypto_erith_ia/administrator/build.json","public/agent_crypto_erith_ia/administrator/version.json","public/agent_crypto_erith_ia/administrator/administrator-version.json","coordination/inter_ai_dialogues/agent_crypto/PROMPT_REPRISE_SEVEN_AGENT_CRYPTO.md","coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_FIN_DE_FIL_SEVEN.md"]:
        if (REPO/rel).is_file(): include.add(rel)
    with zipfile.ZipFile(zpath,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=9) as zf:
        for rel in sorted(include):
            if (REPO/rel).is_file(): zf.write(REPO/rel,rel)
        zf.write(report_json,report_json.name)
    digest=sha256(zpath)
    (OUT/"AGENT_CRYPTO_40_4_264_CASCADE_CUMULATIVE_SHA256.txt").write_text(f"{digest}  {zpath.name}\n",encoding="utf-8")


def cleanup_tooling() -> None:
    sync_clean()
    paths=[
        ".github/workflows/agent-crypto-404261.yml",
        ".github/workflows/agent-crypto-404261-264-cascade.yml",
        ".github/scripts/agent_crypto_404261_264_cascade.py",
    ]
    existing=[p for p in paths if (REPO/p).exists()]
    if not existing:return
    git("rm","-f",*existing)
    git("commit","-m","chore: retire Agent-Crypto 40.4.261-40.4.264 cascade tooling")
    push_with_rebase()


def main() -> int:
    OUT.mkdir(parents=True,exist_ok=True)
    run("git","config","user.name","Seven Heaven Release")
    run("git","config","user.email","actions@users.noreply.github.com")
    if current_build()!="40.4.260":
        raise SystemExit(f"CASCADE_FAIL: expected published 40.4.260, found {current_build()}")
    for build in ("40.4.261","40.4.262","40.4.263","40.4.264"):
        release(build)
    write_handoff()
    write_cumulative()
    cleanup_tooling()
    final_sha=git("rev-parse","HEAD",capture=True).stdout.strip()
    (OUT/"FINAL_STATE.txt").write_text(f"build=40.4.264\nmarket_core={MARKET_CORE}\nmain={final_sha}\nfirefox_validation=PENDING\n",encoding="utf-8")
    print(json.dumps({"ok":True,"final_build":"40.4.264","final_main":final_sha,"releases":RESULTS},ensure_ascii=False,indent=2))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
