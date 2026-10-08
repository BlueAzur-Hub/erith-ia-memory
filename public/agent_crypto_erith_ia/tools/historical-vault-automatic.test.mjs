import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const script=fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/historical-vault-automatic.js","utf8");
const flush=async()=>{await new Promise(resolve=>setImmediate(resolve));await new Promise(resolve=>setImmediate(resolve))};
function fixture({haveCatalog=true}={}){
 const map=new Map();
 function el(id,options={}){
  const events=new Map();const node={id,disabled:false,open:!!options.open,value:options.value||"",
   count:0,textContent:"",addEventListener(event,fn){events.set(event,fn)},
   dispatch(event){events.get(event)?.()},click(){this.count++}};
  map.set(id,node);return node;
 }
 el("analyze");el("r10-automatic-status");
 for(const [detail,btn] of [["r6-archive-adapter","r6-read"],["r7-btc-comparator","r7-check"],["r9-compact","r9-read"]]){el(detail);el(btn)}
 el("r6-asset",{value:"bitcoin"});el("r6-period",{value:"24h"});
 el("r9-asset",{value:"bitcoin"});el("r9-period",{value:"24h"});
 el("r6-result");el("r9-status");
 let idx=0,refresh=0;
 const window=haveCatalog?{SevenCompactArchiveReader:{
  async listCoverage(){idx++;return{quote:"USDT",snapshot:true,coverage:Array(21).fill(null),total:4585,updatedAt:"2026-10-08"}},
  async refreshIndex(){refresh++;return this.listCoverage()}
 }}:{};
 const document={readyState:"complete",getElementById(id){return map.get(id)||null}};
 vm.runInNewContext(script,{window,document});
 return{map,node:id=>map.get(id),calls:()=>({idx,refresh})};
}
test("page loads once and checks only compact index, not individual bars",async()=>{
 const f=fixture();await flush();
 assert.equal(f.node("analyze").count,1);
 assert.equal(f.calls().idx,1);
 for(const button of ["r6-read","r7-check","r9-read"])assert.equal(f.node(button).count,0);
 assert.match(f.node("r10-automatic-status").textContent,/4585/);
});
test("opening a section automatically fetches only that series; changes trigger a new selection",async()=>{
 const f=fixture();await flush();
 const panel=f.node("r9-compact");panel.open=true;panel.dispatch("toggle");await flush();
 assert.equal(f.calls().refresh,1);assert.equal(f.node("r9-read").count,1);
 f.node("r9-period").value="7d";f.node("r9-period").dispatch("change");await flush();
 assert.equal(f.calls().refresh,2);assert.equal(f.node("r9-read").count,2);
 panel.open=false;panel.dispatch("toggle");await flush();
 assert.equal(f.node("r9-read").count,2);
 panel.open=true;panel.dispatch("toggle");await flush();
 assert.equal(f.node("r9-read").count,3);
 const r6=f.node("r6-archive-adapter");r6.open=true;r6.dispatch("toggle");await flush();
 assert.equal(f.node("r6-read").count,1);
 const r7=f.node("r7-btc-comparator");r7.open=true;r7.dispatch("toggle");await flush();
 assert.equal(f.node("r7-check").count,1);
});
test("missing compact reader displays a recoverable warning and does not run any block",async()=>{
 const f=fixture({haveCatalog:false});await flush();
 assert.equal(f.node("analyze").count,1);
 assert.match(f.node("r10-automatic-status").textContent,/indisponible/);
 assert.equal(f.node("r9-read").count,0);
});
