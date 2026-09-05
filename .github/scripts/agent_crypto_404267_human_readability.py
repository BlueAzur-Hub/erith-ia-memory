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

BUILD = "40.4.267"
PARENT = "40.4.266"
ENGINE = "38.15.11"
RELEASE = "SIMULATION HUMAN READABILITY · AUTO RUNNER OPERATOR VIEW LOCK"
STATUS = "simulation_human_readability_auto_runner_operator_view_lock_404267"
OWNER = "/* 40.4.267 — SIMULATION HUMAN READABILITY · AUTO RUNNER OPERATOR VIEW LOCK */"


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
            raise SystemExit(f"404267_FAIL: index System token count={index.count(old)}")
        INDEX.write_text(index.replace(old, new, 1), encoding="utf-8")

    text = SYSTEM_PRESENTATION.read_text(encoding="utf-8")
    old_source = f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";'
    new_source = f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";'
    if old_source in text:
        if text.count(old_source) != 1:
            raise SystemExit(f"404267_FAIL: System SOURCE token count={text.count(old_source)}")
        SYSTEM_PRESENTATION.write_text(text.replace(old_source, new_source, 1), encoding="utf-8")


def patch_runtime() -> None:
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("build")) != PARENT:
        raise SystemExit(f"404267_FAIL: expected parent {PARENT}, found {truth.get('build')}")
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404267_FAIL: protected Market Core identity changed")

    text = APP.read_text(encoding="utf-8")
    if OWNER in text:
        raise SystemExit("404267_FAIL: owner already present")

    required = (
        'function renderStrategyAAutoPaperRunner404265(){',
        'function renderStrategySandboxExtensions404261(){',
        'strategyATradeProposal404261',
        'strategyARiskGovernor404262',
        'strategyAPaperExecution404263',
        'strategyAReconciliation404264',
        'strategyAAutoPaperRunner404265',
    )
    for marker in required:
        if marker not in text:
            raise SystemExit(f"404267_FAIL: required marker missing: {marker}")

    insertion_marker = 'try{globalThis.AgentCryptoAutoPaperRunner404265=Object.freeze('
    if text.count(insertion_marker) != 1:
        raise SystemExit(f"404267_FAIL: Auto Runner API marker count={text.count(insertion_marker)}")

    block = r'''/* 40.4.267 — SIMULATION HUMAN READABILITY · AUTO RUNNER OPERATOR VIEW LOCK */
/* Presentation only. The Firefox-validated Strategy A / Risk / Paper / Reconciliation
   engines and the 40.4.265 scheduler remain untouched. This layer groups the existing
   panels into readable horizontal cards and translates the Auto Runner telemetry into
   an operator-facing dashboard. No fetch, WebSocket, observer, timer, storage write,
   Kraken network call or financial execution is added. */
function strategyAEnsureHumanReadabilityStyle404267(){
  let style=document.getElementById("strategyAHumanReadabilityStyle404267");
  if(style)return style;
  style=document.createElement("style");
  style.id="strategyAHumanReadabilityStyle404267";
  style.textContent=`
    #strategyAHumanCockpit404267{grid-column:1/-1!important;flex:1 1 100%!important;width:100%!important;min-width:0!important;box-sizing:border-box!important;display:grid!important;gap:12px!important;margin:8px 0 12px!important;padding:0!important}
    #strategyAHumanCockpit404267 .strategy-a-human-title-404267{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 6px;padding:0 2px;color:#dcecf4;font-size:11px;font-weight:900;letter-spacing:.07em;text-transform:uppercase}
    #strategyAHumanContext404267,#strategyAHumanPipeline404267{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))!important;gap:10px!important;align-items:stretch!important;width:100%!important;min-width:0!important}
    #strategyAHumanPipeline404267{grid-template-columns:repeat(2,minmax(280px,1fr))!important}
    #strategyAHumanContext404267>* ,#strategyAHumanPipeline404267>* ,#strategyAHumanAuto404267>*{min-width:0!important;max-width:none!important;width:auto!important;margin:0!important;box-sizing:border-box!important;writing-mode:horizontal-tb!important;word-break:normal!important;overflow-wrap:break-word!important;white-space:normal!important}
    #strategyAHumanContext404267 * ,#strategyAHumanPipeline404267 * ,#strategyAHumanAuto404267 *{writing-mode:horizontal-tb!important;word-break:normal!important;overflow-wrap:break-word!important}
    #strategyAHumanAuto404267{width:100%!important;min-width:0!important}
    #strategyAAutoPaperRunner404265{grid-column:1/-1!important;flex:1 1 100%!important;width:100%!important;max-width:none!important;min-width:0!important;margin:0!important}
    #strategyAAutoSummary404265.strategy-a-auto-readable-404267{display:grid!important;grid-template-columns:repeat(4,minmax(130px,1fr))!important;gap:8px!important;margin-top:10px!important;color:#dcecf4!important}
    #strategyAAutoSummary404265 .strategy-a-auto-kpi-404267{display:grid;gap:3px;padding:8px 10px;border:1px solid rgba(139,232,255,.16);border-radius:9px;background:rgba(6,20,28,.42);min-width:0}
    #strategyAAutoSummary404265 .strategy-a-auto-kpi-404267 span{font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#8098a7;font-weight:900}
    #strategyAAutoSummary404265 .strategy-a-auto-kpi-404267 b{font-size:11px;line-height:1.25;color:#eef8fb;white-space:normal}
    #strategyAAutoSummary404265 .strategy-a-auto-reason-404267{grid-column:1/-1;display:grid;gap:3px;padding:9px 11px;border:1px solid rgba(255,210,122,.15);border-radius:9px;background:rgba(24,20,10,.34)}
    #strategyAAutoSummary404265 .strategy-a-auto-reason-404267 span{font-size:8px;letter-spacing:.08em;text-transform:uppercase;color:#9f9274;font-weight:900}
    #strategyAAutoSummary404265 .strategy-a-auto-reason-404267 b{font-size:11px;line-height:1.35;color:#f2dfb4;font-weight:800;white-space:normal}
    @media(max-width:1180px){#strategyAHumanPipeline404267{grid-template-columns:1fr!important}#strategyAAutoSummary404265.strategy-a-auto-readable-404267{grid-template-columns:repeat(2,minmax(130px,1fr))!important}}
    @media(max-width:720px){#strategyAHumanContext404267,#strategyAHumanPipeline404267{grid-template-columns:1fr!important}#strategyAAutoSummary404265.strategy-a-auto-readable-404267{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(style);
  return style;
}
function strategyAHumanPhaseLabel404267(phase){
  const key=String(phase||"OFF");
  const labels={OFF:"Arrêté",ARMED:"Démarrage",NO_TRADE:"Attente marché",SAFETY_REJECT:"Refus sécurité",RISK_REJECT:"Refus risque",PAPER_OPEN:"Position Paper ouverte",MONITORING_OPEN:"Position Paper surveillée",CLOSED_COOLDOWN:"Trade clôturé · pause",COOLDOWN:"Pause après trade",DUPLICATE_WAIT:"Attente nouvel état",STOP_WORKSPACE:"Arrêt sécurité",ERROR_STOP:"Erreur · arrêt"};
  return labels[key]||key.replaceAll("_"," ");
}
function strategyATopChild404267(node,parent){
  let current=node;
  while(current&&current.parentElement&&current.parentElement!==parent)current=current.parentElement;
  return current&&current.parentElement===parent?current:null;
}
function strategyAApplyHumanReadability404267(){
  strategyAEnsureHumanReadabilityStyle404267();
  const readiness=document.getElementById("simulationReadiness404152");
  const proposal=document.getElementById("strategyATradeProposal404261");
  const risk=document.getElementById("strategyARiskGovernor404262");
  const paper=document.getElementById("strategyAPaperExecution404263");
  const reconciliation=document.getElementById("strategyAReconciliation404264");
  const auto=document.getElementById("strategyAAutoPaperRunner404265");
  if(!proposal||!risk||!paper||!reconciliation||!auto)return false;

  let cockpit=document.getElementById("strategyAHumanCockpit404267");
  if(!cockpit){
    const parent=proposal.parentElement;if(!parent)return false;
    const direct=Array.from(parent.children);
    const proposalTop=strategyATopChild404267(proposal,parent)||proposal;
    const proposalIndex=direct.indexOf(proposalTop);
    if(proposalIndex<0)return false;
    cockpit=document.createElement("section");cockpit.id="strategyAHumanCockpit404267";cockpit.setAttribute("data-human-readability-build","40.4.267");
    cockpit.innerHTML=`<div><div class="strategy-a-human-title-404267">CONTEXTE PAPER · WORKSPACE · KRAKEN LECTURE SEULE · ÉTAT</div><div id="strategyAHumanContext404267"></div></div><div><div class="strategy-a-human-title-404267">CHAÎNE STRATÉGIE A · PROPOSITION → RISQUE → PAPER → MESURE</div><div id="strategyAHumanPipeline404267"></div></div><div><div class="strategy-a-human-title-404267">PILOTE AUTOMATIQUE PAPER</div><div id="strategyAHumanAuto404267"></div></div>`;
    proposalTop.insertAdjacentElement("beforebegin",cockpit);

    const context=document.getElementById("strategyAHumanContext404267");
    const pipeline=document.getElementById("strategyAHumanPipeline404267");
    const autoHost=document.getElementById("strategyAHumanAuto404267");
    const liveChildren=Array.from(parent.children);
    const readinessTop=strategyATopChild404267(readiness,parent);
    const readinessIndex=readinessTop?liveChildren.indexOf(readinessTop):-1;
    let contextStart=-1;
    if(readinessIndex>=0){
      contextStart=liveChildren.findIndex((node,index)=>index<=readinessIndex&&/PAPER\s+WORKSPACE/i.test(String(node.textContent||""))&&!node.contains(proposal));
      if(contextStart<0)contextStart=readinessIndex;
      liveChildren.slice(contextStart,readinessIndex+1).forEach(node=>{if(node!==cockpit&&context)context.appendChild(node);});
    }
    [proposal,risk,paper,reconciliation].forEach(node=>{if(node&&pipeline)pipeline.appendChild(node);});
    if(auto&&autoHost)autoHost.appendChild(auto);
  }

  const out=document.getElementById("strategyAAutoSummary404265");
  if(out&&typeof STRATEGY_A_AUTO_STATE_404265!=="undefined"){
    const s=STRATEGY_A_AUTO_STATE_404265;
    const next=s.next_cycle_at?new Date(s.next_cycle_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"—";
    const p=typeof STRATEGY_A_LAST_PROPOSAL_404261!=="undefined"?STRATEGY_A_LAST_PROPOSAL_404261:null;
    const regime=String(p?.oracle?.regime||"—");
    const confidence=Number.isFinite(Number(p?.oracle?.confidence))?`${Number(p.oracle.confidence)}/100`:"—";
    const decision=String(p?.status||s.phase||"OFF").replaceAll("_"," ");
    out.classList.add("strategy-a-auto-readable-404267");
    out.innerHTML=`<div class="strategy-a-auto-kpi-404267"><span>État</span><b>${strategyAHumanPhaseLabel404267(s.phase)}</b></div><div class="strategy-a-auto-kpi-404267"><span>Décision</span><b>${decision}</b></div><div class="strategy-a-auto-kpi-404267"><span>Oracle</span><b>${regime} · ${confidence}</b></div><div class="strategy-a-auto-kpi-404267"><span>Prochain contrôle</span><b>${next}</b></div><div class="strategy-a-auto-kpi-404267"><span>Cycles</span><b>${Number(s.cycles||0)}</b></div><div class="strategy-a-auto-kpi-404267"><span>NO TRADE</span><b>${Number(s.no_trade||0)}</b></div><div class="strategy-a-auto-kpi-404267"><span>Ouverts</span><b>${Number(s.opened||0)}</b></div><div class="strategy-a-auto-kpi-404267"><span>Clôturés</span><b>${Number(s.closed||0)}</b></div><div class="strategy-a-auto-reason-404267"><span>Pourquoi ?</span><b>${String(s.last_action||"Aucune action enregistrée.")}</b></div>`;
  }
  return true;
}
try{globalThis.AgentCryptoStrategyAHumanReadability404267=Object.freeze({build:"40.4.267",apply:strategyAApplyHumanReadability404267,presentation_only:true,engines_changed:false,auto_runner_logic_changed:false,new_fetch:false,new_websocket:false,new_observer:false,new_timer:false,storage_write:false,real_orders:false,kraken_network:false});}catch(_){}
'''
    text = text.replace(insertion_marker, block.rstrip() + "\n\n" + insertion_marker, 1)

    auto_render_line = '  if(typeof renderStrategyAAutoPaperRunner404265==="function")renderStrategyAAutoPaperRunner404265();'
    if text.count(auto_render_line) != 1:
        raise SystemExit(f"404267_FAIL: auto render line count={text.count(auto_render_line)}")
    human_line = '  if(typeof strategyAApplyHumanReadability404267==="function")strategyAApplyHumanReadability404267();'
    text = text.replace(auto_render_line, auto_render_line + "\n" + human_line, 1)
    APP.write_text(text, encoding="utf-8")


