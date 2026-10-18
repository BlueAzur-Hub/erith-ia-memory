/* ERITH.IA Trader · Spot PAPER LIMIT engine · NO LIVE TRADING, I/O OR BRIDGE.
   Simulated fills assume ONLY best-level public size; cannot prove execution. */
(function(root,factory){"use strict";const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.AgentCryptoSpotPaperOrders=api})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const SCHEMA="erith.trader.spot-paper-orders.v1",S=100000000n,AGE=120000;
const pairs=Object.freeze({QUSDT:{base:"Q",venue:"Bitget"},ICNTUSDT:{base:"ICNT",venue:"Bitget"},"FLUID-USDT":{base:"FLUID",venue:"OKX"},SANDUSDT:{base:"SAND",venue:"Binance"}});
const fail=m=>{throw Error(m)};
function d(v){const s=String(v??"");if(!/^\d{1,10}(?:\.\d{1,8})?$/.test(s))fail("Décimal exact invalide");const [a,b=""]=s.split(".");return BigInt(a)*S+BigInt(b.padEnd(8,"0"));}
function fmt(v){if(v<0n)fail("Montant négatif");return (v/S)+"."+(v%S).toString().padStart(8,"0").replace(/0+$/,"").padEnd(1,"0")}
function stamp(s){if(typeof s!=="string"||!s.endsWith("Z"))fail("UTC obligatoire");const n=Date.parse(s);if(!Number.isFinite(n))fail("Date UTC invalide");return n}
function frozen(x){if(x&&typeof x==="object"&&!Object.isFrozen(x)){Object.values(x).forEach(frozen);Object.freeze(x)}return x}
function create({capitalUSDT,maxOrderBps=2000,takerFeeBps=10,maxSpreadBps=100,slippageBps=20}={}){
 const cap=d(capitalUSDT);if(cap<=0n||cap>d("1000000")||![maxOrderBps,takerFeeBps,maxSpreadBps,slippageBps].every(Number.isInteger)||
 maxOrderBps<1||maxOrderBps>10000||takerFeeBps<0||takerFeeBps>1000||maxSpreadBps<1||maxSpreadBps>2000||
 slippageBps<0||slippageBps>1000)fail("Bornes de risque PAPER invalides");
 return frozen({schema:SCHEMA,quote:"USDT",paper:true,orders_enabled:false,
 cashUSDT:fmt(cap),initialUSDT:fmt(cap),holdings:{},pending:null,events:[],halted:false,sequence:0,
 risk:{maxOrderBps,takerFeeBps,maxSpreadBps,slippageBps}});
}
function check(s){if(s?.schema!==SCHEMA||s?.paper!==true||s?.quote!=="USDT"||s?.orders_enabled!==false)fail("Compte PAPER invalide")}
function update(s,fields,event){return frozen({...s,...fields,events:[...s.events,...(event?[event]:[])]})}
function place(s,o,at){check(s);if(s.halted||s.pending)fail("Bot PAPER bloqué ou ordre déjà en attente");
 const market=pairs[o?.pair];if(!market||o.venue!==market.venue||o.base!==market.base||
 o.quote!=="USDT"||o.instrumentType!=="SPOT")fail("Identité de paire Spot USDT incorrecte");
 if(o.type!=="LIMIT"||!["BUY","SELL"].includes(o.side))fail("Seuls les ordres LIMIT sont simulés");
 const qty=d(o.quantity),price=d(o.priceUSDT),step=d(o.lotStep),tick=d(o.tickSize),min=d(o.minQuantity),minCost=d(o.minNotionalUSDT);
 if(qty<min||qty===0n||price===0n||step===0n||tick===0n||minCost===0n||qty%step||price%tick)fail("Contraintes tick, lot et taille non satisfaites");
 const notion=qty*price/S;if(notion<minCost)fail("Notionnel insuffisant");
 if(notion>d(s.initialUSDT)*BigInt(s.risk.maxOrderBps)/10000n)fail("Concentration PAPER dépassée");
 if(o.side==="BUY"&&notion+notion*BigInt(s.risk.takerFeeBps+s.risk.slippageBps)/10000n>d(s.cashUSDT))fail("Solde PAPER USDT insuffisant");
 if(o.side==="SELL"&&qty>d(s.holdings[o.base]||"0"))fail("Quantité PAPER non détenue");
 const t=stamp(at),pending={id:s.sequence+1,pair:o.pair,base:o.base,venue:o.venue,side:o.side,kind:"LIMIT",
 quantity:fmt(qty),remaining:fmt(qty),priceUSDT:fmt(price),lotStep:fmt(step),
 createdAt:at,expiresAt:new Date(t+3600000).toISOString(),contractIdentityCertified:false};
 return update(s,{pending,sequence:pending.id},{type:"PAPER_ACCEPTED",id:pending.id,at});
}
function tick(s,book,nowRaw){check(s);if(!s.pending||s.halted)return s;
 const o=s.pending,now=stamp(nowRaw);
 if(now>=stamp(o.expiresAt))return update(s,{pending:null},{type:"PAPER_EXPIRED",id:o.id,at:nowRaw});
 const when=stamp(book?.atUTC);
 if(when<=stamp(o.createdAt)||when>now||now-when>AGE)fail("Carnet prospectif périmé ou antérieur");
 if(book.pair!==o.pair||book.venue!==o.venue||book.quote!=="USDT"||book.instrumentType!=="SPOT")fail("Carnet d'une autre paire");
 const bid=d(book.bestBidUSDT),ask=d(book.bestAskUSDT),bidQty=d(book.bestBidQty),askQty=d(book.bestAskQty);
 if(!bid||ask<=bid||!bidQty||!askQty)fail("Carnet croisé ou incomplet");
 const spread=Number((ask-bid)*20000n/(ask+bid));
 if(spread>s.risk.maxSpreadBps)fail("Spread au-dessus du plafond PAPER");
 const price=o.side==="BUY"?ask:bid,limit=d(o.priceUSDT);
 if(o.side==="BUY"?price>limit:price<limit)return s;
 const visible=o.side==="BUY"?askQty:bidQty,qty=d(o.remaining),lot=d(o.lotStep);
 const matched=(qty<visible?qty:visible)/lot*lot;if(!matched)return s;
 const notion=matched*price/S,fee=notion*BigInt(s.risk.takerFeeBps)/10000n,slippage=notion*BigInt(s.risk.slippageBps)/10000n;
 const cash=d(s.cashUSDT),holding=d(s.holdings[o.base]||"0");
 if(o.side==="BUY"&&cash<notion+fee+slippage)fail("Fonds PAPER insuffisants à l'exécution");
 if(o.side==="SELL"&&holding<matched)fail("Position PAPER insuffisante");
 const left=qty-matched;
 return update(s,{cashUSDT:fmt(o.side==="BUY"?cash-notion-fee-slippage:cash+notion-fee-slippage),
 holdings:{...s.holdings,[o.base]:fmt(o.side==="BUY"?holding+matched:holding-matched)},
 pending:left?{...o,remaining:fmt(left)}:null},{type:left?"PAPER_PARTIAL":"PAPER_FILLED",id:o.id,at:nowRaw,
 quantity:fmt(matched),priceUSDT:fmt(price),feeUSDT:fmt(fee),slippageReserveUSDT:fmt(slippage),
 sourceBookAt:book.atUTC,simulated:true});
}
function cancel(s,at){check(s);if(!s.pending)return s;return update(s,{pending:null},{type:"PAPER_CANCEL",id:s.pending.id,at:new Date(stamp(at)).toISOString()})}
function kill(s,at){check(s);const a=cancel(s,at);return update(a,{pending:null,halted:true},{type:"PAPER_KILL_SWITCH",at:new Date(stamp(at)).toISOString()})}
return Object.freeze({SCHEMA,pairs,create,place,tick,cancel,kill,realOrders:false,tradeEndpoint:null,network:false,bridge:false,storage:false});
});