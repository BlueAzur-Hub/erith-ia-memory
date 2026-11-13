#!/usr/bin/env node
"use strict";
/*
  Seven Heaven: black-box audit of the EXISTING, unmodified V5 and V6 PAPER engines.
  Deterministic offline fixtures; does not use API credentials, send orders, or fetch networks.
  Script, evidence and reports are research-only. Output is a regression audit, not a code fix.
*/
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const crypto=require("node:crypto");
const ROOT=process.cwd();
const DIR="coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/";
const JS="public/agent_crypto_erith_ia/administrator/js/";
const OUTPUT=path.join(ROOT,DIR,"seven_heaven_v5_v6_okx_spot_contract_audit_evidence");
const ORIGINAL={
  v5:{name:"market-microscope-paper-backtest-v5.js", sha:"069162a40c4a65651ff1cd9ac98a837d64f41e9a"},
  v6:{name:"market-microscope-orderbook-paper-v6.js", sha:"7ae813cd1268ddd657052cc1e2ca474e8b1aed3b"}
};
const SIZES={
  "BTC-USDC":{ask:70904.9,bid:70904.8,minSz:0.00001,lotSz:0.00000001,tickSz:0.1,source:"OKX public API snapshot 2026-11-13 01:41:02 UTC"},
  "ETH-USDC":{ask:2009.18,bid:2009.17,minSz:0.001,lotSz:0.000001,tickSz:0.01,source:"OKX public API snapshot 2026-11-13 01:41:02 UTC"}
};
const BUDGETS=[10,20,100,1000];
let cases=0;
function test(label,fn){try{fn();cases++;return {label,status:"PASS"}}catch(e){cases++;return {label,status:"FAIL",message:String(e.stack||e)}}}
function gitBlobSha(buf){return crypto.createHash("sha1").update(Buffer.from("blob "+buf.length+"\0")).update(buf).digest("hex")}
const sources={};
for(const [k,o] of Object.entries(ORIGINAL)){
  const filename=path.join(ROOT,JS,o.name), bytes=fs.readFileSync(filename);
  const sha=gitBlobSha(bytes);assert.equal(sha,o.sha,"Cannot audit a changed runtime source: "+o.name);
  sources[k]={file:JS+o.name,git_blob_sha1:sha,bytes:bytes.length};
}
const s={};s.globalThis=s;vm.runInNewContext(fs.readFileSync(path.join(ROOT,JS,ORIGINAL.v5.name),"utf8"),s,{filename:ORIGINAL.v5.name});
const v5=s.ErithMarketPaperBacktestV5;assert(v5&&v5.read_only===true&&v5.real_order===false);
require(path.join(ROOT,JS,ORIGINAL.v6.name));
const v6=globalThis.ErithMarketBookPaperV6;assert(v6&&v6.read_only===true&&v6.real_order===false);
const RISK={
  v5_quantity_minimum:"V5 takes no instrument minSz, lotSz, tickSz input; treats an arbitrary fractional base quantity as a valid PAPER entry/exit.",
  v6_quantity_minimum:"V6 takes no instrument minSz, lotSz, tickSz input; sweeps the orderbook to arbitrary fractional base quantity.",
  v6_sell_budget:"V6 SELL quoteBudget means base quantity derived from an indicative mid, NOT a sale of the actual asset quantity from a prior BUY.",
  v5_fee_model:"V5 uses fixed quote fee factor 1/(1+fee) on entry and 1-fee on exit, not actual account fee currency or fill ledger.",
  v6_fee_model:"V6 computes an instantaneous taker fee in quote; never claims to be actual charged fees or historical order execution."
};
const isLot=(x,lot)=>Math.abs(x/lot-Math.round(x/lot))<1e-5;
const now=Date.parse("2026-11-13T01:41:03Z");
const checkLog=[],v5Table=[],v6Table=[],boundary=[];
const closes=[10,10,10,10,10,10,9,8,7,8,9,11,13,15,13,10,7,6,7,9,12,15];
function buildV5(pair,mid){
  const unit=mid/10,ms=900000, start=now-1_000_000_000;
  const rows=closes.map((c,i)=>({t:start+i*ms,o:c*unit,c:c*unit,h:(c+1)*unit,l:(c-1)*unit,v:10,confirm:"1"}));
  function ema(n){let current=null;return rows.map((r,i)=>{if(current===null){if(i+1<n)return null;current=rows.slice(i-n+1,i+1).reduce((sum,x)=>sum+x.c,0)/n;return current}current=r.c*2/(n+1)+current*(n-1)/(n+1);return current;})}
  const fast=ema(2),slow=ema(4),events=[];
  for(let i=1;i<rows.length;i++){
    if(fast[i-1]===null||slow[i-1]===null)continue;
    const old=fast[i-1]-slow[i-1],recent=fast[i]-slow[i];
    const direction=old<=0&&recent>0?"UP":old>=0&&recent<0?"DOWN":null;
    if(direction)events.push({index:i,t:rows[i].t,direction,price:rows[i].c});
  }
  const snapshot={mode:"candles",source:"OKX",loadedInstrument:pair,loadedBar:"15m",emaPeriods:[2,4,12],rows};
  const cross={instrument:pair,bar:"15m",fastPeriod:2,slowPeriod:4,archiveSupported:true,events};
  return {snapshot,cross,events};
}
function buildV6(pair,size,priceOverride){
  const [base,quote]=pair.split("-");
  const ask=priceOverride??size.ask,bid=priceOverride?priceOverride-size.tickSz:size.bid;
  const book={provider:"okx",freshness:"FRESH",loading:false,error:null,external:false,
    pair:base+"/"+quote,loadedAsset:base,loadedQuote:quote,
    sourceObservedAt:new Date(now-1000).toISOString(),
    bids:[[bid,1000],[bid-size.tickSz,1000]],
    asks:[[ask,1000],[ask+size.tickSz,1000]]};
  const chart={loadedInstrument:pair,source:"OKX public candles",loading:false,error:null};
  return{book,chart};
}
for(const [pair,z] of Object.entries(SIZES)){
  const fixture=buildV5(pair,z.ask), depth=buildV6(pair,z);
  checkLog.push(test(pair+" V5 deterministic EMA event fixture",()=>assert.equal(fixture.events.map(e=>e.direction+":"+e.index).join(","),"DOWN:6,UP:10,DOWN:15,UP:19")));
  for(const amount of BUDGETS){
    let v5Result=null;
    checkLog.push(test(pair+" V5 "+amount+" USDC fee and next-open accounting",()=>{
      v5Result=v5.simulate(fixture.snapshot,fixture.cross,{initialCapital:amount,feePercent:0.1,slippagePercent:0.05},now);
      assert.equal(v5Result.ok,true,JSON.stringify(v5Result));
      assert.equal(v5Result.orders,0);
      assert.equal(v5Result.closedTrades.length,1);
      assert(v5Result.openPosition!==null);
      const t=v5Result.closedTrades[0];
      const original=fixture.snapshot.rows,fee=.001,slip=.0005;
      const quantity=amount/(original[11].o*(1+slip)*(1+fee));
      const capitalAfter=quantity*original[16].o*(1-slip)*(1-fee);
      assert(Math.abs(t.quantity-quantity)<1e-11);
      assert(Math.abs(t.capitalAfter-capitalAfter)<1e-8);
      assert(Math.abs(t.capitalBefore-amount)<1e-9);
      assert.equal(v5Result.comparison.emaHasOpenPosition,true);
    }));
    if(v5Result&&v5Result.ok){
      let t=v5Result.closedTrades[0],qty=t.quantity;
      v5Table.push({pair,budget_usdc:amount,entry_base_quantity:qty,lotSz:z.lotSz,minSz:z.minSz,
        above_minSz:qty>=z.minSz,aligned_with_lotSz:isLot(qty,z.lotSz),
        theoretical_unrounded_base_qty:qty,
        quantity_after_floor_to_lot:Math.floor((qty/z.lotSz)+1e-9)*z.lotSz,
        entry_price_synthetic:t.entryPrice,
        closed_pnl_synthetic:t.pnl});
    }
    let buy=null,sell=null;
    checkLog.push(test(pair+" V6 "+amount+" USDC bid/ask depth sweep, fee and no order",()=>{
      buy=v6.simulate(depth.book,depth.chart,{side:"BUY",quoteBudget:amount,feePercent:0.1},now);
      sell=v6.simulate(depth.book,depth.chart,{side:"SELL",quoteBudget:amount,feePercent:0.1},now);
      assert.equal(buy.ok,true,JSON.stringify(buy));
      assert.equal(sell.ok,true,JSON.stringify(sell));
      assert.equal(buy.orders,0);assert.equal(sell.orders,0);
      assert(Math.abs(buy.totalQuote-amount)<1e-8);
      assert(Math.abs(buy.feeQuote-buy.grossQuote*.001)<1e-8);
      assert(Math.abs(sell.totalQuote-sell.grossQuote*.999)<1e-8);
      assert.equal(buy.levelsUsed,1);assert.equal(sell.levelsUsed,1);
    }));
    if(buy&&buy.ok){
      v6Table.push({pair,budget_usdc:amount,minSz:z.minSz,lotSz:z.lotSz,
        buy_base_quantity:buy.baseQuantity,sell_base_quantity_from_mid:sell.baseQuantity,
        buy_above_minSz:buy.baseQuantity>=z.minSz, buy_lot_aligned:isLot(buy.baseQuantity,z.lotSz),
        sell_lot_aligned:isLot(sell.baseQuantity,z.lotSz),
        sell_quantity_is_identical_to_buy_quantity:Math.abs(buy.baseQuantity-sell.baseQuantity)<1e-12,
        buy_quote_spent:buy.totalQuote, sell_quote_received:sell.totalQuote,
        buy_quote_fee:buy.feeQuote,sell_quote_fee:sell.feeQuote,
        fixture_note:"Synthetic TWO-LEVEL deep book at the archived ask/bid; NOT a live orderbook or fill"});
    }
  }
  // Controlled invariant probe: simulated 10 USDC can pass despite falling BELOW the official minSz.
  const elevatedPrice=pair==="BTC-USDC"?2_000_000:20_000;
  const elevated=buildV6(pair,z,elevatedPrice);
  let probe;
  checkLog.push(test(pair+" V6 accepts below-minSz base quantity in isolated high-price fixture (documented gap)",()=>{
    probe=v6.simulate(elevated.book,elevated.chart,{side:"BUY",quoteBudget:10,feePercent:0.1},now);
    assert.equal(probe.ok,true,JSON.stringify(probe));
    assert(probe.baseQuantity<z.minSz,
      "Expected a below-minimum quantity for targeted counterexample");
    assert.equal(probe.orders,0);
  }));
  if(probe&&probe.ok)boundary.push({pair,synthetic_ask:elevatedPrice,budget_usdc:10,
    returned_ok:probe.ok,baseQuantity:probe.baseQuantity,minSz:z.minSz,
    below_minimum:probe.baseQuantity<z.minSz,real_market_quote:false});
}
checkLog.push(test("V5 capital below 10 USDC is refused at UI-setting level",()=>{
 const f=buildV5("BTC-USDC",SIZES["BTC-USDC"].ask);
 const r=v5.simulate(f.snapshot,f.cross,{initialCapital:9,feePercent:0.1,slippagePercent:0.05},now);
 assert.equal(r.code,"INVALID_SETTINGS")
}));
checkLog.push(test("V6 quote budget below 10 USDC is refused at UI-setting level",()=>{
 const z=SIZES["BTC-USDC"],f=buildV6("BTC-USDC",z);
 assert.equal(v6.simulate(f.book,f.chart,{side:"BUY",quoteBudget:9,feePercent:0.1},now).code,"SETTINGS_INVALID");
}));
const bad=checkLog.filter(x=>x.status!=="PASS");
if(bad.length){console.error(JSON.stringify({status:"FAILED_TESTS",bad},null,2));process.exit(1)}
assert.equal(v5Table.length,8);
assert.equal(v6Table.length,8);
const counters={v5_entries_not_lot_aligned:v5Table.filter(x=>!x.aligned_with_lotSz).length,
  v6_buys_not_lot_aligned:v6Table.filter(x=>!x.buy_lot_aligned).length,
  v6_sells_not_lot_aligned:v6Table.filter(x=>!x.sell_lot_aligned).length,
  v6_sell_reference_differs_from_buy_size:v6Table.filter(x=>!x.sell_quantity_is_identical_to_buy_quantity).length,
  v5_entries_below_minSz:v5Table.filter(x=>!x.above_minSz).length,
  v6_buys_below_minSz_at_archived_prices:v6Table.filter(x=>!x.buy_above_minSz).length,
  v6_below_minSz_counterexamples:boundary.filter(x=>x.below_minimum&&x.returned_ok).length};
