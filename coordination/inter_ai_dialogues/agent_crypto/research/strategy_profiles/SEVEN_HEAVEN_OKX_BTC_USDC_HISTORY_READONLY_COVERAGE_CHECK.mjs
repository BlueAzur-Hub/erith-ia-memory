#!/usr/bin/env node
// One-time, public, read-only feasibility audit for BTC-USDC OKX Spot 1Dutc.
// It does not create a collector, store data, access private account APIs or trade.
import {setTimeout as sleep} from 'node:timers/promises';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const headers={'Accept':'application/json','User-Agent':'SevenHeavenResearch/1.0 (+public read-only price verification)'};
const endpoint='https://www.okx.com/api/v5/market/history-candles';
const url=new URL(endpoint);url.searchParams.set('instId','BTC-USDC');url.searchParams.set('bar','1Dutc');url.searchParams.set('limit','100');
const target=Date.parse('2023-07-01T00:00:00.000Z');
let cursor=null,rows=new Map(),pages=0,networkStatus=[],lastOldest=Infinity;
try {
  for(let i=0;i<24;i++){
    const u=new URL(url);
    if(cursor!==null)u.searchParams.set('after',String(cursor));
    const response=await fetch(u,{headers,signal:AbortSignal.timeout(13000)});
    if(!response.ok)throw Error('Public OKX endpoint returned HTTP '+response.status);
    const body=await response.json();
    if(body.code!=='0'||!Array.isArray(body.data))throw Error('Public OKX response error: code='+String(body.code)+' message='+String(body.msg).slice(0,130));
    const page=body.data;
    if(!page.length)break;
    pages++;
    for(const c of page){
      if(!Array.isArray(c)||c.length<9)throw Error('Unexpected OKX candle format');
      const [ts,o,h,l,close,vol,volCcy,volQuote,confirm]=c;
      const stamp=Number(ts),numbers=[o,h,l,close,vol].map(Number);
      if(!Number.isSafeInteger(stamp)||numbers.some(x=>!Number.isFinite(x))||numbers.some(x=>x<0)||numbers.slice(0,4).some(x=>x<=0))throw Error('Invalid public candle');
      if(numbers[1]<Math.max(numbers[0],numbers[3])||numbers[2]>Math.min(numbers[0],numbers[3]))throw Error('Inconsistent OKX OHLC');
      if(stamp%86400000!==0)throw Error('UTC daily candle misalignment');
      if(confirm!=='1')continue; // never use unfinished daily candle
      const prev=rows.get(stamp);
      if(prev&&JSON.stringify(prev)!==JSON.stringify(c))throw Error('Conflicting OKX candle '+stamp);
      rows.set(stamp,c);
    }
    const oldest=Math.min(...page.map(x=>Number(x[0])));
    if(oldest>=lastOldest)throw Error('Pagination stopped moving backwards');
    lastOldest=oldest;
    networkStatus.push({page:pages,earliestUTC:new Date(oldest).toISOString().slice(0,10),num:page.length});
    if(oldest<=target||page.length<100)break;
    cursor=oldest;
    await sleep(150); // respect API rate
  }
  const data=[...rows.values()].sort((a,b)=>Number(a[0])-Number(b[0]));
  const diffs=[];
  for(let i=1;i<data.length;i++)if(Number(data[i][0])-Number(data[i-1][0])!==86400000)diffs.push({before:data[i-1][0],after:data[i][0]});
  const daily=data.map(([ts,o,h,l,c,vol])=>[Number(ts),Number(o),Number(h),Number(l),Number(c),Number(vol)]);
  const evidence={schema:'seven.okx.spot.btc-usdc.daily-history-coverage.v1',readOnly:true,ordersEnabled:false,
    source:{venue:'OKX Spot',instrument:'BTC-USDC',interval:'1Dutc',endpoint,utc:true},
    checkedAtUTC:new Date().toISOString(),pages,days:daily.length,firstUTC:daily.length?new Date(daily[0][0]).toISOString().slice(0,10):null,
    lastUTC:daily.length?new Date(daily.at(-1)[0]).toISOString().slice(0,10):null,
    contiguous:diffs.length===0,gaps:diffs.slice(0,12),networkStatus,
    sha256:createHash('sha256').update(JSON.stringify(daily)).digest('hex'),
    enoughForThreeMethods:daily.length>=220&&diffs.length===0};
  writeFileSync('/tmp/seven_okx_history_coverage.json',JSON.stringify(evidence,null,2));
  if(evidence.enoughForThreeMethods)writeFileSync('/tmp/seven_okx_daily_research_rows.json',JSON.stringify(daily));
  console.log(JSON.stringify(evidence,null,2));
  if(!evidence.enoughForThreeMethods)process.exitCode=2;
}catch(err){console.error('OKX_COVERAGE_UNVERIFIED:',err.message);process.exitCode=3}
