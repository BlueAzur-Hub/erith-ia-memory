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

BUILD = "40.4.266"
PARENT = "40.4.265"
ENGINE = "38.15.11"
RELEASE = "STRATEGY A · SIGNAL INPUT CONVERGENCE LOCK"
STATUS = "strategy_a_signal_input_convergence_lock_404266"
OWNER = "/* 40.4.266 — STRATEGY A · SIGNAL INPUT CONVERGENCE LOCK */"


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
            raise SystemExit(f"404266_FAIL: index System token count={index.count(old)}")
        INDEX.write_text(index.replace(old, new, 1), encoding="utf-8")

    text = SYSTEM_PRESENTATION.read_text(encoding="utf-8")
    old_source = f'const SOURCE="./views/system.html?v=administrator-build-{PARENT}";'
    new_source = f'const SOURCE="./views/system.html?v=administrator-build-{BUILD}";'
    if old_source in text:
        if text.count(old_source) != 1:
            raise SystemExit(f"404266_FAIL: System SOURCE token count={text.count(old_source)}")
        SYSTEM_PRESENTATION.write_text(text.replace(old_source, new_source, 1), encoding="utf-8")


def patch_runtime() -> None:
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("build")) != PARENT:
        raise SystemExit(f"404266_FAIL: expected parent {PARENT}, found {truth.get('build')}")
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404266_FAIL: protected Market Core identity changed")

    text = APP.read_text(encoding="utf-8")
    if OWNER in text:
        raise SystemExit("404266_FAIL: owner already present")

    btc_marker = "function strategyABtcContext404261(){"
    oracle_marker = "function strategyAOracleContext404261(){"
    local_marker = "function strategyALocalContext404261(){"
    for marker in (btc_marker, oracle_marker, local_marker):
        if text.count(marker) != 1:
            raise SystemExit(f"404266_FAIL: marker count {marker} = {text.count(marker)}")

    start = text.index(btc_marker)
    oracle_start = text.index(oracle_marker, start)
    local_start = text.index(local_marker, oracle_start)

    replacement = r'''/* 40.4.266 — STRATEGY A · SIGNAL INPUT CONVERGENCE LOCK */
/* Strategy A now reads the same canonical owners already used by the live UI:
   BTC 24h from atlasCurrentQuoteForCoin().change24h first, then stored coin fallbacks;
   Oracle from atlasOracleBuildModel(BTC), with the resident collapsed preview only as
   a presentation fallback. No Oracle model, Market Core, fetch, WebSocket or order owner changes. */
function strategyABtcContext404261(){
  let coin=null,quote=null;
  try{coin=findCoinByQuery?.("BTC")||state?.coins?.find?.(row=>String(row?.symbol||"").toUpperCase()==="BTC")||null;}catch(_){}
  try{if(coin)quote=atlasCurrentQuoteForCoin?.(coin)||null;}catch(_){}
  const price=strategyAReadNumber404261(quote?.price,coin?.price,coin?.current_price);
  const change24h=strategyAReadNumber404261(
    quote?.change24h,quote?.change_24h,quote?.change24hPct,quote?.changePct24h,
    coin?.change24h,coin?.price_change_percentage_24h,coin?.change_24h,coin?.change24hPct,coin?.changePct24h
  );
  const live24=Number.isFinite(Number(quote?.change24h));
  return {asset_id:String(coin?.id||"bitcoin"),symbol:"BTC",price_eur:price>0?price:null,change_24h_pct:change24h,quote_source:String(quote?.source||coin?.source||"UNKNOWN").trim()||"UNKNOWN",change_24h_owner:live24?"atlasCurrentQuoteForCoin.change24h":"coin_state_fallback",available:!!coin&&price>0};
}
function strategyAOracleContext404261(){
  let coin=null,model=null;
  try{coin=findCoinByQuery?.("BTC")||state?.coins?.find?.(row=>String(row?.symbol||"").toUpperCase()==="BTC")||null;}catch(_){}
  try{if(coin&&typeof atlasOracleBuildModel==="function")model=atlasOracleBuildModel(coin)||null;}catch(_){}
  const rawBias=String(model?.bias||"").trim().toUpperCase();
  const modelRegime=/HAUSSI/.test(rawBias)?"TENDANCE HAUSSIÈRE":/BAISS/.test(rawBias)?"TENDANCE BAISSIÈRE":/MIXTE|CONTRADICT/.test(rawBias)?"MIXTE":"UNKNOWN";
  const modelConfidence=strategyAReadNumber404261(model?.dataConfidence);
  const modelReady=!!coin&&!!model&&String(model?.status||"ready").toLowerCase()!=="waiting"&&modelRegime!=="UNKNOWN"&&Number.isFinite(modelConfidence);
  if(modelReady){
    return {available:true,active:true,regime:modelRegime,confidence:modelConfidence,informational_only:true,source:"atlasOracleBuildModel",asset_id:String(coin?.id||"bitcoin"),h24:strategyAReadNumber404261(model?.h24),direction_score:strategyAReadNumber404261(model?.directionScore)};
  }

  const preview=document.getElementById("atlasOracleCollapsedPreview40296");
  const biasText=String(document.getElementById("atlasOracleCollapsedBias40296")?.textContent||preview?.dataset?.bias||"").replace(/\s+/g," ").trim().toUpperCase();
  const previewBias=String(preview?.dataset?.bias||biasText).toUpperCase();
  const regime=/HAUSSI/.test(previewBias)?"TENDANCE HAUSSIÈRE":/BAISS/.test(previewBias)?"TENDANCE BAISSIÈRE":/MIXTE|CONTRADICT/.test(previewBias)?"MIXTE":"UNKNOWN";
  const confText=String(document.getElementById("atlasOracleCollapsedConfidence40296")?.textContent||"").replace(/\s+/g," ");
  const confMatch=confText.match(/(\d{1,3})\s*\/\s*100/);
  const confidence=confMatch?Number(confMatch[1]):null;
  const available=!!preview;
  const active=available&&regime!=="UNKNOWN"&&Number.isFinite(confidence);
  return {available,active,regime,confidence,informational_only:true,source:"oracle_collapsed_preview_40296",asset_id:String(coin?.id||"bitcoin"),h24:null,direction_score:null};
}
try{globalThis.AgentCryptoStrategyASignalInput404266=Object.freeze({build:"40.4.266",btc:strategyABtcContext404261,oracle:strategyAOracleContext404261,market_owner:"atlasCurrentQuoteForCoin.change24h",oracle_owner:"atlasOracleBuildModel",oracle_presentation_fallback:"atlasOracleCollapsedPreview40296",market_core_changed:false,oracle_engine_changed:false,new_fetch:false,new_websocket:false,new_observer:false,new_timer:false,storage_write:false,real_orders:false,kraken_network:false});}catch(_){}
'''

    text = text[:start] + replacement + "\n" + text[local_start:]

    old_finally = '''  }finally{\n    try{renderStrategySandboxExtensions404261();}catch(_){}\n    if(s.enabled){\n      const cooldownDelay=s.cooldown_until>Date.now()?Math.min(s.cadence_ms,Math.max(1000,s.cooldown_until-Date.now())):s.cadence_ms;\n      strategyAAutoSchedule404265(cooldownDelay);\n    }else{s.next_cycle_at=null;}\n  }'''
    new_finally = '''  }finally{\n    if(s.enabled){\n      const cooldownDelay=s.cooldown_until>Date.now()?Math.min(s.cadence_ms,Math.max(1000,s.cooldown_until-Date.now())):s.cadence_ms;\n      strategyAAutoSchedule404265(cooldownDelay);\n    }else{s.next_cycle_at=null;}\n    try{renderStrategySandboxExtensions404261();}catch(_){}\n  }'''
    if text.count(old_finally) != 1:
        raise SystemExit(f"404266_FAIL: Auto Runner finally owner count={text.count(old_finally)}")
    text = text.replace(old_finally, new_finally, 1)

    APP.write_text(text, encoding="utf-8")


