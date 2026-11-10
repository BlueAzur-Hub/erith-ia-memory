#!/usr/bin/env node
// Seven Heaven historical research: public, unsigned API listing ONLY.
// No credentials, no orders, no trading account, no automatic collector.
// The official OKX archive module 2 is the 1-minute candlestick dataset;
// module 3 is derivatives funding data and MUST NOT be used for spot candles.
// Date groups in module 2 are UTC+8; UTC reaggregation is required later.
import fs from 'node:fs';
const endpoint='https://www.okx.com/api/v5/public/market-data-history';
const examples=['2022-06-15','2023-10-15','2024-06-15','2025-02-15'];
const evidence={schema:'seven.crypto.okx.spot.btc-usdc.official-archive-discovery.v1',
  checkedAtUTC:new Date().toISOString(),endpoint,readOnly:true,ordersEnabled:false,
  checkedInstrument:'BTC-USDC',instrumentType:'SPOT',dataset:'1-minute candlesticks',
  module:'2',groupTimezone:'UTC+08:00',files:[],notes:[
    'Official historical archive advertises candles from July 2023, not guaranteed per pair.',
    'This check tests concrete BTC-USDC dates and does not presume older data is present.',
    'One-minute file days begin at UTC+8 midnight (16:00 previous UTC day).',
    'Never merge archive daily buckets directly with 1Dutc bars without reaggregation.',
  ]};
for(const date of examples){
  const time=Date.parse(date+'T00:00:00+08:00');
  const url=new URL(endpoint);
  for(const [k,v] of Object.entries({module:'2',instType:'SPOT',instIdList:'BTC-USDC',
   dateAggrType:'daily',begin:String(time),end:String(time)}))url.searchParams.set(k,v);
  const item={date,requestFields:Object.fromEntries(url.searchParams)};
  try{
    const resp=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(16000)});
    item.http=resp.status;
    const body=await resp.json();
    item.code=body.code;
    item.message=String(body.msg||'').slice(0,250);
    item.itemCount=Array.isArray(body.data)?body.data.length:null;
    item.itemKeys=Array.isArray(body.data)&&body.data[0]?Object.keys(body.data[0]):[];
    item.details=[];
    if(Array.isArray(body.data)){
      for(const x of body.data.slice(0,4)){
        const record={fields:Object.keys(x)};
        for(const [k,v] of Object.entries(x)){
          if(typeof v==='string' && ['instId','instType','dateAggrType','dateTs','dataTs','begin','end','date'].includes(k))record[k]=v;
          if(Array.isArray(v)){
            record[k+'Count']=v.length;
            record[k+'Fields']=v.length&&typeof v[0]==='object'?Object.keys(v[0]):[];
            if(v.length&&typeof v[0]==='object'){
              record[k+'Example']={};
              for(const [kk,vv] of Object.entries(v[0])){
                if(/url|href|link/i.test(kk))record[k+'Example'][kk+'Present']=Boolean(vv);
                else if(typeof vv==='string' || typeof vv==='number')record[k+'Example'][kk]=String(vv).slice(0,180);
              }
            }
          }else if(/url|href|link/i.test(k))record[k+'Present']=Boolean(v);
        }
        item.details.push(record);
      }
    }
  }catch(err){
    item.error=String(err?.message||err).slice(0,250);
  }
  evidence.files.push(item);
  await new Promise(resolve=>setTimeout(resolve,350));
}
fs.writeFileSync('/tmp/seven_okx_bulk_archive_discovery.json',JSON.stringify(evidence,null,2));
console.log('OFFICIAL_BULK_DISCOVERY '+JSON.stringify(evidence));
