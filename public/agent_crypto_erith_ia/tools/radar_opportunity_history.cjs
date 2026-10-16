#!/usr/bin/env node
"use strict";
// Compact observational archive. Reads existing snapshots; never fetches or places orders.
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),reader=require("../laboratoire/radar.js");
const cryptoDir=path.join(root,"data/crypto"),outDir=path.join(cryptoDir,"radar-opportunities");
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const finite=v=>typeof v==="number"&&Number.isFinite(v)?v:null;
function dailyArchive(now=new Date()){
 const core=read(path.join(cryptoDir,"latest.json")),extended=read(path.join(cryptoDir,"extended.json"));
 const scan=reader.selectOpportunities(core,extended);
 const newest=Math.max(Date.parse(scan.sourceTimes.core),Date.parse(scan.sourceTimes.extended));
 if(!Number.isFinite(newest)||Math.abs(now.getTime()-newest)>8*3600000)
  throw Error("Archives Top1000 périmées (> 8 h), journée non publiée");
 const date=new Date(newest).toISOString().slice(0,10);
 if(date!==now.toISOString().slice(0,10))throw Error("Archive non datée d'aujourd'hui, publication refusée");
 const file=path.join(outDir,date+".json");
 if(fs.existsSync(file))return {file,created:false}; // one immutable prospective observation per day
 const archive={
  schema:"erith.radar.opportunity-observation.v1",record_kind:"prospective_snapshot",
  observed_date_utc:date,source_times_utc:scan.sourceTimes,
  source_files:["data/crypto/latest.json","data/crypto/extended.json"],
  universe:scan.universe,eligible:scan.eligible,filters:scan.filters,
  groups:{momentum_24h_7d:scan.trend,rebound_24h_only:scan.rebound},
  measures_are_percentages:true,orders_enabled:false,account_access:false,simulation_only:true,
  historical_candles_validated:false,spread_validated:false,orderbook_validated:false,
  note:"Classement transversal de prix agrégés ; pas de conseil, aucun rendement futur constaté à l'heure de création."
 };
 fs.mkdirSync(outDir,{recursive:true});
 fs.writeFileSync(file,JSON.stringify(archive,null,2)+"\n");
 return {file,created:true,momentum:scan.trend.length,rebound:scan.rebound.length};
}
function archiveHistory(){
 const dir=path.join(root,"data/history");
 const daily=new Map(),files=fs.readdirSync(dir).filter(f=>/^20\d{2}-\d{2}-\d{2}\.jsonl$/.test(f)).sort();
 for(const file of files){
  const date=file.slice(0,10);
  for(const line of fs.readFileSync(path.join(dir,file),"utf8").split(/\r?\n/)){
   if(!line.trim())continue;
   let raw;try{raw=JSON.parse(line);}catch(_){continue;}
   if(raw.schema!=="atlas_market_snapshot_top50_v1"||raw.live_ok!==true||
      !Array.isArray(raw.assets)||raw.assets.length<40)continue;
   const time=Date.parse(raw.saved_at||"");
   if(!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==date)continue;
   if(!daily.has(date)||daily.get(date).time<time)
    daily.set(date,{time,at:raw.saved_at,file:"data/history/"+file,assets:raw.assets});
  }
 }
 const days=[...daily.keys()].sort().slice(-60);
 const output=[];
 for(const date of days){
  const snap=daily.get(date),futureDate=new Date(Date.parse(date+"T00:00:00Z")+7*86400000).toISOString().slice(0,10);
  const forward=daily.get(futureDate);
  const futureById=new Map((forward?.assets||[]).map(x=>[x.id,x]));
  const selected=snap.assets.filter(c=>
   finite(c.change_24h_pct)!==null&&c.change_24h_pct>=4&&
   finite(c.change_7d_pct)!==null&&c.change_7d_pct>0&&
   finite(c.volume_24h_eur)!==null&&c.volume_24h_eur>=1000000&&
   finite(c.market_cap_eur)!==null&&c.market_cap_eur>=20000000&&
   finite(c.price_usd)!==null&&c.price_usd>0
  ).sort((a,b)=>b.change_24h_pct-a.change_24h_pct).slice(0,5);
  for(const c of selected){
   const f=futureById.get(c.id),futurePrice=finite(f?.price_usd);
   const valid=futurePrice!==null&&futurePrice>0;
   output.push({
    id:c.id,symbol:c.symbol,rank:c.rank,observed_at:snap.at,
    price_usd:c.price_usd,change24h_pct:c.change_24h_pct,change7d_pct:c.change_7d_pct,
    selection_rule:"TOP50_RETROSPECTIVE_MOMENTUM_WITH_EUR_VOLUME_AND_CAP_FILTER",
    future_7d_date:futureDate,observed_followup_at:valid?forward.at:null,
    observed_followup_price_usd:valid?futurePrice:null,
    followup_change_pct:valid?Math.round((futurePrice/c.price_usd-1)*1e4)/100:null,
    followup_status:valid?"OBSERVED_MARKET_SNAPSHOT":forward?"ASSET_NOT_IN_TOP50":"FOLLOWUP_SNAPSHOT_MISSING",
    source_path:snap.file,followup_source_path:valid?forward.file:null
   });
  }
 }
 const history={schema:"erith.radar.top50-retrospective-review.v1",
  record_kind:"retrospective_descriptive_check_not_paper_trades",
  latest_archive_day_utc:days.at(-1)||null,archive_days_scanned:days.length,
  selection_scope:"Top50 historical daily snapshots only; separate criteria from prospective Top1000",
  selection_filters:{change24h_min_pct:4,change7d_positive:true,volume24h_min_eur:1000000,market_cap_min_eur:20000000},
  forward_horizon_days:7,followup_returns_ignore_fees:true,trade_executions_recorded:false,
  note:"Pure retrospective, with possible selection and survivorship bias. Only an exact future dated public snapshot with the same asset id is compared; missing is null, not zero.",
  observations:output};
 fs.mkdirSync(outDir,{recursive:true});
 const file=path.join(outDir,"historical-top50-forward.json");
 const content=JSON.stringify(history,null,2)+"\n";
 if(!fs.existsSync(file)||fs.readFileSync(file,"utf8")!==content)fs.writeFileSync(file,content);
 return {file,days:days.length,observations:output.length,followups:output.filter(x=>x.followup_status==="OBSERVED_MARKET_SNAPSHOT").length};
}
if(require.main===module){
 const result={prospective:dailyArchive(),retrospective:archiveHistory()};
 console.log(JSON.stringify(result,null,2));
}
module.exports={dailyArchive,archiveHistory};