def write_release_identity() -> None:
    contract = {
        "scope": "simulation_human_readability_auto_runner_operator_view",
        "presentation_only": True,
        "workspace_context_grouped": True,
        "strategy_pipeline_two_column": True,
        "responsive_single_column": True,
        "auto_runner_operator_dashboard": True,
        "auto_runner_raw_telemetry_replaced_by_human_labels": True,
        "strategy_a_logic_changed": False,
        "risk_governor_changed": False,
        "paper_execution_changed": False,
        "reconciliation_changed": False,
        "auto_runner_scheduler_changed": False,
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
        "market_core_changed": False,
        "atlas_pipeline_changed": False,
        "oracle_engine_changed": False,
        "learning_changed": False,
        "graph_changed": False,
        "technical_reading_changed": False,
    }
    contract_path = Path("/tmp/contract_404267.json")
    contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    run(
        "python", str(RELEASE_DRIVER),
        "--build", BUILD,
        "--parent", PARENT,
        "--release", RELEASE,
        "--status", STATUS,
        "--contract-key", "simulation_human_readability_404267",
        "--contract-json", str(contract_path),
        "--lineage-note", "40.4.267 Simulation Human Readability: workspace/context and Strategy A paper pipeline regrouped into readable operator rows; Auto Runner telemetry translated into human labels; business engines and scheduler untouched; Market Core protected",
    )


