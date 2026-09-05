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

BUILD = "40.4.268"
PARENT = "40.4.267"
ENGINE = "38.15.11"
RELEASE = "SIMULATION OPERATOR BOARD · SIMPLE HUMAN VIEW LOCK"
STATUS = "simulation_operator_board_simple_human_view_lock_404268"
OWNER = "/* 40.4.268 — SIMULATION OPERATOR BOARD · SIMPLE HUMAN VIEW LOCK */"


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
            raise SystemExit(f"404268_FAIL: index System token count={index.count(old)}")
        INDEX.write_text(index.replace(old, new, 1), encoding="utf-8")

    text = SYSTEM_PRESENTATION.read_text(encoding="utf-8")
    old_source = f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";'
    new_source = f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";'
    if old_source in text:
        if text.count(old_source) != 1:
            raise SystemExit(f"404268_FAIL: System SOURCE token count={text.count(old_source)}")
        SYSTEM_PRESENTATION.write_text(text.replace(old_source, new_source, 1), encoding="utf-8")


def patch_runtime() -> None:
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("build")) != PARENT:
        raise SystemExit(f"404268_FAIL: expected parent {PARENT}, found {truth.get('build')}")
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404268_FAIL: protected Market Core identity changed")

    text = APP.read_text(encoding="utf-8")
    if OWNER in text:
        raise SystemExit("404268_FAIL: owner already present")

    insertion_marker = 'try{globalThis.AgentCryptoStrategyAHumanReadability404267=Object.freeze('
    if text.count(insertion_marker) != 1:
        raise SystemExit(f"404268_FAIL: 40.4.267 API marker count={text.count(insertion_marker)}")

    block = r'''/* 40.4.268 — SIMULATION OPERATOR BOARD · SIMPLE HUMAN VIEW LOCK */
/* Presentation-only replacement for the dense 40.4.267 cockpit. The validated
   Strategy A, Risk Governor, local Paper execution, reconciliation and 5-minute
   Auto Runner remain the only business owners. The old technical cockpit is kept
   intact inside a closed advanced-details disclosure. No fetch, WebSocket, timer,
   observer, storage write, Kraken network request or real order is added. */
function strategyAEnsureOperatorBoardStyle404268(){
  let style=document.getElementById("strategyAOperatorBoardStyle404268");
  if(style)return style;
  style=document.createElement("style");
  style.id="strategyAOperatorBoardStyle404268";
  style.textContent=`
    #strategyAOperatorBoard404268{grid-column:1/-1!important;flex:1 1 100%!important;width:100%!important;min-width:0!important;box-sizing:border-box!important;margin:10px 0 14px!important;padding:14px!important;border:1px solid rgba(87,220,190,.30)!important;border-radius:16px!important;background:linear-gradient(135deg,rgba(7,27,31,.92),rgba(8,18,25,.90))!important;color:#eaf6f4!important}
    #strategyAOperatorBoard404268 *{box-sizing:border-box!important;writing-mode:horizontal-tb!important;word-break:normal!important;overflow-wrap:break-word!important}
    #strategyAOperatorBoard404268 .aop-head-404268{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:18px!important;align-items:center!important;padding:4px 2px 14px!important;border-bottom:1px solid rgba(255,255,255,.08)!important}
    #strategyAOperatorBoard404268 .aop-kicker-404268{font-size:10px!important;letter-spacing:.14em!important;text-transform:uppercase!important;color:#72f1d1!important;font-weight:900!important;margin:0 0 4px!important}
    #strategyAOperatorBoard404268 h3{font-size:21px!important;line-height:1.15!important;margin:0!important;color:#fff!important}
    #strategyAOperatorBoard404268 .aop-sub-404268{display:block!important;margin-top:6px!important;font-size:12px!important;line-height:1.45!important;color:#9fb4bd!important}
    #strategyAOperatorBoard404268 .aop-actions-404268{display:flex!important;gap:9px!important;flex-wrap:wrap!important;justify-content:flex-end!important}
    #strategyAOperatorBoard404268 .aop-actions-404268 button{min-width:165px!important;min-height:42px!important;padding:9px 14px!important;font-size:12px!important;font-weight:900!important;white-space:normal!important}
    #strategyAOperatorBoard404268 .aop-status-404268{display:grid!important;grid-template-columns:190px minmax(0,1fr)!important;gap:14px!important;align-items:center!important;margin:14px 0!important;padding:13px 15px!important;border-radius:12px!important;border:1px solid rgba(105,225,255,.20)!important;background:rgba(4,18,25,.58)!important}
    #strategyAOperatorBoard404268 .aop-status-label-404268{font-size:10px!important;text-transform:uppercase!important;letter-spacing:.10em!important;color:#7f98a4!important;font-weight:900!important}
    #strategyAOperatorBoard404268 .aop-status-value-404268{display:block!important;margin-top:3px!important;font-size:18px!important;line-height:1.2!important;color:#75f5d4!important;font-weight:950!important}
    #strategyAOperatorBoard404268 .aop-status-reason-404268{font-size:12px!important;line-height:1.45!important;color:#d4e2e7!important}
    #strategyAOperatorBoard404268 .aop-grid-404268{display:grid!important;grid-template-columns:repeat(4,minmax(180px,1fr))!important;gap:10px!important;margin:0 0 14px!important}
    #strategyAOperatorBoard404268 .aop-card-404268{min-width:0!important;min-height:86px!important;padding:11px 12px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:11px!important;background:rgba(255,255,255,.035)!important}
    #strategyAOperatorBoard404268 .aop-card-404268 span{display:block!important;font-size:9px!important;text-transform:uppercase!important;letter-spacing:.09em!important;color:#7f98a4!important;font-weight:900!important;margin-bottom:6px!important}
    #strategyAOperatorBoard404268 .aop-card-404268 b{display:block!important;font-size:14px!important;line-height:1.3!important;color:#f3fbfd!important}
    #strategyAOperatorBoard404268 .aop-card-404268 small{display:block!important;margin-top:5px!important;font-size:10px!important;line-height:1.35!important;color:#9eb1b9!important}
    #strategyAOperatorBoard404268 .aop-section-title-404268{margin:3px 0 8px!important;font-size:11px!important;letter-spacing:.09em!important;text-transform:uppercase!important;color:#d9e8eb!important;font-weight:950!important}
    #strategyAOperatorBoard404268 .aop-flow-404268{display:grid!important;grid-template-columns:repeat(4,minmax(180px,1fr))!important;gap:10px!important;margin-bottom:14px!important}
    #strategyAOperatorBoard404268 .aop-step-404268{display:grid!important;grid-template-columns:34px minmax(0,1fr)!important;gap:9px!important;align-items:start!important;padding:10px 11px!important;border-radius:11px!important;border:1px solid rgba(105,225,255,.13)!important;background:rgba(8,29,38,.38)!important}
    #strategyAOperatorBoard404268 .aop-step-num-404268{display:grid!important;place-items:center!important;width:32px!important;height:32px!important;border-radius:50%!important;background:rgba(73,213,190,.12)!important;border:1px solid rgba(73,213,190,.28)!important;color:#72f1d1!important;font-size:13px!important;font-weight:950!important}
    #strategyAOperatorBoard404268 .aop-step-404268 b{display:block!important;font-size:12px!important;line-height:1.3!important;color:#edf8fa!important}
    #strategyAOperatorBoard404268 .aop-step-404268 small{display:block!important;margin-top:3px!important;font-size:10px!important;line-height:1.35!important;color:#92a7b0!important}
    #strategyAOperatorBoard404268 .aop-decision-404268{display:grid!important;grid-template-columns:repeat(5,minmax(130px,1fr))!important;gap:9px!important;margin-bottom:12px!important}
    #strategyAOperatorBoard404268 .aop-decision-404268>div{padding:9px 10px!important;border-radius:10px!important;border:1px solid rgba(255,255,255,.08)!important;background:rgba(0,0,0,.16)!important;min-width:0!important}
    #strategyAOperatorBoard404268 .aop-decision-404268 span{display:block!important;font-size:8px!important;text-transform:uppercase!important;letter-spacing:.08em!important;color:#7d929d!important;font-weight:900!important;margin-bottom:4px!important}
    #strategyAOperatorBoard404268 .aop-decision-404268 b{display:block!important;font-size:12px!important;line-height:1.3!important;color:#edf8fa!important}
    #strategyAOperatorBoard404268 .aop-note-404268{padding:10px 12px!important;border-radius:10px!important;border-left:3px solid #72f1d1!important;background:rgba(40,121,108,.10)!important;font-size:11px!important;line-height:1.45!important;color:#c8d8dd!important}
    #strategyAOperatorBoard404268 .aop-tech-404268{margin-top:12px!important;border-top:1px solid rgba(255,255,255,.07)!important;padding-top:9px!important}
    #strategyAOperatorBoard404268 .aop-tech-404268>summary{cursor:pointer!important;font-size:10px!important;font-weight:900!important;letter-spacing:.07em!important;text-transform:uppercase!important;color:#7f98a4!important;padding:6px 0!important}
    #strategyAHumanCockpit404267{display:none!important}
    #strategyAOperatorBoard404268 .aop-tech-404268[open] #strategyAHumanCockpit404267{display:grid!important;margin-top:10px!important}
    @media(max-width:1280px){#strategyAOperatorBoard404268 .aop-grid-404268,#strategyAOperatorBoard404268 .aop-flow-404268{grid-template-columns:repeat(2,minmax(220px,1fr))!important}#strategyAOperatorBoard404268 .aop-decision-404268{grid-template-columns:repeat(2,minmax(160px,1fr))!important}}
    @media(max-width:760px){#strategyAOperatorBoard404268 .aop-head-404268{grid-template-columns:1fr!important}#strategyAOperatorBoard404268 .aop-actions-404268{justify-content:stretch!important}#strategyAOperatorBoard404268 .aop-actions-404268 button{width:100%!important}#strategyAOperatorBoard404268 .aop-status-404268{grid-template-columns:1fr!important}#strategyAOperatorBoard404268 .aop-grid-404268,#strategyAOperatorBoard404268 .aop-flow-404268,#strategyAOperatorBoard404268 .aop-decision-404268{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(style);
  return style;
}
function strategyAOperatorPhase404268(s,p,open){
  if(!s?.enabled)return {label:"ARRÊTÉ",reason:"Clique une fois sur « DÉMARRER AUTO A ». Ensuite le cycle travaille seul toutes les 5 minutes."};
  if(open)return {label:"POSITION PAPER OUVERTE",reason:String(s.last_action||"Position fictive ouverte et surveillée.")};
  const phase=String(s.phase||"");
  if(phase==="NO_TRADE")return {label:"ATTENTE — PAS DE TRADE",reason:String(p?.reason||s.last_action||"Les conditions d'entrée ne sont pas réunies.")};
  if(phase==="SAFETY_REJECT"||phase==="RISK_REJECT")return {label:"REFUS SÉCURITÉ",reason:String(s.last_action||"Le Risk Governor a bloqué la proposition.")};
  if(phase.includes("COOLDOWN"))return {label:"PAUSE APRÈS TRADE",reason:String(s.last_action||"Pause de sécurité avant le prochain cycle.")};
  if(phase.includes("ERROR")||phase.includes("STOP"))return {label:"ARRÊT SÉCURITÉ",reason:String(s.last_action||"Le pilote automatique s'est arrêté par sécurité.")};
  return {label:"AUTO A ACTIF",reason:String(s.last_action||"Cycle automatique actif.")};
}
function strategyAApplyOperatorBoard404268(){
  strategyAEnsureOperatorBoardStyle404268();
  const old=document.getElementById("strategyAHumanCockpit404267");
  if(!old)return false;
  let board=document.getElementById("strategyAOperatorBoard404268");
  if(!board){
    board=document.createElement("section");board.id="strategyAOperatorBoard404268";board.setAttribute("data-operator-board-build","40.4.268");
    board.innerHTML=`<div class="aop-head-404268"><div><div class="aop-kicker-404268">SIMULATION · STRATÉGIE A</div><h3>Auto Paper — vue simple</h3><span class="aop-sub-404268">Un seul bouton pour démarrer. Ensuite : observation → décision → risque → trade fictif → mesure, automatiquement toutes les 5 minutes.</span></div><div class="aop-actions-404268"><button type="button" class="btn" id="strategyAOperatorStart404268">DÉMARRER AUTO A</button><button type="button" class="btn small" id="strategyAOperatorStop404268">ARRÊTER AUTO</button></div></div><div class="aop-status-404268"><div><span class="aop-status-label-404268">État actuel</span><b class="aop-status-value-404268" id="strategyAOperatorStatus404268">—</b></div><div class="aop-status-reason-404268" id="strategyAOperatorReason404268">Lecture de l'état…</div></div><div class="aop-grid-404268"><div class="aop-card-404268"><span>Capital simulé</span><b id="strategyAOperatorCapital404268">—</b><small>Argent virtuel uniquement</small></div><div class="aop-card-404268"><span>Workspace</span><b>STRATÉGIE A</b><small>isolée de CONTROL et STRATÉGIE B</small></div><div class="aop-card-404268"><span>Sécurité</span><b>AUCUN ORDRE RÉEL</b><small>aucune clé API · aucun wallet</small></div><div class="aop-card-404268"><span>Kraken</span><b>LECTURE SEULE</b><small>le moteur Paper local reste indépendant</small></div></div><div class="aop-section-title-404268">Ce que fait Auto A</div><div class="aop-flow-404268"><div class="aop-step-404268"><div class="aop-step-num-404268">1</div><div><b>Observe BTC</b><small>prix + variation 24 h</small></div></div><div class="aop-step-404268"><div class="aop-step-num-404268">2</div><div><b>Consulte Oracle</b><small>régime + confiance</small></div></div><div class="aop-step-404268"><div class="aop-step-num-404268">3</div><div><b>Vérifie le risque</b><small>autorise, réduit ou refuse</small></div></div><div class="aop-step-404268"><div class="aop-step-num-404268">4</div><div><b>Simule et mesure</b><small>Paper fictif + P/L de test</small></div></div></div><div class="aop-section-title-404268">Dernière décision</div><div class="aop-decision-404268"><div><span>Décision</span><b id="strategyAOperatorDecision404268">—</b></div><div><span>BTC 24 h</span><b id="strategyAOperatorBtc404268">—</b></div><div><span>Oracle</span><b id="strategyAOperatorOracle404268">—</b></div><div><span>Paper</span><b id="strategyAOperatorPaper404268">—</b></div><div><span>Prochain cycle</span><b id="strategyAOperatorNext404268">—</b></div></div><div class="aop-note-404268" id="strategyAOperatorMetrics404268">Aucune mesure disponible pour le moment.</div><details class="aop-tech-404268" id="strategyAOperatorTech404268"><summary>Détails techniques — ouvrir seulement si nécessaire</summary><div id="strategyAOperatorTechHost404268"></div></details>`;
    old.insertAdjacentElement("beforebegin",board);
    board.querySelector("#strategyAOperatorTechHost404268")?.appendChild(old);
    board.querySelector("#strategyAOperatorStart404268")?.addEventListener("click",()=>{strategyAAutoStart404265();});
    board.querySelector("#strategyAOperatorStop404268")?.addEventListener("click",()=>{strategyAAutoStop404265();});
  }

  const s=typeof STRATEGY_A_AUTO_STATE_404265!=="undefined"?STRATEGY_A_AUTO_STATE_404265:null;
  const p=typeof STRATEGY_A_LAST_PROPOSAL_404261!=="undefined"?STRATEGY_A_LAST_PROPOSAL_404261:null;
  const r=typeof STRATEGY_A_LAST_RISK_404262!=="undefined"?STRATEGY_A_LAST_RISK_404262:null;
  const ledger=typeof STRATEGY_A_PAPER_LEDGER_404263!=="undefined"?STRATEGY_A_PAPER_LEDGER_404263:[];
  const open=Array.isArray(ledger)?ledger.find(row=>row?.status==="PAPER_OPEN")||null:null;
  let local=null,metrics=null;
  try{local=strategyALocalContext404261();}catch(_){}
  try{metrics=strategyAMetrics404264();}catch(_){}
  const phase=strategyAOperatorPhase404268(s,p,open);
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set("strategyAOperatorStatus404268",phase.label);
  set("strategyAOperatorReason404268",phase.reason);
  const cash=Number(local?.cash_eur);set("strategyAOperatorCapital404268",Number.isFinite(cash)?`${cash.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} €`:"—");
  set("strategyAOperatorDecision404268",String(p?.status||s?.phase||"—").replaceAll("_"," "));
  const h24=Number(p?.market?.change_24h_pct);set("strategyAOperatorBtc404268",Number.isFinite(h24)?`${h24>=0?"+":""}${h24.toFixed(2)} %`:"—");
  const conf=Number(p?.oracle?.confidence);set("strategyAOperatorOracle404268",p?.oracle?.regime?`${p.oracle.regime}${Number.isFinite(conf)?` · ${conf}/100`:""}`:"—");
  set("strategyAOperatorPaper404268",open?`OUVERT · ${Number(open.authorized_notional_eur||0).toFixed(2)} €`:"AUCUNE POSITION");
  const next=s?.next_cycle_at?new Date(s.next_cycle_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"—";set("strategyAOperatorNext404268",next);
  const sample=Number(metrics?.sample_size||0),pnl=Number(metrics?.cumulative_net_pnl_eur||0),fees=Number(metrics?.total_fees_eur||0);
  set("strategyAOperatorMetrics404268",`Tests clôturés : ${sample} · P/L Paper cumulé : ${pnl.toFixed(2)} € · frais simulés : ${fees.toFixed(2)} € · échantillon minimal avant toute conclusion : 30 trades.`);
  const start=document.getElementById("strategyAOperatorStart404268"),stop=document.getElementById("strategyAOperatorStop404268");
  if(start){start.disabled=!!s?.enabled;start.textContent=s?.enabled?"AUTO A ACTIF":"DÉMARRER AUTO A";}
  if(stop)stop.disabled=!s?.enabled;
  return true;
}
try{globalThis.AgentCryptoStrategyAOperatorBoard404268=Object.freeze({build:"40.4.268",apply:strategyAApplyOperatorBoard404268,presentation_only:true,old_technical_ui_preserved:true,technical_default_closed:true,engines_changed:false,auto_runner_logic_changed:false,new_fetch:false,new_websocket:false,new_observer:false,new_timer:false,storage_write:false,real_orders:false,kraken_network:false});}catch(_){}
'''
    text = text.replace(insertion_marker, block.rstrip() + "\n\n" + insertion_marker, 1)

    old_tail = '  if(typeof strategyAApplyHumanReadability404267==="function")strategyAApplyHumanReadability404267();\n}'
    new_tail = '  if(typeof strategyAApplyHumanReadability404267==="function")strategyAApplyHumanReadability404267();\n  if(typeof strategyAApplyOperatorBoard404268==="function")strategyAApplyOperatorBoard404268();\n}'
    if text.count(old_tail) != 1:
        raise SystemExit(f"404268_FAIL: render tail count={text.count(old_tail)}")
    text = text.replace(old_tail, new_tail, 1)
    APP.write_text(text, encoding="utf-8")


