"use strict";
// Isolated research contract. NOT imported by Administrator; no network/storage/DOM mutation.
// Source/metadata can CLAIM a currency without proving that the exchange delivered it.

function seriesCurrencyEvidence(entry){
  const allowed=new Set(["EUR","USD","USDC","USDT"]);
  const claims=[];
  const add=(kind,value)=>{
    const v=typeof value==="string"?value.trim().toUpperCase():"";
    if(allowed.has(v))claims.push({kind,currency:v});
  };
  add("key",entry?.currencyInKey);
  add("metadata.currency",entry?.declaredCurrency);
  add("metadata.quoteCurrency",entry?.declaredQuoteCurrency);
  const source=String(entry?.source||"");
  for(const match of source.matchAll(/\bmarket_chart\s+(EUR|USD|USDC|USDT)\b/gi))
    add("source.market_chart",match[1]);
  for(const match of source.matchAll(/\b[A-Z0-9]{1,15}\/(EUR|USD|USDC|USDT)\b/g))
    add("source.pair",match[1]);
  if(String(entry?.sourceFamily||"").toLowerCase()==="binance"){
    for(const match of source.matchAll(/\b[A-Z0-9]{1,15}(EUR|USD|USDC|USDT)\b/g))
      add("source.instrument",match[1]);
  }
  const currencies=[...new Set(claims.map(c=>c.currency))];
  const conflict=currencies.length>1;
  const currency=currencies.length===1?currencies[0]:null;
  const sourceEvidence=claims.some(c=>c.kind.startsWith("source."));
  return Object.freeze({currency,conflict,claims,
    evidence:conflict?"conflicting-claims":!currency?"unknown":
      sourceEvidence?"source-declared":"metadata-or-key-declared",
    independentlyVerified:false
  });
}

function inspectHistoricalRecord(entry){
  const evidence=seriesCurrencyEvidence(entry);
  const samples=Array.isArray(entry?.samples)?entry.samples:[];
  const times=samples.map(s=>Number(s?.timeMs));
  const prices=samples.map(s=>Number(s?.priceRaw));
  const validNumbers=samples.length>0 &&
    times.every(n=>Number.isFinite(n)&&n>0) &&
    prices.every(n=>Number.isFinite(n)&&n>0);
  const chronological=validNumbers&&times.every((t,i)=>i===0||t>=times[i-1]);
  const usable=!!(evidence.currency&&!evidence.conflict&&validNumbers&&chronological);
  return Object.freeze({coinId:String(entry?.coinId||"").toLowerCase(),periodDays:Number(entry?.periodDays),
    currency:evidence.currency,currencyEvidence:evidence.evidence,claims:evidence.claims,
    conflict:evidence.conflict,independentlyVerified:evidence.independentlyVerified,
    sampleCount:samples.length,validNumbers,chronological,usable,
    firstSampleTimestamp:validNumbers?times[0]:null,
    lastSampleTimestamp:validNumbers?times[times.length-1]:null,
    sourceFamily:String(entry?.sourceFamily||entry?.sourceInKey||"").toLowerCase(),
    rawPrices:validNumbers?prices:[],
    note:"Sampled values only; currency provenance and native market accuracy require separate verification"
  });
}

function comparableSpot(coin,record){
  if(!record?.usable)return null;
  const field=record.currency==="EUR"?"priceEur":record.currency==="USD"?"priceUsd":null;
  if(!field)return null; // USDC/USDT never relabeled as USD.
  const value=coin?.[field];
  if(value===undefined||value===null||value==="")return null;
  const price=Number(value);
  return Number.isFinite(price)&&price>0?Object.freeze({price,currency:record.currency,field}):null;
}

function proposedHistoryCacheKey(record){
  if(!record?.usable||!Number.isInteger(record.periodDays)||record.periodDays<=0)
    throw new Error("unqualified historical series cannot enter canonical cache");
  if(!/^[a-z0-9._-]+$/.test(record.coinId)||!/^[a-z0-9._-]+$/.test(record.sourceFamily))
    throw new Error("unsafe historical cache identity");
  return `${record.coinId}:${record.currency}:${record.sourceFamily}:${record.periodDays}`;
}

function historicalSpotParity(coin,record,historicalPrice,historicalTimestamp,options={}){
  const skip=(reason)=>Object.freeze({comparable:false,reason});
  if(!record?.usable || record.conflict)
    return skip("unqualified-history");
  // The absence of a contradiction does NOT prove that cache labels are truthful.
  if(record.currencyEvidence!=="source-declared")return skip("provenance-not-established");
  if(record.sourceFamily!=="coingecko" || !String(coin?.source||"").toLowerCase().includes("coingecko"))
    return skip("different-provider");
  const spot=comparableSpot(coin,record);
  if(!spot)return skip("spot-not-in-same-currency");
  const historical=Number(historicalPrice),t=Number(historicalTimestamp);
  if(!Number.isFinite(historical)||historical<=0||!Number.isFinite(t)||t<=0)
    return skip("invalid-historical-price-or-time");
  const timestamp=coin?.spotUpdatedAt??coin?.timestamp??coin?.lastUpdated;
  const spotAt=typeof timestamp==="number"?timestamp:Date.parse(String(timestamp||""));
  if(!Number.isFinite(spotAt)||spotAt<=0)return skip("missing-spot-timestamp");
  const maxAgeMs=Number.isFinite(Number(options.maxAgeMs))&&Number(options.maxAgeMs)>=0
    ?Number(options.maxAgeMs):20*60*1000;
  if(Math.abs(t-spotAt)>maxAgeMs)return skip("timestamp-mismatch");
  const warnGapPct=Number.isFinite(Number(options.warnGapPct))&&Number(options.warnGapPct)>0
    ?Number(options.warnGapPct):2.5;
  const gapPct=Math.abs(historical-spot.price)/spot.price*100;
  return Object.freeze({comparable:true,currency:record.currency,spotField:spot.field,
    historicalPrice:historical,spotPrice:spot.price,historicalTimestamp:t,spotTimestamp:spotAt,
    gapPct,warn:gapPct>warnGapPct});
}

module.exports={seriesCurrencyEvidence,inspectHistoricalRecord,comparableSpot,proposedHistoryCacheKey,historicalSpotParity};