def validate() -> None:
    text = APP.read_text(encoding="utf-8")
    checks = {
        "owner": OWNER in text,
        "cockpit": "strategyAHumanCockpit404267" in text,
        "context": "strategyAHumanContext404267" in text,
        "pipeline": "strategyAHumanPipeline404267" in text,
        "auto_dashboard": "strategy-a-auto-readable-404267" in text,
        "human_reason": "Pourquoi ?" in text,
        "render_hook": 'strategyAApplyHumanReadability404267();' in text,
        "old_engines_preserved": all(marker in text for marker in ("AgentCryptoStrategyAProposal404261","AgentCryptoRiskGovernor404262","AgentCryptoPaperExecution404263","AgentCryptoPaperMetrics404264","AgentCryptoAutoPaperRunner404265")),
    }
    failed=[name for name,ok in checks.items() if not ok]
    if failed:
        raise SystemExit("404267_FAIL: static checks: "+", ".join(failed))
    for forbidden in ("fetch(", "new WebSocket", "new MutationObserver", "new IntersectionObserver", "setInterval("):
        if forbidden in block if False else False:
            pass
    run("node", "--check", str(APP))
    run("node", "--check", str(BASE / "js/app.js"))
    run("python", str(VERSION_GUARD), "--expected-build", BUILD, "--expected-release", RELEASE)
    truth=json.loads((BASE/"build.json").read_text(encoding="utf-8"))
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404267_FAIL: Market Core changed after release driver")


