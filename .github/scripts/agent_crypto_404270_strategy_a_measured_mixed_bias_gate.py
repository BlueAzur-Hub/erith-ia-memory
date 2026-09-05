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

BUILD = "40.4.270"
PARENT = "40.4.269"
ENGINE = "38.15.11"
RELEASE = "STRATEGY A · MEASURED MIXED-BIAS ENTRY GATE LOCK"
STATUS = "strategy_a_measured_mixed_bias_entry_gate_lock_404270"
OWNER = "/* 40.4.270 — STRATEGY A · MEASURED MIXED-BIAS ENTRY GATE LOCK */"


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
            raise SystemExit(f"404270_FAIL: index System token count={index.count(old)}")
        INDEX.write_text(index.replace(old, new, 1), encoding="utf-8")

    text = SYSTEM_PRESENTATION.read_text(encoding="utf-8")
    old_source = f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";'
    new_source = f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";'
    if old_source in text:
        if text.count(old_source) != 1:
            raise SystemExit(f"404270_FAIL: System SOURCE token count={text.count(old_source)}")
        SYSTEM_PRESENTATION.write_text(text.replace(old_source, new_source, 1), encoding="utf-8")


def patch_runtime() -> None:
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("build")) != PARENT:
        raise SystemExit(f"404270_FAIL: expected parent {PARENT}, found {truth.get('build')}")
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404270_FAIL: protected Market Core identity changed")

    text = APP.read_text(encoding="utf-8")
    if OWNER in text:
        raise SystemExit("404270_FAIL: owner already present")

    proposal_marker = "function strategyATradeProposal404261(){"
    if text.count(proposal_marker) != 1:
        raise SystemExit(f"404270_FAIL: proposal marker count={text.count(proposal_marker)}")

    helper = r'''/* 40.4.270 — STRATEGY A · MEASURED MIXED-BIAS ENTRY GATE LOCK */
/* Paper-only admission refinement. The original HAUSSIER regime still passes exactly
   as before. A MIXTE regime may now reach the existing Risk Governor only when the
   canonical Oracle model carries a measurable positive directional bias AND stronger
   confidence, while BTC 24h is materially positive. No Market Core, Oracle model,
   Risk Governor, Paper executor, Kraken/network, persistence or real-order owner changes. */
const STRATEGY_A_MIXED_BIAS_GATE_404270=Object.freeze({min_direction_score:12,min_oracle_confidence:70,min_btc_24h_pct:0.10});
function strategyAMeasuredMixedBias404270(oracle,btc){
  const regime=String(oracle?.regime||"").toUpperCase();
  const mixed=/MIXTE|CONTRADICT/.test(regime)&&!/HAUSSI|BAISS/.test(regime);
  const direction=Number(oracle?.direction_score),confidence=Number(oracle?.confidence),btc24=Number(btc?.change_24h_pct);
  const directionOk=Number.isFinite(direction)&&direction>=STRATEGY_A_MIXED_BIAS_GATE_404270.min_direction_score;
  const confidenceOk=Number.isFinite(confidence)&&confidence>=STRATEGY_A_MIXED_BIAS_GATE_404270.min_oracle_confidence;
  const btcOk=Number.isFinite(btc24)&&btc24>=STRATEGY_A_MIXED_BIAS_GATE_404270.min_btc_24h_pct;
  return {eligible:mixed&&directionOk&&confidenceOk&&btcOk,mixed,direction_score:Number.isFinite(direction)?direction:null,confidence:Number.isFinite(confidence)?confidence:null,btc_24h_pct:Number.isFinite(btc24)?btc24:null,direction_ok:directionOk,confidence_ok:confidenceOk,btc_ok:btcOk,thresholds:STRATEGY_A_MIXED_BIAS_GATE_404270};
}
try{globalThis.AgentCryptoStrategyAMeasuredMixedBias404270=Object.freeze({build:"40.4.270",evaluate:strategyAMeasuredMixedBias404270,thresholds:STRATEGY_A_MIXED_BIAS_GATE_404270,paper_only:true,risk_governor_required:true,market_core_changed:false,oracle_engine_changed:false,risk_governor_changed:false,paper_execution_changed:false,new_fetch:false,new_websocket:false,new_observer:false,new_timer:false,storage_write:false,real_orders:false,kraken_network:false});}catch(_){}
'''
    text = text.replace(proposal_marker, helper + "\n" + proposal_marker, 1)

    old_line = '  const bullishRegime=/HAUSSI/.test(oracle.regime)&&!/BAISS/.test(oracle.regime);const reasons=[];let status="PROPOSED";'
    new_line = '  const bullishRegime=/HAUSSI/.test(oracle.regime)&&!/BAISS/.test(oracle.regime),mixedGate=strategyAMeasuredMixedBias404270(oracle,btc),entryRegimeOk=bullishRegime||mixedGate.eligible;const reasons=[];let status="PROPOSED";'
    if text.count(old_line) != 1:
        raise SystemExit(f"404270_FAIL: bullish baseline line count={text.count(old_line)}")
    text = text.replace(old_line, new_line, 1)

    old_gate = '  if(!bullishRegime){status="NO_TRADE";reasons.push(`Régime Oracle non haussier (${oracle.regime}).`);}'
    new_gate = '''  if(!entryRegimeOk){status="NO_TRADE";reasons.push(mixedGate.mixed?`Régime Oracle MIXTE sans biais mesuré suffisant (direction ${mixedGate.direction_score??"—"}/100, seuil +${STRATEGY_A_MIXED_BIAS_GATE_404270.min_direction_score}; confiance ${mixedGate.confidence??"—"}/100, seuil ${STRATEGY_A_MIXED_BIAS_GATE_404270.min_oracle_confidence}; BTC 24 h ${mixedGate.btc_24h_pct??"—"} %, seuil +${STRATEGY_A_MIXED_BIAS_GATE_404270.min_btc_24h_pct.toFixed(2)} %).`:`Régime Oracle non haussier (${oracle.regime}).`);}'''
    if text.count(old_gate) != 1:
        raise SystemExit(f"404270_FAIL: strict regime gate count={text.count(old_gate)}")
    text = text.replace(old_gate, new_gate, 1)

    old_reason = '  if(status==="PROPOSED")reasons.push("Baseline admissible : BTC 24 h positif + Oracle actif + régime haussier + confiance ≥ 55/100.");'
    new_reason = '''  if(status==="PROPOSED")reasons.push(bullishRegime?"Baseline admissible : BTC 24 h positif + Oracle actif + régime haussier + confiance ≥ 55/100.":`Gate 40.4.270 admissible : Oracle MIXTE avec biais haussier mesuré ${mixedGate.direction_score}/100 + confiance ${mixedGate.confidence}/100 + BTC 24 h ${Number(mixedGate.btc_24h_pct).toFixed(2)} % ; validation Risk Governor requise.`);'''
    if text.count(old_reason) != 1:
        raise SystemExit(f"404270_FAIL: baseline reason count={text.count(old_reason)}")
    text = text.replace(old_reason, new_reason, 1)

    old_fp = '  const fingerprint=[btc.price_eur??"na",btc.change_24h_pct??"na",oracle.regime,oracle.confidence??"na",local.cash_eur??"na",local.exposure_before_eur??"na",status].join("|");'
    new_fp = '  const fingerprint=[btc.price_eur??"na",btc.change_24h_pct??"na",oracle.regime,oracle.confidence??"na",oracle.direction_score??"na",bullishRegime?"BULLISH":"MIXED_GATE",mixedGate.eligible?"PASS":"FAIL",local.cash_eur??"na",local.exposure_before_eur??"na",status].join("|");'
    if text.count(old_fp) != 1:
        raise SystemExit(f"404270_FAIL: fingerprint line count={text.count(old_fp)}")
    text = text.replace(old_fp, new_fp, 1)

    old_entry = 'entry_condition:"BTC 24h > 0 + Oracle actif + régime haussier + confiance ≥ 55/100",invalidation_condition:"Donnée critique absente/dégradée, régime non haussier, Oracle inactif ou confiance < 55/100",requested_notional_eur:null'
    new_entry = 'entry_condition:"BTC 24h > 0 + Oracle actif + [régime haussier + confiance ≥ 55/100 OU MIXTE + direction ≥ +12/100 + confiance ≥ 70/100 + BTC 24h ≥ +0.10%]",invalidation_condition:"Donnée critique absente/dégradée, Oracle inactif, confiance insuffisante, régime baissier/contradictoire ou MIXTE sans biais mesuré suffisant",entry_gate:{build:"40.4.270",mode:bullishRegime?"BULLISH_BASELINE":"MEASURED_MIXED_BIAS",mixed_bias:mixedGate},requested_notional_eur:null'
    if text.count(old_entry) != 1:
        raise SystemExit(f"404270_FAIL: entry condition payload count={text.count(old_entry)}")
    text = text.replace(old_entry, new_entry, 1)

    APP.write_text(text, encoding="utf-8")


