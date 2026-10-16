/* ERITH.IA · Cas d'école NeoSoul (DNA) — scénarios PAPER arithmétiques.
 * Source price: human screenshot of USD display (not Bitget executable USDT).
 * Pure local arithmetic via existing Trader PAPER core. NO HTTP, NO storage, NO orders. */
((root,factory)=>{
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.AgentCryptoDnaPaperSchool=api;
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
  "use strict";
  const DNA=Object.freeze({
    id:"neosoul",symbol:"DNA",name:"NeoSoul",
    referencePriceUsd:0.296674,referenceLabel:"Capture Trader du 16/10/2026 vers 17 h 37 (France)",
    market:"DNA/USDT",venue:"Bitget Spot",currency:"USD_PAPER_DISPLAY",
    contract:"0xA991F61940095AEA0724ef54077223B048c5CF7b",
    realOrders:false,
  });
  const RANGES=Object.freeze([-20,-5,0,5,20]);
  const BTC_MOVES=Object.freeze([-10,-5,0,5,10]);
  const valid=n=>typeof n==="number"&&Number.isFinite(n);
  function simulateDNA(core,config={}){
    if(!core||typeof core.assess!=="function")return {ok:false,reason:"Noyau PAPER Trader indisponible."};
    const c={capital:2,price:DNA.referencePriceUsd,entryFeePct:0.2,exitFeePct:0.2,
      spreadPct:0.1,slippagePct:0.1,...config};
    const result=core.assess(c);
    if(!result.ok)return result;
    return Object.freeze({
      ok:true,mode:"PAPER_48H_SCENARIOS_NOT_OBSERVATIONS",
      asset:"NeoSoul · DNA",market:"DNA/USDT",venue:"Bitget Spot",
      referenceType:"USD_DISPLAY_SCREENSHOT_NOT_EXECUTABLE_USDT",
      referencePriceUsd:c.price,
      amountUnit:"USD_PAPER_NOT_USDC_OR_USDT",
      capital:result.capital,quantityNotTradable:result.quantity,
      estimatedBreakEvenPct:result.breakEvenMovePct,
      costs:Object.freeze({
        entryFeePct:result.entryFeePct,exitFeePct:result.exitFeePct,
        spreadPct:result.spreadPct,slippagePct:result.slippagePct
      }),
      scenarios:Object.freeze(RANGES.map(pct=>{
        const row=result.simulate(pct);
        return Object.freeze({movePct:pct,netUsdPaper:row.net,profitUsdPaper:row.profit,returnPct:row.returnPct});
      })),
      marketExecution:false,realOrders:false,tradeMinimumKnown:false,
      liquidityProven:false,priceObservedAtT48:false,
      fxUsdcUsdtValidated:false
    });
  }
  function simulateBTC(positionUsd=6.35,reserveUsdc=4.38){
    if(!valid(positionUsd)||positionUsd<0||!valid(reserveUsdc)||reserveUsdc<0)
      return {ok:false,reason:"Valorisation ou réserve invalide."};
    return Object.freeze({
      ok:true,mode:"BTC_MARK_TO_MARKET_14D_HYPOTHETICAL",
      referencePositionUsd:positionUsd,reserveUsdc,
      scenarios:Object.freeze(BTC_MOVES.map(movePct=>Object.freeze({
        movePct,btcValueUsd:positionUsd*(1+movePct/100),
        deltaUsd:positionUsd*movePct/100,
        totalReferenceUsd:positionUsd*(1+movePct/100)+reserveUsdc,
      }))),
      caveat:"Variations fictives à 14 jours, sans prix futur, coût de revient prouvé, conversion USDC/USD ou frais de sortie. Aucune transaction.",
      realOrders:false
    });
  }
  function attach(doc,core){
    const el=id=>doc.getElementById(id);
    if(!el("dna-result")||!el("btc-result"))return false;
    const fmt=(n,d=5)=>valid(n)?new Intl.NumberFormat("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:2}).format(n):"—";
    const rows=(target,head,entries)=>{
      target.replaceChildren();
      const h=doc.createElement("strong");h.textContent=head;target.append(h);
      const table=doc.createElement("table");
      const thead=doc.createElement("thead"),tr=doc.createElement("tr");
      for(const title of ["Scénario de cours","Valeur théorique","Écart fictif"]){
        const th=doc.createElement("th");th.textContent=title;tr.append(th);
      }
      thead.append(tr);table.append(thead);
      const tbody=doc.createElement("tbody");
      for(const [label,value,delta] of entries){
        const line=doc.createElement("tr");
        for(const val of [label,value,delta]){const td=doc.createElement("td");td.textContent=val;line.append(td)}
        tbody.append(line);
      }
      table.append(tbody);target.append(table);
    };
    function recalculate(){
      const value=id=>Number(String(el(id)?.value||"").trim().replace(",","."));
      const out=simulateDNA(core,{
        capital:value("dna-capital"),price:value("dna-price"),
        entryFeePct:value("dna-in-fee"),exitFeePct:value("dna-out-fee"),
        spreadPct:value("dna-spread"),slippagePct:value("dna-slip")
      });
      if(!out.ok){el("dna-result").textContent="Calcul suspendu : "+out.reason;return;}
      rows(el("dna-result"),"DNA · Hypothèses à 48 heures — aucun cours futur observé",
        out.scenarios.map(r=>[
          (r.movePct>0?"+":"")+r.movePct+" %",fmt(r.netUsdPaper)+" USD PAPER",
          (r.profitUsdPaper>=0?"+":"")+fmt(r.profitUsdPaper)+" USD PAPER"
        ]));
      el("dna-threshold").textContent="Point mort théorique : +"+fmt(out.estimatedBreakEvenPct,3)+" %. Quantité fictive : "+fmt(out.quantityNotTradable,7)+" DNA. Ces données ne vérifient pas la liquidité ni le minimum Bitget.";
      const btc=simulateBTC();
      rows(el("btc-result"),"BTC · Conservation 14 jours — variation fictive depuis la capture",
        btc.scenarios.map(r=>[(r.movePct>0?"+":"")+r.movePct+" %",
          fmt(r.btcValueUsd)+" USD (BTC)",
          (r.deltaUsd>=0?"+":"")+fmt(r.deltaUsd)+" USD (BTC)"]));
      el("btc-note").textContent="Réserve inchangée : "+fmt(btc.reserveUsdc)+" USDC ; sa contre-valeur USD n'est pas certifiée. Aucun achat, vente ou profit total déduit.";
    }
    el("dna-calc")?.addEventListener("click",recalculate);
    recalculate();return true;
  }
  if(typeof document!=="undefined"){
    const boot=()=>attach(document,globalThis.AgentCryptoPaperLabCore);
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  }
  return Object.freeze({DNA,simulateDNA,simulateBTC,attach,readOnly:true});
});