def write_release_identity() -> None:
    contract = {
        "scope": "simulation_operator_board_simple_human_view",
        "presentation_only": True,
        "old_technical_ui_preserved": True,
        "technical_default_closed": True,
        "single_primary_start_action": True,
        "plain_language_status": True,
        "minimum_operator_card_width_px": 180,
        "strategy_engine_changed": False,
        "risk_governor_changed": False,
        "paper_execution_changed": False,
        "reconciliation_changed": False,
        "auto_runner_logic_changed": False,
        "market_core_changed": False,
        "atlas_pipeline_changed": False,
        "oracle_engine_changed": False,
        "new_timer": False,
        "new_fetch": False,
        "new_websocket": False,
        "new_observer": False,
        "storage_write": False,
        "real_orders": False,
        "kraken_network": False,
    }
    contract_path = Path("/tmp/contract_404268.json")
    contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    run(
        "python", str(RELEASE_DRIVER),
        "--build", BUILD,
        "--parent", PARENT,
        "--release", RELEASE,
        "--status", STATUS,
        "--contract-key", "simulation_operator_board_404268",
        "--contract-json", str(contract_path),
        "--lineage-note", "40.4.268 Simulation Operator Board: dense 40.4.267 technical cockpit default-collapsed; one-button Auto A start; large horizontal plain-language status/flow/decision cards; validated Strategy/Risk/Paper/metrics/5-min scheduler owners preserved; Market Core protected",
    )