def write_release_identity() -> None:
    contract = {
        "scope": "strategy_a_signal_input_convergence",
        "strategy": "STRATEGY_A_V1",
        "asset": "BTC",
        "market_signal_owner": "atlasCurrentQuoteForCoin.change24h",
        "oracle_signal_owner": "atlasOracleBuildModel(BTC)",
        "oracle_presentation_fallback": "atlasOracleCollapsedPreview40296",
        "auto_runner_next_cycle_display_fixed": True,
        "auto_runner_logic_changed": False,
        "risk_governor_changed": False,
        "paper_execution_changed": False,
        "reconciliation_changed": False,
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
    contract_path = Path("/tmp/contract_404266.json")
    contract_path.write_text(json.dumps(contract, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    run(
        "python", str(RELEASE_DRIVER),
        "--build", BUILD,
        "--parent", PARENT,
        "--release", RELEASE,
        "--status", STATUS,
        "--contract-key", "strategy_a_signal_input_convergence_404266",
        "--contract-json", str(contract_path),
        "--lineage-note", "40.4.266 Strategy A Signal Input Convergence: BTC 24h bound to live quote owner; Oracle bound directly to canonical atlasOracleBuildModel; Auto Runner next-cycle timestamp rendered after scheduling; zero Kraken network; Market Core protected",
    )


def validate() -> None:
    text = APP.read_text(encoding="utf-8")
    checks = {
        "owner": OWNER in text,
        "live_btc_owner": "quote?.change24h" in text,
        "canonical_oracle_owner": 'source:"atlasOracleBuildModel"' in text,
        "diagnostic_api": "AgentCryptoStrategyASignalInput404266" in text,
        "auto_runner_preserved": "AgentCryptoAutoPaperRunner404265" in text,
        "schedule_before_render": text.find("strategyAAutoSchedule404265(cooldownDelay);") < text.find("try{renderStrategySandboxExtensions404261();}catch(_){}", text.find("strategyAAutoSchedule404265(cooldownDelay);")),
    }
    failed = [name for name, ok in checks.items() if not ok]
    if failed:
        raise SystemExit("404266_FAIL: static checks: "+", ".join(failed))
    run("node", "--check", str(APP))
    run("node", "--check", str(BASE / "js/app.js"))
    run("python", str(VERSION_GUARD), "--expected-build", BUILD, "--expected-release", RELEASE)
    truth = json.loads((BASE / "build.json").read_text(encoding="utf-8"))
    if str(truth.get("engine")) != ENGINE:
        raise SystemExit("404266_FAIL: Market Core changed after release driver")


def package() -> tuple[Path, Path]:
    COORD.mkdir(parents=True, exist_ok=True)
    zip_path = COORD / "AGENT_CRYPTO_40_4_266_STRATEGY_A_SIGNAL_INPUT_CONVERGENCE.zip"
    sha_path = COORD / "AGENT_CRYPTO_40_4_266_STRATEGY_A_SIGNAL_INPUT_CONVERGENCE_SHA256.txt"
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
    print(f"404266_ZIP={zip_path}")
    print(f"404266_SHA256={digest}")
    return zip_path, sha_path


def main() -> None:
    sync_system_tokens()
    patch_runtime()
    write_release_identity()
    validate()
    package()
    print("404266_SIGNAL_INPUT_CONVERGENCE_PASS")


if __name__ == "__main__":
    main()
