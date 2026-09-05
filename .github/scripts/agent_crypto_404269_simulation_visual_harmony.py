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

BUILD = "40.4.269"
PARENT = "40.4.268"
ENGINE = "38.15.11"
RELEASE = "SIMULATION VISUAL HARMONY · NATIVE OPERATOR CONSOLE LOCK"
STATUS = "simulation_visual_harmony_native_operator_console_lock_404269"
OWNER = "/* 40.4.269 — SIMULATION VISUAL HARMONY · NATIVE OPERATOR CONSOLE LOCK */"
ZIP_NAME = "AGENT_CRYPTO_40_4_269_SIMULATION_VISUAL_HARMONY_NATIVE_OPERATOR_CONSOLE.zip"
SHA_NAME = "AGENT_CRYPTO_40_4_269_SIMULATION_VISUAL_HARMONY_NATIVE_OPERATOR_CONSOLE_SHA256.txt"
REPORT_NAME = "AGENT_CRYPTO_40_4_269_SIMULATION_VISUAL_HARMONY_NATIVE_OPERATOR_CONSOLE_REPORT.md"


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
            raise SystemExit(f"404269_FAIL: index System token count={index.count(old)}")
        INDEX.write_text(index.replace(old, new, 1), encoding="utf-8")

    text = SYSTEM_PRESENTATION.read_text(encoding="utf-8")
    old_source = f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";'
    new_source = f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";'
    if old_source in text:
        if text.count(old_source) != 1:
            raise SystemExit(f"404269_FAIL: System SOURCE token count={text.count(old_source)}")
        SYSTEM_PRESENTATION.write_text(text.replace(old_source, new_source, 1), encoding="utf-8")