def validate() -> None:
    text = APP.read_text(encoding="utf-8")
    required = (
        OWNER,
        'id="strategyAOperatorBoard404268"',
        'DÉMARRER AUTO A',
        'Ce que fait Auto A',
        'Détails techniques — ouvrir seulement si nécessaire',
        'strategyAAutoStart404265();',
        'strategyAAutoStop404265();',
        'strategyAApplyHumanReadability404267();',
        'strategyAApplyOperatorBoard404268();',
        'AgentCryptoStrategyAOperatorBoard404268',
    )
    for marker in required:
        if marker not in text:
            raise SystemExit(f"404268_FAIL: missing runtime marker {marker}")
    for forbidden in ("fetch(", "new WebSocket(", "new MutationObserver(", "new IntersectionObserver(", "localStorage.setItem(", "indexedDB.open("):
        block_start=text.index(OWNER)
        block_end=text.index(insertion_marker) if False else text.index('try{globalThis.AgentCryptoStrategyAHumanReadability404267=Object.freeze(', block_start)
        if forbidden in text[block_start:block_end]:
            raise SystemExit(f"404268_FAIL: forbidden new owner token {forbidden}")
    run("node", "--check", str(APP))
    run("node", "--check", str(BASE / "js/app.js"))
    run("python", str(VERSION_GUARD), "--expected-build", BUILD, "--expected-release", RELEASE)
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404268_FAIL: Market Core changed after release driver")


def package() -> tuple[Path, Path]:
    COORD.mkdir(parents=True, exist_ok=True)
    zip_path = COORD / "AGENT_CRYPTO_40_4_268_SIMULATION_OPERATOR_BOARD_SIMPLE_HUMAN_VIEW.zip"
    sha_path = COORD / "AGENT_CRYPTO_40_4_268_SIMULATION_OPERATOR_BOARD_SIMPLE_HUMAN_VIEW_SHA256.txt"
    members = [
        BASE / "app.js",
        BASE / "build.json",
        BASE / "administrator-version.json",
        BASE / "version.json",
        BASE / "index.html",
        BASE / "js/app.js",
        BASE / "js/views/system-presentation.js",
    ]
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in members:
            zf.write(path, path.relative_to(REPO))
    digest = sha256(zip_path)
    sha_path.write_text(f"{digest}  {zip_path.name}\n", encoding="utf-8")
    print(f"404268_ZIP={zip_path}")
    print(f"404268_SHA256={digest}")
    return zip_path, sha_path


def main() -> None:
    sync_system_tokens()
    patch_runtime()
    write_release_identity()
    validate()
    package()
    print("404268_SIMULATION_OPERATOR_BOARD_PASS")


if __name__ == "__main__":
    main()
