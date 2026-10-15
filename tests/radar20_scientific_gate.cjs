#!/usr/bin/env node
"use strict";
/*
 * Radar20 evidence gate. Read-only; no network, API keys, orders, or data writes.
 * An integrity PASS means source files are mutually consistent, NOT profitable.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const PREFIX="public/agent_crypto_erith_ia/data/trader_flux/";
function insist(ok,why){if(!ok)throw new Error("EVIDENCE_INTEGRITY_FAILURE: "+why);}
function read(root,relative){return fs.readFileSync(path.join(root,PREFIX,relative));}
function data(root,relative){return JSON.parse(read(root,relative).toString("utf8"));}
function digest(buf){return crypto.createHash("sha256").update(buf).digest("hex");}
function finite(n){return typeof n==="number"&&Number.isFinite(n);}
function rounded(n,d=2){return Number(n.toFixed(d));}
function evaluate(frozen,forwardIndex,forward,executionIndex,history,stress,observations){
  insist(frozen.schema==="erith.trader.radar20.forward-protocol.v1","forward protocol schema");
  insist(Array.isArray(frozen.symbols)&&frozen.symbols.length===20&&new Set(frozen.symbols).size===20,"20 unique locked markets");
  insist(frozen.simulation_only===true&&frozen.trading_orders_enabled===false,"locked simulation-only protocol");
  insist(forwardIndex.schema==="erith.radar20.forward.index.v1"&&forwardIndex.orders_enabled===false,"forward index read-only");
  insist(forwardIndex.config_sha256===forward.protocol_sha256&&forward.protocol_sha256===executionIndex.protocol_sha256,"consistent protocol fingerprints");
  insist(forward.schema==="erith.radar20.forward.summary.v1"&&forward.no_live_orders===true&&forward.strategy_certified===false,"forward is uncertified and read-only");
  insist(Array.isArray(forwardIndex.days)&&forward.days_collected===forwardIndex.days.length,"forward collection counters match");
  insist(Number.isInteger(frozen.test_days)&&frozen.test_days===90&&frozen.holding_hours===48,"immutable forward and settlement durations");
  const settlementDays=Math.ceil(frozen.holding_hours/24),sourceDays=frozen.test_days+settlementDays;
  insist(Number.isInteger(forward.days_collected)&&forward.days_collected>=0&&forward.days_collected<=sourceDays,"forward source days include bounded 48h settlement");
  const expectedStatus=forward.days_collected===0?"WAITING_FOR_FIRST_DAY":forward.days_collected===sourceDays?"COMPLETE":"RUNNING";
  insist(forward.status===expectedStatus,"forward status matches collection and settlement");
  const signalDays=Math.min(forward.days_collected,frozen.test_days);
  insist(forwardIndex.days.every((day,i)=>day.day===new Date(Date.parse(frozen.start_day_utc+"T00:00:00Z")+i*86400000).toISOString().slice(0,10)),"forward days contiguous from frozen start");
  insist(history.orders_enabled===false&&history.primary&&history.primary.capital_usdt===frozen.capital_usdt,"historical portfolio isolation");
  insist(stress.orders_enabled===false&&stress.primary&&stress.primary.capital_usdt===frozen.capital_usdt,"retrospective portfolio isolation");
  insist(history.strategy_certified!==true&&stress.strategy_certified===false,"historical models uncertified");
  insist(executionIndex.orders_enabled===false&&executionIndex.simulations_only===true&&executionIndex.account_fees_published===false,"execution index never claims fills or account fees");
  const checkQuarter=(v,label)=>{
    insist(finite(v.total_profit_net_usdt)&&finite(v.drawdown_pct)&&finite(v.completed_trades),"valid "+label+" metrics");
    insist(Math.abs((v.final_cash_usdt-frozen.capital_usdt)-v.total_profit_net_usdt)<0.02,"capital arithmetic "+label);
    return {label,trades:v.completed_trades,net_usdt:rounded(v.total_profit_net_usdt,2),max_drawdown_pct:rounded(v.drawdown_pct,2),assumed_roundtrip_cost_pct:v.assumed_roundtrip_fee_pct,source:"retrospective Binance Spot USDT (hypothetical fills)"};
  };
  const quarters=[checkQuarter(stress.primary,"2026-04..2026-06"),checkQuarter(history.primary,"2026-07..2026-09")];
  insist(Array.isArray(observations)&&observations.length===executionIndex.observations.length,"all execution observations inspected");
  let candidates=0,publicBooks=0,delayed=0;
  for(const [i,o] of observations.entries()){
    const meta=executionIndex.observations[i];
    insist(o.schema==="erith.trader.radar20.execution-witness.v1"&&o.protocol_sha256===executionIndex.protocol_sha256,"witness protocol "+meta.file);
    insist(o.orders_enabled===false&&o.paper_only===true&&o.not_an_order_fill===true&&o.authenticated_account_data_accessed===false&&o.authenticated_fee_included===false,"witness contains no real fill/fee "+meta.file);
    insist(Array.isArray(o.signals)&&Array.isArray(o.okx_books),"witness arrays "+meta.file);
    insist(meta.signal_candidates===o.signals.length&&meta.okx_book_reports===o.okx_books.length,"witness counters "+meta.file);
    insist(o.source_status===meta.source_status,"witness source coverage "+meta.file);
    insist(finite(o.offset_after_hour_seconds)&&o.offset_after_hour_seconds>=0,"witness observation time "+meta.file);
    candidates+=o.signals.length;publicBooks+=o.okx_books.length;
    if(o.offset_after_hour_seconds>0)delayed++;
    for(const b of o.okx_books){
      insist(b.account_fee_included===false&&b.future_fill_guaranteed===false,"public book is not an authenticated trade "+meta.file);
    }
  }
  return {
    schema:"erith.trader.radar20.scientific-gate.v1",
    state:"RESEARCH_ONLY_NOT_VALIDATED",
    integrity:"PASS", profitability_certified:false,real_orders:false,
    distinct_retrospective_quarters:quarters,
    interpretation:"Quarterly simulations reset capital independently; they are not one six-month equity curve or a prospective validation.",
    forward:{start_day_utc:frozen.start_day_utc,protocol_days:frozen.test_days,signal_days_collected:signalDays,signal_days_remaining:frozen.test_days-signalDays,settlement_days_required:settlementDays,source_days_required:sourceDays,source_days_collected:forward.days_collected,settlement_days_collected:Math.max(0,forward.days_collected-frozen.test_days),status:forward.status,simulation_only:true},
    execution_witness:{observations:observations.length,signal_candidates:candidates,public_okx_book_snapshots:publicBooks,delayed_after_signal_hour:delayed,authenticated_account_fees:false,future_entry_fill_proven:false,scope:"Public OKX depth observed after signal-hour open, not contemporaneous fills"},
    blockers:[
      ...(signalDays<frozen.test_days?["PROSPECTIVE_90_DAYS_INCOMPLETE"]:[]),
      ...(forward.days_collected<sourceDays?["SETTLEMENT_WINDOW_INCOMPLETE"]:[]),
      "EXECUTION_COSTS_NOT_AUTHENTICATED",
      "NO_REAL_FILL_EVIDENCE",
      "RETROSPECTIVE_MODEL_SELECTION_BIAS",
      "MANUAL_INDEPENDENT_VALIDATION_REQUIRED"
    ]
  };
}
function run(root){
  const forwardRoot="radar20_forward/", executionRoot="radar20_execution/";
  const frozen=data(root,forwardRoot+"experiment.json");
  const idx=data(root,forwardRoot+"index.json");
  insist(digest(read(root,forwardRoot+"experiment.json"))===idx.config_sha256,"frozen protocol SHA-256");
  const indexed=[...(idx.days||[]),...(idx.okx||[]),...(idx.outputs||[])];
  for(const o of indexed){
    insist(typeof o.file==="string"&&/^[\w./-]+$/.test(o.file)&&!o.file.startsWith("/")&&!o.file.split("/").includes(".."),"safe forward indexed path");
    insist(typeof o.sha256==="string"&&/^[a-f0-9]{64}$/.test(o.sha256),"valid forward indexed digest");
    insist(digest(read(root,forwardRoot+o.file))===o.sha256,"forward indexed SHA-256 "+o.file);
  }
  const forward=data(root,forwardRoot+"summary.json");
  const ex=data(root,executionRoot+"index.json");
  const obs=ex.observations.map(o=>{
    insist(/^[a-f0-9]{64}$/.test(o.sha256)&&!o.file.includes(".."),"witness index file path and digest");
    const bytes=read(root,executionRoot+o.file);
    insist(digest(bytes)===o.sha256,"witness SHA-256 "+o.file);
    return JSON.parse(bytes.toString("utf8"));
  });
  const history=data(root,"radar20_portfolio/summary.json");
  const stress=data(root,"radar20_retro_stress/summary.json");
  const report=evaluate(frozen,idx,forward,ex,history,stress,obs);
  report.source_fingerprints={protocol_sha256:idx.config_sha256,witness_index_sha256:digest(read(root,executionRoot+"index.json"))};
  return report;
}
function markdown(r){
  const qs=r.distinct_retrospective_quarters;
  return "# Radar 20 — état de preuve calculé\n\n"+
  "**"+r.state+"** · intégrité documentaire "+r.integrity+" · ordres réels désactivés.\n\n"+
  "| Simulation indépendante | Transactions | Résultat (USDT fictifs) | Recul maximal | Coût AR supposé |\n|---|---:|---:|---:|---:|\n"+
  qs.map(q=>"| "+q.label+" | "+q.trades+" | "+q.net_usdt+" | "+q.max_drawdown_pct+" % | "+q.assumed_roundtrip_cost_pct+" % |").join("\n")+
  "\n\n**Prospectif :** "+r.forward.signal_days_collected+"/"+r.forward.protocol_days+" journées de signaux, "+r.forward.signal_days_remaining+" restantes. Archives sources "+r.forward.source_days_collected+"/"+r.forward.source_days_required+" (dont "+r.forward.settlement_days_required+" journées de clôture, non des signaux supplémentaires).\n"+
  "**Carnet public :** "+r.execution_witness.observations+" observations, "+r.execution_witness.signal_candidates+" candidats, "+r.execution_witness.public_okx_book_snapshots+" relevés OKX. Frais de compte et exécutions futures non prouvés.\n"+
  "**Blocages :** "+r.blockers.join(" ; ")+".\n\n"+
  "Les deux trimestres ont des capitaux fictifs réinitialisés. Un PASS d'intégrité n'est jamais une certification de gain, ni une autorisation d'ordre.\n";
}
if(require.main===module){
  try{
    const arg=process.argv.find(x=>x.startsWith("--root="));
    const root=arg?path.resolve(arg.slice(7)):path.resolve(__dirname,"..");
    const result=run(root);
    process.stdout.write(process.argv.includes("--markdown")?markdown(result):JSON.stringify(result,null,2)+"\n");
  }catch(e){process.stderr.write(String(e.message||e)+"\n");process.exitCode=1;}
}
module.exports={evaluate,run,markdown,digest};
