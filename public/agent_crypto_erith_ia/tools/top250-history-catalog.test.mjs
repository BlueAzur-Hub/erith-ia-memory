import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const js=fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/top250-history-catalog.js","utf8");
const catalog=JSON.parse(fs.readFileSync(
 "public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_history_catalog/index.json","utf8"));
const base="https://blueazur-hub.github.io";
function fixture(mutate=()=>{}){
 const map=new Map();
 function node(id){
  if(map.has(id))return map.get(id);
  const el={id,textContent:"",value:id==="top250-limit"?"50":"",
            checked:false,children:[],append(...children){this.children.push(...children)},
            replaceChildren(...children){this.children=[...children]},
            addEventListener(){}};
  map.set(id,el);return el;
 }
 const document={
  currentScript:{src:base+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/top250-history-catalog.js"},
  getElementById:node,
  createDocumentFragment:()=>node("fragment-"+map.size),
  createElement:tag=>node("dom-"+tag+"-"+map.size)
 };
 let count=0;
 const window={};
 const apiFetch=async uri=>{
  assert.equal(new URL(uri).origin,base);
  count++;
  const input=structuredClone(catalog);mutate(input);
  return new Response(JSON.stringify(input),{status:200});
 };
 vm.runInNewContext(js,{window,document,fetch:apiFetch,location:{origin:base},
   URL,Response},{timeout:5000});
 return {window,node,requests:()=>count};
}
async function settled(f){
 for(let n=0;n<20;n++){
  if(!f.node("top250-status").textContent.includes("Lecture du registre"))break;
  await new Promise(r=>setImmediate(r));
 }
}
test("all original and addendum SHA256 ZIPs are accepted by the common reader",async()=>{
 const f=fixture();await settled(f);
 const result=f.window.SevenTop250Catalog.read();
 assert.equal(f.node("top250-status").textContent.startsWith("Catalogue disponible"),true,
   f.node("top250-status").textContent);
 assert.equal(f.requests(),1);
 assert.equal(result.archived_assets,catalog.archived_assets);
 assert.ok(result.archived_assets>=40,"Previously verified 40 archives cannot disappear");
 assert.equal(result.native_1m_candles,catalog.native_1m_candles);
 assert.ok(result.native_1m_candles>=17483040,"Previously verified native candles cannot disappear");
 assert.equal(result.assets.length,250);
 const dot=result.assets.find(x=>x.id==="polkadot");
 assert.ok(dot.months.some(m=>m.release.includes("bulk-add-")));
});
test("tampered addendum release reference fails without published fake coverage",async()=>{
 const f=fixture(c=>{
  const dot=c.assets.find(a=>a.id==="polkadot");
  dot.months.find(m=>m.release.includes("-add-")).release="crypto-spot-bulk-add-invalid";
 });
 await settled(f);
 assert.equal(f.window.SevenTop250Catalog.read(),null);
 assert.match(f.node("top250-status").textContent,/Catalogue indisponible/);
});
