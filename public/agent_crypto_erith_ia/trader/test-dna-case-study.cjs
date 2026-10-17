"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=(p)=>fs.readFileSync(path.join(root,p),"utf8");
const shell=read("trader/trading-desk.html");
const mirror=read("trader/trader-runtime-mirror.js");
const page=read("trader/dna-case-study.html");
const review=read("laboratoire/dna-decision-review.js");

test("Trader keeps a single Administrator runtime and only one entrypoint script",()=>{
 const scripts=[...shell.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(scripts.length,1,"No parallel Trader owner should mount");
 assert.match(scripts[0],/trader-runtime-mirror\.js/);
 assert.match(shell,/src="\.\.\/administrator\/index\.html\?surface=trader"/);
 assert.doesNotMatch(shell,/dna-case-study\.js|secondRuntime|newOwner/);
});
test("DNA drawer is Trader-only, collapsible, lazy and keyboard accessible",()=>{
 assert.match(mirror,/function mountDnaCaseStudyDock\(/);
 assert.match(mirror,/mountDnaCaseStudyDock\(\);/);
 assert.match(mirror,/id="traderDnaCaseToggle"/);
 assert.match(mirror,/panel\.hidden=true/);
 assert.match(mirror,/aria-expanded/);
 assert.match(mirror,/setOpen\(panel\.hidden\)/);
 assert.match(mirror,/if\(!loaded\)\{content\.src=caseUrl;loaded=true;/);
 assert.match(mirror,/event\.key==="Escape"/);
 assert.match(mirror,/dna-case-study\.html/);
 assert.doesNotMatch(mirror,/fetch\(|\bplaceOrder\(/);
});
test("DNA case study is semantic, human-readable and cites the exact public source",()=>{
 assert.match(page,/<main>/);
 assert.match(page,/Dossier DNA|Cas d'école DNA/);
 assert.match(page,/type="application\/json"/);
 assert.match(page,/id="case-observations"/);
 assert.match(page,/id="case-portfolios"/);
 assert.match(page,/id="case-machine"/);
 assert.match(page,/raw\.githubusercontent\.com\/BlueAzur-Hub\/erith-ia-memory\/main\/public\/agent_crypto_erith_ia\/data\/trader_flux\/dna_paper\/state\.json/);
 assert.match(page,/fetch\("\.\.\/data\/trader_flux\/dna_paper\/state\.json\?source=dna-case-study"/);
 assert.match(page,/\.\.\/laboratoire\/dna-decision-review\.js/);
 assert.match(page,/Futures.*distinct/);
 assert.doesNotMatch(page,/<img\b|<canvas\b|<form\b|type="password"|method="post"/i);
});
test("inline reader has valid syntax and never fabricates data on fetch failures",()=>{
 const chunks=[...page.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]);
 assert.equal(chunks.length,1);
 assert.doesNotThrow(()=>new vm.Script(chunks[0],{filename:"dna-case-study-inline.js"}));
 assert.match(chunks[0],/ErithDnaReview\.study\(s\)/);
 assert.match(chunks[0],/\.catch\(e=>/);
 assert.match(chunks[0],/Source inaccessible \/ non validée/);
 assert.match(chunks[0],/textContent/);
 assert.doesNotMatch(chunks[0],/innerHTML\s*=|\.submit\(|localStorage|sessionStorage|\.post\(/);
});
test("canonical PAPER engine fails closed and does not enable Futures",()=>{
 const {study}=require("../laboratoire/dna-decision-review.js");
 const state={
 schema:"erith.dna.paper.48h.v1",mode:"PAPER",executed_order:false,
 order_permissions:false,private_account_access:false,venue:"Bitget",
 market:"DNAUSDT",type:"SPOT",quote:"USDT",
 token:{contract:"0xA991F61940095AEA0724ef54077223B048c5CF7b"},
 scenarios:[10,25,100].map(capital_usdc=>({capital_usdc,status:"open"})),observations:[]
 };
 const result=study(state);
 assert.equal(result.order_decision,"NO_ORDER");
 assert.equal(result.futures_decision,"INSUFFICIENT_OKX_FUTURES_DATA");
 assert.throws(()=>study({...state,market:"BTCUSDT"}),/policy/);
 assert.throws(()=>study({...state,executed_order:true}),/policy/);
});
