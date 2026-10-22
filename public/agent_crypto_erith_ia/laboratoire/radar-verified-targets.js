/* Radar three verified-contract Spot candidates — static GitHub archives only.
   No private account, price extrapolation or trade decision. */
(function(root,factory){"use strict";const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root?.document)api.mount(root.document);})(typeof window==="undefined"?null:window,()=>{
"use strict";
const expected=[
 ["bedrock-token","BR","BRUSDT","binance-smart-chain","0xff7d6a96ae471bbcd7713af9cb1feeb16cf56b41"],
 ["janction","JCT","JCTUSDT","binance-smart-chain","0xea37a8de1de2d9d10772eeb569e28bfa5cb17707"],
 ["beam-2","BEAM","BEAMUSDT","ethereum","0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce"]
];
const dec=v=>typeof v==="string"&&/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(v)&&Number.isFinite(Number(v))?Number(v):null;
const ms=t=>typeof t==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(t)?Date.parse(t):NaN;
function verify(header,day,now=Date.now()){
 if(header?.schema!=="erith.radar.verified-target-hourly.latest.v1"||
    header.orders_enabled!==false||header.real_orders!==0||
    header.target_count!==3||!(/^\d{4}-\d\d-\d\dT\d\dZ$/.test(header.hour_utc||""))||
    day?.schema!=="erith.radar.verified-target-hourly.v1"||
    day.orders_enabled!==false||day.real_orders!==0||
    header.source_date_utc!==header.hour_utc.slice(0,10)||
    day.date_utc!==header.source_date_utc||!Array.isArray(day.hours)||
    day.hours.length<1||day.hours.length>24)
   throw Error("Index/archives cibles non conformes");
 const hours=day.hours.filter(x=>x.hour_utc===header.hour_utc);
 if(hours.length!==1)throw Error("Heure unique introuvable");
 const one=hours[0],at=ms(one.observed_at_utc);
 if(one.schema!=="erith.radar.verified-target-hourly.v1"||
    one.orders_enabled!==false||one.real_orders!==0||one.paper_fills!==0||
    one.total_targets!==3||!Array.isArray(one.markets)||one.markets.length!==3||
    !Number.isFinite(at)||at>now+30000||
    new Date(at).toISOString().slice(0,13)!==one.hour_utc.slice(0,13))
   throw Error("Capture publique non fiable");
 const rows=one.markets.map((x,i)=>{
  const [id,sym,pair,network,pinned]=expected[i];
  if(x?.coin_id!==id||x.symbol!==sym||x.pair!==pair||
     x.venue!=="Bitget"||x.type!=="SPOT"||x.quote!=="USDT"||
     x.platform!==network||x.contract_address!==pinned||
     !["UNAVAILABLE","OBSERVED"].includes(x.status))
    throw Error("Paire ou identité CoinGecko ambiguë");
  if(x.status==="UNAVAILABLE"){
   if(x.proof!==null)throw Error("Source absente possédant un prix");
   return {symbol:sym,pair,status:"UNAVAILABLE"};
  }
  const p=x.proof,t=p?.ticker,b=p?.book,identity=p?.identity;
  if(identity?.coin_id!==id||identity.platform!==network||
     identity.contract_address!==pinned||identity.same_chain_and_address!==true||
     p.execution_proven!==false||p.account_rules_verified!==false||
     dec(t?.last)===null||dec(b?.best_bid)===null||dec(b?.best_ask)===null||
     dec(b.best_bid)>=dec(b.best_ask)||
     dec(b.spread_bps)===null||dec(b.top5_bid_quote_depth)===null||
     dec(b.top5_ask_quote_depth)===null||b.fill_proven!==false||
     !Array.isArray(p.closed_15m)||!p.closed_15m.length||p.closed_15m.length>4)
   throw Error("Données Spot non démontrées");
  for(const event of [t.source_at_utc,b.source_at_utc,identity.native_checked_at_utc]){
   const stamp=ms(event);
   if(!Number.isFinite(stamp)||Math.abs(stamp-at)>300000)
    throw Error("Datation native manquante ou trop ancienne");
  }
  return {symbol:sym,pair,status:"OBSERVED",last:dec(t.last),bid:dec(b.best_bid),
   ask:dec(b.best_ask),spread:dec(b.spread_bps),bidDepth:dec(b.top5_bid_quote_depth),
   askDepth:dec(b.top5_ask_quote_depth),quote:"USDT"};
 });
 const count=rows.filter(x=>x.status==="OBSERVED").length;
 if(count!==one.markets_observed||count!==header.markets_observed||
    header.observed_at_utc!==one.observed_at_utc)
  throw Error("État des cibles non concordant");
 return {at:one.observed_at_utc,hour:one.hour_utc,
   ageMinutes:Math.max(0,Math.floor((now-at)/60000)),
   rows,readOnly:true,ordersEnabled:false};
}
function display(doc,validated){
 const text=doc.querySelector("[data-target-status]");
 const tbody=doc.querySelector("[data-target-rows]");
 if(!text||!tbody)return;
 tbody.replaceChildren();
 const nf=(x,n=5)=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:n}).format(x);
 for(const x of validated.rows){
  const row=doc.createElement("tr");
  const vals=x.status==="OBSERVED"?
   [x.pair,"Spot vérifié",nf(x.last,8)+" USDT",nf(x.bid,8)+" / "+nf(x.ask,8),
    nf(x.spread,2)+" pb",nf(x.bidDepth,2)+" / "+nf(x.askDepth,2)+" USDT"]:
   [x.pair,"Indisponible","—","—","—","—"];
  vals.forEach(v=>{const td=doc.createElement("td");td.textContent=v;row.appendChild(td);});
  tbody.appendChild(row);
 }
 text.textContent=validated.at+" · "+validated.rows.filter(x=>x.status==="OBSERVED").length+
  "/3 marchés observés · capture âgée de "+validated.ageMinutes+
  " min ; contrats recontrôlés à la collecte · non live, aucun ordre ni signal d'achat.";
}
function mount(doc){
 const pane=doc.getElementById("radar-verified-targets");if(!pane)return;
 const status=doc.querySelector("[data-target-status]");
 const tbody=doc.querySelector("[data-target-rows]");
 const refresh=doc.querySelector("[data-target-refresh]");
 let loading=false;
 async function load(){
  if(loading||!pane.open)return;
  loading=true;refresh.disabled=true;status.textContent="Vérification des archives Spot ciblées…";
  const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),12000);
  try{
   async function read(relative){
    const u=new URL(relative,doc.baseURI);
    const res=await fetch(u.href,{credentials:"omit",cache:"no-store",signal:ctl.signal});
    if(!res.ok)throw Error("Archive non publiée (HTTP "+res.status+")");
    const body=await res.text();if(body.length>170000)throw Error("Archive trop importante");
    return JSON.parse(body);
   }
   const base="../data/crypto/radar-verified-target-hourly/";
   const header=await read(base+"latest.json");
   if(!/^\d{4}-\d\d-\d\d$/.test(header.source_date_utc||""))
    throw Error("Date UTC absente");
   display(doc,verify(header,await read(base+header.source_date_utc+".json")));
  }catch(err){
   tbody.replaceChildren();
   status.textContent="STOP · "+String(err.message||err)+
    ". Sans archive valide, aucune cotation ni performance ne peut être affichée.";
  }finally{clearTimeout(timeout);refresh.disabled=false;loading=false;}
 }
 pane.addEventListener("toggle",()=>{if(pane.open)void load();});
 refresh.addEventListener("click",()=>{void load();});
}
return Object.freeze({verify,display,mount,readOnly:true,ordersEnabled:false});
});
