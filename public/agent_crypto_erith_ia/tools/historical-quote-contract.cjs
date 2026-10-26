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

module.exports={seriesCurrencyEvidence,inspectHistoricalRecord,comparableSpot,proposedHistoryCacheKey};