def patch_runtime() -> None:
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("build")) != PARENT:
        raise SystemExit(f"404269_FAIL: expected parent {PARENT}, found {truth.get('build')}")
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404269_FAIL: protected Market Core identity changed")

    text = APP.read_text(encoding="utf-8")
    if OWNER in text:
        raise SystemExit("404269_FAIL: owner already present")

    insertion_marker = 'try{globalThis.AgentCryptoStrategyAOperatorBoard404268=Object.freeze('
    if text.count(insertion_marker) != 1:
        raise SystemExit(f"404269_FAIL: 40.4.268 API marker count={text.count(insertion_marker)}")

    block = r'''/* 40.4.269 — SIMULATION VISUAL HARMONY · NATIVE OPERATOR CONSOLE LOCK */
/* Presentation only. The 40.4.268 simple board is retired from the normal flow because
   operator validation found it visually disconnected from the native Administrator UI.
   This layer mounts one compact console directly below the existing Assistant feedback,
   reuses the validated Auto A owners, and keeps the dense 40.4.267 cockpit behind a
   genuinely closed technical disclosure. No business engine, fetch, WebSocket, timer,
   storage, Kraken request or real-order behavior is added or changed. */
function strategyAEnsureVisualHarmonyStyle404269(){
  let style=document.getElementById("strategyAVisualHarmonyStyle404269");
  if(style)return style;
  style=document.createElement("style");
  style.id="strategyAVisualHarmonyStyle404269";
  style.textContent=`
    #strategyAOperatorBoard404268{display:none!important}
    #strategyAVisualConsole404269{width:100%!important;min-width:0!important;margin:12px 0 14px!important;border:1px solid rgba(65,189,219,.28)!important;border-radius:14px!important;background:linear-gradient(180deg,rgba(3,17,27,.88),rgba(3,12,20,.94))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035),0 14px 36px rgba(0,0,0,.18)!important;overflow:hidden!important;color:#eaf5fa!important}
    #strategyAVisualConsole404269 *{box-sizing:border-box!important;writing-mode:horizontal-tb!important;word-break:normal!important;overflow-wrap:break-word!important}
    #strategyAVisualConsole404269 .avc-head-404269{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;padding:12px 14px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;background:linear-gradient(90deg,rgba(16,55,75,.30),rgba(30,20,62,.16) 60%,rgba(8,33,29,.14))!important}
    #strategyAVisualConsole404269 .avc-title-404269{display:flex!important;align-items:center!important;gap:10px!important;min-width:0!important}
    #strategyAVisualConsole404269 .avc-mark-404269{display:grid!important;place-items:center!important;width:36px!important;height:36px!important;border:1px solid rgba(92,224,255,.30)!important;border-radius:10px!important;background:rgba(37,145,179,.12)!important;color:#7ce8ff!important;font-size:18px!important;flex:0 0 auto!important}
    #strategyAVisualConsole404269 .avc-kicker-404269{display:block!important;margin-bottom:2px!important;font-size:8px!important;font-weight:900!important;letter-spacing:.13em!important;text-transform:uppercase!important;color:#72dff5!important}
    #strategyAVisualConsole404269 h3{margin:0!important;font-size:16px!important;line-height:1.15!important;color:#f5fbff!important;font-weight:950!important;letter-spacing:.01em!important}
    #strategyAVisualConsole404269 .avc-actions-404269{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;justify-content:flex-end!important}
    #strategyAVisualConsole404269 .avc-state-pill-404269{display:inline-flex!important;align-items:center!important;min-height:32px!important;padding:6px 10px!important;border-radius:999px!important;border:1px solid rgba(116,238,208,.24)!important;background:rgba(32,142,115,.10)!important;color:#8af2d7!important;font-size:10px!important;font-weight:950!important;letter-spacing:.04em!important;text-transform:uppercase!important}
    #strategyAVisualConsole404269 .avc-actions-404269 button{min-height:34px!important;padding:7px 12px!important;font-size:10px!important;font-weight:950!important;white-space:nowrap!important}
    #strategyAVisualConsole404269 .avc-body-404269{padding:12px 14px 13px!important}
    #strategyAVisualConsole404269 .avc-reason-404269{display:flex!important;align-items:center!important;gap:10px!important;min-height:42px!important;margin-bottom:11px!important;padding:9px 11px!important;border:1px solid rgba(255,255,255,.07)!important;border-radius:10px!important;background:rgba(255,255,255,.025)!important}
    #strategyAVisualConsole404269 .avc-reason-label-404269{flex:0 0 auto!important;font-size:8px!important;font-weight:900!important;letter-spacing:.10em!important;text-transform:uppercase!important;color:#7894a3!important}
    #strategyAVisualConsole404269 .avc-reason-404269 b{font-size:11px!important;line-height:1.35!important;color:#dce9ef!important;font-weight:800!important}
    #strategyAVisualConsole404269 .avc-flow-404269{display:grid!important;grid-template-columns:1fr 22px 1fr 22px 1fr 22px 1fr!important;gap:7px!important;align-items:center!important;margin-bottom:11px!important}
    #strategyAVisualConsole404269 .avc-arrow-404269{text-align:center!important;color:#536d7c!important;font-size:15px!important;font-weight:900!important}
    #strategyAVisualConsole404269 .avc-stage-404269{display:grid!important;grid-template-columns:30px minmax(0,1fr)!important;gap:8px!important;align-items:center!important;min-height:58px!important;padding:8px 10px!important;border-radius:10px!important;background:rgba(7,24,33,.62)!important;border:1px solid rgba(255,255,255,.075)!important;min-width:0!important}
    #strategyAVisualConsole404269 .avc-stage-num-404269{display:grid!important;place-items:center!important;width:28px!important;height:28px!important;border-radius:8px!important;font-size:10px!important;font-weight:950!important}
    #strategyAVisualConsole404269 .avc-stage-404269 b{display:block!important;font-size:11px!important;line-height:1.2!important;color:#f0f7fb!important}
    #strategyAVisualConsole404269 .avc-stage-404269 small{display:block!important;margin-top:3px!important;font-size:9px!important;line-height:1.25!important;color:#8199a7!important}
    #strategyAVisualConsole404269 .avc-market-404269{border-color:rgba(71,203,236,.19)!important}.avc-market-404269 .avc-stage-num-404269{background:rgba(40,170,205,.13)!important;color:#6be5ff!important;border:1px solid rgba(71,203,236,.22)!important}
    #strategyAVisualConsole404269 .avc-oracle-404269{border-color:rgba(162,118,239,.18)!important}.avc-oracle-404269 .avc-stage-num-404269{background:rgba(124,75,203,.13)!important;color:#c9a7ff!important;border:1px solid rgba(162,118,239,.23)!important}
    #strategyAVisualConsole404269 .avc-risk-404269{border-color:rgba(234,192,93,.18)!important}.avc-risk-404269 .avc-stage-num-404269{background:rgba(179,126,25,.12)!important;color:#f4d27f!important;border:1px solid rgba(234,192,93,.22)!important}
    #strategyAVisualConsole404269 .avc-paper-404269{border-color:rgba(91,219,171,.18)!important}.avc-paper-404269 .avc-stage-num-404269{background:rgba(34,153,114,.12)!important;color:#82efc6!important;border:1px solid rgba(91,219,171,.22)!important}
    #strategyAVisualConsole404269 .avc-kpis-404269{display:grid!important;grid-template-columns:1.15fr .9fr 1fr .9fr 1fr!important;gap:8px!important}
    #strategyAVisualConsole404269 .avc-kpi-404269{min-width:0!important;padding:8px 9px!important;border-radius:9px!important;border:1px solid rgba(255,255,255,.065)!important;background:rgba(0,0,0,.15)!important}
    #strategyAVisualConsole404269 .avc-kpi-404269 span{display:block!important;margin-bottom:3px!important;font-size:7px!important;font-weight:900!important;letter-spacing:.08em!important;text-transform:uppercase!important;color:#718b99!important}
    #strategyAVisualConsole404269 .avc-kpi-404269 b{display:block!important;font-size:10px!important;line-height:1.3!important;color:#eef7fb!important;font-weight:900!important}
    #strategyAVisualConsole404269 .avc-foot-404269{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;flex-wrap:wrap!important;margin-top:10px!important;padding-top:9px!important;border-top:1px solid rgba(255,255,255,.055)!important}
    #strategyAVisualConsole404269 .avc-safety-404269{font-size:8px!important;line-height:1.3!important;color:#6f8997!important;font-weight:800!important;letter-spacing:.04em!important;text-transform:uppercase!important}
    #strategyAVisualConsole404269 .avc-metrics-404269{font-size:9px!important;line-height:1.3!important;color:#aac0cb!important;text-align:right!important}
    #strategyATechDetails404269{width:100%!important;margin:0 0 12px!important;border:1px solid rgba(255,255,255,.06)!important;border-radius:10px!important;background:rgba(3,12,18,.40)!important;overflow:hidden!important}
    #strategyATechDetails404269>summary{cursor:pointer!important;padding:9px 12px!important;font-size:9px!important;font-weight:900!important;letter-spacing:.07em!important;text-transform:uppercase!important;color:#718b99!important;list-style-position:inside!important}
    #strategyATechDetails404269[open]>summary{border-bottom:1px solid rgba(255,255,255,.06)!important}
    #strategyATechHost404269{padding:10px!important}
    #strategyATechHost404269 #strategyAHumanCockpit404267{display:grid!important;margin:0!important;width:100%!important}
    @media(max-width:1080px){#strategyAVisualConsole404269 .avc-flow-404269{grid-template-columns:1fr 1fr!important}#strategyAVisualConsole404269 .avc-arrow-404269{display:none!important}#strategyAVisualConsole404269 .avc-kpis-404269{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    @media(max-width:700px){#strategyAVisualConsole404269 .avc-head-404269{align-items:flex-start!important;flex-direction:column!important}#strategyAVisualConsole404269 .avc-actions-404269{width:100%!important;justify-content:stretch!important}#strategyAVisualConsole404269 .avc-actions-404269 button{flex:1 1 auto!important}#strategyAVisualConsole404269 .avc-flow-404269,#strategyAVisualConsole404269 .avc-kpis-404269{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(style);
  return style;
}
function strategyAVisualPhase404269(s,p,open){
  if(!s?.enabled)return {label:"ARRÊTÉ",reason:"Pilote Paper inactif. Active Auto A pour laisser la chaîne travailler seule toutes les 5 minutes."};
  if(open)return {label:"PAPER OUVERT",reason:String(s.last_action||"Position fictive ouverte et surveillée.")};
  const phase=String(s?.phase||"");
  if(phase==="NO_TRADE")return {label:"ATTENTE MARCHÉ",reason:String(p?.reason||s.last_action||"Aucune condition d'entrée valide pour le moment.")};
  if(phase==="SAFETY_REJECT"||phase==="RISK_REJECT")return {label:"REFUS SÉCURITÉ",reason:String(s.last_action||"Le gouverneur de risque a refusé la proposition.")};
  if(phase.includes("COOLDOWN"))return {label:"PAUSE",reason:String(s.last_action||"Pause de sécurité après trade Paper.")};
  if(phase.includes("ERROR")||phase.includes("STOP"))return {label:"ARRÊT SÉCURITÉ",reason:String(s.last_action||"Le pilote s'est arrêté par sécurité.")};
  return {label:"AUTO A ACTIF",reason:String(s.last_action||"Cycle automatique actif.")};
}
function strategyAApplyVisualHarmony404269(){
  strategyAEnsureVisualHarmonyStyle404269();
  const simulation=document.getElementById("simulation");
  const feedback=document.getElementById("actionFeedback");
  const oldBoard=document.getElementById("strategyAOperatorBoard404268");
  const oldCockpit=document.getElementById("strategyAHumanCockpit404267");
  if(!simulation||!feedback||!oldBoard||!oldCockpit)return false;

  let board=document.getElementById("strategyAVisualConsole404269");
  if(!board){
    board=document.createElement("section");
    board.id="strategyAVisualConsole404269";
    board.setAttribute("data-visual-harmony-build","40.4.269");
    board.innerHTML=`<div class="avc-head-404269"><div class="avc-title-404269"><span class="avc-mark-404269" aria-hidden="true">◇</span><div><span class="avc-kicker-404269">STRATÉGIE A · PAPER AUTOMATIQUE</span><h3>Pilote de simulation</h3></div></div><div class="avc-actions-404269"><span class="avc-state-pill-404269" id="strategyAVisualState404269">ARRÊTÉ</span><button type="button" class="btn" id="strategyAVisualStart404269">ACTIVER AUTO A</button><button type="button" class="btn small" id="strategyAVisualStop404269">STOP</button></div></div><div class="avc-body-404269"><div class="avc-reason-404269"><span class="avc-reason-label-404269">Lecture</span><b id="strategyAVisualReason404269">Lecture de l'état…</b></div><div class="avc-flow-404269"><div class="avc-stage-404269 avc-market-404269"><span class="avc-stage-num-404269">01</span><div><b>BTC</b><small>prix + variation 24 h</small></div></div><span class="avc-arrow-404269">→</span><div class="avc-stage-404269 avc-oracle-404269"><span class="avc-stage-num-404269">02</span><div><b>Oracle</b><small>régime + confiance</small></div></div><span class="avc-arrow-404269">→</span><div class="avc-stage-404269 avc-risk-404269"><span class="avc-stage-num-404269">03</span><div><b>Risk Governor</b><small>accepte · réduit · refuse</small></div></div><span class="avc-arrow-404269">→</span><div class="avc-stage-404269 avc-paper-404269"><span class="avc-stage-num-404269">04</span><div><b>Paper + mesure</b><small>fill fictif · P/L · frais</small></div></div></div><div class="avc-kpis-404269"><div class="avc-kpi-404269"><span>Décision</span><b id="strategyAVisualDecision404269">—</b></div><div class="avc-kpi-404269"><span>BTC 24 h</span><b id="strategyAVisualBtc404269">—</b></div><div class="avc-kpi-404269"><span>Oracle</span><b id="strategyAVisualOracle404269">—</b></div><div class="avc-kpi-404269"><span>Paper</span><b id="strategyAVisualPaper404269">—</b></div><div class="avc-kpi-404269"><span>Prochain cycle</span><b id="strategyAVisualNext404269">—</b></div></div><div class="avc-foot-404269"><div class="avc-safety-404269">SESSION LOCALE · 5 MIN · AUCUN ORDRE RÉEL · KRAKEN LECTURE SEULE</div><div class="avc-metrics-404269" id="strategyAVisualMetrics404269">0 trade · P/L 0,00 € · frais 0,00 €</div></div></div>`;
    feedback.insertAdjacentElement("afterend",board);
    board.querySelector("#strategyAVisualStart404269")?.addEventListener("click",()=>{strategyAAutoStart404265();renderStrategySandboxExtensions404261();});
    board.querySelector("#strategyAVisualStop404269")?.addEventListener("click",()=>{strategyAAutoStop404265();renderStrategySandboxExtensions404261();});
  }

  let tech=document.getElementById("strategyATechDetails404269");
  if(!tech){
    tech=document.createElement("details");tech.id="strategyATechDetails404269";
    tech.innerHTML=`<summary>Mode technique · Proposal / Risk / Paper / Reconciliation / Kraken</summary><div id="strategyATechHost404269"></div>`;
    board.insertAdjacentElement("afterend",tech);
  }
  const host=document.getElementById("strategyATechHost404269");
  if(host&&oldCockpit.parentElement!==host)host.appendChild(oldCockpit);
  tech.open=false;

  oldBoard.style.display="none";
  const s=typeof STRATEGY_A_AUTO_STATE_404265!=="undefined"?STRATEGY_A_AUTO_STATE_404265:null;
  const p=typeof STRATEGY_A_LAST_PROPOSAL_404261!=="undefined"?STRATEGY_A_LAST_PROPOSAL_404261:null;
  const ledger=typeof STRATEGY_A_PAPER_LEDGER_404263!=="undefined"?STRATEGY_A_PAPER_LEDGER_404263:[];
  const open=Array.from(ledger||[]).slice().reverse().find(row=>row&&row.status==="PAPER_OPEN")||null;
  const metrics=typeof strategyAMetrics404264==="function"?strategyAMetrics404264():null;
  const phase=strategyAVisualPhase404269(s,p,open);
  const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value;};
  set("strategyAVisualState404269",phase.label);
  set("strategyAVisualReason404269",phase.reason);
  set("strategyAVisualDecision404269",String(p?.status||s?.phase||"—").replaceAll("_"," "));
  const h24=Number(p?.market?.change_24h_pct);set("strategyAVisualBtc404269",Number.isFinite(h24)?`${h24>=0?"+":""}${h24.toFixed(2)} %`:"—");
  const conf=Number(p?.oracle?.confidence);set("strategyAVisualOracle404269",p?.oracle?.regime?`${p.oracle.regime}${Number.isFinite(conf)?` · ${conf}/100`:""}`:"—");
  set("strategyAVisualPaper404269",open?`OUVERT · ${Number(open.authorized_notional_eur||0).toFixed(2)} €`:"AUCUNE POSITION");
  const next=s?.next_cycle_at?new Date(s.next_cycle_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):"—";set("strategyAVisualNext404269",next);
  const sample=Number(metrics?.sample_size||0),pnl=Number(metrics?.cumulative_net_pnl_eur||0),fees=Number(metrics?.total_fees_eur||0);
  set("strategyAVisualMetrics404269",`${sample} trade${sample===1?"":"s"} · P/L ${pnl.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} € · frais ${fees.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} €`);
  const start=document.getElementById("strategyAVisualStart404269"),stop=document.getElementById("strategyAVisualStop404269");
  if(start){start.disabled=!!s?.enabled;start.textContent=s?.enabled?"AUTO A ACTIF":"ACTIVER AUTO A";}
  if(stop)stop.disabled=!s?.enabled;
  return true;
}
try{globalThis.AgentCryptoStrategyAVisualHarmony404269=Object.freeze({build:"40.4.269",apply:strategyAApplyVisualHarmony404269,presentation_only:true,native_simulation_mount:true,technical_default_closed:true,engines_changed:false,auto_runner_logic_changed:false,new_fetch:false,new_websocket:false,new_observer:false,new_timer:false,storage_write:false,real_orders:false,kraken_network:false});}catch(_){}
'''
    text = text.replace(insertion_marker, block.rstrip() + "\n\n" + insertion_marker, 1)

    old_tail = '  if(typeof strategyAApplyOperatorBoard404268==="function")strategyAApplyOperatorBoard404268();\n}'
    new_tail = '  if(typeof strategyAApplyOperatorBoard404268==="function")strategyAApplyOperatorBoard404268();\n  if(typeof strategyAApplyVisualHarmony404269==="function")strategyAApplyVisualHarmony404269();\n}'
    if text.count(old_tail) != 1:
        raise SystemExit(f"404269_FAIL: render tail count={text.count(old_tail)}")
    text = text.replace(old_tail, new_tail, 1)
    APP.write_text(text, encoding="utf-8")


