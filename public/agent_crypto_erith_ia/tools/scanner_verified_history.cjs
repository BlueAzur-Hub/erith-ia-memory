'use strict';

/**
 * Agent-Crypto / Seven: read-only server-side historical evidence for exactly
 * five frozen CoinGecko IDs. No asset substitution, currency conversion,
 * chart mutation, private Bridge access, wallet or orders.
 *
 * The collector never fabricates points and never declares a failed request
 * usable. Its JSON is a candidate evidence record, NOT a validated browser
 * history and NOT the scanner's selector.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const SCHEMA = 'agent_crypto_scanner_server_history_v1';
const BASE = 'https://api.coingecko.com/api/v3';
const MIN_POINTS = 40;
const WINDOW_MS = 24 * 60 * 60 * 1000;
const BOUNDARY_MS = 12 * 60 * 1000;
const MAX_INTERIOR_GAP_MS = 30 * 60 * 1000;
const MAX_RESPONSE_BYTES = 4_000_000;

function exactIds(ids) {
  if (!Array.isArray(ids) || ids.length !== 5) throw new Error('Exactly five frozen CoinGecko IDs required');
  const cleaned = ids.map(id => String(id || '').trim().toLowerCase());
  if (cleaned.some(id => !/^[a-z0-9][a-z0-9-]{0,99}$/.test(id)) || new Set(cleaned).size !== 5) {
    throw new Error('Invalid or duplicate CoinGecko IDs');
  }
  return cleaned;
}

function safeError(error) {
  return String(error?.message || error || 'Unknown error').slice(0, 350);
}

function validatePoints(prices, anchorMs) {
  if (!Array.isArray(prices)) return {ok:false,reason:'Missing CoinGecko prices array'};
  // Do NOT sanitize invalid points into an apparently complete result.
  if (prices.length < MIN_POINTS || prices.length > 10000) {
    return {ok:false,reason:'Point count out of bounds: '+prices.length};
  }
  let prev = -Infinity;
  for (const row of prices) {
    if (!Array.isArray(row) || row.length < 2) return {ok:false,reason:'Malformed point'};
    const [time,price] = row;
    if (!Number.isSafeInteger(time) || !Number.isFinite(price) || price <= 0
        || time <= prev || time > anchorMs + BOUNDARY_MS) {
      return {ok:false,reason:'Invalid price, timestamp, order or future point'};
    }
    if (Number.isFinite(prev) && time - prev > MAX_INTERIOR_GAP_MS) {
      return {ok:false,reason:'Historical series contains an interior gap',gapMs:time-prev};
    }
    prev = time;
  }
  const first = prices[0][0];
  const last = prices[prices.length - 1][0];
  if (first > anchorMs - WINDOW_MS + BOUNDARY_MS || last < anchorMs - BOUNDARY_MS) {
    return {ok:false,reason:'Frozen 24 h window not covered',first,last,anchor:anchorMs};
  }
  return {ok:true,first,last,pointCount:prices.length,spanMs:last-first};
}

async function requestCoin(fetchFn,id,anchorMs,opts={}) {
  const endpoint = '/coins/'+encodeURIComponent(id)+'/market_chart';
  const query = '?vs_currency=eur&days=1&precision=full';
  const origin = opts.baseUrl || BASE;
  const url = origin + endpoint + query;
  const headers = {'Accept':'application/json','User-Agent':'agent-crypto-seven-history/1'};
  // A key must never be written to evidence or publicly committed.
  if (opts.demoKey) headers['x-cg-demo-api-key'] = opts.demoKey;
  const controller = new AbortController();
  let timer;
  const empty = {id,quoteCurrency:'EUR',periodDays:1,source:'coingecko-market-chart',
    endpoint,requestedAt:new Date(anchorMs).toISOString(),status:'unavailable'};
  try {
    timer=setTimeout(()=>controller.abort(),opts.timeoutMs||25000);
    const response=await fetchFn(url,{headers,signal:controller.signal});
    const code=Number(response?.status);
    if (!response?.ok) {
      return {...empty,httpStatus:Number.isInteger(code)?code:null,
        error:code===429?'CoinGecko HTTP 429 rate limit':'CoinGecko HTTP '+(code || 'unknown')};
    }
    const body=await response.text();
    if (body.length>MAX_RESPONSE_BYTES) return {...empty,httpStatus:code,error:'Oversized upstream response'};
    let json;
    try {json=JSON.parse(body)} catch {return {...empty,httpStatus:code,error:'Invalid upstream JSON'}}
    const validity=validatePoints(json?.prices,anchorMs);
    if (!validity.ok) return {...empty,httpStatus:code,error:validity.reason,
      coverage:validity};
    return {...empty,status:'ready',httpStatus:code,receivedAt:new Date().toISOString(),
      provenance:{provider:'CoinGecko',method:'GET',endpoint,query:{vs_currency:'eur',days:'1',precision:'full'}},
      coverage:validity,series:json.prices};
  } catch(error) {
    return {...empty,httpStatus:null,error:error?.name==='AbortError'?'Upstream timeout':safeError(error)};
  } finally {clearTimeout(timer)}
}

async function collect({ids,frameId,fetchFn=fetch,now=Date.now(),timeoutMs=25000,demoKey,
  spacingMs=12000,baseUrl}={}) {
  const exact = exactIds(ids);
  if (typeof frameId!=='string' || !/^[A-Za-z0-9._:-]{3,128}$/.test(frameId)) {
    throw new Error('Exact frozen Market Frame identity required');
  }
  if (!Number.isSafeInteger(now) || now<1600000000000) throw new Error('Invalid acquisition clock');
  const results=[];
  for (let i=0;i<exact.length;i++) {
    if (i && spacingMs>0) await new Promise(r=>setTimeout(r,spacingMs));
    results.push(await requestCoin(fetchFn,exact[i],now,{timeoutMs,demoKey,baseUrl}));
  }
  const envelope={schema:SCHEMA,frameId,requestedIds:exact,quoteCurrency:'EUR',periodDays:1,
    windowEnd:new Date(now).toISOString(),fetchedAt:new Date().toISOString(),
    // Consumers must enforce freshness and verify all five records separately.
    status:results.every(r=>r.status==='ready')?'ready':'partial',
    readyCount:results.filter(r=>r.status==='ready').length,
    results};
  envelope.sha256='sha256:'+crypto.createHash('sha256')
    .update(JSON.stringify(envelope)).digest('hex');
  return envelope;
}

async function main(argv=process.argv.slice(2)) {
  const args=Object.fromEntries(argv.filter(a=>a.startsWith('--')&&a.includes('='))
    .map(a=>{const p=a.indexOf('=');return [a.slice(2,p),a.slice(p+1)]}));
  if (!args.ids || !args.frame || !args.output) throw new Error('Required: --ids=a,b,c,d,e --frame=ID --output=/safe/path.json');
  const output=path.resolve(args.output);
  const root=path.resolve(process.cwd());
  if (!(output.startsWith(root+path.sep))) throw new Error('Output must be under working directory');
  const data=await collect({ids:args.ids.split(','),frameId:args.frame,
    demoKey:process.env.COINGECKO_DEMO_API_KEY||undefined});
  fs.mkdirSync(path.dirname(output),{recursive:true});
  // Keep previous file intact if collection is partial: write a separate evidence file.
  const tmp=output+'.tmp';
  fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{encoding:'utf8',mode:0o600});
  fs.renameSync(tmp,output);
  process.stdout.write(JSON.stringify({schema:data.schema,status:data.status,readyCount:data.readyCount,
    ids:data.requestedIds,failures:data.results.filter(x=>x.status!=='ready').map(x=>({id:x.id,httpStatus:x.httpStatus,error:x.error}))})+'\n');
}
if(require.main===module)main().catch(err=>{console.error(safeError(err));process.exitCode=1});
module.exports={exactIds,validatePoints,requestCoin,collect,SCHEMA};