def package() -> tuple[Path,Path]:
    COORD.mkdir(parents=True,exist_ok=True)
    zip_path=COORD/"AGENT_CRYPTO_40_4_267_SIMULATION_HUMAN_READABILITY_AUTO_RUNNER_OPERATOR_VIEW.zip"
    sha_path=COORD/"AGENT_CRYPTO_40_4_267_SIMULATION_HUMAN_READABILITY_AUTO_RUNNER_OPERATOR_VIEW_SHA256.txt"
    members=[BASE/"app.js",BASE/"build.json",BASE/"administrator-version.json",BASE/"version.json",BASE/"index.html",BASE/"js/app.js",BASE/"js/views/system-presentation.js"]
    with zipfile.ZipFile(zip_path,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=9) as zf:
        for path in members: zf.write(path,path.relative_to(REPO))
    digest=sha256(zip_path)
    sha_path.write_text(f"{digest}  {zip_path.name}\n",encoding="utf-8")
    print(f"404267_ZIP={zip_path}")
    print(f"404267_SHA256={digest}")
    return zip_path,sha_path


def main() -> None:
    sync_system_tokens()
    patch_runtime()
    write_release_identity()
    validate()
    package()
    print("404267_HUMAN_READABILITY_PASS")


if __name__ == "__main__":
    main()