def release_identity() -> None:
    contract = {
        "scope": "simulation_strategy_a_operator_presentation_only",
        "native_mount": "simulation_after_action_feedback",
        "previous_operator_board_hidden": True,
        "technical_ui_preserved": True,
        "technical_default_closed": True,
        "strategy_a_changed": False,
        "risk_governor_changed": False,
        "paper_execution_changed": False,
        "reconciliation_changed": False,
        "auto_runner_logic_changed": False,
        "market_core_changed": False,
        "oracle_engine_changed": False,
        "atlas_pipeline_changed": False,
        "learning_changed": False,
        "graph_changed": False,
        "technical_reading_changed": False,
        "new_fetch": False,
        "new_websocket": False,
        "new_observer": False,
        "new_timer": False,
        "storage_write": False,
        "kraken_network": False,
        "real_orders": False,
        "firefox_validation_required": True,
    }
    contract_path = REPO / ".github/scripts/.agent_crypto_404269_contract.json"
    contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    try:
        run(
            "python", str(RELEASE_DRIVER),
            "--build", BUILD,
            "--parent", PARENT,
            "--release", RELEASE,
            "--status", STATUS,
            "--contract-key", "strategy_a_visual_harmony_404269",
            "--contract-json", str(contract_path),
            "--lineage-note", "40.4.269 Simulation visual harmony: compact native Auto A console mounted in the Simulation flow; 40.4.267/268 technical presentation retained but removed from normal operator view",
        )
    finally:
        contract_path.unlink(missing_ok=True)


