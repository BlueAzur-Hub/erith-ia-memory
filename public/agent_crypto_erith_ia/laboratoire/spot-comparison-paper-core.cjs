/* ERITH.IA · Seven Heaven · read-only price-based research; no execution. */
"use strict";
const analyze=function analyze(archives){
"use strict";
const requireTrue=(x,s)=>{if(!x)throw new Error(s)};
const pairs=["KMNO-USDC","KAT-USDC","IRYS-USDC"];
const costs=[0.2,0.8,1.6];
const pct=v=>Math.round(v*10000)/10000;
const round=v=>Math.round(v*1e6)/1e6;
requireTrue(Array.isArray(archives)&&archives.length===3,"Expected exactly three native archives");
const items=archives.map((doc,k)=>{
  const pair=pairs[k];
  requireTrue(doc&&doc.schema==="erith.okx-native-spot-candles.v1"&&doc.pair===pair&&doc.quote==="USDC"&&doc.instrument_type==="SPOT"&&doc.orders_enabled===false&&doc.account_access===false,"Native quote/identity mismatch for "+pair);
  requireTrue(doc.bar_interval_ms?.["1H"]===3600000&&Array.isArray(doc.candles?.["1H"]),"Missing true one-hour series");
  const source=doc.candles["1H"],rows=[];
  for(let i=0;i<source.length;i++){
    let x=source[i];
    requireTrue(Array.isArray(x)&&x.length===8,"Malformed OHLCV row for "+pair);
    let n=x.map(Number);
    requireTrue(n.every(Number.isFinite)&&n[0]>0&&n[1]>0&&n[4]>0&&n[2]>=Math.max(n[1],n[4])&&n[3]>0&&n[3]<=Math.min(n[1],n[4])&&n[5]>=0&&n[6]>=0,"Invalid real OHLCV at "+i);
    requireTrue(i===0||n[0]-rows[i-1][0]===3600000,"Gap or duplicated hourly timestamp");
    rows.push(n);
  }
  requireTrue(rows.length>=150,"Insufficient hourly history");
  requireTrue(rows[rows.length-1][0]<Date.parse(doc.generated_at_utc),"Future candle relative to archive metadata");
  const split=Math.max(25,Math.floor(rows.length*.7));
  const summary={pair,market:"OKX Spot",quote:"USDC",source_snapshot_utc:doc.generated_at_utc,
    history_start_utc:new Date(rows[0][0]).toISOString(),
    history_last_closed_utc:new Date(rows[rows.length-1][0]).toISOString(),
    test_start_utc:new Date(rows[split][0]).toISOString(),test_hours:rows.length-split,
    hourly_bars:rows.length,zero_quote_volume_bars:rows.filter(x=>x[6]===0).length,
    no_volume_pct:pct(rows.filter(x=>x[6]===0).length/rows.length*100)};
  const scenarios=[
   {key:"momentum",label:"Après une hausse ≥ 5 % sur 24 h",direction:1},
   {key:"rebound",label:"Après une baisse ≤ −5 % sur 24 h",direction:-1}
  ].map(s=>{
   const trades=[];let scannedSignals=0,filteredSignals=0;
   for(let i=split;i+24<rows.length;i++){
     const gain=rows[i][4]/rows[i-24][4]-1;
     if(!(s.direction===1?gain>=.05:gain<=-.05))continue;
     scannedSignals++;
     // Only data observable AT DECISION TIME may qualify a signal.
     const past24Quote=rows.slice(i-23,i+1).reduce((sum,x)=>sum+x[6],0);
     if(rows[i][6]<10||past24Quote<1000){filteredSignals++;continue}
     const entry=rows[i+1],exit=rows[i+24];
     const factor=exit[4]/entry[1];
     trades.push({
       signal_utc:new Date(rows[i][0]+3600000).toISOString(),
       entry_hour_utc:new Date(entry[0]).toISOString(),
       exit_hour_utc:new Date(exit[0]).toISOString(),
       signal_change_24h_pct:pct(gain*100),
       entry_open_usdc:entry[1], exit_close_usdc:exit[4],
       gross_return_pct:pct((factor-1)*100),
       entry_quote_volume_usdc:round(entry[6]),exit_quote_volume_usdc:round(exit[6]),
       entry_bar_without_trades:entry[6]===0,
       exit_bar_without_trades:exit[6]===0,
       // Even positive hourly traded volume does not establish book depth or execution.
       executed_order:false,matched_book_depth:false
     });
     // Non-overlap: next decision after the previous modeled 24h exit.
     i+=23;
   }
   const sensitivity=costs.map(fee=>{
      let cash=1,wins=0,peak=1,maxdd=0;
      const path=[];
      for(const t of trades){
        let gross=t.exit_close_usdc/t.entry_open_usdc;
        cash*=gross*(1-fee/100);if(gross*(1-fee/100)>1)wins++;
        if(cash>peak)peak=cash;
        let dd=(peak-cash)/peak;
        if(dd>maxdd)maxdd=dd;
        path.push({at_utc:t.exit_hour_utc,equity_multiple:round(cash)});
      }
      return {assumed_roundtrip_cost_pct:fee,model_return_pct:pct((cash-1)*100),wins,
         trade_level_drawdown_pct:pct(maxdd*100),equity_multiples:path};
   });
   return {strategy:s.key,label:s.label,raw_signal_hours:scannedSignals,
     excluded_signal_hours:filteredSignals,modeled_trades:trades.length,
     entry_zero_volume:trades.filter(t=>t.entry_bar_without_trades).length,
     exit_zero_volume:trades.filter(t=>t.exit_bar_without_trades).length,
     cost_scenarios:sensitivity,trades};
  });
  const hold=costs.map(fee=>({assumed_roundtrip_cost_pct:fee,
    model_return_pct:pct((rows[rows.length-1][4]/rows[split][4]*(1-fee/100)-1)*100)}));
  return {...summary,scenarios,benchmarks:{no_trade_pct:0,buy_and_hold_cost_scenarios:hold}};
});
return {schema:"erith.seven.spot-model-price-only.v1",study_type:"EXPLORATORY_RETROSPECTIVE_NOT_PROSPECTIVE",
   report_date_utc:"2026-10-24",
   rules:{source:"OKX public history-candles / confirmed 1H bars",signal_lookback_hours:24,
      decision:"after signal hourly candle closes",entry:"following hourly OPEN (hypothetical)",exit:"24th following hourly CLOSE (hypothetical)",holding_hours:24,
      chronological_test_fraction:0.3,threshold_momentum_pct:5,threshold_rebound_pct:-5,
      minimum_signal_bar_quote_volume_usdc:10,minimum_trailing_24h_quote_volume_usdc:1000,
      overlapping_positions:false,capital_tickets_usdc:[100,400,1000],
      cost_assumptions_roundtrip_pct:costs},
   caveats:["No historical order book or confirmed bid/ask at entry and exit: no fills and no certified tradable gains",
   "Signal screened using known historical quote volume only; entry/exit bar volume reviewed afterward as evidence quality, never as a selection filter",
   "The chronological 70/30 split is an exploratory historical comparison, not an untouched prospective holdout or a certified strategy",
   "USDC is the native quote. No USD or USDT conversion, no real trading permissions",
   "The buy-and-hold descriptive benchmark has more time invested than sparse trade models, so it is not a matched risk benchmark",
   "Trade-level drawdown omits intra-trade drawdown and any liquidation/slippage",
   "Notional 100/400/1000 USDC is a linear paper illustration; execution capacity is not verified"],
   orders_enabled:false,real_orders:0,paper_fills:0,execution_certified:false,
   instruments:items};
};
module.exports={analyze};
if(require.main===module){
 const fs=require("node:fs"),path=require("node:path");
 const root=path.resolve(__dirname,"../data/crypto/okx-hourly");
 const paths=[path.join(root,"spot-candles/kmno-usdc.json"),path.join(root,"spot-candles/kat-usdc.json"),path.join(root,"irys-spot-candles.json")];
 const docs=paths.map(p=>JSON.parse(fs.readFileSync(p,"utf8")));
 process.stdout.write(JSON.stringify(analyze(docs),null,2)+String.fromCharCode(10));
}
