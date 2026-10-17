"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const shell=read("trader/trading-desk.html");
const mirror=read("trader/trader-runtime-mirror.js");
const admin=read("administrator/index.html");
const page=read("trader/dna-case-study.html");
test("the Trader retains exactly one Administrator market/chart owner",()=>{
 const scripts=[...shell.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(scripts.length,1);
 assert.match(scripts[0],/trader-runtime-mirror\.js/);
 assert.match(shell,/administrator\/index\.html\?surface=trader/);
});
test("DNA replaces the ONE pre-existing Cas d'école, without a floating button",()=>{
 assert.match(admin,/id="traderOkbCaseStudy"/);
 assert.match(mirror,/function mountNativeDnaCase\(win,doc\)/);
 assert.match(mirror,/getElementById\("traderOkbCaseStudy"\)/);
 assert.match(mirror,/mountNativeDnaCase\(win,doc\)/);
 assert.match(mirror,/originalBody\.hidden=dna/);
 assert.match(mirror,/dnaBody\.hidden=!dna/);
 assert.match(mirror,/selectedId==="neosoul"/);
 assert.match(mirror,/chart\?\.coin_id==="neosoul"/);
 assert.match(mirror,/function mountNativeDnaCase/);
 assert.match(mirror,/const showData=async/);
 assert.match(mirror,/url=new URL\("../data\/trader_flux\/dna_paper\/state\.json/);
 assert.match(mirror,/state\.executed_order!==false/);
 assert.doesNotMatch(mirror,/createElement\("iframe"\)|position:fixed|mountDnaCaseStudyDock/);
 assert.doesNotMatch(mirror,/traderDnaCaseToggle|traderDnaCaseDock|mountDnaCaseStudyDock/);
 assert.doesNotMatch(mirror,/position:fixed;right:14px;top:155px/);
});
test("DNA retains source and machine contract, without orders or media",()=>{
 assert.match(page,/<main>/);assert.match(page,/id="case-portfolios"/);
 assert.match(page,/id="case-observations"/);assert.match(page,/id="case-machine"/);
 assert.match(page,/type="application\/json"/);
 assert.match(page,/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory\/main/);
 assert.match(page,/fetch\("\.\.\/data\/trader_flux\/dna_paper\/state\.json/);
 assert.doesNotMatch(page,/<img\b|<canvas\b|<form\b|method="post"/i);
 const scripts=[...page.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).filter(Boolean);
 assert.equal(scripts.length,1);assert.doesNotThrow(()=>new vm.Script(scripts[0]));
 assert.match(scripts[0],/ErithDnaReview\.study\(s\)/);
 assert.match(scripts[0],/Source inaccessible \/ non validée/);
 assert.doesNotMatch(scripts[0],/innerHTML\s*=|localStorage|sessionStorage|\.post\(/);
});
test("hour freshness formatting is valid and source failures remain explicit",()=>{
 assert.match(page,/minimumFractionDigits:Math\.min\(2,d\),maximumFractionDigits:d/);
 const f=(d)=>Number(1.234).toLocaleString("fr-FR",{minimumFractionDigits:Math.min(2,d),maximumFractionDigits:d});
 assert.doesNotThrow(()=>f(1));
 assert.match(f(1),/1,2/);
 assert.doesNotThrow(()=>f(5));
});
test("DNA engine explicitly forbids execution and identity substitution",()=>{
 const {study}=require("../laboratoire/dna-decision-review.js");
 const s={schema:"erith.dna.paper.48h.v1",mode:"PAPER",executed_order:false,
  order_permissions:false,private_account_access:false,venue:"Bitget",
  market:"DNAUSDT",type:"SPOT",quote:"USDT",
  token:{contract:"0xA991F61940095AEA0724ef54077223B048c5CF7b"},
  scenarios:[10,25,100].map(capital_usdc=>({capital_usdc})),observations:[]};
 const o=study(s);assert.equal(o.order_decision,"NO_ORDER");
 assert.equal(o.futures_decision,"INSUFFICIENT_OKX_FUTURES_DATA");
 assert.throws(()=>study({...s,market:"BTCUSDT"}),/identity/);
});