def validate() -> None:
    run("node", "--check", str(APP))
    run("python", str(VERSION_GUARD), "--expected-build", BUILD, "--expected-release", RELEASE)
    text = APP.read_text(encoding="utf-8")
    required = (
        OWNER,
        'id="strategyAVisualConsole404269"',
        'feedback.insertAdjacentElement("afterend",board)',
        'id="strategyATechDetails404269"',
        'tech.open=false',
        'strategyAAutoStart404265();renderStrategySandboxExtensions404261();',
        'strategyAAutoStop404265();renderStrategySandboxExtensions404261();',
        'strategyAApplyVisualHarmony404269();',
        'AgentCryptoStrategyAVisualHarmony404269',
    )
    for marker in required:
        if marker not in text:
            raise SystemExit(f"404269_FAIL: missing runtime marker {marker}")
    block = text[text.index(OWNER):text.index(insertion_marker) if False else text.index('try{globalThis.AgentCryptoStrategyAVisualHarmony404269=Object.freeze')]
    for forbidden in ("fetch(", "new WebSocket(", "new MutationObserver(", "new IntersectionObserver(", "localStorage.setItem(", "indexedDB.open("):
        if forbidden in block:
            raise SystemExit(f"404269_FAIL: forbidden presentation behavior {forbidden}")


