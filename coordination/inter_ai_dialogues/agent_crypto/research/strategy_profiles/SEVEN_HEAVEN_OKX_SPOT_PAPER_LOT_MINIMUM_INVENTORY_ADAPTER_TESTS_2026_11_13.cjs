#!/usr/bin/env node
"use strict";
/* Pure offline integration/contract tests; no exchange orders or private APIs. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=process.cwd();
const BASE="coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/";
const ADAPTER="SEVEN_HEAVEN_OKX_SPOT_PAPER_LOT_MINIMUM_INVENTORY_ADAPTER_2026_11_13.cjs";
const adapter=require(path.join(ROOT,BASE,ADAPTER));
const sourcePath=path.join(ROOT,BASE,"seven_heaven_okx_public_eligibility_evidence/SEVEN_HEAVEN_OKX_BTC_ETH_USDC_PUBLIC_ELIGIBILITY_2026_11_13_PROOFS.json");
const source=JSON.parse(fs.readFileSync(sourcePath,"utf8"));
assert.equal(source.errors.length,0);
const feePpm=1000,slipPpm=500;
const budgets=["10","20","100","1000"],cases=[],examples=[];
function test(name,fn){
 try{const summary=fn()||{};cases.push({name,result:"PASS",...summary});}
 catch(e){cases.push({name,result:"FAIL",error:String(e.stack||e)});process.exitCode=1;}
}
const S=1000000000000n;
function atoms(s){
 const p=String(s).split(".");return BigInt(p[0])*S+BigInt((p[1]||"").padEnd(12,"0"));
}
function quoteConserved(start,spent,residual){
 assert.equal(atoms(spent)+atoms(residual),atoms(start));
}
function meta(pair){return source.pairs[pair].instrument;}
function book(pair,askShift="0"){
 const pairSource=source.pairs[pair],inst=meta(pair);
 const tick=Number(inst.tickSz);
 const dp=inst.tickSz.split(".")[1]?.length||0;
 const ask=(Number(pairSource.ticker.askPx)+Number(askShift)).toFixed(dp);
 const bid=(Number(pairSource.ticker.bidPx)+Number(askShift)).toFixed(dp);
 const ask2=(Number(ask)+tick).toFixed(dp);
 const bid2=(Number(bid)-tick).toFixed(dp);
 const thin=pair==="BTC-USDC"?"0.00003":"0.003";
 return {instId:pair,sourceObservedAt:"2026-11-13T01:41:02.974Z",
   asks:[[ask,thin],[ask2,"100"]],bids:[[bid,thin],[bid2,"100"]]};
}
const NOW=Date.parse("2026-11-13T01:41:03.000Z");
test("Safe offline exports, no order path",()=>{
 assert.equal(adapter.read_only,true);assert.equal(adapter.orders,0);
 assert.equal(adapter.real_order,false);assert.equal(adapter.api_credentials,false);
 assert.equal(adapter.public_eligibility_guaranteed,false);
 assert.equal(Object.keys(adapter).filter(k=>/sendOrder|execute|auth/i.test(k)).length,0);
});
test("Source provenance and public instrument identity",()=>{
 assert.equal(source.completed_utc.startsWith("2026-11-13"),true);
 for(const pair of ["BTC-USDC","ETH-USDC"]){
  assert.equal(meta(pair).instType,"SPOT");assert.equal(meta(pair).state,"live");
  assert.equal(meta(pair).instId,pair);assert.equal(meta(pair).quoteCcy,"USDC");
 }
});
for(const pair of ["BTC-USDC","ETH-USDC"]){
 const spec=meta(pair),levels=book(pair),lot=atoms(spec.lotSz),minimum=atoms(spec.minSz);
 for(const budget of budgets){
  test(pair+" "+budget+" USDC V5 entry inventory and fees",()=>{
   const b=adapter.referenceBuy({spec,budget,referencePrice:source.pairs[pair].ticker.askPx,feePpm,slipPpm});
   assert.equal(b.ok,true,JSON.stringify(b));
   assert.equal(b.orders,0);assert.equal(b.read_only,true);
   assert(atoms(b.quantity_base)>=minimum);
   assert.equal(atoms(b.quantity_base)%lot,0n);
   quoteConserved(budget,b.total_debit_usdc,b.cash_remainder_usdc);
   assert.equal(atoms(b.notional_usdc)+atoms(b.fee_quote_usdc),atoms(b.total_debit_usdc));
   assert.equal(b.account_trading_permission_checked,false);
   assert.equal(b.other_quote_minimum_checked,false);
   const rawBudget=Number(budget),entryPrice=Number(b.model_fill_price);
   const unrounded=rawBudget/(entryPrice*1.001);
   assert(Number(b.quantity_base)<=unrounded+1e-14);
   const sold=adapter.referenceSell({spec,inventoryBase:b.quantity_base,
     referencePrice:source.pairs[pair].ticker.bidPx,feePpm,slipPpm});
   assert.equal(sold.ok,true);assert.equal(sold.quantity_base,b.quantity_base);
   assert.equal(sold.inventory_after_base,"0");
   assert.equal(atoms(sold.gross_proceeds_usdc)-atoms(sold.fee_quote_usdc),
     atoms(sold.net_proceeds_usdc));
   const round=adapter.referenceRoundTrip({spec,budget,entryPrice:source.pairs[pair].ticker.askPx,
     exitPrice:source.pairs[pair].ticker.bidPx,feePpm,slipPpm});
   assert.equal(round.ok,true);assert.equal(round.inventory_remaining_base,"0");
   assert.equal(atoms(round.end_quote_usdc)-atoms(round.start_quote_usdc),atoms(round.pnl_quote_usdc));
   assert(atoms(round.pnl_quote_usdc)<0n);
   return {qty:b.quantity_base,remaining_quote:b.cash_remainder_usdc,pnl:round.pnl_quote_usdc};
  });
  test(pair+" "+budget+" USDC V6 book two levels and exact inventory sell",()=>{
   const b=adapter.buyFromBook({spec,budget,book:levels,nowMs:NOW,feePpm});
   assert.equal(b.ok,true,JSON.stringify(b));
   assert.equal(b.levels_used,2);
   assert.equal(atoms(b.quantity_base)%lot,0n);
   assert(atoms(b.quantity_base)>=minimum);
   quoteConserved(budget,b.total_debit_usdc,b.cash_remainder_usdc);
   const s=adapter.sellInventoryToBook({spec,inventoryBase:b.quantity_base,
     book:levels,nowMs:NOW,feePpm});
   assert.equal(s.ok,true);
   assert.equal(s.quantity_base,b.quantity_base);
   assert.equal(s.inventory_before_base,b.quantity_base);
   assert.equal(s.inventory_after_base,"0");
   assert.equal(atoms(s.gross_proceeds_usdc)-atoms(s.fee_quote_usdc),atoms(s.net_proceeds_usdc));
   const rt=adapter.bookRoundTrip({spec,budget,book:levels,nowMs:NOW,feePpm});
   assert.equal(rt.ok,true,JSON.stringify(rt));
   assert.equal(rt.inventory_remaining_base,"0");assert.equal(rt.orders,0);
   assert.equal(atoms(rt.end_quote_usdc)-atoms(rt.start_quote_usdc),atoms(rt.pnl_quote_usdc));
   assert(atoms(rt.pnl_quote_usdc)<0n);
   examples.push({pair,budget_usdc:budget,bought_base:b.quantity_base,
     sell_base:s.quantity_base,residual_usdc:b.cash_remainder_usdc,
     same_book_friction_usdc:rt.pnl_quote_usdc});
   return {qty:b.quantity_base,sold_qty:s.quantity_base,pnl:rt.pnl_quote_usdc};
  });
 }
 const extreme=pair==="BTC-USDC"?"2000000":"20000";
 test(pair+" refuses sub-minimum after lot floor in extreme reference scenario",()=>{
  const x=adapter.referenceBuy({spec,budget:"10",referencePrice:extreme});
  assert.equal(x.ok,false);assert.equal(x.code,"MIN_SIZE_AFTER_LOT");assert.equal(x.orders,0);
 });
 test(pair+" refuses sub-minimum after lot floor in extreme book scenario",()=>{
  const stress=book(pair);
  stress.asks=[[extreme,"100"]];
  stress.bids=[[String(Number(extreme)-Number(spec.tickSz)),"100"]];
  const x=adapter.buyFromBook({spec,budget:"10",book:stress,nowMs:NOW});
  assert.equal(x.ok,false);assert.equal(x.code,"MIN_SIZE_AFTER_LOT");
 });
 test(pair+" limit-price tick precision is checked without inventing a market limit order",()=>{
  const px=source.pairs[pair].ticker.askPx;
  assert.equal(adapter.validateLimitPrice({spec,price:px}).valid_tick,true);
  assert.equal(adapter.validateLimitPrice({spec,price:(Number(px)+Number(spec.tickSz)/10).toFixed(
     (spec.tickSz.split(".")[1]||"").length+1)}).valid_tick,false);
 });
 test(pair+" book timestamp and pair integrity are fail-closed",()=>{
  assert.throws(()=>adapter.buyFromBook({spec,budget:"10",book:book(pair),nowMs:NOW+20000}),
    /stale/);
  const wrong={...book(pair),instId:"OTHER-USDC"};
  assert.throws(()=>adapter.buyFromBook({spec,budget:"10",book:wrong,nowMs:NOW}),/pair/);
 });
 test(pair+" cannot sell inventory smaller than minSz",()=>{
  const belowAtoms=atoms(spec.minSz)-atoms(spec.lotSz);
  const asDecimal=(x)=>{const f=(x%S).toString().padStart(12,"0").replace(/0+$/,"");return (x/S).toString()+(f?"."+f:"");};
  const x=adapter.sellInventoryToBook({spec,inventoryBase:asDecimal(belowAtoms),book:book(pair),nowMs:NOW});
  assert.equal(x.ok,false);assert.equal(x.code,"MIN_SIZE_AFTER_LOT");
 });
 test(pair+" refuses missing depth instead of partial fill",()=>{
  const shallow=book(pair);
  shallow.bids=[[shallow.bids[0][0],spec.minSz]];
  const b=adapter.buyFromBook({spec,budget:"100",book:book(pair),nowMs:NOW});
  assert.equal(b.ok,true);
  const s=adapter.sellInventoryToBook({spec,inventoryBase:b.quantity_base,
    book:shallow,nowMs:NOW});
  assert.equal(s.ok,false);assert.equal(s.code,"INSUFFICIENT_LIQUIDITY");
 });
}
test("V6 original raw fraction is different from adapter's lot-rounded quantity",()=>{
 require(path.join(ROOT,"public/agent_crypto_erith_ia/administrator/js/market-microscope-orderbook-paper-v6.js"));
 const original=globalThis.ErithMarketBookPaperV6;
 assert.equal(original.read_only,true);
 for(const pair of ["BTC-USDC","ETH-USDC"]){
  const spec=meta(pair),b=book(pair);
  const raw={provider:"okx",freshness:"FRESH",loading:false,error:null,external:false,
    pair:pair.replace("-","/"),loadedAsset:pair.split("-")[0],loadedQuote:"USDC",
    sourceObservedAt:b.sourceObservedAt,asks:b.asks,bids:b.bids};
  const originalRun=original.simulate(raw,{loadedInstrument:pair,source:"OKX public candles"},
    {side:"BUY",quoteBudget:10,feePercent:.1},NOW);
  assert.equal(originalRun.ok,true,JSON.stringify(originalRun));
  const adapted=adapter.buyFromBook({spec,budget:"10",book:b,nowMs:NOW});
  assert.equal(adapted.ok,true);
  assert(Number(adapted.quantity_base)<originalRun.baseQuantity,
    "Expected quantity floor (not unrounded original)");
  assert.equal(atoms(adapted.quantity_base)%atoms(spec.lotSz),0n);
 }
});
test("No input mutation for contract metadata, order book or original proofs",()=>{
 const pair="BTC-USDC",spec=meta(pair),b=book(pair),before=JSON.stringify([spec,b]);
 const result=adapter.bookRoundTrip({spec,budget:"10",book:b,nowMs:NOW});
 assert.equal(result.ok,true);assert.equal(JSON.stringify([spec,b]),before);
});
const failed=cases.filter(x=>x.result!=="PASS");
if(failed.length){
 console.error(JSON.stringify({status:"FAIL",failed},null,2));
 process.exit(1);
}
const out=path.join(ROOT,BASE,"seven_heaven_okx_spot_paper_adapter_evidence");
fs.mkdirSync(out,{recursive:true});
const sha=(f)=>crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const proof={
 schema:"seven-heaven.okx-spot-paper-quantity-inventory-adapter-tests-v1",
 date_utc:"2026-11-13",status:"PASS_OFFLINE_RESEARCH_ONLY_NOT_EXCHANGE_CERTIFIED",
 program:BASE+ADAPTER,program_sha256:sha(path.join(ROOT,BASE,ADAPTER)),
 original_v6:"public/agent_crypto_erith_ia/administrator/js/market-microscope-orderbook-paper-v6.js",
 original_v6_sha256:sha(path.join(ROOT,"public/agent_crypto_erith_ia/administrator/js/market-microscope-orderbook-paper-v6.js")),
 public_instrument_evidence:BASE+"seven_heaven_okx_public_eligibility_evidence/SEVEN_HEAVEN_OKX_BTC_ETH_USDC_PUBLIC_ELIGIBILITY_2026_11_13_PROOFS.json",
 public_instrument_evidence_sha256:sha(sourcePath),
 tests_passed:cases.length,tests_failed:0,tests:cases,fixtures:examples,
 risks_and_limits:[
  "No actual orders, private API, network, bridge or modification of V5/V6 runtime",
  "Only known public minSz lotSz tickSz are enforced; not a guarantee of account-specific order validity",
  "Flat 0.1% taker fee charged in USDC quote is assumed; actual account fee currency/exceptions unverified",
  "V5 fixed 0.05% slippage is a hypothesis separate from V6 book impact",
  "Prices and 2-level books in tests are synthetic fixtures anchored to a historical public snapshot",
  "Buying and selling on the same static book measures friction, not temporal profitability",
  "Quote arithmetic uses 12 decimal fixed-point atoms; actual OKX quote-precision and min-notional need separate verification"]
};
const report=[
 "# Seven Heaven — Adaptateur PAPER isolé : quantités, frais et inventaire BTC/ETH USDC",
 "",
 "**13 novembre 2026. Développement de laboratoire, en lecture seule ; production intacte.**",
 "",
 "## Livraison réalisée",
 "",
 "- Module de recherche autonome Node.js : \`"+ADAPTER+"\`. Le module n'est chargé ni par l'Administrator ni par le Trader.",
 "- Tests déterministes : \`SEVEN_HEAVEN_OKX_SPOT_PAPER_LOT_MINIMUM_INVENTORY_ADAPTER_TESTS_2026_11_13.cjs\`.",
 "- Références des tailles : relevé officiel **public** OKX du 13 novembre 2026, **BTC-USDC** minSz 0.00001 BTC, lotSz 0.00000001 BTC, tickSz 0.1 USDC ; **ETH-USDC** minSz 0.001 ETH, lotSz 0.000001 ETH, tickSz 0.01 USDC.",
 "- \`"+cases.length+"\` tests déterministes réussis ; tous les jeux normaux 10/20/100/1000 USDC pour les deux marchés couvrent achats/sorties V5, achats/ventes V6 et réconciliation de quantité.",
 "",
 "## Ce que corrige le laboratoire — sans changer les simulateurs existants",
 "",
 "1. **Arrondi à la baisse \`lotSz\`** (BigInt à 12 décimales de précision) et test public \`minSz\` avant de déclarer un résultat de simulation recevable.",
 "2. **Frais recalculés après arrondi**, achat et vente séparés, sous une hypothèse explicitement fixe de **0,10 % taker en USDC** par côté ; V5 conserve **0,05 % de glissement fixe** par côté, et V6 utilise les seuls niveaux d'un carnet synthétique sans ajouter le spread deux fois.",
 "3. **Vente de la quantité effectivement achetée** : le simulateur V6 ne transforme plus un montant de vente indépendant en inventaire fictif. Le reliquat de liquidités après l'achat est conservé dans le bilan final.",
 "4. **Blocage des quantités sous \`minSz\`**, de la profondeur insuffisante, d'un carnet périmé/d'une autre paire ; contrôle séparé de \`tickSz\` pour un prix d'ordre limite, sans appliquer à tort cet arrondi aux prix OHLC historiques.",
 "",
 "## Exemples avec carnet de test synthétique (ce ne sont pas les vrais prix d'exécution)",
 "",
 "| Marché | Budget USDC | Quantité achetée = revendue | Cash résiduel USDC | Friction aller-retour USDC |",
 "|---|---:|---:|---:|---:|"
];
for(const x of examples){
 report.push("| "+x.pair+" | "+x.budget_usdc+" | "+x.bought_base+" | "+x.residual_usdc+" | "+x.same_book_friction_usdc+" |");
}
report.push("","## Limites encore ouvertes",
 "- « Conformité aux contraintes **publiques connues** » ne vaut jamais acceptation d'un ordre **sur le compte européen** : un minimum en devise de cotation, des règles de paire/compte, la devise de frais et la disponibilité EEE peuvent différer.",
 "- Tests entièrement **synthétiques** sur une profondeur à deux niveaux ancrée aux prix du relevé du 13 novembre, non une exécution réelle ni une mesure de performance.",
 "- Ne pas substituer automatiquement les nouveaux calculs aux PnL historiques V5/V6 : le laboratoire est **séparé**, et les historiques déjà publiés gardent leurs hypothèses.",
 "- Aucune permission d'ordre, aucun changement de Bridge, Administrator, Operator, Trader ; scripts de recherche uniquement dans \`coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/\`.",
 "",
 "**Verdict :** l'adaptateur est prêt pour les comparaisons PAPER de laboratoire **après validation CI**, pas pour le déploiement, encore moins pour l'exécution réelle.",
 "");
const jsonFile=path.join(out,"SEVEN_HEAVEN_OKX_SPOT_PAPER_ADAPTER_QUANTITY_INVENTORY_TEST_PROOFS_2026_11_13.json");
const reportFile=path.join(out,"SEVEN_HEAVEN_OKX_SPOT_PAPER_ADAPTER_QUANTITY_INVENTORY_REPORT_2026_11_13.md");
for(const f of [jsonFile,reportFile])if(fs.existsSync(f))throw Error("Refuse to overwrite immutable evidence "+f);
fs.writeFileSync(jsonFile,JSON.stringify(proof,null,2)+"\n");
fs.writeFileSync(reportFile,report.join("\n"));
console.log(JSON.stringify({status:"PASS_LAB_ONLY",tests_passed:cases.length,
 fixtures:examples.length,proof:jsonFile,report:reportFile},null,2));