const proof={schema:"seven-heaven.v5-v6-paper-execution-contract-audit-v1",
  status:"OFFLINE_ENGINE_AUDIT_TESTS_PASS_GAPS_DOCUMENTED",
  session_date:"2026-11-13",simulators:"Unmodified public Administrator V5/V6",
  source_files:sources,reference_instrument_snapshot:SIZES,
  external_instrument_evidence:"seven_heaven_okx_public_eligibility_evidence/SEVEN_HEAVEN_OKX_BTC_ETH_USDC_PUBLIC_ELIGIBILITY_2026_11_13_PROOFS.json",
  historical_fee_reference:"Notion OKX MEMORY CORE 01 Trading Fees, 6/9/12 Nov screenshot",
  limits:["The artificial prices used in the minSz violation counterexample are NOT observed market prices",
    "Fixture books have two deep price levels to isolate arithmetic; NOT observed depth",
    "No account-specific min-notional, fee currency, EEA availability, or executable orders validated",
    "The absence of lotSz validation is a PAPER fidelity gap; not evidence of erroneous paper fee arithmetic"],
  tests:{passed:checkLog.length,failed:0,results:checkLog},
  counts:counters,v5_fixtures:v5Table,v6_fixtures:v6Table,minSz_counterexamples:boundary,
  decisions:{
    runtime_unchanged:true,
    order_enabled:false,
    historical_fee_math:"PASS on synthetic fixture at 0.10% fee and 0.05% slip per side",
    instant_book_fee_math:"PASS on synthetic fixture with 0.10% quote taker fee",
    exchange_lot_min_enforcement:"NOT_IMPLEMENTED in either module",
    V6_sell_as_order_close:"NOT_PROVEN; SELL quoteBudget is mid-based reference, not original BUY base position",
    production_ready:"NO; this is an educational PAPER module with no actual order compliance guarantee"}};