def package() -> None:
    COORD.mkdir(parents=True, exist_ok=True)
    report = COORD / REPORT_NAME
    report.write_text(
        "# Agent-Crypto 40.4.269 — Simulation Visual Harmony\n\n"
        "- Parent: 40.4.268\n"
        "- Market Core: 38.15.11 (protected)\n"
        "- Scope: presentation only\n"
        "- Operator correction: the 40.4.268 board was readable but visually disconnected and mounted inside a narrow technical flow.\n"
        "- New behavior: one compact Auto A console is mounted directly below the native Assistant feedback at full Simulation width.\n"
        "- Technical Proposal/Risk/Paper/Reconciliation/Kraken cockpit is preserved behind a closed disclosure.\n"
        "- Strategy A / Risk Governor / Paper / Reconciliation / Auto Runner logic unchanged.\n"
        "- No Kraken network, no real orders, no storage write, no new timer/fetch/WebSocket/observer.\n"
        "- Firefox operator validation required.\n",
        encoding="utf-8",
    )
    files = [
        BASE / "app.js",
        BASE / "js/app.js",
        BASE / "index.html",
        BASE / "build.json",
        BASE / "version.json",
        BASE / "administrator-version.json",
        SYSTEM_PRESENTATION,
        report,
    ]
    zip_path = COORD / ZIP_NAME
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for path in files:
            zf.write(path, path.relative_to(REPO).as_posix())
    (COORD / SHA_NAME).write_text(f"{sha256(zip_path)}  {ZIP_NAME}\n", encoding="utf-8")


def main() -> int:
    sync_system_tokens()
    patch_runtime()
    release_identity()
    validate()
    package()
    print(json.dumps({"ok": True, "build": BUILD, "release": RELEASE, "zip": ZIP_NAME, "sha256": sha256(COORD / ZIP_NAME)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
