/* ERITH.IA — Zcash scenario PAPER only. Pure arithmetic, never a trading engine.
   No network, wallet, storage, timers, exchange orders or executable instructions. */
(function(root){
"use strict";
function need(test,why){if(!test)throw new RangeError(why);}
function simulate({budget_usdc,entry_ask_usdc,exit_bid_usdc,buy_fee_percent,sell_fee_percent}){
 const vals=[budget_usdc,entry_ask_usdc,exit_bid_usdc,buy_fee_percent,sell_fee_percent];
 need(vals.every(x=>typeof x==="number"&&Number.isFinite(x)),"Données numériques valides requises");
 need(budget_usdc>0&&budget_usdc<=100000&&entry_ask_usdc>0&&exit_bid_usdc>0,"Prix/budget positifs requis");
 need(buy_fee_percent>=0&&buy_fee_percent<10&&sell_fee_percent>=0&&sell_fee_percent<10,"Frais hypothétiques hors limites");
 const gross_zec=budget_usdc/entry_ask_usdc;
 const net_zec=gross_zec*(1-buy_fee_percent/100);
 const sale_proceeds_usdc=net_zec*exit_bid_usdc*(1-sell_fee_percent/100);
 const pnl_usdc=sale_proceeds_usdc-budget_usdc;
 return Object.freeze({gross_zec,net_zec,sale_proceeds_usdc,pnl_usdc,
  pnl_pct:pnl_usdc/budget_usdc*100,real_orders:0,execution_proven:false,
  minSz_verified:false,lotSz_verified:false,tickSz_verified:false,
  fees_account_verified:false,quote:"USDC",mode:"PAPER_ONLY"});
}
const api=Object.freeze({simulate,read_only:true,real_orders:false});
if(typeof module==="object"&&module.exports)module.exports=api;
if(root)root.SevenZcashPaperModel=api;
})(typeof window==="undefined"?null:window);