const report=[
"# Seven Heaven — Audit du vrai code V5/V6 : frais, minSz, lotSz et petites quantités",
"",
"**13 novembre 2026 · Tests exécutés sur les sources JavaScript réelles et inchangées de l'Administrator. Aucun ordre réel.**",
"",
"## Résultat",
"",
"**Les calculs de frais V5 et V6 passent les tests de référence, mais les deux moteurs ne sont pas conformes à un moteur d'ordre OKX : ils n'intègrent pas l'arrondi lotSz ni le contrôle minSz des quantités rendues.** Cela ne constitue pas un problème de sécurité d'exécution puisque les modules sont PAPER/read-only, mais une **limite de réalisme** qu'il faut rendre explicite.",
"",
"| Mesure vérifiée sur les moteurs réels | Résultat |",
"|---|---:|",
"| Tests ciblés réussis | "+checkLog.length+"/"+checkLog.length+" |",
"| V5 : quantités d'entrée non alignées sur lotSz aux prix des fixtures | "+counters.v5_entries_not_lot_aligned+"/8 |",
"| V6 : quantités d'achat non alignées sur lotSz aux prix des fixtures | "+counters.v6_buys_not_lot_aligned+"/8 |",
"| V6 : quantités de vente non alignées sur lotSz aux prix des fixtures | "+counters.v6_sells_not_lot_aligned+"/8 |",
"| V6 : quantité SELL ≠ quantité BUY pour un même budget indicatif | "+counters.v6_sell_reference_differs_from_buy_size+"/8 |",
"| V6 : cas de quantité sous minSz accepté dans une fixture de stress | "+counters.v6_below_minSz_counterexamples+"/2 |",
"",
"## Contrat réel et preuves des écarts",
"",
"- **V5 historique :** valide bougies, source OKX, croisements EMA, ordre temporel, coûts et capital. Il calcule \`quantity = cash / (nextOpen × (1+slippage) × (1+fee))\`; la vente fictive emploie \`proceeds = quantity × nextOpen × (1−slippage) × (1−fee)\`. Ces égalités ont été vérifiées sur huit entrées et leur aller-retour clos, pour 10/20/100/1000 USDC sur les deux instruments.",
"- **V6 carnet instantané :** l'achat déduit mathématiquement le coût \`feePercent\` du budget avant de balayer les asks, puis la vente retranche les frais des bids. Les tests vérifient que le budget total achat inclut bien ses frais, sans les doubler.",
"- **Quantités :** V5 et V6 produisent une \`baseQuantity\` calculée en flottants sans la rabattre au pas de quantité \`lotSz\`. Le montant obtenu serait donc susceptible d'être refusé par OKX si réutilisé tel quel dans un ordre réel. L'échantillon des cours de référence 13/11 ne montre **aucune quantité sous \`minSz\` avec un budget ≥ 10 USDC**, mais les calculs ne comportent **aucune validation minSz**.",
"- **Contre-exemple indépendant, pas un prix réel :** une fixture fictive d'ETH à 20 000 USDC ou BTC à 2 000 000 USDC avec seulement 10 USDC démontre que V6 retourne \`ok: true\` pour une quantité inférieure au \`minSz\` public. La faille est **documentaire/fonctionnelle pour l'admissibilité théorique**, pas la preuve d'un ordre réellement exécuté.",
"- **V6 SELL :** le champ \`quoteBudget\` est converti en quantité de base depuis le cours médian du carnet, et non depuis une position V5 achetée. Une estimation SELL à 10 USDC n'est donc **pas** une sortie fidèle du BTC/ETH correspondant à l'estimation BUY de 10 USDC.",
"- **Âge, carnet et profondeur :** les deux fichiers existants possèdent déjà des contrôles de contexte, d'horodatage et de niveau ; les tests d'origine restent nécessaires pour contrôler ces gardes séparément.",
"",
"## Contraintes OKX observées et statut réel",
"",
"| Instrument | minSz public | lotSz public | tickSz public |",
"|---|---:|---:|---:|",
"| BTC-USDC | 0,00001 BTC | 0,00000001 BTC | 0,1 USDC |",
"| ETH-USDC | 0,001 ETH | 0,000001 ETH | 0,01 USDC |",
"",
"Ces valeurs proviennent du relevé public OKX du **13/11/2026 à 01:41 UTC**, sans garantie d'accès sur le compte européen, sans contrôle de notional minimum supplémentaire. Les prix du carnet ci-dessus sont des **références dans des fixtures**, pas des exécutions historiques ou une profondeur réelle.",
"",
"## Décisions",
"",
"1. **Classer V5 et V6 comme simulations théoriques éducatives correctes dans leurs hypothèses, non comme moteurs d'ordres admissibles.** Ne pas faire croire que \`ok: true\` garantit l'acceptation d'un ordre sur OKX.",
"2. Si l'on veut simuler précisément un ordre conforme, ajouter **dans une évolution séparée explicitement demandée** : validation publique \`minSz/lotSz/tickSz\`, arrondi de quantité à la baisse, calcul des frais sur la quantité arrondie, réconciliation de l'inventaire de base pour la vente, contrôle de la devise de commission et gestion des exceptions EEE/min-notional.",
"3. Tester séparément cet adaptateur sans modifier le V5 historique, ni rétroactivement les PnL des études déjà archivées. Ne jamais prétendre que les études Bitstamp/USD sont directement les frais OKX/USDC.",
"",
"## Reproduction",
"",
"- Programme autonome : \`SEVEN_HEAVEN_V5_V6_OKX_SPOT_QUANTITY_LOTS_FEES_MINIMUM_CONTRACT_AUDIT_2026_11_13.cjs\` (Node.js).",
"- Preuves détaillées : \`SEVEN_HEAVEN_V5_V6_OKX_SPOT_QUANTITY_LOTS_FEES_MINIMUM_CONTRACT_AUDIT_2026_11_13_PROOFS.json\`.",
"- Sources d'origine vérifiées par Git Blob SHA-1 : \`"+ORIGINAL.v5.sha+"\` (V5) et \`"+ORIGINAL.v6.sha+"\` (V6).",
"- Les tests synthétiques existants V5 et V6 sont exécutés par le workflow GitHub Actions associé ; leur PASS doit être confirmé sur le run avant de le revendiquer.",
"",
"**Frontière :** aucun changement d'Administrator, d'Operator, du Trader, du Bridge, aucun ordre réel, aucun secret, aucun prix inventé présenté comme une cotation. Seuls le programme de recherche, ses preuves et le rapport sont publiés.",
""
].join("\n");
fs.mkdirSync(OUTPUT,{recursive:true});
const proofFile=path.join(OUTPUT,"SEVEN_HEAVEN_V5_V6_OKX_SPOT_QUANTITY_LOTS_FEES_MINIMUM_CONTRACT_AUDIT_2026_11_13_PROOFS.json");
const reportFile=path.join(OUTPUT,"SEVEN_HEAVEN_V5_V6_OKX_SPOT_QUANTITY_LOTS_FEES_MINIMUM_CONTRACT_AUDIT_2026_11_13_REPORT.md");
const proofText=JSON.stringify(proof,null,2)+"\n";
for(const file of [proofFile,reportFile])if(fs.existsSync(file))throw Error("Immutable evidence already present: "+file);
fs.writeFileSync(proofFile,proofText);
fs.writeFileSync(reportFile,report);
console.log(JSON.stringify({status:"AUDIT_PASS_LIMITATIONS_DEMONSTRATED",tests_passed:checkLog.length,
  counts:counters,source_SHA:sources,evidence_folder:OUTPUT,proof:proofFile,report:reportFile},null,2));