def write_release_identity() -> None:
    contract = {
        "scope": "strategy_a_measured_mixed_bias_entry_gate",
        "strategy": "STRATEGY_A_V1",
        "asset": "BTC",
        "mode": "paper_proposal_admission_only",
        "original_bullish_regime_path_preserved": True,
        "mixed_regime_admission": {
            "regime": "MIXTE",
            "min_direction_score": 12,
            "min_oracle_confidence": 70,
            "min_btc_24h_pct": 0.10,
            "risk_governor_still_required": True,
        },
        "risk_governor_changed": False,
        "paper_execution_changed": False,
        "reconciliation_changed": False,
        "auto_runner_changed": False,
        "market_core_changed": False,
        "oracle_engine_changed": False,
        "atlas_pipeline_changed": False,
        "graph_changed": False,
        "technical_reading_changed": False,
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
    contract_path = Path("/tmp/contract_404270.json")
    contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    run(
        "python", str(RELEASE_DRIVER),
        "--build", BUILD,
        "--parent", PARENT,
        "--release", RELEASE,
        "--status", STATUS,
        "--contract-key", "strategy_a_measured_mixed_bias_entry_gate_404270",
        "--contract-json", str(contract_path),
        "--lineage-note", "40.4.270 Strategy A measured MIXTE gate: original HAUSSIER baseline preserved; MIXTE may reach existing Risk Governor only with canonical direction score >= +12/100, Oracle confidence >= 70/100 and BTC 24h >= +0.10%; paper-only; Market Core/Oracle/Risk/Paper owners protected",
    )


def validate() -> None:
    text = APP.read_text(encoding="utf-8")
    required = (
        OWNER,
        "strategyAMeasuredMixedBias404270",
        "AgentCryptoStrategyAMeasuredMixedBias404270",
        "min_direction_score:12",
        "min_oracle_confidence:70",
        "min_btc_24h_pct:0.10",
        "entryRegimeOk=bullishRegime||mixedGate.eligible",
        "validation Risk Governor requise",
        'entry_gate:{build:"40.4.270"',
        "AgentCryptoStrategyASignalInput404266",
        "AgentCryptoAutoPaperRunner404265",
    )
    missing = [marker for marker in required if marker not in text]
    if missing:
        raise SystemExit("404270_FAIL: missing runtime markers: " + ", ".join(missing))
    if 'if(!bullishRegime){status="NO_TRADE"' in text:
        raise SystemExit("404270_FAIL: old strict MIXTE blocker still present")
    for forbidden in ("fetch(", "new WebSocket(", "new MutationObserver(", "new IntersectionObserver(", "localStorage.setItem(", "indexedDB.open("):
        block = text[text.index(OWNER):text.index(proposal_marker := "function strategyATradeProposal404261(){", text.index(OWNER))]
        if forbidden in block:
            raise SystemExit(f"404270_FAIL: forbidden side effect in gate helper: {forbidden}")
    run("node", "--check", str(APP))
    run("node", "--check", str(BASE / "js/app.js"))
    run("python", str(VERSION_GUARD), "--expected-build", BUILD, "--expected-release", RELEASE)
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404270_FAIL: Market Core changed after release driver")


def package() -> tuple[Path, Path]:
    COORD.mkdir(parents=True, exist_ok=True)
    zip_path = COORD / "AGENT_CRYPTO_40_4_270_STRATEGY_A_MEASURED_MIXED_BIAS_ENTRY_GATE.zip"
    sha_path = COORD / "AGENT_CRYPTO_40_4_270_STRATEGY_A_MEASURED_MIXED_BIAS_ENTRY_GATE_SHA256.txt"
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
    print(f"404270_ZIP={zip_path}")
    print(f"404270_SHA256={digest}")
    return zip_path, sha_path


def main() -> None:
    sync_system_tokens()
    patch_runtime()
    write_release_identity()
    validate()
    package()
    print("404270_STRATEGY_A_MEASURED_MIXED_BIAS_GATE_PASS")


if __name__ == "__main__":
    main()
