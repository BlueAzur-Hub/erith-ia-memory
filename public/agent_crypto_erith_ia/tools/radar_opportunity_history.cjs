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
 const files=fs.readdirSync(outDir).filter(f=>/^20\d{2}-\d{2}-\d{2}\.json$/.test(f));
 const past=files.map(f=>read(path.join(outDir,f)));
 const tracked=trackPreviousCandidates(core,extended,scan,past,date);
 const archive={
  schema:"erith.radar.opportunity-observation.v1",record_kind:"prospective_snapshot",
  tracked_candidates:tracked,
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

function selectedCandidates(day){
 const groups=day?.groups||{};
 return [...(groups.momentum_24h_7d||[]),...(groups.rebound_24h_only||[])].filter(x=>x&&typeof x.id==="string"&&x.id);
}
function dayOffset(date,days){
 const ms=Date.parse(date+"T00:00:00Z");
 ensureDate(ms);
 return new Date(ms+days*86400000).toISOString().slice(0,10);
}
function ensureDate(ms){if(!Number.isFinite(ms))throw Error("Date Radar invalide");}
function trackPreviousCandidates(core,extended,scan,past,date){
 const wanted=new Map();
 const add=(x,firstSeen)=>{if(x&&typeof x.id==="string"&&x.id&&!wanted.has(x.id))
    wanted.set(x.id,{symbol:x.symbol||null,first_seen_date_utc:firstSeen});};
 for(const day of past){
  const gap=Math.round((Date.parse(date+"T00:00:00Z")-Date.parse(day.observed_date_utc+"T00:00:00Z"))/86400000);
  if(gap>=1&&gap<=7)for(const x of selectedCandidates(day))add(x,day.observed_date_utc);
 }
 for(const x of selectedCandidates({groups:{momentum_24h_7d:scan.trend,rebound_24h_only:scan.rebound}}))add(x,date);
 const prices=new Map();
 for(const [snapshot,when] of [[core,scan.sourceTimes.core],[extended,scan.sourceTimes.extended]]){
  for(const x of snapshot.coins||[]){
   if(typeof x.id!=="string"||!x.id)continue;
   if(prices.has(x.id))throw Error("Collision d'identité entre Top250 et Extended : "+x.id);
   prices.set(x.id,{coin:x,at:when});
  }
 }
 return [...wanted.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([id,prior])=>{
  const found=prices.get(id),coin=found?.coin,price=finite(coin?.priceUsd);
  const valid=price!==null&&price>0&&Number.isFinite(Date.parse(found?.at||""));
  return {id,symbol:coin?.symbol||prior.symbol,first_seen_date_utc:prior.first_seen_date_utc,
    observed_at_utc:valid?found.at:null,price_usd:valid?price:null,
    rank:Number.isInteger(coin?.rank)?coin.rank:null,
    volume_24h_usd:valid?finite(coin?.volume24hUsd):null,
    market_cap_usd:valid?finite(coin?.marketCapUsd):null,
    status:valid?"OBSERVED_TOP1000":"NO_VALID_TOP1000_PRICE"};
 });
}
function buildDynamicFollowups(archives){
 const days=[...archives].filter(x=>x?.schema==="erith.radar.opportunity-observation.v1"&&
    /^\d{4}-\d{2}-\d{2}$/.test(x.observed_date_utc||""))
   .sort((a,b)=>a.observed_date_utc.localeCompare(b.observed_date_utc));
 const byDay=new Map(days.map(x=>[x.observed_date_utc,x])),latest=days.at(-1)?.observed_date_utc||null;
 const follow=(id,firstAt,date,horizon)=>{
  const target=dayOffset(date,horizon),future=byDay.get(target);
  if(!future)return {target_date_utc:target,at_utc:null,price_usd:null,change_pct:null,
    status:latest&&target<=latest?"MISSING_DATED_SNAPSHOT":"AWAITING_FUTURE_DAY"};
  const record=(future.tracked_candidates||[]).find(x=>x.id===id)
   ||selectedCandidates(future).find(x=>x.id===id);
  const value=finite(record?.price_usd??record?.priceUsd),at=record?.observed_at_utc||record?.sourceSnapshot||null;
  const volume=finite(record?.volume_24h_usd??record?.volume24hUsd);
  const cap=finite(record?.market_cap_usd??record?.marketCapUsd);
  const start=Date.parse(firstAt||""),finish=Date.parse(at||"");
  if(value===null||value<=0||!Number.isFinite(finish)||!Number.isFinite(start)||finish<=start)
   return {target_date_utc:target,at_utc:null,price_usd:null,change_pct:null,status:"NO_MATCHING_VERIFIED_PRICE"};
  return {target_date_utc:target,at_utc:at,price_usd:value,elapsed_hours:Math.round((finish-start)/3600000*100)/100,
    volume_24h_usd:volume!==null&&volume>=0?volume:null,
    market_cap_usd:cap!==null&&cap>=0?cap:null,
    rank:Number.isInteger(record?.rank)?record.rank:null,
    status:"OBSERVED_DAILY_SNAPSHOT",change_pct:null};
 };
 const observations=[];
 for(const day of days){
  const selected=new Set();
  for(const c of selectedCandidates(day)){
   if(selected.has(c.id))continue;selected.add(c.id);
   const price=finite(c.priceUsd),at=c.sourceSnapshot||null;
   if(price===null||price<=0||!Number.isFinite(Date.parse(at||"")))continue;
   const d1=follow(c.id,at,day.observed_date_utc,1);
   const d7=follow(c.id,at,day.observed_date_utc,7);
   for(const v of [d1,d7])if(v.status==="OBSERVED_DAILY_SNAPSHOT")
    v.change_pct=Math.round((v.price_usd/price-1)*1e4)/100;
   observations.push({id:c.id,symbol:c.symbol,group:(day.groups.momentum_24h_7d||[]).some(x=>x.id===c.id)?"momentum_24h_7d":"rebound_24h_only",
     first_seen_date_utc:day.observed_date_utc,observed_at_utc:at,initial_price_usd:price,
     initial_volume_24h_usd:finite(c.volume24hUsd),
     initial_market_cap_usd:finite(c.marketCapUsd),initial_rank:Number.isInteger(c.rank)?c.rank:null,
     followup_1d:d1,followup_7d:d7});
  }
 }
 return {schema:"erith.radar.dynamic-forward-observations.v1",record_kind:"descriptive_daily_followup_not_paper_trades",
  quote:"USD",source:"Existing immutable prospective Radar Top1000 daily archives",
  source_archive_dates:days.map(d=>d.observed_date_utc),
  horizons_calendar_days:[1,7],orders_enabled:false,trade_executions_recorded:false,
  fees_included:false,positions_created:false,identity_market_pair_certified:false,
  note:"Suivi descriptif au même identifiant CoinGecko ; horodatages réels affichés, pas de prix intrajournalier supposé. Les volumes 24 h sont des mesures de snapshots, non une quantité échangée entre deux relevés. Absence de suivi = null. USD n'est pas USDT.",
  observations};
}
function archiveDynamicFollowups(){
 const files=fs.readdirSync(outDir).filter(f=>/^20\d{2}-\d{2}-\d{2}\.json$/.test(f)).sort().slice(-90);
 const history=buildDynamicFollowups(files.map(f=>read(path.join(outDir,f))));
 const dest=path.join(outDir,"dynamic-followups.json"),body=JSON.stringify(history,null,2)+"\n";
 if(!fs.existsSync(dest)||fs.readFileSync(dest,"utf8")!==body)fs.writeFileSync(dest,body);
 return {file:dest,days:files.length,observations:history.observations.length,
  completed_1d:history.observations.filter(x=>x.followup_1d.status==="OBSERVED_DAILY_SNAPSHOT").length,
  completed_7d:history.observations.filter(x=>x.followup_7d.status==="OBSERVED_DAILY_SNAPSHOT").length};
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
 const onlyFollowups=process.argv.includes("--followups-only");
 let prospective=null;
 if(!onlyFollowups){
  try{prospective=dailyArchive();}
  catch(e){
   const reason=String(e.message||e);
   if(!/^(Archives Top1000 périmées \(> 8 h\)|Archive non datée d'aujourd'hui, publication refusée)$/.test(reason))throw e;
   prospective={created:false,reason:"STALE_SOURCE_SNAPSHOT",details:reason};
   console.warn("Radar : sources du jour non publiables ; dérivation des archives existantes uniquement.");
  }
 }
 const result={prospective,retrospective:onlyFollowups?null:archiveHistory(),dynamic:archiveDynamicFollowups()};
 console.log(JSON.stringify(result,null,2));
}
module.exports={dailyArchive,archiveHistory,selectedCandidates,trackPreviousCandidates,buildDynamicFollowups,archiveDynamicFollowups};
